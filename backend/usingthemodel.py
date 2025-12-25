import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from pathlib import Path
import traceback
import sys
import json

BASE_MODEL_PATH = "models/stabilityai/stablelm-2-zephyr-1_6b"
LORA_PATH = "models/adapters/stabilityai/stablelm-2-zephyr-1_6b-docling"
MERGED_MODEL_PATH = "merged_models/stablem"
Path("offload").mkdir(parents=True, exist_ok=True)

def log(msg: str):
    print(f"[MERGE] {msg}", flush=True)


def verify_paths(base_path: str, lora_path: str):
    """Verify that required paths exist before starting merge."""
    base = Path(base_path)
    lora = Path(lora_path)
    
    if not base.exists():
        raise FileNotFoundError(f"Base model not found: {base_path}")
    if not lora.exists():
        raise FileNotFoundError(f"LoRA adapter not found: {lora_path}")
    
    # Check for adapter_config.json
    adapter_config = lora / "adapter_config.json"
    if not adapter_config.exists():
        raise FileNotFoundError(f"adapter_config.json not found in {lora_path}")
    
    log("All paths verified")


def get_model_size(model):
    """Calculate model size in MB."""
    param_size = sum(p.nelement() * p.element_size() for p in model.parameters())
    buffer_size = sum(b.nelement() * b.element_size() for b in model.buffers())
    size_mb = (param_size + buffer_size) / 1024**2
    return size_mb


def save_merge_info(merged_path: Path, base_path: str, lora_path: str, model):
    """Save metadata about the merge operation."""
    info = {
        "base_model": base_path,
        "lora_adapter": lora_path,
        "merged_model_size_mb": round(get_model_size(model), 2),
        "merge_timestamp": str(Path(merged_path).stat().st_mtime),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    }
    
    with open(merged_path / "merge_info.json", "w") as f:
        json.dump(info, f, indent=2)
    
    log(f"Merge info saved (model size: {info['merged_model_size_mb']:.2f} MB)")


def load_and_merge_model(
    base_model_path: str = BASE_MODEL_PATH,
    lora_path: str = LORA_PATH,
    merged_model_path: str = MERGED_MODEL_PATH,
    save_safetensors: bool = True,  # Safer format
):
    try:
        log("Starting merge process")
        
        # Verify paths first
        verify_paths(base_model_path, lora_path)

        merged_path = Path(merged_model_path)
        merged_path.mkdir(parents=True, exist_ok=True)
        log(f"Merge directory ready: {merged_path}")

        # ---- Tokenizer ----
        log("Loading tokenizer")
        tokenizer = AutoTokenizer.from_pretrained(base_model_path)
        
        # Ensure pad_token is set (important for generation)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            log("Set pad_token to eos_token")
        
        tokenizer.save_pretrained(merged_path)
        log("Tokenizer saved")

        # ---- Device decision ----
        use_cuda = torch.cuda.is_available()
        device = "cuda" if use_cuda else "cpu"
        
        if use_cuda:
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            log(f"CUDA available: {gpu_name} ({gpu_memory:.1f} GB)")
        else:
            log("CUDA not available, using CPU")

        device_map = "auto" if use_cuda else None
        log(f"Using device_map = {device_map}")

        # ---- Base model ----
        log("Loading base model (this may take time)")
        base_model = AutoModelForCausalLM.from_pretrained(
        base_model_path,
        torch_dtype=torch.float32,   # REQUIRED for safe merge
        device_map=None,             # MUST be None
        low_cpu_mem_usage=True,
        )
        log(f"Base model loaded ({get_model_size(base_model):.2f} MB)")

        # ---- LoRA adapter ----
        log("Loading LoRA adapter")
        model = PeftModel.from_pretrained(
            base_model,
            lora_path,
        )
        log("LoRA adapter attached")

        # ---- Merge ----
        log("Merging LoRA weights into base model...")
        merged_model = model.merge_and_unload()
        log("✓ Merge completed successfully")

        # ---- Save ----
        log("Saving merged model to disk")
        merged_model.save_pretrained(
            merged_path,
            safe_serialization=save_safetensors,  # Use safetensors format
        )
        log(f"✓ Merged model saved to {merged_path}")
        
        # Save merge metadata
        save_merge_info(merged_path, base_model_path, lora_path, merged_model)

        log("=" * 50)
        log("Merge process finished successfully!")
        log(f"Merged model location: {merged_path.absolute()}")
        log("=" * 50)
        
        return merged_model, tokenizer

    except FileNotFoundError as e:
        log(f"ERROR: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
    except Exception as e:
        log("ERROR during merge")
        traceback.print_exc()
        input("Press Enter to exit...")
        sys.exit(1)


def test_merged_model(model_path: str):
    """Quick test of the merged model."""
    log("Testing merged model...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
    )
    
    test_prompt = "What is machine learning?"
    inputs = tokenizer(test_prompt, return_tensors="pt")
    
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=50,
            temperature=0.7,
            do_sample=True,
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    log(f"Test response:\n{response}")


if __name__ == "__main__":
    # Merge the model
    model, tokenizer = load_and_merge_model()
    
    # Optional: Quick test
    test_choice = input("\nTest the merged model? (y/n): ").strip().lower()
    if test_choice == "y":
        test_merged_model(MERGED_MODEL_PATH)
    
    input("\nPress Enter to exit...")
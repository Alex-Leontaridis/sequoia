#!/usr/bin/env python3
"""
Setup script to install PCToolkit for prompt compression
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up PCToolkit for Prompt Compression")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('message_logger_service.py'):
        print("❌ Please run this script from the project root directory")
        return 1
    
    # Step 1: Install basic requirements
    if not run_command("pip3 install -r requirements.txt", "Installing basic requirements"):
        return 1
    
    # Step 2: Clone PCToolkit
    if not os.path.exists('PCToolkit'):
        if not run_command(
            "git clone https://github.com/3DAgentWorld/Toolkit-for-Prompt-Compression.git PCToolkit",
            "Cloning PCToolkit repository"
        ):
            return 1
    else:
        print("✓ PCToolkit directory already exists")
    
    # Step 3: Install PCToolkit dependencies
    pctoolkit_requirements = "PCToolkit/requirements.txt"
    if os.path.exists(pctoolkit_requirements):
        if not run_command(f"pip3 install -r {pctoolkit_requirements}", "Installing PCToolkit requirements"):
            return 1
    else:
        print("⚠ PCToolkit requirements.txt not found, installing common dependencies")
        common_deps = [
            "torch", "transformers", "datasets", "accelerate", 
            "sentencepiece", "numpy", "scipy", "scikit-learn"
        ]
        for dep in common_deps:
            run_command(f"pip3 install {dep}", f"Installing {dep}")
    
    # Step 4: Add PCToolkit to Python path
    print("\n🔧 Setting up Python path for PCToolkit...")
    
    # Create a symlink or copy the pctoolkit module
    if os.path.exists('PCToolkit/pctoolkit'):
        if not os.path.exists('pctoolkit'):
            try:
                if os.name == 'nt':  # Windows
                    import shutil
                    shutil.copytree('PCToolkit/pctoolkit', 'pctoolkit')
                else:  # Unix-like
                    os.symlink('PCToolkit/pctoolkit', 'pctoolkit')
                print("✓ PCToolkit module linked successfully")
            except Exception as e:
                print(f"⚠ Could not link PCToolkit module: {e}")
                print("You may need to manually add PCToolkit to your Python path")
        else:
            print("✓ PCToolkit module already available")
    
    # Step 5: Test the installation
    print("\n🧪 Testing PCToolkit installation...")
    test_script = """
try:
    from pctoolkit.compressors import PromptCompressor
    compressor = PromptCompressor(type='SCCompressor', device='cpu')
    test_result = compressor.compressgo("This is a test prompt for compression.", 0.5)
    print("✓ PCToolkit test successful!")
    print(f"Test compression result: {test_result}")
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("PCToolkit may not be properly installed")
except Exception as e:
    print(f"⚠ PCToolkit test failed: {e}")
    print("This might be normal if models are not downloaded yet")
"""
    
    try:
        exec(test_script)
    except Exception as e:
        print(f"⚠ Test execution failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 PCToolkit setup completed!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the service: python3 message_logger_service.py")
    print("2. Load the Chrome extension")
    print("3. Test on ChatGPT - prompts will be compressed and logged!")
    print()
    print("Note: Some models may be downloaded on first use.")
    print("This might take some time depending on your internet connection.")
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)
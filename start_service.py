#!/usr/bin/env python3
"""
Startup script for the ChatGPT compression system
"""

import os
import sys
import subprocess
import time
import requests
import threading
from pathlib import Path

def check_dependencies():
    """Check if all dependencies are installed"""
    try:
        import flask
        import flask_cors
        import tiktoken
        print("✓ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing Python dependency: {e}")
        print("Run: pip3 install -r requirements.txt")
        return False

def check_prompt_compressor():
    """Check if prompt_compressor is set up"""
    if os.path.exists('prompt_compressor'):
        print("✓ Prompt compressor library found")
        return True
    else:
        print("✗ Prompt compressor library not found")
        print("Run: python3 setup_compressor.py")
        return False

def start_compression_service():
    """Start the compression service in a separate process"""
    print("Starting compression service...")
    
    try:
        # Start the service
        process = subprocess.Popen([
            sys.executable, 'improved_compression_service.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for it to start
        time.sleep(3)
        
        # Check if it's running
        try:
            response = requests.get('http://localhost:8002/health', timeout=5)
            if response.status_code == 200:
                print("✓ Compression service started successfully")
                return process
            else:
                print(f"✗ Service returned status {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("✗ Could not connect to compression service")
            return None
            
    except Exception as e:
        print(f"✗ Failed to start compression service: {e}")
        return None

def run_tests():
    """Run the test suite"""
    print("\nRunning tests...")
    try:
        result = subprocess.run([sys.executable, 'test_compression.py'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ All tests passed")
            return True
        else:
            print("✗ Some tests failed")
            print(result.stdout)
            return False
    except Exception as e:
        print(f"✗ Error running tests: {e}")
        return False

def print_instructions():
    """Print setup instructions"""
    print("\n" + "=" * 60)
    print("🚀 ChatGPT Message Compressor is Ready!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Install browser extension:")
    print("   • Install Tampermonkey: https://www.tampermonkey.net/")
    print("   • Create new script and paste contents of 'chatgpt_compressor.user.js'")
    print()
    print("2. Open ChatGPT:")
    print("   • Navigate to https://chatgpt.com")
    print("   • Start chatting - messages will be automatically compressed!")
    print()
    print("3. Monitor compression:")
    print("   • Look for green notifications showing compression stats")
    print("   • Check browser console for detailed logs")
    print()
    print("Service URLs:")
    print("• Compression API: http://localhost:8002")
    print("• Health Check: http://localhost:8002/health")
    print()
    print("To stop the service, press Ctrl+C")

def main():
    """Main startup function"""
    print("ChatGPT Message Compressor - Startup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    if not check_prompt_compressor():
        print("\nWould you like to set up the prompt compressor now? (y/n): ", end="")
        response = input().strip().lower()
        if response in ['y', 'yes']:
            print("Running setup...")
            print("Cloning prompt_compressor library...")
            result = subprocess.run(['git', 'clone', 'https://github.com/metawake/prompt_compressor.git'])
            if result.returncode == 0:
                print("Installing prompt_compressor...")
                result = subprocess.run(['pip3', 'install', '-e', '.'], cwd='./prompt_compressor')
                if result.returncode != 0:
                    print("Setup failed")
                    sys.exit(1)
            else:
                print("Failed to clone prompt_compressor")
                sys.exit(1)
        else:
            print("Please set up the prompt_compressor library manually:")
            print("git clone https://github.com/metawake/prompt_compressor.git")
            print("cd prompt_compressor && pip3 install -e .")
            sys.exit(1)
    
    # Start compression service
    service_process = start_compression_service()
    if not service_process:
        sys.exit(1)
    
    # Run tests
    if not run_tests():
        print("Warning: Tests failed, but service is running")
    
    # Print instructions
    print_instructions()
    
    try:
        # Keep the service running
        service_process.wait()
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        service_process.terminate()
        print("Service stopped.")

if __name__ == "__main__":
    main()
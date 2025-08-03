#!/usr/bin/env python3
"""
Startup script for the ChatGPT compression backend service
This script helps users start the backend service from the extension directory
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def find_backend_files():
    """Find the backend files in the parent directory"""
    current_dir = Path(__file__).parent
    parent_dir = current_dir.parent
    
    # Look for backend files in parent directory
    compression_service = parent_dir / 'improved_compression_service.py'
    requirements_file = parent_dir / 'requirements.txt'
    
    if not compression_service.exists():
        print("❌ Backend files not found!")
        print(f"Expected location: {compression_service}")
        print("\nPlease make sure the backend files are in the parent directory:")
        print("- improved_compression_service.py")
        print("- requirements.txt")
        return None, None
    
    return compression_service, requirements_file

def install_dependencies(requirements_file):
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print("❌ Failed to install dependencies:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def start_compression_service(service_file):
    """Start the compression service"""
    print("🚀 Starting compression service...")
    
    try:
        # Change to the parent directory to run the service
        parent_dir = service_file.parent
        os.chdir(parent_dir)
        
        # Start the service
        process = subprocess.Popen([
            sys.executable, str(service_file.name)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for it to start
        time.sleep(3)
        
        # Check if it's running
        try:
            response = requests.get('http://localhost:8002/health', timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ Compression service started successfully!")
                print(f"   Service URL: http://localhost:8002")
                print(f"   Library loaded: {data.get('library_loaded', 'Unknown')}")
                return process
            else:
                print(f"❌ Service returned status {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("❌ Could not connect to compression service")
            print("   Make sure no other service is running on port 8002")
            return None
            
    except Exception as e:
        print(f"❌ Failed to start compression service: {e}")
        return None

def print_instructions():
    """Print setup instructions"""
    print("\n" + "=" * 60)
    print("🎉 ChatGPT Compressor Backend is Ready!")
    print("=" * 60)
    print()
    print("The compression service is now running on http://localhost:8002")
    print()
    print("Next steps:")
    print("1. Load the Chrome extension:")
    print("   • Open Chrome and go to chrome://extensions/")
    print("   • Enable 'Developer mode'")
    print("   • Click 'Load unpacked' and select this extension folder")
    print()
    print("2. Test the extension:")
    print("   • Go to https://chat.openai.com")
    print("   • Start chatting - messages will be automatically compressed!")
    print()
    print("3. Monitor compression:")
    print("   • Look for green notifications showing compression stats")
    print("   • Check browser console for detailed logs")
    print()
    print("Service endpoints:")
    print("• Health check: http://localhost:8002/health")
    print("• Compression API: http://localhost:8002/compress")
    print("• Service info: http://localhost:8002/")
    print()
    print("To stop the service, press Ctrl+C")

def main():
    """Main startup function"""
    print("ChatGPT Compressor - Backend Startup")
    print("=" * 40)
    
    # Find backend files
    service_file, requirements_file = find_backend_files()
    if not service_file:
        return
    
    print(f"✅ Found backend files in: {service_file.parent}")
    
    # Install dependencies
    if requirements_file and requirements_file.exists():
        if not install_dependencies(requirements_file):
            print("\n❌ Failed to install dependencies. Please run manually:")
            print(f"   pip3 install -r {requirements_file}")
            return
    else:
        print("⚠️  No requirements.txt found, skipping dependency installation")
    
    # Start compression service
    service_process = start_compression_service(service_file)
    if not service_process:
        return
    
    # Print instructions
    print_instructions()
    
    try:
        # Keep the service running
        print("\n🔄 Service is running... Press Ctrl+C to stop")
        service_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
        service_process.terminate()
        print("✅ Service stopped.")

if __name__ == "__main__":
    main() 
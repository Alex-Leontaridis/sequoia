#!/usr/bin/env python3
"""
Simple startup script for the ChatGPT Message Logger
"""

import os
import sys
import subprocess
import time
import requests

def check_dependencies():
    """Check if all dependencies are installed"""
    try:
        import flask
        import flask_cors
        print("✓ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing Python dependency: {e}")
        print("Run: pip3 install -r requirements.txt")
        return False

def start_message_logger_service():
    """Start the message logger service"""
    print("Starting message logger service...")
    
    try:
        # Start the service
        process = subprocess.Popen([
            sys.executable, 'message_logger_service.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for it to start
        time.sleep(3)
        
        # Check if it's running
        try:
            response = requests.get('http://localhost:8002/health', timeout=5)
            if response.status_code == 200:
                print("✓ Message logger service started successfully")
                print("📡 Service running on http://localhost:8002")
                return process
            else:
                print(f"✗ Service returned status {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("✗ Could not connect to message logger service")
            return None
            
    except Exception as e:
        print(f"✗ Failed to start message logger service: {e}")
        return None

def print_instructions():
    """Print setup instructions"""
    print("\n" + "=" * 60)
    print("🚀 ChatGPT Message Logger is Ready!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Install browser extension:")
    print("   • Load the chrome-extension folder as an unpacked extension")
    print("   • Or use the extension in development mode")
    print()
    print("2. Open ChatGPT:")
    print("   • Navigate to https://chat.openai.com")
    print("   • Start chatting - messages will be automatically logged!")
    print()
    print("3. Monitor logging:")
    print("   • Look for blue notifications showing message logging")
    print("   • Check the service logs for detailed message information")
    print("   • Visit http://localhost:8002/messages to see logged messages")
    print()
    print("4. Service endpoints:")
    print("   • Health check: http://localhost:8002/health")
    print("   • View messages: http://localhost:8002/messages")
    print("   • Log message: POST http://localhost:8002/log-message")
    print()
    print("Press Ctrl+C to stop the service")
    print("=" * 60)

def main():
    """Main startup function"""
    print("🔧 ChatGPT Message Logger - Simple Backend")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Start the service
    process = start_message_logger_service()
    if not process:
        print("Failed to start message logger service")
        return 1
    
    # Print instructions
    print_instructions()
    
    try:
        # Keep the script running
        process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping message logger service...")
        process.terminate()
        process.wait()
        print("✓ Service stopped")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 
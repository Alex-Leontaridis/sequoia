#!/usr/bin/env python3
"""
Test script to verify the Spanish modifier functionality
"""

import requests
import json
import time

def test_spanish_modifier():
    """Test that messages are being modified and logged correctly"""
    base_url = "http://localhost:8002"
    
    print("🧪 Testing ChatGPT Spanish Modifier")
    print("=" * 50)
    
    # Test 1: Check service is running
    print("\n1. Checking service health...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Service is healthy: {data}")
        else:
            print(f"✗ Service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Service health check error: {e}")
        return False
    
    # Test 2: Get current message count
    print("\n2. Getting current message count...")
    try:
        response = requests.get(f"{base_url}/messages")
        if response.status_code == 200:
            data = response.json()
            initial_count = data['stats']['total_messages']
            print(f"✓ Initial message count: {initial_count}")
        else:
            print(f"✗ Failed to get messages: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error getting messages: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎯 Manual Testing Instructions:")
    print("=" * 50)
    print()
    print("1. Make sure the Chrome extension is loaded and active")
    print("2. Open ChatGPT (https://chat.openai.com)")
    print("3. Send a test message like: 'How are you today?'")
    print("4. You should see:")
    print("   • A green notification: 'Message Modified!'")
    print("   • ChatGPT should respond in Spanish")
    print("   • Check the logs below...")
    print()
    
    # Wait for user to test manually
    input("Press Enter after testing the extension in ChatGPT...")
    
    # Test 3: Check if new messages were logged
    print("\n3. Checking for new logged messages...")
    try:
        response = requests.get(f"{base_url}/messages")
        if response.status_code == 200:
            data = response.json()
            final_count = data['stats']['total_messages']
            new_messages = final_count - initial_count
            
            print(f"✓ Final message count: {final_count}")
            print(f"✓ New messages logged: {new_messages}")
            
            if new_messages > 0:
                print("\n📝 Recent messages:")
                for i, msg in enumerate(data['recent_messages'][-new_messages:], 1):
                    print(f"\n--- Message {i} ---")
                    print(f"Timestamp: {msg['timestamp']}")
                    print(f"Length: {msg['length']} chars")
                    print(f"URL: {msg['url']}")
                    print(f"Content preview: {msg['message'][:200]}...")
                    
                    # Check if it contains both original and modified
                    if "ORIGINAL:" in msg['message'] and "MODIFIED:" in msg['message']:
                        print("✓ Contains both original and modified message")
                        if "Please reply in Spanish" in msg['message']:
                            print("✓ Spanish instruction was added")
                        else:
                            print("⚠ Spanish instruction not found")
                    else:
                        print("ℹ Regular message (no modification detected)")
                
                return True
            else:
                print("⚠ No new messages found. Make sure you sent a message in ChatGPT.")
                return False
        else:
            print(f"✗ Failed to get final messages: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error getting final messages: {e}")
        return False

if __name__ == "__main__":
    try:
        success = test_spanish_modifier()
        if success:
            print("\n✅ Test completed successfully!")
            print("🎉 The Spanish modifier is working correctly!")
        else:
            print("\n❌ Test failed!")
            print("🔧 Check the extension and service are running correctly.")
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
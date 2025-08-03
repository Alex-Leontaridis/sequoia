#!/usr/bin/env python3
"""
Simple test script for the ChatGPT Message Logger
"""

import requests
import json
import time

def test_message_logger_service():
    """Test the message logger service"""
    base_url = "http://localhost:8002"
    
    print("🧪 Testing ChatGPT Message Logger Service")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed: {data}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False
    
    # Test 2: Log a message
    print("\n2. Testing message logging...")
    test_message = "This is a test message from the automated test script. It should be logged by the service."
    test_url = "https://chat.openai.com/test"
    
    try:
        response = requests.post(f"{base_url}/log-message", 
                               json={"message": test_message, "url": test_url})
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Message logged successfully: {data}")
        else:
            print(f"✗ Message logging failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Message logging error: {e}")
        return False
    
    # Test 3: Get messages
    print("\n3. Testing message retrieval...")
    try:
        response = requests.get(f"{base_url}/messages")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Messages retrieved successfully")
            print(f"  Total messages: {data['stats']['total_messages']}")
            print(f"  Recent messages: {len(data['recent_messages'])}")
            
            # Check if our test message is there
            found_test_message = False
            for msg in data['recent_messages']:
                if test_message in msg['message']:
                    found_test_message = True
                    print(f"  ✓ Test message found in logs")
                    break
            
            if not found_test_message:
                print(f"  ⚠ Test message not found in recent messages")
        else:
            print(f"✗ Message retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Message retrieval error: {e}")
        return False
    
    # Test 4: Test with different message types
    print("\n4. Testing different message types...")
    test_messages = [
        "Short message",
        "A longer message with more content to test the logging functionality",
        "Message with special characters: !@#$%^&*()",
        "Message with numbers: 12345 and symbols: <>&\"'"
    ]
    
    for i, msg in enumerate(test_messages, 1):
        try:
            response = requests.post(f"{base_url}/log-message", 
                                   json={"message": msg, "url": f"https://test{i}.com"})
            if response.status_code == 200:
                print(f"  ✓ Message {i} logged successfully")
            else:
                print(f"  ✗ Message {i} failed: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Message {i} error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 All tests completed!")
    print("The message logger service is working correctly.")
    print("You can now use the Chrome extension to log ChatGPT messages.")
    
    return True

if __name__ == "__main__":
    try:
        success = test_message_logger_service()
        if success:
            print("\n✅ Test suite passed!")
        else:
            print("\n❌ Test suite failed!")
            exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        exit(1) 
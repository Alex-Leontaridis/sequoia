#!/usr/bin/env python3
"""
Test script for prompt compression functionality
"""

import requests
import json

def test_compression_service():
    """Test the compression functionality of the message logger service"""
    base_url = "http://localhost:8002"
    
    print("🧪 Testing Prompt Compression Service")
    print("=" * 60)
    
    # Test 1: Health check with compression status
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Service is healthy")
            print(f"  Service: {data.get('service', 'Unknown')}")
            print(f"  Compression Available: {data.get('compression_available', False)}")
            print(f"  Compressor Initialized: {data.get('compressor_initialized', False)}")
            print(f"  Compression Method: {data.get('compression_method', 'none')}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False
    
    # Test 2: Direct compression test
    print("\n2. Testing direct compression endpoint...")
    test_prompts = [
        "This is a simple test prompt that should be compressed effectively by the PCToolkit compression system.",
        "I am writing a longer prompt with more details to test how well the compression algorithm works with extended content. This should demonstrate the effectiveness of the selective context compression method.",
        "Please explain the process of photosynthesis in plants, including the light-dependent and light-independent reactions, and how this process is crucial for life on Earth."
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        try:
            response = requests.post(f"{base_url}/compress", 
                                   json={"text": prompt, "ratio": 0.3})
            if response.status_code == 200:
                result = response.json()
                print(f"\n  Test {i} - ✓ Compression successful:")
                print(f"    Original Length: {result.get('original_length', 0)} chars")
                print(f"    Compressed Length: {result.get('compressed_length', 0)} chars")
                print(f"    Compression Ratio: {result.get('compression_ratio', 0)}%")
                print(f"    Method: {result.get('method', 'unknown')}")
                print(f"    Original: {prompt[:60]}...")
                print(f"    Compressed: {result.get('compressed', 'N/A')[:60]}...")
            else:
                print(f"  Test {i} - ✗ Compression failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"    Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"    Error: {response.text}")
        except Exception as e:
            print(f"  Test {i} - ✗ Compression error: {e}")
    
    # Test 3: Test message logging with compression
    print("\n3. Testing message logging with compression...")
    test_log_message = "ORIGINAL: How can I improve my productivity at work?\n\nMODIFIED: How can I improve my productivity at work?\n\nPlease reply in Spanish."
    
    try:
        response = requests.post(f"{base_url}/log-message", 
                               json={
                                   "message": test_log_message, 
                                   "url": "https://chat.openai.com/test",
                                   "compression_ratio": 0.4
                               })
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Message logged with compression")
            print(f"  Status: {result.get('status', 'unknown')}")
            print(f"  Message Length: {result.get('message_length', 0)}")
            if 'compression' in result:
                comp = result['compression']
                print(f"  Compression Ratio: {comp.get('compression_ratio', 0)}%")
                print(f"  Compression Method: {comp.get('method', 'unknown')}")
        else:
            print(f"✗ Message logging failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Message logging error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Compression testing completed!")
    print("=" * 60)
    print()
    print("Check the service console for detailed compression logs.")
    print("The service will show compression analysis for each prompt.")
    
    return True

if __name__ == "__main__":
    try:
        success = test_compression_service()
        if success:
            print("\n✅ Compression service tests passed!")
        else:
            print("\n❌ Some compression service tests failed!")
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
#!/usr/bin/env python3
"""
Test the backend service with token compression functionality
"""

import requests
import json

def test_compression_endpoint():
    """Test the /log-message endpoint with compression and token counting"""
    
    url = "http://localhost:8002/log-message"
    
    test_messages = [
        "Please explain how machine learning works and provide practical examples",
        "I need help understanding Python programming best practices for beginners",
        "Can you describe the differences between artificial intelligence and machine learning?",
        "What are the most effective strategies for software development in modern teams?"
    ]
    
    print("🧪 Testing Backend Compression with Token Counting")
    print("=" * 70)
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n📝 Test {i}: Sending message to backend...")
        
        data = {
            "message": message,
            "url": f"https://test{i}.chatgpt.com"
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'compression' in result:
                    comp = result['compression']
                    print(f"✅ Success!")
                    print(f"   📏 Characters: {comp['original_length']} → {comp['compressed_length']} ({comp['compression_ratio']}%)")
                    if 'original_tokens' in comp:
                        print(f"   🪙 Tokens: {comp['original_tokens']} → {comp['compressed_tokens']} ({comp.get('token_compression_ratio', 0)}%)")
                        tiktoken_status = "✅ tiktoken" if comp.get('tiktoken_available', False) else "⚠️ estimated"
                        print(f"   🔧 Token Counter: {tiktoken_status}")
                    print(f"   🛠️ Method: {comp['method']}")
                else:
                    print(f"⚠️ No compression data in response")
            else:
                print(f"❌ HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to backend service")
            print("   Make sure to run: python3 message_logger_service.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 70)
    print("🏁 Backend compression test completed!")

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8002/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend service is healthy")
            print(f"   📊 Total messages: {data.get('total_messages', 0)}")
            return True
        else:
            print(f"❌ Health check failed: HTTP {response.status_code}")
            return False
    except:
        print("❌ Backend service not available")
        return False

if __name__ == "__main__":
    print("🔍 Checking backend service health...")
    if test_health_endpoint():
        print()
        test_compression_endpoint()
    else:
        print("\n💡 Start the backend service with:")
        print("   python3 message_logger_service.py")
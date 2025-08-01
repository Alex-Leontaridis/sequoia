#!/usr/bin/env python3
"""
Test script for the compression service
"""

import requests
import json
import time

COMPRESSION_SERVICE_URL = 'http://localhost:8002'

def test_compression_service():
    """Test the compression service with sample prompts"""
    
    test_prompts = [
        "I am really interested in learning more about Python programming and would like to know what are the best practices",
        "Could you please help me understand how machine learning algorithms work in detail?",
        "I would like to create a web application using React and would appreciate some guidance on the best approach",
        "Can you explain to me what are the differences between supervised and unsupervised learning?",
        "I am having trouble with my code and would like some help debugging the issue"
    ]
    
    print("Testing Compression Service")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{COMPRESSION_SERVICE_URL}/health")
        if response.status_code == 200:
            print("✓ Service is healthy")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Could not connect to service: {e}")
        print("Make sure the compression service is running:")
        print("python3 compression_service.py")
        return False
    
    print("\nTesting compression with sample prompts:")
    print("-" * 50)
    
    total_original_tokens = 0
    total_compressed_tokens = 0
    
    for i, prompt in enumerate(test_prompts, 1):
        try:
            response = requests.post(
                f"{COMPRESSION_SERVICE_URL}/compress",
                json={"text": prompt},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\nTest {i}:")
                print(f"Original: {prompt}")
                print(f"Compressed: {result['compressed_text']}")
                print(f"Tokens: {result['original_tokens']} → {result['compressed_tokens']} "
                      f"({result['compression_ratio']}% reduction)")
                
                total_original_tokens += result['original_tokens']
                total_compressed_tokens += result['compressed_tokens']
                
            else:
                print(f"✗ Test {i} failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"✗ Test {i} error: {e}")
    
    # Summary
    if total_original_tokens > 0:
        overall_ratio = ((total_original_tokens - total_compressed_tokens) / total_original_tokens) * 100
        print(f"\n" + "=" * 50)
        print("SUMMARY:")
        print(f"Total original tokens: {total_original_tokens}")
        print(f"Total compressed tokens: {total_compressed_tokens}")
        print(f"Total tokens saved: {total_original_tokens - total_compressed_tokens}")
        print(f"Overall compression ratio: {overall_ratio:.2f}%")
    
    return True

def test_chatgpt_message():
    """Test with a ChatGPT-style message structure"""
    
    print("\n" + "=" * 50)
    print("Testing ChatGPT message structure")
    print("-" * 50)
    
    # Simulate the actual ChatGPT request body structure
    chatgpt_body = {
        "action": "next",
        "messages": [
            {
                "id": "test-message-id",
                "author": {"role": "user"},
                "create_time": time.time(),
                "content": {
                    "content_type": "text",
                    "parts": ["I am really interested in learning more about how artificial intelligence works and would like to understand the fundamental concepts behind machine learning algorithms"]
                },
                "metadata": {}
            }
        ],
        "conversation_id": "test-conversation",
        "parent_message_id": "test-parent",
        "model": "auto"
    }
    
    # Extract message content (simulate what the userscript does)
    message = chatgpt_body["messages"][0]
    original_content = message["content"]["parts"][0]
    
    print(f"Original message content: {original_content}")
    
    # Test compression
    try:
        response = requests.post(
            f"{COMPRESSION_SERVICE_URL}/compress",
            json={"text": original_content},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"Compressed content: {result['compressed_text']}")
            print(f"Compression stats: {result['original_tokens']} → {result['compressed_tokens']} tokens")
            print(f"Reduction: {result['compression_ratio']}%")
            
            # Update message content (simulate what userscript does)
            message["content"]["parts"][0] = result['compressed_text']
            
            print(f"\nUpdated ChatGPT body:")
            print(json.dumps(chatgpt_body, indent=2))
            
        else:
            print(f"✗ Compression failed: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    success = test_compression_service()
    if success:
        test_chatgpt_message()
#!/usr/bin/env python3
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import tiktoken for token counting
try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
    print("✓ tiktoken library loaded successfully")
except ImportError as e:
    TIKTOKEN_AVAILABLE = False
    print(f"⚠ tiktoken not available: {e}")
    print("Install with: pip3 install tiktoken")

# Import PCToolkit for prompt compression
try:
    from pctoolkit.compressors import PromptCompressor
    COMPRESSION_AVAILABLE = True
    print("✓ PCToolkit prompt compression library loaded successfully")
except ImportError as e:
    COMPRESSION_AVAILABLE = False
    print(f"⚠ PCToolkit not available: {e}")
    print("Install with: pip install -r requirements.txt and download PCToolkit")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize prompt compressor
compressor = None
if COMPRESSION_AVAILABLE:
    try:
        # Initialize the SCCompressor (Selective Context Compressor)
        # You can change 'SCCompressor' to other types like 'LLMLingua', 'LongLLMLingua', etc.
        compressor = PromptCompressor(type='SCCompressor', device='cpu')  # Use 'cuda' if you have GPU
        logger.info("✓ Prompt compressor initialized successfully")
    except Exception as e:
        logger.error(f"✗ Failed to initialize prompt compressor: {e}")
        compressor = None

message_stats = {'total_messages': 0, 'messages': [], 'start_time': datetime.now().isoformat()}

def count_tokens(text, model="gpt-3.5-turbo"):
    """
    Count tokens in text using tiktoken
    Args:
        text: Text to count tokens for
        model: Model name for tokenization (default: gpt-3.5-turbo)
    Returns:
        int: Number of tokens, or character count if tiktoken unavailable
    """
    if not TIKTOKEN_AVAILABLE:
        # Fallback: rough estimation (1 token ≈ 4 characters)
        return len(text) // 4
    
    try:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except Exception as e:
        logger.warning(f"Token counting failed: {e}, using character estimation")
        return len(text) // 4

def simple_compress(text, ratio=0.3):
    """
    Simple fallback compression when PCToolkit is not available
    Removes common words and shortens text
    """
    if not text or len(text) < 10:
        return text
    
    # Remove common words for basic compression
    common_words = [
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 
        'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
        'very', 'really', 'quite', 'rather', 'pretty', 'much', 'many', 'more', 'most',
        'please', 'could', 'would', 'should', 'might', 'can', 'will'
    ]
    
    words = text.split()
    target_word_count = int(len(words) * ratio)
    
    # Keep important words, remove common ones
    compressed_words = []
    important_words = []
    
    for word in words:
        word_lower = word.lower().strip('.,!?;:"')
        if word_lower not in common_words or len(compressed_words) < target_word_count:
            compressed_words.append(word)
        if word_lower not in common_words:
            important_words.append(word)
    
    # If we still have too many words, take the most important ones
    if len(compressed_words) > target_word_count and important_words:
        compressed_words = important_words[:target_word_count]
    
    return ' '.join(compressed_words) if compressed_words else text

def compress_prompt(text, ratio=0.3):
    """
    Compress a prompt using PCToolkit
    Args:
        text: Original prompt text
        ratio: Compression ratio (0.3 means compress to 30% of original length)
    Returns:
        dict with original, compressed text, and compression stats
    """
    if not compressor:
        # Simple fallback compression using basic text shortening
        fallback_compressed = simple_compress(text, ratio)
        original_length = len(text)
        compressed_length = len(fallback_compressed)
        original_tokens = count_tokens(text)
        compressed_tokens = count_tokens(fallback_compressed)
        
        char_ratio = (original_length - compressed_length) / original_length * 100 if original_length > 0 else 0
        token_ratio = (original_tokens - compressed_tokens) / original_tokens * 100 if original_tokens > 0 else 0
        
        return {
            'original': text,
            'compressed': fallback_compressed,
            'compression_ratio': round(char_ratio, 2),
            'token_compression_ratio': round(token_ratio, 2),
            'original_length': original_length,
            'compressed_length': compressed_length,
            'original_tokens': original_tokens,
            'compressed_tokens': compressed_tokens,
            'method': 'simple_fallback',
            'target_ratio': ratio,
            'success': True,
            'tiktoken_available': TIKTOKEN_AVAILABLE,
            'note': 'PCToolkit not available, using simple compression'
        }
    
    try:
        # Compress the prompt
        compressed_result = compressor.compressgo(text, ratio)
        
        # Calculate compression statistics
        original_length = len(text)
        compressed_length = len(compressed_result)
        original_tokens = count_tokens(text)
        compressed_tokens = count_tokens(compressed_result)
        
        char_ratio = (original_length - compressed_length) / original_length * 100
        token_ratio = (original_tokens - compressed_tokens) / original_tokens * 100 if original_tokens > 0 else 0
        
        return {
            'original': text,
            'compressed': compressed_result,
            'compression_ratio': round(char_ratio, 2),
            'token_compression_ratio': round(token_ratio, 2),
            'original_length': original_length,
            'compressed_length': compressed_length,
            'original_tokens': original_tokens,
            'compressed_tokens': compressed_tokens,
            'method': 'SCCompressor',
            'target_ratio': ratio,
            'success': True,
            'tiktoken_available': TIKTOKEN_AVAILABLE
        }
    except Exception as e:
        logger.error(f"Compression failed: {e}")
        original_tokens = count_tokens(text)
        return {
            'original': text,
            'compressed': text,
            'compression_ratio': 0,
            'token_compression_ratio': 0,
            'original_length': len(text),
            'compressed_length': len(text),
            'original_tokens': original_tokens,
            'compressed_tokens': original_tokens,
            'method': 'failed',
            'target_ratio': ratio,
            'success': False,
            'tiktoken_available': TIKTOKEN_AVAILABLE,
            'error': str(e)
        }

@app.route('/log-message', methods=['POST'])
def log_message():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        message = data['message']
        url = data.get('url', 'unknown')
        timestamp = datetime.now().isoformat()
        compression_ratio = data.get('compression_ratio', 0.3)  # Default compression ratio
        
        # Extract the original user prompt if the message contains both original and modified
        user_prompt = message
        if "ORIGINAL:" in message and "MODIFIED:" in message:
            # Extract just the original part for compression
            try:
                original_start = message.find("ORIGINAL:") + len("ORIGINAL:")
                modified_start = message.find("MODIFIED:")
                user_prompt = message[original_start:modified_start].strip()
            except:
                user_prompt = message
        
        logger.info(f'📨 RECEIVED MESSAGE from {url}')
        logger.info(f'📝 Content: {message}')
        logger.info(f'⏰ Timestamp: {timestamp}')
        
        # Perform prompt compression
        compression_result = compress_prompt(user_prompt, compression_ratio)
        
        # Console log the compression results
        print("\n" + "="*80)
        print("🔥 PROMPT COMPRESSION ANALYSIS")
        print("="*80)
        print(f"📅 Timestamp: {timestamp}")
        print(f"🌐 URL: {url}")
        print(f"📏 Original Length: {compression_result['original_length']} chars")
        print(f"📦 Compressed Length: {compression_result['compressed_length']} chars")
        print(f"📊 Compression Ratio: {compression_result['compression_ratio']}%")
        print(f"🔧 Method: {compression_result['method']}")
        print()
        print("📝 ORIGINAL PROMPT:")
        print("-" * 40)
        print(compression_result['original'])
        print()
        print("🗜️ COMPRESSED PROMPT:")
        print("-" * 40)
        print(compression_result['compressed'])
        print("="*80)
        
        # Log compression details to logger
        logger.info(f'🗜️ COMPRESSION: {compression_result["compression_ratio"]}% reduction')
        logger.info(f'📏 LENGTH: {compression_result["original_length"]} → {compression_result["compressed_length"]} chars')
        logger.info(f'🔧 METHOD: {compression_result["method"]}')
        if not compression_result.get('success', True):
            logger.warning(f'⚠️ COMPRESSION FAILED: {compression_result.get("error", "Unknown error")}')
        logger.info('-' * 50)
        
        # Store message with compression data
        message_entry = {
            'timestamp': timestamp, 
            'message': message, 
            'url': url, 
            'length': len(message),
            'compression': compression_result,
            'user_prompt': user_prompt,
            'compressed_prompt': compression_result['compressed']
        }
        message_stats['messages'].append(message_entry)
        message_stats['total_messages'] += 1
        
        if len(message_stats['messages']) > 100:
            message_stats['messages'] = message_stats['messages'][-100:]
        
        return jsonify({
            'status': 'success', 
            'message': 'Message logged and compressed successfully', 
            'timestamp': timestamp, 
            'message_length': len(message),
            'compression': compression_result
        })
        
    except Exception as e:
        logger.error(f'Error logging message: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/messages', methods=['GET'])
def get_messages():
    return jsonify({'stats': message_stats, 'recent_messages': message_stats['messages'][-10:]})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'ChatGPT Message Logger with Prompt Compression', 
        'total_messages': message_stats['total_messages'],
        'compression_available': COMPRESSION_AVAILABLE,
        'compressor_initialized': compressor is not None,
        'compression_method': 'SCCompressor' if compressor else 'none'
    })

@app.route('/compress', methods=['POST'])
def compress_endpoint():
    """Test endpoint for prompt compression"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        ratio = data.get('ratio', 0.3)
        
        result = compress_prompt(text, ratio)
        
        # Console log the compression test
        print(f"\n🧪 COMPRESSION TEST:")
        print(f"Original: {result['original']}")
        print(f"Compressed: {result['compressed']}")
        print(f"Ratio: {result['compression_ratio']}%")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f'Error in compression test: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({'service': 'ChatGPT Message Logger', 'version': '1.0.0'})

if __name__ == '__main__':
    logger.info('🚀 Starting ChatGPT Message Logger Service...')
    logger.info('📡 Service will run on http://localhost:8002')
    app.run(host='0.0.0.0', port=8002, debug=True)

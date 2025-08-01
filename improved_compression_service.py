#!/usr/bin/env python3
"""
Improved Compression Service with better prompt_compressor integration
"""

import os
import sys
import json
import logging
import importlib.util
from flask import Flask, request, jsonify
from flask_cors import CORS
import tiktoken

# Add prompt_compressor to path if it exists
if os.path.exists('./prompt_compressor'):
    sys.path.insert(0, './prompt_compressor')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class AdvancedPromptCompressor:
    def __init__(self):
        self.encoder = tiktoken.get_encoding("cl100k_base")
        self.prompt_compressor = None
        self._load_prompt_compressor()
        
    def _load_prompt_compressor(self):
        """Try to load the prompt_compressor library"""
        try:
            # Try to import the prompt_compressor module
            spec = importlib.util.spec_from_file_location(
                "prompt_compressor", 
                "./prompt_compressor/prompt_compressor/__init__.py"
            )
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Try to get the PromptCompressor class
                if hasattr(module, 'PromptCompressor'):
                    self.prompt_compressor = module.PromptCompressor()
                    logger.info("✓ Loaded prompt_compressor library")
                else:
                    logger.warning("PromptCompressor class not found in module")
                    
        except Exception as e:
            logger.warning(f"Could not load prompt_compressor library: {e}")
            logger.info("Falling back to built-in compression rules")
    
    def count_tokens(self, text):
        """Count tokens using tiktoken"""
        try:
            return len(self.encoder.encode(text))
        except Exception as e:
            logger.error(f"Error counting tokens: {e}")
            return len(text.split())
    
    def library_compress(self, text):
        """Compress using the prompt_compressor library"""
        if not self.prompt_compressor:
            return None
            
        try:
            # Use the library's compression method
            result = self.prompt_compressor.compress(text)
            
            # Handle different possible return formats
            if isinstance(result, dict):
                return result.get('compressed_text', result.get('compressed', text))
            elif isinstance(result, str):
                return result
            else:
                return str(result)
                
        except Exception as e:
            logger.error(f"Library compression failed: {e}")
            return None
    
    def rule_based_compress(self, text):
        """Enhanced rule-based compression"""
        # Common contraction rules
        contractions = {
            "I am": "I'm",
            "you are": "you're",
            "he is": "he's",
            "she is": "she's",
            "it is": "it's",
            "we are": "we're",
            "they are": "they're",
            "I will": "I'll",
            "you will": "you'll",
            "he will": "he'll",
            "she will": "she'll",
            "it will": "it'll",
            "we will": "we'll",
            "they will": "they'll",
            "I would": "I'd",
            "you would": "you'd",
            "he would": "he'd",
            "she would": "she'd",
            "we would": "we'd",
            "they would": "they'd",
            "I have": "I've",
            "you have": "you've",
            "we have": "we've",
            "they have": "they've"
        }
        
        # Politeness reduction rules
        politeness_reductions = [
            ("could you please", "please"),
            ("would you mind", "please"),
            ("I would like to", "I want to"),
            ("I would appreciate if", "please"),
            ("it would be great if", "please"),
            ("if you could", "please"),
            ("I am wondering if", "can"),
            ("I was hoping that", "please"),
            ("would it be possible to", "can you"),
        ]
        
        # Redundancy removal
        redundancy_rules = [
            ("really very", "very"),
            ("quite very", "very"),
            ("really quite", "quite"),
            ("more about", "about"),
            ("learn more about", "learn about"),
            ("understand more about", "understand"),
            ("know more about", "know about"),
            ("in order to", "to"),
            ("for the purpose of", "to"),
            ("with the goal of", "to"),
        ]
        
        # Filler word removal
        filler_words = [
            "basically", "actually", "literally", "obviously", 
            "clearly", "definitely", "certainly", "surely",
            "of course", "naturally", "undoubtedly"
        ]
        
        compressed = text
        
        # Apply contractions
        for full, contracted in contractions.items():
            compressed = compressed.replace(full, contracted)
            compressed = compressed.replace(full.capitalize(), contracted.capitalize())
        
        # Apply politeness reductions
        for verbose, concise in politeness_reductions:
            compressed = compressed.replace(verbose, concise)
            compressed = compressed.replace(verbose.capitalize(), concise.capitalize())
        
        # Apply redundancy rules
        for redundant, concise in redundancy_rules:
            compressed = compressed.replace(redundant, concise)
        
        # Remove filler words (but be careful not to change meaning)
        for filler in filler_words:
            # Only remove if it's a standalone word
            import re
            pattern = r'\b' + re.escape(filler) + r'\b'
            compressed = re.sub(pattern, '', compressed, flags=re.IGNORECASE)
        
        # Clean up extra spaces
        compressed = ' '.join(compressed.split())
        
        return compressed.strip()
    
    def smart_compress(self, text):
        """Smart compression that tries multiple approaches"""
        original_tokens = self.count_tokens(text)
        
        # Don't compress very short messages
        if original_tokens < 5:
            return {
                'original_text': text,
                'compressed_text': text,
                'original_tokens': original_tokens,
                'compressed_tokens': original_tokens,
                'tokens_saved': 0,
                'compression_ratio': 0,
                'method': 'no_compression_needed'
            }
        
        best_compression = text
        best_tokens = original_tokens
        best_method = 'original'
        
        # Try library compression
        if self.prompt_compressor:
            try:
                library_result = self.library_compress(text)
                if library_result and library_result != text:
                    library_tokens = self.count_tokens(library_result)
                    if library_tokens < best_tokens:
                        best_compression = library_result
                        best_tokens = library_tokens
                        best_method = 'library'
            except Exception as e:
                logger.error(f"Library compression error: {e}")
        
        # Try rule-based compression
        rule_result = self.rule_based_compress(text)
        if rule_result and rule_result != text:
            rule_tokens = self.count_tokens(rule_result)
            if rule_tokens < best_tokens:
                best_compression = rule_result
                best_tokens = rule_tokens
                best_method = 'rule_based'
        
        # Calculate final statistics
        tokens_saved = original_tokens - best_tokens
        compression_ratio = (tokens_saved / original_tokens * 100) if original_tokens > 0 else 0
        
        return {
            'original_text': text,
            'compressed_text': best_compression,
            'original_tokens': original_tokens,
            'compressed_tokens': best_tokens,
            'tokens_saved': tokens_saved,
            'compression_ratio': round(compression_ratio, 2),
            'method': best_method
        }

# Initialize compressor
compressor = AdvancedPromptCompressor()

@app.route('/compress', methods=['POST'])
def compress_text():
    """Compress text endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field in request'}), 400
        
        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Empty text provided'}), 400
        
        result = compressor.smart_compress(text)
        
        logger.info(f"Compression: {result['original_tokens']} → {result['compressed_tokens']} tokens "
                   f"({result['compression_ratio']}%) using {result['method']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in compress endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'advanced_prompt_compressor',
        'library_loaded': compressor.prompt_compressor is not None
    })

@app.route('/stats', methods=['GET'])
def service_stats():
    """Service statistics"""
    return jsonify({
        'service': 'Advanced ChatGPT Prompt Compression Service',
        'version': '2.0.0',
        'features': {
            'library_compression': compressor.prompt_compressor is not None,
            'rule_based_compression': True,
            'smart_selection': True,
            'token_counting': True
        },
        'endpoints': {
            '/compress': 'POST - Compress text',
            '/health': 'GET - Health check',
            '/stats': 'GET - Service statistics'
        }
    })

@app.route('/', methods=['GET'])
def index():
    """Service info endpoint"""
    return jsonify({
        'service': 'Advanced ChatGPT Prompt Compression Service',
        'version': '2.0.0',
        'status': 'running',
        'library_loaded': compressor.prompt_compressor is not None
    })

if __name__ == '__main__':
    logger.info("Starting Advanced Prompt Compression Service on http://localhost:8002")
    logger.info(f"Library loaded: {compressor.prompt_compressor is not None}")
    app.run(host='0.0.0.0', port=8002, debug=False)
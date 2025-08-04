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
            "they have": "they've",
            "do not": "don't",
            "does not": "doesn't",
            "did not": "didn't",
            "can not": "can't",
            "cannot": "can't",
            "will not": "won't",
            "would not": "wouldn't",
            "should not": "shouldn't",
            "could not": "couldn't",
            "have not": "haven't",
            "has not": "hasn't",
            "had not": "hadn't",
            "is not": "isn't",
            "are not": "aren't",
            "was not": "wasn't",
            "were not": "weren't"
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
            ("very detailed", "detailed"),
            ("very important", "important"),
            ("very interesting", "interesting"),
            ("very helpful", "helpful"),
            ("very useful", "useful"),
            ("very good", "good"),
            ("very bad", "bad"),
            ("very large", "large"),
            ("very small", "small"),
            ("very long", "long"),
            ("very short", "short"),
            ("very fast", "fast"),
            ("very slow", "slow"),
            ("very easy", "easy"),
            ("very difficult", "difficult"),
            ("very simple", "simple"),
            ("very complex", "complex"),
            ("very clear", "clear"),
            ("very obvious", "obvious"),
            ("very basic", "basic"),
            ("very advanced", "advanced"),
            ("very specific", "specific"),
            ("very general", "general"),
            ("very accurate", "accurate"),
            ("very precise", "precise"),
            ("very exact", "exact"),
            ("very similar", "similar"),
            ("very different", "different"),
            ("very common", "common"),
            ("very rare", "rare"),
            ("very popular", "popular"),
            ("very famous", "famous"),
            ("very successful", "successful"),
            ("very effective", "effective"),
            ("very efficient", "efficient"),
            ("very powerful", "powerful"),
            ("very strong", "strong"),
            ("very weak", "weak"),
            ("very high", "high"),
            ("very low", "low"),
            ("very big", "big"),
            ("very little", "little"),
            ("very much", "much"),
            ("very many", "many"),
            ("very few", "few"),
            ("very often", "often"),
            ("very rarely", "rarely"),
            ("very quickly", "quickly"),
            ("very slowly", "slowly"),
            ("very carefully", "carefully"),
            ("very easily", "easily"),
            ("very well", "well"),
            ("very badly", "badly"),
            ("very nicely", "nicely"),
            ("very beautifully", "beautifully"),
            ("very perfectly", "perfectly"),
            ("very completely", "completely"),
            ("very totally", "totally"),
            ("very absolutely", "absolutely"),
            ("very definitely", "definitely"),
            ("very certainly", "certainly"),
            ("very surely", "surely"),
            ("very probably", "probably"),
            ("very possibly", "possibly"),
            ("very maybe", "maybe"),
            ("very perhaps", "perhaps"),
            ("very usually", "usually"),
            ("very normally", "normally"),
            ("very typically", "typically"),
            ("very generally", "generally"),
            ("very usually", "usually"),
            ("very commonly", "commonly"),
            ("very frequently", "frequently"),
            ("very regularly", "regularly"),
            ("very constantly", "constantly"),
            ("very continuously", "continuously"),
            ("very always", "always"),
            ("very never", "never"),
            ("very sometimes", "sometimes"),
            ("very occasionally", "occasionally"),
            ("very rarely", "rarely"),
            ("very seldom", "seldom"),
            ("very hardly", "hardly"),
            ("very barely", "barely"),
            ("very scarcely", "scarcely"),
            ("very almost", "almost"),
            ("very nearly", "nearly"),
            ("very approximately", "approximately"),
            ("very roughly", "roughly"),
            ("very about", "about"),
            ("very around", "around"),
            ("very close to", "close to"),
            ("very near to", "near to"),
            ("very far from", "far from"),
            ("very away from", "away from"),
            ("very inside", "inside"),
            ("very outside", "outside"),
            ("very within", "within"),
            ("very without", "without"),
            ("very above", "above"),
            ("very below", "below"),
            ("very under", "under"),
            ("very over", "over"),
            ("very on top of", "on top of"),
            ("very in front of", "in front of"),
            ("very behind", "behind"),
            ("very next to", "next to"),
            ("very beside", "beside"),
            ("very between", "between"),
            ("very among", "among"),
            ("very through", "through"),
            ("very across", "across"),
            ("very along", "along"),
            ("very around", "around"),
            ("very throughout", "throughout"),
            ("very during", "during"),
            ("very while", "while"),
            ("very when", "when"),
            ("very where", "where"),
            ("very why", "why"),
            ("very how", "how"),
            ("very what", "what"),
            ("very which", "which"),
            ("very who", "who"),
            ("very whom", "whom"),
            ("very whose", "whose"),
        ]
        
        # Filler word removal
        filler_words = [
            "basically", "actually", "literally", "obviously", 
            "clearly", "definitely", "certainly", "surely",
            "of course", "naturally", "undoubtedly", "indeed",
            "frankly", "honestly", "truthfully", "seriously"
        ]
        
        # Additional compression rules for common phrases
        additional_rules = [
            ("artificial intelligence", "AI"),
            ("machine learning", "ML"),
            ("deep learning", "DL"),
            ("neural networks", "neural nets"),
            ("natural language processing", "NLP"),
            ("computer vision", "CV"),
            ("data science", "DS"),
            ("big data", "large data"),
            ("cloud computing", "cloud"),
            ("internet of things", "IoT"),
            ("virtual reality", "VR"),
            ("augmented reality", "AR"),
            ("blockchain technology", "blockchain"),
            ("cryptocurrency", "crypto"),
            ("user interface", "UI"),
            ("user experience", "UX"),
            ("application programming interface", "API"),
            ("representational state transfer", "REST"),
            ("graphical user interface", "GUI"),
            ("command line interface", "CLI"),
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
        
        # Apply additional compression rules
        for long_phrase, short_phrase in additional_rules:
            compressed = compressed.replace(long_phrase, short_phrase)
            compressed = compressed.replace(long_phrase.capitalize(), short_phrase.capitalize())
        
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

@app.route('/log-message', methods=['POST'])
def log_message():
    """Log message and return compression result - compatible with extension"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message field in request'}), 400
        
        message = data['message']
        url = data.get('url', 'unknown')
        
        if not message or not message.strip():
            return jsonify({'error': 'Empty message provided'}), 400
        
        # Log the message
        logger.info(f"Message logged from {url}: {message[:100]}...")
        
        # Compress the message
        compression_result = compressor.smart_compress(message)
        
        # Format response for extension
        response = {
            'compression': {
                'success': True,
                'original': compression_result['original_text'],
                'compressed': compression_result['compressed_text'],
                'original_length': len(compression_result['original_text']),
                'compressed_length': len(compression_result['compressed_text']),
                'compression_ratio': round((1 - len(compression_result['compressed_text']) / len(compression_result['original_text'])) * 100, 2),
                'original_tokens': compression_result['original_tokens'],
                'compressed_tokens': compression_result['compressed_tokens'],
                'token_compression_ratio': compression_result['compression_ratio'],
                'method': compression_result['method'],
                'tiktoken_available': True
            },
            'logged': True,
            'url': url
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in log-message endpoint: {e}")
        return jsonify({
            'compression': {
                'success': False,
                'error': str(e)
            }
        }), 500

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
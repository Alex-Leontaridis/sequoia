# 🗜️ ChatGPT Prompt Compression Setup Guide

This guide will help you set up the [PCToolkit prompt compression library](https://github.com/3DAgentWorld/Toolkit-for-Prompt-Compression) integration with our ChatGPT Spanish Modifier extension.

## 🎯 What This Does

- **Intercepts user prompts** sent to ChatGPT
- **Compresses prompts** using state-of-the-art compression techniques
- **Logs compression analysis** to console with detailed statistics
- **Maintains Spanish modification** functionality
- **Reduces token usage** while preserving prompt meaning

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
python3 setup_pctoolkit.py
```

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
pip3 install -r requirements.txt
```

2. **Clone PCToolkit:**
```bash
git clone https://github.com/3DAgentWorld/Toolkit-for-Prompt-Compression.git PCToolkit
```

3. **Install PCToolkit requirements:**
```bash
pip3 install -r PCToolkit/requirements.txt
```

4. **Create symlink (Linux/Mac) or copy (Windows):**
```bash
# Linux/Mac
ln -s PCToolkit/pctoolkit pctoolkit

# Windows
xcopy PCToolkit\pctoolkit pctoolkit /E /I
```

## 🧪 Testing the Setup

1. **Test the compression service:**
```bash
python3 test_compression.py
```

2. **Start the service:**
```bash
python3 message_logger_service.py
```

3. **Check health with compression status:**
```bash
curl http://localhost:8002/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ChatGPT Message Logger with Prompt Compression",
  "compression_available": true,
  "compressor_initialized": true,
  "compression_method": "SCCompressor"
}
```

## 🔧 How It Works

### 1. **Compression Integration**
The service now includes the PCToolkit library:
```python
from pctoolkit.compressors import PromptCompressor

compressor = PromptCompressor(type='SCCompressor', device='cpu')
result = compressor.compressgo(text, ratio=0.3)
```

### 2. **Console Logging**
Every time a user sends a message to ChatGPT, you'll see detailed compression analysis:

```
================================================================================
🔥 PROMPT COMPRESSION ANALYSIS
================================================================================
📅 Timestamp: 2024-01-15T10:30:45.123456
🌐 URL: https://chat.openai.com/c/abc123
📏 Original Length: 156 chars
📦 Compressed Length: 98 chars
📊 Compression Ratio: 37.18%
🔧 Method: SCCompressor

📝 ORIGINAL PROMPT:
----------------------------------------
How can I improve my productivity at work? I'm looking for practical tips...

🗜️ COMPRESSED PROMPT:
----------------------------------------
How improve productivity work? Looking practical tips...
================================================================================
```

### 3. **API Endpoints**

- **`POST /log-message`** - Logs messages with compression analysis
- **`POST /compress`** - Test compression directly
- **`GET /health`** - Health check with compression status
- **`GET /messages`** - View logged messages with compression data

## 🎛️ Configuration Options

### Compression Methods Available:
- **`SCCompressor`** - Selective Context (default)
- **`LLMLingua`** - LLMLingua compression
- **`LongLLMLingua`** - Long context compression
- **`SCRL`** - Sentence Compression with Reinforcement Learning
- **`KiS`** - Keep it Simple

### Change Compression Method:
In `message_logger_service.py`, modify line 30:
```python
compressor = PromptCompressor(type='LLMLingua', device='cpu')  # Change type here
```

### Adjust Compression Ratio:
Default ratio is 0.3 (compress to 30% of original). Adjust in the service:
```python
compression_ratio = data.get('compression_ratio', 0.5)  # Change default here
```

### GPU Acceleration:
If you have CUDA available:
```python
compressor = PromptCompressor(type='SCCompressor', device='cuda')
```

## 📊 Compression Performance

Based on PCToolkit benchmarks:

| Method | Avg Compression | Speed | Quality |
|--------|----------------|-------|---------|
| SCCompressor | 30-50% | Fast | High |
| LLMLingua | 40-60% | Medium | High |
| LongLLMLingua | 50-70% | Slow | Very High |
| SCRL | 25-40% | Fast | Medium |
| KiS | 20-35% | Very Fast | Medium |

## 🔍 Usage Example

1. **Start the service:**
```bash
python3 message_logger_service.py
```

2. **Load Chrome extension** and visit ChatGPT

3. **Send a message** like:
```
"Please explain the process of machine learning, including supervised and unsupervised learning, and provide examples of real-world applications."
```

4. **Console output:**
```
🔥 PROMPT COMPRESSION ANALYSIS
📏 Original Length: 142 chars
📦 Compressed Length: 89 chars  
📊 Compression Ratio: 37.32%
🔧 Method: SCCompressor

📝 ORIGINAL PROMPT:
Please explain the process of machine learning, including supervised and unsupervised learning, and provide examples of real-world applications.

🗜️ COMPRESSED PROMPT:
Explain machine learning: supervised, unsupervised learning. Real-world examples.
```

## 🛠️ Troubleshooting

### PCToolkit Import Errors:
```bash
# Ensure PCToolkit is in your Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/PCToolkit"

# Or install in development mode
cd PCToolkit && pip3 install -e .
```

### Model Download Issues:
```bash
# Some models are downloaded on first use
# Make sure you have good internet connection
# Check available disk space (models can be large)
```

### CUDA Issues:
```bash
# If CUDA fails, fall back to CPU
# Edit message_logger_service.py line 30:
compressor = PromptCompressor(type='SCCompressor', device='cpu')
```

### Memory Issues:
```bash
# Reduce compression ratio for faster processing
compression_ratio = 0.5  # Less aggressive compression
```

## 📈 Benefits

✅ **Token Reduction:** Save 30-70% on ChatGPT API costs  
✅ **Detailed Analytics:** See exactly how prompts are compressed  
✅ **Multiple Methods:** Choose the best compression for your needs  
✅ **Real-time Processing:** Instant compression with visual feedback  
✅ **Spanish Integration:** Works with existing Spanish modification  
✅ **Research Ready:** Log data for compression analysis  

## 🔗 References

- [PCToolkit Repository](https://github.com/3DAgentWorld/Toolkit-for-Prompt-Compression)
- [PCToolkit Paper](https://arxiv.org/abs/2403.17411)
- [Selective Context Paper](https://arxiv.org/abs/2304.12102)
- [LLMLingua Paper](https://arxiv.org/abs/2310.05736)

Now you have a complete prompt compression system integrated with your ChatGPT extension! 🎉
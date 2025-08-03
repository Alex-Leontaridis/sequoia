#!/bin/bash

# ChatGPT Message Compressor - Quick Start Script
# This script sets up the complete system automatically

set -e  # Exit on any error

echo "🚀 ChatGPT Message Compressor - Quick Start"
echo "=========================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "improved_compression_service.py" ] || [ ! -d "chrome-extension" ]; then
    print_error "Please run this script from the project root directory"
    print_error "Make sure you have both the backend files and chrome-extension folder"
    exit 1
fi

print_status "Checking system requirements..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check Node.js (for testing)
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found - integration test will be skipped"
    NODE_AVAILABLE=false
else
    NODE_AVAILABLE=true
fi

print_success "System requirements check passed"

# Install Python dependencies
print_status "Installing Python dependencies..."
if pip3 install -r requirements.txt; then
    print_success "Python dependencies installed"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Start the backend service
print_status "Starting backend compression service..."
cd chrome-extension

# Check if port 8002 is already in use
if lsof -Pi :8002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 8002 is already in use. Stopping existing service..."
    pkill -f "improved_compression_service.py" || true
    sleep 2
fi

# Start the service in background
python3 ../improved_compression_service.py > ../backend.log 2>&1 &
SERVICE_PID=$!

# Wait for service to start
print_status "Waiting for service to start..."
sleep 5

# Test if service is running
if curl -s http://localhost:8002/health > /dev/null; then
    print_success "Backend service started successfully"
else
    print_error "Failed to start backend service"
    print_error "Check backend.log for details"
    kill $SERVICE_PID 2>/dev/null || true
    exit 1
fi

# Run integration test if Node.js is available
if [ "$NODE_AVAILABLE" = true ]; then
    print_status "Running integration test..."
    if node test_integration.js; then
        print_success "Integration test passed"
    else
        print_warning "Integration test failed - but service is running"
    fi
else
    print_warning "Skipping integration test (Node.js not available)"
fi

# Print setup instructions
echo
echo "🎉 Setup Complete!"
echo "=================="
echo
echo "The backend service is now running on http://localhost:8002"
echo
echo "Next steps to load the Chrome extension:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'chrome-extension' folder"
echo "5. The extension should now appear in your extensions list"
echo
echo "To test the extension:"
echo "1. Go to https://chat.openai.com"
echo "2. Start chatting normally"
echo "3. Look for green notifications showing compression stats"
echo
echo "Service endpoints:"
echo "• Health check: http://localhost:8002/health"
echo "• Compression API: http://localhost:8002/compress"
echo "• Service info: http://localhost:8002/"
echo
echo "To stop the service, run:"
echo "  pkill -f 'improved_compression_service.py'"
echo
echo "Logs are saved to: backend.log"

# Save PID for easy cleanup
echo $SERVICE_PID > ../service.pid
print_success "Service PID saved to service.pid"

echo
print_status "Setup complete! The backend service is running in the background." 
from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Serve index.html at the root
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve test.html
@app.route('/test.html')
def test():
    return send_from_directory('.', 'test.html')

# Health check endpoint
@app.route('/health')
def health():
    return 'healthy\n', 200

# Serve any other static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
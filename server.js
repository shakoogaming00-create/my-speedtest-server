const http = require('http');
const crypto = require('crypto');

const PORT = 3000;
// Generate 10MB of random dummy data in memory once to save CPU
const dummyData10MB = crypto.randomBytes(10 * 1024 * 1024);

const server = http.createServer((req, res) => {
    // Set CORS headers so your frontend can talk to this backend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle options preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Ping endpoint
    if (req.method === 'GET' && req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
        return;
    }

    // 2. Download endpoint (Sends the 10MB file)
    if (req.method === 'GET' && req.url === '/download') {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': dummyData10MB.length,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        });
        res.end(dummyData10MB);
        return;
    }

    // 3. Upload endpoint (Receives dummy data from browser)
    if (req.method === 'POST' && req.url === '/upload') {
        let bodySize = 0;
        req.on('data', (chunk) => {
            bodySize += chunk.length;
        });
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success', receivedBytes: bodySize }));
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Speed test server is running on http://localhost:${PORT}`);
});

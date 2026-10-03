const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your website frontend can make requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Prevent browser from caching speed test data
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 1. PING Endpoint (for measuring latency)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// 2. DOWNLOAD Endpoint (streams dummy binary data)
app.get('/download', (req, res) => {
  const sizeInMB = parseInt(req.query.size) || 25; // Default 25MB chunk
  const chunkSize = 1024 * 1024; // 1MB
  const totalBytes = sizeInMB * 1024 * 1024;
  const dummyBuffer = crypto.randomBytes(chunkSize);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', totalBytes);

  let sentBytes = 0;
  function sendChunks() {
    while (sentBytes < totalBytes) {
      const remainingBytes = totalBytes - sentBytes;
      const currentChunkSize = Math.min(chunkSize, remainingBytes);
      const canContinue = res.write(dummyBuffer.subarray(0, currentChunkSize));
      sentBytes += currentChunkSize;
      if (!canContinue) {
        res.once('drain', sendChunks);
        return;
      }
    }
    res.end();
  }
  sendChunks();
});

// 3. UPLOAD Endpoint (measures upload speed by reading incoming stream)
app.post('/upload', (req, res) => {
  let receivedBytes = 0;
  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
  });
  req.on('end', () => {
    res.status(200).json({ status: 'ok', receivedBytes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

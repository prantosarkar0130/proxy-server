const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// --- আপনার Google Drive API Key এখানে বসান ---
const API_KEY = 'AIzaSyCfCvc7jayg-hRnhF-bFu1cJ1-m7BR2cX4'; 

app.get('/video/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

    try {
        const range = req.headers.range;
        
        const axiosConfig = {
            method: 'get',
            url: driveUrl,
            responseType: 'stream',
            headers: {}
        };

        if (range) {
            axiosConfig.headers['Range'] = range;
        }

        const response = await axios(axiosConfig);

        // হেডারগুলো সেট করা যাতে ArtPlayer সহজে স্ট্রিমিং করতে পারে
        res.set({
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': response.headers['content-length'],
            'Content-Range': response.headers['content-range'] || '',
        });

        if (range && response.status === 206) {
            res.status(206); // Partial Content for seeking
        }

        response.data.pipe(res);

    } catch (error) {
        console.error("Streaming Error:", error.message);
        res.status(500).send("Video could not be loaded.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy Server running on port ${PORT}`));

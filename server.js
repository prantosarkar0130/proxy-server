const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// আপনার API Key টি এখানে দিন
const API_KEY = 'AIzaSyCfCvc7jayg-hRnhF-bFu1cJ1-m7BR2cX4'; 

app.get('/video/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;

    try {
        const range = req.headers.range;

        const response = await axios({
            method: 'get',
            url: driveUrl,
            responseType: 'stream',
            headers: {
                // ব্রাউজারের Range রিকোয়েস্ট হুবহু গুগলের কাছে পাঠানো
                Range: range || 'bytes=0-'
            }
        });

        // ড্রাইভ থেকে পাওয়া হেডারগুলো সেট করা
        res.status(response.status); // ২১৬ (Partial Content) হলে তাই পাঠাবে
        res.set({
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Content-Length': response.headers['content-length'],
            'Content-Range': response.headers['content-range'] || '',
            'Access-Control-Allow-Origin': '*',
        });

        response.data.pipe(res);

    } catch (error) {
        // যদি ড্রাইভ থেকে কোনো এরর আসে (যেমন ৪৮৩ বা ৫০৩)
        console.error("G-Drive Error:", error.response ? error.response.status : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: "Streaming Failed",
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Proxy Server running on port ${PORT}`));

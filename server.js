const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL প্রয়োজন' });
        }
        
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.data && response.data.code === 0 && response.data.data) {
            const data = response.data.data;
            res.json({
                success: true,
                title: data.title,
                videoUrl: data.play,
                thumbnail: data.cover
            });
        } else {
            res.status(404).json({ error: 'ভিডিও পাওয়া যায়নি' });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'সার্ভার সমস্যা, পরে আবার চেষ্টা করুন' });
    }
});

app.get('/api/proxy', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        if (!videoUrl) {
            return res.status(400).json({ error: 'URL প্রয়োজন' });
        }
        
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
        response.data.pipe(res);
        
    } catch (error) {
        res.status(500).json({ error: 'প্রক্সি ইরর' });
    }
});

app.listen(PORT, () => {
    console.log(`সার্ভার চালু হয়েছে!`);
    console.log(`http://localhost:${PORT} ওপেন করুন`);
});
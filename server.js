const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// TikTok API - with video info
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL প্রয়োজন' });
        }
        
        // Using tikwm.com API which returns full video info
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.data && response.data.code === 0 && response.data.data) {
            const data = response.data.data;
            
            // Extract video info
            const videoInfo = {
                success: true,
                title: data.title || 'TikTok Video',
                videoUrl: data.play || data.wmplay,
                thumbnail: data.cover,
                author: data.author?.unique_id || data.author?.nickname || 'unknown',
                likes: data.digg_count || 0,
                comments: data.comment_count || 0,
                shares: data.share_count || 0,
                duration: data.duration || 0
            };
            
            res.json(videoInfo);
        } else {
            res.status(404).json({ error: 'ভিডিও পাওয়া যায়নি' });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'সার্ভার সমস্যা' });
    }
});

// Proxy endpoint for downloading
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tiktok.com/'
            }
        });
        
        res.setHeader('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
        
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'প্রক্সি ইরর' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 সার্ভার চালু হয়েছে!`);
    console.log(`📱 পোর্ট: ${PORT}`);
});
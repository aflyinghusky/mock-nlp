const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    const start = process.hrtime(); // Get high-resolution time at request start

    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(start); // Calculate elapsed time
        const elapsedMilliseconds = (seconds * 1e3 + nanoseconds / 1e6).toFixed(3); // Convert to ms
        const statusCode = res.statusCode; 
        console.log(`method=${req.method}, url=${req.originalUrl}, status_code=${statusCode}, response_time=${elapsedMilliseconds}ms`);
    });

    next();
});
// Mock Intent Detection
function detectIntent(message) {
    if (/không em ơi/i.test(message)) return "tu_choi";
    if (/đúng rồi/i.test(message)) return "dong_y";
    return "other";
}

function extractEntities(message) {
    const entities = {};

    // Location Extraction
    const locationMatch = message.match(/tại\s(\w+)/i);
    if (locationMatch) entities.location = locationMatch[1];

    // Topic Extraction
    const topicMatch = message.match(/về\s(\w+)/i);
    if (topicMatch) entities.topic = topicMatch[1];

    // Date Extraction (e.g., "ngày 25/12/2024" or "ngày mai")
    const dateMatch = message.match(/ngày\s(\d{1,2}\/\d{1,2}\/\d{4}|mai|hôm nay|hôm qua)/i);
    if (dateMatch) entities.date = dateMatch[1];

    // Time Extraction (e.g., "lúc 14:30" or "vào buổi chiều")
    const timeMatch = message.match(/lúc\s(\d{1,2}:\d{2})|vào\s(buổi\s\w+)/i);
    if (timeMatch) entities.time = timeMatch[1] || timeMatch[2];

    // Quantity Extraction (e.g., "số lượng 5" or "10 cái")
    const quantityMatch = message.match(/số\s*lượng\s*(\d+)|(\d+)\s*(cái|người|vé|quyển|chiếc)/i);
    if (quantityMatch) entities.quantity = quantityMatch[1] || quantityMatch[2];

    return entities;
}

const customEntityConfigs = [
    { entity: "location", regex: /tại\s(\w+)/i },
    { entity: "date", regex: /ngày\s(\d{1,2}\/\d{1,2}\/\d{4}|mai|hôm nay|hôm qua)/i },
    { entity: "time", regex: /lúc\s(\d{1,2}:\d{2})|vào\s(buổi\s\w+)/i },
    { entity: "quantity", regex: /số\s*lượng\s*(\d+)|(\d+)\s*(cái|người|vé|quyển|chiếc)/i },
    { entity: "customEntity", regex: /xem\s(\w+)/i } // Example custom entity
];

function extractCustomEntities(message) {
    const entities = {};
    customEntityConfigs.forEach(({ entity, regex }) => {
        const match = message.match(regex);
        if (match) {
            entities[entity] = match[1] || match[0];
        }
    });

    return entities;
}

// Intent Detection API
app.post('/api/nlp/v2/intent', async (req, res) => {
    const { data: message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const intent = detectIntent(message);
    await timeout(randResponseTime());
    res.json({ intent });
});

// Entity Extraction API
app.post('/api/nlp/v2/entity', async (req, res) => {
    const { data: message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    await timeout(randResponseTime());
    const entities = extractCustomEntities(message);
    res.json({ entities });
});

app.post('/api/v2/entity', async (req, res) => {
    const { data: message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    await timeout(randResponseTime());
    const entities = extractEntities(message);
    res.json({ entities });
});

function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function randResponseTime() {
    // Generate a random number between 100 and 150
    return Math.floor(Math.random() * 101) + 50;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mock NLP Service running on port ${PORT}`));

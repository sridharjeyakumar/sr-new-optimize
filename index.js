const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { optii } = require('./optimise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const readCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const csvData = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                csvData.push(row);
            })
            .on('end', () => {
                resolve(csvData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

app.post('/backend/optimize', async (req, res) => {
    try {
        const requestData = req.body.requestData;
        const corridorCsvPath = path.resolve(__dirname, 'Corridor - Final.csv');
        const corridorData = await readCsvFile(corridorCsvPath);
        const optimizedData = await optii(requestData, corridorData);
        res.json({ 'len': optimizedData.length, 'req': requestData.length, optimizedData });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

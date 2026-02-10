const fs = require('fs');
const path = require('path');

const readJsonFile = (filename) => {
    try {
        // Robust path resolution logic
        // Try server/data first, then data (local dev vs prod structure)
        let dataDir = path.join(process.cwd(), 'server/data');
        if (!fs.existsSync(dataDir)) {
             dataDir = path.join(process.cwd(), 'data');
        }
        
        const filePath = path.join(dataDir, filename);

        if (!fs.existsSync(filePath)) {
            console.error(`DataLoader: File not found: ${filePath}`);
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`DataLoader: Error reading ${filename}:`, error);
        return [];
    }
};

module.exports = { readJsonFile };

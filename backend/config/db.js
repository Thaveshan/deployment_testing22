const mongoose = require('mongoose');

const profileDb = mongoose.createConnection(process.env.MONGO_URI);
const logsDb = mongoose.createConnection(process.env.MONGO_Logs_URI);

profileDb.on('connected', () => {
    console.log('Connected to Profile Database');
});

profileDb.on('error', (err) => {
    console.error('Profile Database connection error:', err);
});

logsDb.on('connected', () => {
    console.log('Connected to Logs Database');
});

logsDb.on('error', (err) => {
    console.error('Logs Database connection error:', err);
});

module.exports = { profileDb, logsDb };


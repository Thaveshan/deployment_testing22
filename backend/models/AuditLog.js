const mongoose = require('mongoose');
const { logsDb } = require('../config/db');

const auditLogSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
    },

    action: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = logsDb.model('AuditLog', auditLogSchema);
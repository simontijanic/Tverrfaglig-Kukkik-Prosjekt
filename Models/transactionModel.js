const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    reindeer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reindeer',
        required: true
    },
    currentOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    newOwnerEmail: {
        type: String,
        required: true
    },
    newOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted_by_new_owner', 'rejected_by_new_owner', 'accepted_final', 'rejected_final'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Transfer', transferSchema);
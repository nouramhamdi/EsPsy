const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    eventid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentfeedback: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
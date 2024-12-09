const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.Mixed,  // Can be either ObjectId or String
    required: true
  },
  senderEmail: {  // Store the actual email address
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: '(No Subject)'
  },
  body: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Email', EmailSchema);
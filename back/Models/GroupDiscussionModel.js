const mongoose = require("mongoose");



// Message Schema
const messageSchema = new mongoose.Schema({

  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  content: { type: String }, 

  timestamp: { type: Date, default: Date.now },

  isPinned: { type: Boolean, default: false },

  isEdited: { type: Boolean, default: false },

  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["like", "heart", "thumbsUp"] }
  }],

  media: {
    type: { 
      type: String, 
      enum: ["image", "video", "audio", "pdf", "txt"] // Added audio type
    }, 
    url: { type: String },
    duration: { // Optional duration for audio messages
      type: Number, 
      min: 0,
      default: null 
    }
  },
  new: { // Added boolean field
    type: Boolean,
    default: true,
  },
  messageType: { // Optional: Explicit message type declaration
    type: String,
    enum: ['text', 'media', 'vocal'],
    default: 'text'
  }

});


const groupDiscussionSchema = new mongoose.Schema({

  name: { type: String, required: true }, 

  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 

  theme: { type: String}, 

  moderator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 

  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 

  isLocked: { type: Boolean, default: false }, 

  messages: [messageSchema] ,

}, { timestamps: true });

module.exports = mongoose.model("GroupDiscussion", groupDiscussionSchema);
const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Or String if you're using anonymous IDs or UUIDs
    ref: "User", // Optional: only if you have a User model
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOption: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  result: {  // New field for storing the analysis result
    type: String,
    required: false,  // The result might not be available at first, so it's not mandatory
  },
  // models/Response.js
treated: {
  type: Boolean,
  default: false
},
supportMessage: {
  type: String,
},
suggestedResource: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Resource",
},


});

module.exports = mongoose.model("TestResponse", responseSchema);

const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to students
    required: true,
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to psychologists
    required: true,
  },
   description: {
    type: String
  }, 
  scheduledDate: { type: Date },
  time:{type:String},
  status: {
    type: String,
    enum: ["requested", "approved", "declined", "completed","pending_confirmation","cancelled"],
    default: "requested",
  },
  feedbacks: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    feedback: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

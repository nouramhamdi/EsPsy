const mongoose = require('mongoose');

const filePatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Psychologist ID is required']
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const FilePatient = mongoose.model('FilePatient', filePatientSchema);

module.exports = FilePatient;
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  taskDate: {
    type: Date,
    required: true
  },
  headingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Heading',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

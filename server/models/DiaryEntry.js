const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  headingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Heading',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);

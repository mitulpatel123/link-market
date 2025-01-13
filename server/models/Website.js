const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  headingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Heading',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Website', websiteSchema);

const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  topics: [{ type: String, trim: true }]
});

const syllabusSchema = new mongoose.Schema(
  {
    board: { 
      type: String, 
      required: true, 
      enum: ['FBISE', 'BISE Lahore', 'MDCAT', 'CSS', 'General'],
      trim: true 
    },
    subject:  { type: String, required: true, trim: true },
    chapters: [chapterSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Syllabus', syllabusSchema);

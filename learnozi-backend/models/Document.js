const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    characterCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// We don't want to send the giant extracted text string to the frontend list view
// so we'll exclude it by default when querying multiple docs.
documentSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.extractedText; // Can be manually included internally when chatting
  return doc;
};

module.exports = mongoose.model('Document', documentSchema);

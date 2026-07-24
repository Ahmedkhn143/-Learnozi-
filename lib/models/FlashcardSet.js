import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['new', 'learning', 'known'],
    default: 'new',
  },
  reviewedAt: { type: Date },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  nextReviewDate: { type: Date, default: Date.now }
});

const flashcardSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title:   { type: String, required: true, trim: true, maxlength: 100 },
    subject: { type: String, default: 'General', trim: true },
    cards:   [cardSchema],
    isAIGenerated: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    university: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

flashcardSetSchema.virtual('progress').get(function () {
  if (!this.cards || this.cards.length === 0) return 0;
  const known = this.cards.filter((c) => c.status === 'known').length;
  return Math.round((known / this.cards.length) * 100);
});

export default mongoose.models.FlashcardSet || mongoose.model('FlashcardSet', flashcardSetSchema);

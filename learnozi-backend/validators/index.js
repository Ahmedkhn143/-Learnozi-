const Joi = require('joi');

// ─── Reusable atoms ──────────────────────────────────────
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid ObjectId');
const trimStr  = (min = 1, max = 200) => Joi.string().trim().min(min).max(max);

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

const register = Joi.object({
  name:     trimStr(1, 50).required().messages({ 'any.required': 'Name is required' }),
  email:    Joi.string().trim().lowercase().email().required().messages({ 'string.email': 'Valid email is required' }),
  password: Joi.string().min(6).max(128).required().messages({ 'string.min': 'Password must be at least 6 characters' }),
});

const login = Joi.object({
  email:    Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetPassword = Joi.object({
  password: Joi.string().min(6).max(128).required(),
});

const updateProfile = Joi.object({
  name:     trimStr(1, 50).optional(),
  oldPassword: Joi.string().optional(),
  newPassword: Joi.string().min(6).max(128).optional(),
  preferences: Joi.object({
    studyHoursPerDay: Joi.number().min(1).max(16).optional(),
    subjects: Joi.array().items(Joi.string().trim().max(100)).max(20).optional(),
  }).optional(),
}).custom((value, helpers) => {
  // If newPassword is present, oldPassword must also be present
  if (value.newPassword && !value.oldPassword) {
    return helpers.error('any.custom', { message: 'Old password is required to set a new password' });
  }
  return value;
});

const resendVerification = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

// ═══════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════

const createExam = Joi.object({
  subject:  objectId.required().messages({ 'any.required': 'Subject ID is required' }),
  title:    trimStr(1, 150).required(),
  examDate: Joi.date().iso().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  notes:    Joi.string().trim().max(1000).allow('').optional(),
});

const updateExam = Joi.object({
  subject:  objectId.optional(),
  title:    trimStr(1, 150).optional(),
  examDate: Joi.date().iso().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  notes:    Joi.string().trim().max(1000).allow('').optional(),
}).min(1);

// ═══════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════

const createSubject = Joi.object({
  name:   trimStr(1, 100).required(),
  color:  Joi.string().trim().max(30).optional(),
  topics: Joi.array().items(Joi.object({
    title:      Joi.string().trim().max(200).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  })).max(100).optional(),
  notes: Joi.string().trim().max(2000).allow('').optional(),
});

const updateSubject = Joi.object({
  name:   trimStr(1, 100).optional(),
  color:  Joi.string().trim().max(30).optional(),
  topics: Joi.array().items(Joi.object({
    title:      Joi.string().trim().max(200).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  })).max(100).optional(),
  notes: Joi.string().trim().max(2000).allow('').optional(),
}).min(1);

// ═══════════════════════════════════════════════════════════
// FLASHCARDS
// ═══════════════════════════════════════════════════════════

const generateFlashcards = Joi.object({
  topic:    trimStr(1, 300).required().messages({ 'any.required': 'Topic is required' }),
  subject:  Joi.string().trim().max(100).optional(),
  count:    Joi.number().integer().min(5).max(20).default(10),
  language: Joi.string().valid('english', 'urdu').default('english'),
});

const createFlashcardSet = Joi.object({
  title:   trimStr(1, 200).required(),
  subject: Joi.string().trim().max(100).optional(),
  cards:   Joi.array().items(Joi.object({
    question: Joi.string().trim().min(1).max(1000).required(),
    answer:   Joi.string().trim().min(1).max(2000).required(),
  })).min(1).max(100).required(),
});

const updateCard = Joi.object({
  status: Joi.string().valid('new', 'learning', 'known').required(),
});

// ═══════════════════════════════════════════════════════════
// FOCUS SESSIONS
// ═══════════════════════════════════════════════════════════

const saveSession = Joi.object({
  subject:     Joi.string().trim().max(100).optional(),
  durationMin: Joi.number().integer().min(1).max(600).required(),
  completed:   Joi.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// STUDY PLANS
// ═══════════════════════════════════════════════════════════

const createPlan = Joi.object({
  title:    trimStr(1, 200).required(),
  examDate: Joi.date().iso().optional(),
  subjects: Joi.array().items(Joi.string().trim().max(100)).max(20).optional(),
  tasks:    Joi.array().items(Joi.object({
    title:            Joi.string().trim().max(300).required(),
    subject:          Joi.string().trim().max(100).optional(),
    priority:         Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    estimatedMinutes: Joi.number().integer().min(1).max(480).optional(),
    scheduledDate:    Joi.date().iso().optional(),
  })).max(200).optional(),
});

const generatePlan = Joi.object({
  title:       trimStr(1, 200).optional(),
  subjects:    Joi.array().items(Joi.string().trim().max(100)).min(1).required(),
  examDate:    Joi.date().iso().required(),
  preferences: Joi.string().trim().max(500).allow('').optional(),
});

const updatePlan = Joi.object({
  title:    trimStr(1, 200).optional(),
  examDate: Joi.date().iso().optional(),
  subjects: Joi.array().items(Joi.string().trim().max(100)).max(20).optional(),
  status:   Joi.string().valid('active', 'completed', 'archived').optional(),
}).min(1);

const updateTask = Joi.object({
  status:        Joi.string().valid('pending', 'in_progress', 'completed', 'skipped').optional(),
  actualMinutes: Joi.number().integer().min(0).max(600).optional(),
  priority:      Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
}).min(1);

// ═══════════════════════════════════════════════════════════
// SCHEDULES
// ═══════════════════════════════════════════════════════════

const generateSchedule = Joi.object({
  title:       trimStr(1, 200).optional(),
  startDate:   Joi.date().iso().required(),
  endDate:     Joi.date().iso().greater(Joi.ref('startDate')).required(),
  hoursPerDay: Joi.number().min(0.5).max(16).default(4),
  subjectIds:  Joi.array().items(objectId).max(20).optional(),
});

const toggleSession = Joi.object({
  completed: Joi.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════
// AI
// ═══════════════════════════════════════════════════════════

const explain = Joi.object({
  topic:    trimStr(1, 500).required().messages({ 'any.required': 'Topic is required' }),
  level:    Joi.string().valid('beginner', 'intermediate', 'advanced').default('intermediate'),
  language: Joi.string().valid('english', 'urdu').default('english'),
});

const chat = Joi.object({
  message:        trimStr(1, 2000).required(),
  conversationId: objectId.optional(),
  subject:        Joi.string().trim().max(100).optional(),
});

const summarize = Joi.object({
  text:     Joi.string().trim().min(50).max(15000).required().messages({
    'string.min': 'Text must be at least 50 characters',
    'any.required': 'Text to summarize is required',
  }),
  language: Joi.string().valid('english', 'urdu').default('english'),
});

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

const documentSchemas = require('./documentValidators');
const academicSchemas = require('./academicValidators');

module.exports = {
  // Auth
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  resendVerification,
  // Exams
  createExam,
  updateExam,
  // Subjects
  createSubject,
  updateSubject,
  // Flashcards
  generateFlashcards,
  createFlashcardSet,
  updateCard,
  // Focus
  saveSession,
  // Plans
  createPlan,
  generatePlan,
  updatePlan,
  updateTask,
  // Schedules
  generateSchedule,
  toggleSession,
  // AI
  explain,
  chat,
  summarize,
  // Documents
  ...documentSchemas,
  // Academics
  ...academicSchemas,
};

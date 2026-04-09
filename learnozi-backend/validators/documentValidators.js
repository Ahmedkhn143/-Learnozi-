const Joi = require('joi');

module.exports = {
  // Chatting with a document
  chatDocument: Joi.object({
    question: Joi.string().required().min(2),
    history: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'ai').required(),
        content: Joi.string().required(),
      })
    ).optional(),
  }),
};

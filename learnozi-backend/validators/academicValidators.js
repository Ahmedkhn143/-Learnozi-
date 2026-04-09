const Joi = require('joi');

const trimStr = (min = 1, max = 200) => Joi.string().trim().min(min).max(max);

module.exports = {
  createSemester: Joi.object({
    name: trimStr(1, 100).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  }),
  
  updateSemester: Joi.object({
    name: trimStr(1, 100).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  }).min(1),

  createCourse: Joi.object({
    name: trimStr(1, 150).required(),
    code: trimStr(1, 20).required(),
    creditHours: Joi.number().integer().min(1).max(6).default(3),
    targetGrade: Joi.string().trim().max(5).allow('').optional(),
    actualGrade: Joi.string().trim().max(5).allow('').optional(),
  }),

  updateCourse: Joi.object({
    name: trimStr(1, 150).optional(),
    code: trimStr(1, 20).optional(),
    creditHours: Joi.number().integer().min(1).max(6).optional(),
    targetGrade: Joi.string().trim().max(5).allow('').optional(),
    actualGrade: Joi.string().trim().max(5).allow('').optional(),
  }).min(1),
};

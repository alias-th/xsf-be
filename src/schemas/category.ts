import Joi from "joi";

export const create = Joi.object().keys({
  name: Joi.string().required().messages({
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
  description: Joi.string().min(6).required().messages({
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 6 characters long.",
    "any.required": "Description is required.",
  }),
});

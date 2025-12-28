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
  discount_percentage: Joi.number().min(0).max(100).optional().messages({
    "number.base": "discount_percentage must be a number.",
    "number.min": "discount_percentage cannot be less than 0.",
    "number.max": "discount_percentage cannot be more than 100.",
    "any.required": "discount_percentage is required.",
  }),
  product_ids: Joi.array().items(Joi.string()).required().messages({
    "array.base": "product_ids must be an array.",
    "any.required": "product_ids is required.",
  }),
});

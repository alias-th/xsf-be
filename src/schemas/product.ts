import Joi from "joi";

export const create = Joi.object().keys({
  name: Joi.string().required().messages({
    "string.empty": "product name is required.",
    "any.required": "product name is required.",
  }),

  code: Joi.string().min(6).required().messages({
    "string.empty": "code is required.",
    "any.required": "code is required.",
    "string.min": "code must be at least 6 characters.",
  }),

  price: Joi.number().positive().required().messages({
    "number.base": "price must be a number.",
    "number.positive": "price must be a positive number.",
    "any.required": "price is required.",
  }),
  description: Joi.string().optional().messages({
    "string.empty": "description is required.",
    "any.required": "description is required.",
  }),
  categoryId: Joi.string().optional().messages({
    "string.empty": "category is required.",
    "any.required": "category is required.",
  }),
  stock_quantity: Joi.number().integer().min(0).optional().messages({
    "number.base": "stock_quantity must be a number.",
    "number.integer": "stock_quantity must be an integer.",
    "number.min": "stock_quantity cannot be negative.",
    "any.required": "stock_quantity is required.",
  }),
  is_popular: Joi.boolean().optional().messages({
    "boolean.base": "is_popular must be a boolean.",
    "any.required": "is_popular is required.",
  }),
});

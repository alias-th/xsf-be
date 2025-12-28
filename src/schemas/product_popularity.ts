import Joi from "joi";

export const create = Joi.object().keys({
  product_id: Joi.string().required().messages({
    "string.empty": "product_id is required.",
    "any.required": "product_id is required.",
  }),
  view_count: Joi.number().min(0).required().messages({
    "number.base": "view_count must be a number.",
    "number.min": "view_count cannot be negative.",
    "any.required": "view_count is required.",
  }),
});

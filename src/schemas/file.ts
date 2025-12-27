import Joi from "joi";

export const file = Joi.object().keys({
  file: Joi.any()
    .custom((value, helpers) => {
      if (value === null || value === undefined) {
        return value;
      }

      // Check if the value is a file object
      if (!value?.filename || !value?.mimetype) {
        return helpers.error("custom.invalid_file_type");
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.mimetype)) {
        return helpers.error("custom.invalid_file_type");
      }

      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (value?.size > maxSize) {
        return helpers.error("custom.file_size_exceeded");
      }

      return value;
    })
    .messages({
      "custom.invalid_file_type":
        "The file type is invalid. Only JPEG and PNG files are allowed.",
      "custom.file_size_exceeded": "The file size exceeds the 5MB limit.",
    }),
});

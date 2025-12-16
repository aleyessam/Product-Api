const Joi = require("joi");

const baseProductSchema = {
  sku: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .min(3)
    .max(50)
    .uppercase()
    .required(),

  name: Joi.string().trim().min(3).max(200).required(),

  description: Joi.string().trim().max(1000).allow(null),

  category: Joi.string().trim().min(2).max(100).required(),

  type: Joi.string().valid("public", "private"),

  price: Joi.number().positive().precision(2).required(),

  discountPrice: Joi.number()
    .min(0)
    .precision(2)
    .less(Joi.ref("price"))
    .allow(null),

  quantity: Joi.number().integer().min(0).required(),
};

const createProductSchema = Joi.object(baseProductSchema);

const updateProductSchema = Joi.object({
  name: baseProductSchema.name.optional(),
  description: baseProductSchema.description.optional(),
  category: baseProductSchema.category.optional(),
  type: baseProductSchema.type.optional(),
  price: baseProductSchema.price.optional(),
  discountPrice: baseProductSchema.discountPrice.optional(),
  quantity: baseProductSchema.quantity.optional(),
}).min(1); // must send at least one field

module.exports = {
  createProductSchema,
  updateProductSchema,
};

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
      match: /^[A-Za-z0-9_-]+$/,
      immutable: true, // SKU cannot be updated
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Cross-field validation
productSchema.pre("save", function () {
  if (this.discountPrice !== null && this.discountPrice >= this.price) {
    throw new Error("Discount price must be less than original price");
  }
});

module.exports = mongoose.model("Product", productSchema);

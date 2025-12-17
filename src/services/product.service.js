const Product = require("../models/product.model");

const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

const getProductById = async (id, role) => {
  const query = { _id: id };

  // users can only see public products
  if (role === "user") {
    query.type = "public";
  }

  return Product.findOne(query);
};

const getProducts = async (query, options) => {
  const { page, limit, sortBy, sortOrder } = options;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return { items, total };
};

const getProductStats = async () => {
  const products = await Product.find();

  const totalProducts = products.length;

  let totalInventoryValue = 0;
  let totalDiscountedValue = 0;
  let outOfStockCount = 0;

  const productsByCategory = {};
  const productsByType = {};

  products.forEach((p) => {
    totalInventoryValue += p.price * p.quantity;

    if (p.discountPrice != null) {
      totalDiscountedValue += p.discountPrice * p.quantity;
    }

    if (p.quantity === 0) {
      outOfStockCount++;
    }

    // category stats
    if (!productsByCategory[p.category]) {
      productsByCategory[p.category] = { count: 0, totalValue: 0 };
    }
    productsByCategory[p.category].count++;
    productsByCategory[p.category].totalValue += p.price * p.quantity;

    // type stats
    if (!productsByType[p.type]) {
      productsByType[p.type] = { count: 0, totalValue: 0 };
    }
    productsByType[p.type].count++;
    productsByType[p.type].totalValue += p.price * p.quantity;
  });

  return {
    totalProducts,
    totalInventoryValue,
    totalDiscountedValue,
    // averagePrice represents the average price per product,
    // not weighted by quantity, as defined in the task specification
    averagePrice: totalProducts === 0 ? 0 : totalInventoryValue / totalProducts,
    outOfStockCount,
    productsByCategory: Object.entries(productsByCategory).map(
      ([category, data]) => ({ category, ...data })
    ),
    productsByType: Object.entries(productsByType).map(([type, data]) => ({
      type,
      ...data,
    })),
  };
};

const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
};

module.exports = {
  createProduct,
  getProductById,
  getProducts,
  getProductStats,
  updateProduct,
  deleteProduct,
};

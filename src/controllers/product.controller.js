const productService = require("../services/product.service");
const { success } = require("../utils/response");
const { logSuccess } = require("../utils/logger");
const statsCache = require("../utils/cache");

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    logSuccess(`Product created: ${product.sku}`);
    statsCache.del("product_stats");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    // handle duplicate SKU
    if (err.code === 11000) {
      err.statusCode = 409;
      err.code = "DUPLICATE_SKU";
      err.message = "Product with this SKU already exists";
    }
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(
      req.params.id,
      req.userRole
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        error: { code: "NOT_FOUND" },
      });
    }

    return success(res, "Product retrieved successfully", product);
  } catch (err) {
    next(err);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      search,
      sort = "createdAt",
      order = "asc",
      minPrice,
      maxPrice,
    } = req.query;

    // safe sort whitelist
    const allowedSortFields = ["name", "price", "quantity", "createdAt"];
    const sortBy = allowedSortFields.includes(sort) ? sort : "createdAt";

    const sortOrder = order === "desc" ? -1 : 1;

    const query = {};

    // RBAC filter
    if (req.userRole === "user") {
      query.type = "public";
    }

    if (category) query.category = category;
    if (type) query.type = type;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const { items, total } = await productService.getProducts(query, {
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    return success(res, "Products retrieved successfully", items, {
      currentPage: Number(page),
      totalPages,
      totalItems: total,
      itemsPerPage: Number(limit),
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (err) {
    next(err);
  }
};

const getProductStats = async (req, res, next) => {
  try {
    const cached = statsCache.get("product_stats");

    if (cached) {
      return success(res, "Statistics retrieved successfully", cached);
    }

    const stats = await productService.getProductStats();

    statsCache.set("product_stats", stats);

    return success(res, "Statistics retrieved successfully", stats);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        error: { code: "NOT_FOUND" },
      });
    }

    logSuccess(`Product updated: ${product.sku}`);
    statsCache.del("product_stats");

    return success(res, "Product updated successfully", product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        error: { code: "NOT_FOUND" },
      });
    }

    logSuccess(`Product deleted: ${product.sku}`);
    statsCache.del("product_stats");

    return success(res, "Product deleted successfully", {
      id: product._id,
      sku: product.sku,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getProductStats,
  updateProduct,
  deleteProduct,
};

const express = require("express");
const productRoutes = require("./routes/product.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const apiLimiter = require("./middlewares/rateLimit.middleware");

const app = express();

app.use(express.json());
app.use(require("./middlewares/sanitize.middleware"));

app.use(apiLimiter);

app.use("/api/products", productRoutes);

// global error handler
app.use(errorMiddleware);

module.exports = app;

require("dotenv").config();

process.env.NODE_ENV = "test";

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Product = require("../src/models/product.model");

// generate unique SKU per test run
const TEST_SKU = `TEST-INT-${Date.now()}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // cleanup test data
  await Product.deleteMany({ sku: TEST_SKU });

  await mongoose.connection.close();
});

describe("Products API – RBAC & validation", () => {
  it("should reject creating a product without X-User-Role", async () => {
    const response = await request(app).post("/api/products").send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should allow admin to create product with valid payload", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("X-User-Role", "admin")
      .send({
        sku: TEST_SKU,
        name: "Integration Test Product",
        category: "Test",
        price: 100,
        quantity: 1,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.sku).toBe(TEST_SKU);
  });

  it("should allow admin to retrieve product statistics", async () => {
    const response = await request(app)
      .get("/api/products/stats")
      .set("X-User-Role", "admin");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("totalProducts");
    expect(response.body.data).toHaveProperty("totalInventoryValue");
    expect(response.body.data).toHaveProperty("averagePrice");
  });
});

# Product Management API

A RESTful API for managing products with role-based access control.  
The focus of this project is clean structure, validation, and practical backend design.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Joi (request validation)
- Docker
- node-cache

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local instance or MongoDB Atlas)

### Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/aleyessam/Product-Api.git
   cd Product-Api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an environment file:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB connection string.

5. Start the server:
   ```bash
   npm start
   ```

The API will be available at:

```
http://localhost:3000
```

---

## Running with Docker (Optional)

1. Build the Docker image:

   ```bash
   docker build -t product-api .
   ```

2. Create a Docker environment file:

   ```bash
   cp .env.example .env.docker
   ```

3. Update `.env.docker` with your MongoDB connection string.

4. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env.docker product-api
   ```

---

## Environment Variables

The application uses the following environment variables:

| Variable  | Description                    |
| --------- | ------------------------------ |
| PORT      | Port number for the API server |
| MONGO_URI | MongoDB connection string      |

Example:

```env
PORT=3000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/product-api
```

---

## Authentication

Authentication is simulated using a request header:

```
X-User-Role: admin | user
```

- `admin` has full access to all endpoints
- `user` has read-only access to public products

---

## API Endpoints

### Create Product (Admin only)

```
POST /api/products
```

Headers:

```
X-User-Role: admin
Content-Type: application/json
```

Body example:

```json
{
  "sku": "LAPTOP-001",
  "name": "Gaming Laptop",
  "description": "High performance laptop",
  "category": "Electronics",
  "type": "public",
  "price": 1200,
  "discountPrice": 999,
  "quantity": 10
}
```

---

### Get All Products

```
GET /api/products
```

Headers:

```
X-User-Role: admin | user
```

Optional query parameters:

```
?page=1
&limit=10
&category=Electronics
&type=public
&search=laptop
&sort=price
&order=asc
```

---

### Get Product by ID

```
GET /api/products/:id
```

Headers:

```
X-User-Role: admin | user
```

Note: users can only access public products.

---

### Update Product (Admin only)

```
PUT /api/products/:id
```

Headers:

```
X-User-Role: admin
```

Body example:

```json
{
  "price": 1300,
  "quantity": 5
}
```

---

### Delete Product (Admin only)

```
DELETE /api/products/:id
```

Headers:

```
X-User-Role: admin
```

---

### Product Statistics (Admin only)

```
GET /api/products/stats
```

Headers:

```
X-User-Role: admin
```

Returns aggregated statistics such as total products, inventory value,
average price, and category/type breakdowns. Results are cached for performance.

---

## API Documentation

A Postman collection is included in the repository under the `postman/` folder.
It contains example requests for all available endpoints.

---

## Project Structure

```
src/
 ├─ controllers/
 ├─ services/
 ├─ routes/
 ├─ models/
 ├─ middlewares/
 ├─ validations/
 ├─ utils/
 ├─ app.js
 └─ server.js
```

---

## Input Sanitization

All incoming requests are sanitized before validation and processing.

- String values in `req.body` and `req.query` are trimmed
- Potential XSS payloads are sanitized using the `xss` library
- Sanitization runs before validation and controller logic

This adds a basic security layer to protect the API from malicious input without introducing unnecessary complexity.

---

## Rate Limiting

Basic request rate limiting is applied to protect the API from excessive or abusive traffic.

- Implemented using `express-rate-limit`
- Limits the number of requests per IP within a fixed time window
- Helps prevent brute-force attempts and accidental overload
- Can be applied globally or to specific endpoints (such as statistics)

This keeps the API stable while remaining simple and easy to maintain.

---

## Testing

Basic unit and integration tests are included to verify core API behavior.

- Implemented using `jest` and `supertest`
- Tests focus on role-based access control (RBAC) and request validation
- MongoDB is used during tests with a dedicated connection
- Each test run generates a unique SKU to avoid data collisions

### Running Tests

Before running tests, ensure the `MONGO_URI` environment variable is set.

```bash
npm test
```

Example test cases include:

- Rejecting requests without the `X-User-Role` header
- Allowing admins to create products with valid input
- Verifying correct HTTP status codes and response structure

---

## Notes

- Input validation is applied at both request and database level
- SKU values are unique and immutable
- Users never receive private product data
- Statistics are cached and invalidated on write operations
- Environment variables are injected at runtime and not committed to the repository

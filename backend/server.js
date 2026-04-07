import cors from "cors";
import express from "express";
import sqlite3 from "sqlite3";
import swaggerUi from "swagger-ui-express";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8000);
const DB_PATH = path.join(__dirname, "crayfish_farm.db");
const ORDER_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);
const SERVER_URL = `http://127.0.0.1:${PORT}`;

const sqlite = sqlite3.verbose();
const rawDb = new sqlite.Database(DB_PATH);

const db = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function onRun(error) {
        if (error) {
          reject(error);
          return;
        }

        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: promisify(rawDb.get.bind(rawDb)),
  all: promisify(rawDb.all.bind(rawDb)),
  exec: promisify(rawDb.exec.bind(rawDb)),
};

function rowToProduct(row) {
  return {
    id: row.id,
    title_am: row.title_am,
    desc_am: row.desc_am,
    title_en: row.title_en,
    desc_en: row.desc_en,
    title_ru: row.title_ru,
    desc_ru: row.desc_ru,
    minWeight: row.min_weight,
    maxWeight: row.max_weight,
    pricePerKg: row.price_per_kg,
    images: JSON.parse(row.images),
  };
}

function rowToOrderBase(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    status: row.status,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
  };
}

async function getProductRow(productId) {
  return db.get(
    `
      SELECT
        id,
        title_am,
        desc_am,
        title_en,
        desc_en,
        title_ru,
        desc_ru,
        min_weight,
        max_weight,
        price_per_kg,
        images
      FROM products
      WHERE id = ?
    `,
    [productId],
  );
}

async function getOrderRow(orderId) {
  return db.get(
    `
      SELECT
        id,
        customer_name,
        phone,
        email,
        notes,
        status,
        total_amount,
        created_at
      FROM orders
      WHERE id = ?
    `,
    [orderId],
  );
}

async function getOrderItems(orderId) {
  return db.all(
    `
      SELECT
        id,
        product_id,
        product_title,
        quantity,
        weight_grams,
        price_per_kg,
        line_total
      FROM order_items
      WHERE order_id = ?
      ORDER BY id
    `,
    [orderId],
  );
}

async function buildOrderResponse(row) {
  const items = await getOrderItems(row.id);

  return {
    ...rowToOrderBase(row),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productTitle: item.product_title,
      quantity: item.quantity,
      weightGrams: item.weight_grams,
      pricePerKg: item.price_per_kg,
      lineTotal: item.line_total,
    })),
  };
}

function validateProductPayload(payload) {
  const requiredStrings = [
    "title_am",
    "desc_am",
    "title_en",
    "desc_en",
    "title_ru",
    "desc_ru",
  ];

  for (const key of requiredStrings) {
    if (typeof payload[key] !== "string" || payload[key].trim() === "") {
      return `${key} is required`;
    }
  }

  const numericFields = ["minWeight", "maxWeight", "pricePerKg"];
  for (const key of numericFields) {
    if (!Number.isInteger(payload[key]) || payload[key] < 1) {
      return `${key} must be a positive integer`;
    }
  }

  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    return "images must be a non-empty array";
  }

  if (payload.images.some((image) => typeof image !== "string" || image.trim() === "")) {
    return "images must contain only non-empty strings";
  }

  return null;
}

function validateOrderPayload(payload) {
  if (typeof payload.customerName !== "string" || payload.customerName.trim() === "") {
    return "customerName is required";
  }

  if (typeof payload.phone !== "string" || payload.phone.trim() === "") {
    return "phone is required";
  }

  if (payload.email != null && typeof payload.email !== "string") {
    return "email must be a string";
  }

  if (payload.notes != null && typeof payload.notes !== "string") {
    return "notes must be a string";
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return "items must be a non-empty array";
  }

  for (const item of payload.items) {
    if (!Number.isInteger(item.productId) || item.productId < 1) {
      return "productId must be a positive integer";
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return "quantity must be a positive integer";
    }

    if (!Number.isInteger(item.weightGrams) || item.weightGrams < 1) {
      return "weightGrams must be a positive integer";
    }
  }

  return null;
}

async function initDatabase() {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      title_am TEXT NOT NULL,
      desc_am TEXT NOT NULL,
      title_en TEXT NOT NULL,
      desc_en TEXT NOT NULL,
      title_ru TEXT NOT NULL,
      desc_ru TEXT NOT NULL,
      min_weight INTEGER NOT NULL,
      max_weight INTEGER NOT NULL,
      price_per_kg INTEGER NOT NULL,
      images TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_title TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      weight_grams INTEGER NOT NULL,
      price_per_kg INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);
}

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Crayfish Farm API",
    version: "1.0.0",
    description: "Node.js backend API for products, orders, and admin management.",
  },
  servers: [{ url: SERVER_URL }],
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title_am: { type: "string" },
          desc_am: { type: "string" },
          title_en: { type: "string" },
          desc_en: { type: "string" },
          title_ru: { type: "string" },
          desc_ru: { type: "string" },
          minWeight: { type: "integer" },
          maxWeight: { type: "integer" },
          pricePerKg: { type: "integer" },
          images: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      ProductInput: {
        type: "object",
        required: [
          "title_am",
          "desc_am",
          "title_en",
          "desc_en",
          "title_ru",
          "desc_ru",
          "minWeight",
          "maxWeight",
          "pricePerKg",
          "images",
        ],
        properties: {
          title_am: { type: "string" },
          desc_am: { type: "string" },
          title_en: { type: "string" },
          desc_en: { type: "string" },
          title_ru: { type: "string" },
          desc_ru: { type: "string" },
          minWeight: { type: "integer" },
          maxWeight: { type: "integer" },
          pricePerKg: { type: "integer" },
          images: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      OrderItemInput: {
        type: "object",
        required: ["productId", "quantity", "weightGrams"],
        properties: {
          productId: { type: "integer" },
          quantity: { type: "integer" },
          weightGrams: { type: "integer" },
        },
      },
      OrderCreate: {
        type: "object",
        required: ["customerName", "phone", "items"],
        properties: {
          customerName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItemInput" },
          },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          productId: { type: "integer", nullable: true },
          productTitle: { type: "string" },
          quantity: { type: "integer" },
          weightGrams: { type: "integer" },
          pricePerKg: { type: "integer" },
          lineTotal: { type: "integer" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          customerName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          status: { type: "string" },
          totalAmount: { type: "integer" },
          createdAt: { type: "string" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
        },
      },
      OrderStatusUpdate: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["pending", "confirmed", "completed", "cancelled"],
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          detail: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      get: {
        summary: "List products",
        parameters: [
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Product list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Get one product",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/orders": {
      post: {
        summary: "Create an order",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admin/products": {
      get: {
        summary: "List products for admin",
        responses: {
          200: {
            description: "Product list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admin/products/{id}": {
      put: {
        summary: "Update product",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete product",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Delete result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admin/orders": {
      get: {
        summary: "List orders",
        parameters: [
          {
            in: "query",
            name: "status",
            required: false,
            schema: {
              type: "string",
              enum: ["pending", "confirmed", "completed", "cancelled"],
            },
          },
        ],
        responses: {
          200: {
            description: "Orders list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/orders/{id}": {
      get: {
        summary: "Get one order",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Order",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          404: {
            description: "Order not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update order status",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderStatusUpdate" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated order",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          400: {
            description: "Invalid status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Order not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";
    let query = `
      SELECT
        id,
        title_am,
        desc_am,
        title_en,
        desc_en,
        title_ru,
        desc_ru,
        min_weight,
        max_weight,
        price_per_kg,
        images
      FROM products
    `;
    let params = [];

    if (search) {
      const pattern = `%${search}%`;
      query += `
        WHERE
          LOWER(title_am) LIKE ?
          OR LOWER(title_en) LIKE ?
          OR LOWER(title_ru) LIKE ?
          OR LOWER(desc_am) LIKE ?
          OR LOWER(desc_en) LIKE ?
          OR LOWER(desc_ru) LIKE ?
      `;
      params = [pattern, pattern, pattern, pattern, pattern, pattern];
    }

    query += " ORDER BY id";
    const rows = await db.all(query, params);
    res.json(rows.map(rowToProduct));
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const row = await getProductRow(Number(req.params.id));
    if (!row) {
      res.status(404).json({ detail: "Product not found" });
      return;
    }

    res.json(rowToProduct(row));
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", async (req, res, next) => {
  try {
    const validationError = validateOrderPayload(req.body);
    if (validationError) {
      res.status(400).json({ detail: validationError });
      return;
    }

    const payload = req.body;
    const lineItems = [];
    let totalAmount = 0;

    for (const item of payload.items) {
      const productRow = await getProductRow(item.productId);
      if (!productRow) {
        res.status(404).json({ detail: `Product ${item.productId} not found` });
        return;
      }

      const lineTotal = Math.trunc((productRow.price_per_kg / 1000) * item.weightGrams * item.quantity);
      lineItems.push({
        productId: productRow.id,
        productTitle: productRow.title_en,
        quantity: item.quantity,
        weightGrams: item.weightGrams,
        pricePerKg: productRow.price_per_kg,
        lineTotal,
      });
      totalAmount += lineTotal;
    }

    const result = await db.run(
      `
        INSERT INTO orders (
          customer_name,
          phone,
          email,
          notes,
          status,
          total_amount
        )
        VALUES (?, ?, ?, ?, 'pending', ?)
      `,
      [
        payload.customerName,
        payload.phone,
        payload.email ?? null,
        payload.notes ?? null,
        totalAmount,
      ],
    );

    for (const item of lineItems) {
      await db.run(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_title,
            quantity,
            weight_grams,
            price_per_kg,
            line_total
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          result.lastID,
          item.productId,
          item.productTitle,
          item.quantity,
          item.weightGrams,
          item.pricePerKg,
          item.lineTotal,
        ],
      );
    }

    const orderRow = await getOrderRow(result.lastID);
    res.status(201).json(await buildOrderResponse(orderRow));
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/products", async (_req, res, next) => {
  try {
    const rows = await db.all(
      `
        SELECT
          id,
          title_am,
          desc_am,
          title_en,
          desc_en,
          title_ru,
          desc_ru,
          min_weight,
          max_weight,
          price_per_kg,
          images
        FROM products
        ORDER BY id
      `,
    );
    res.json(rows.map(rowToProduct));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/products", async (req, res, next) => {
  try {
    const validationError = validateProductPayload(req.body);
    if (validationError) {
      res.status(400).json({ detail: validationError });
      return;
    }

    const payload = req.body;
    const result = await db.run(
      `
        INSERT INTO products (
          title_am,
          desc_am,
          title_en,
          desc_en,
          title_ru,
          desc_ru,
          min_weight,
          max_weight,
          price_per_kg,
          images
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.title_am,
        payload.desc_am,
        payload.title_en,
        payload.desc_en,
        payload.title_ru,
        payload.desc_ru,
        payload.minWeight,
        payload.maxWeight,
        payload.pricePerKg,
        JSON.stringify(payload.images),
      ],
    );

    const row = await getProductRow(result.lastID);
    res.status(201).json(rowToProduct(row));
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/products/:id", async (req, res, next) => {
  try {
    const validationError = validateProductPayload(req.body);
    if (validationError) {
      res.status(400).json({ detail: validationError });
      return;
    }

    const productId = Number(req.params.id);
    const existing = await getProductRow(productId);
    if (!existing) {
      res.status(404).json({ detail: "Product not found" });
      return;
    }

    const payload = req.body;
    await db.run(
      `
        UPDATE products
        SET
          title_am = ?,
          desc_am = ?,
          title_en = ?,
          desc_en = ?,
          title_ru = ?,
          desc_ru = ?,
          min_weight = ?,
          max_weight = ?,
          price_per_kg = ?,
          images = ?
        WHERE id = ?
      `,
      [
        payload.title_am,
        payload.desc_am,
        payload.title_en,
        payload.desc_en,
        payload.title_ru,
        payload.desc_ru,
        payload.minWeight,
        payload.maxWeight,
        payload.pricePerKg,
        JSON.stringify(payload.images),
        productId,
      ],
    );

    const row = await getProductRow(productId);
    res.json(rowToProduct(row));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/products/:id", async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const existing = await getProductRow(productId);
    if (!existing) {
      res.status(404).json({ detail: "Product not found" });
      return;
    }

    await db.run("DELETE FROM products WHERE id = ?", [productId]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/orders", async (req, res, next) => {
  try {
    const statusFilter = typeof req.query.status === "string" ? req.query.status : "";
    let query = `
      SELECT
        id,
        customer_name,
        phone,
        email,
        notes,
        status,
        total_amount,
        created_at
      FROM orders
    `;
    let params = [];

    if (statusFilter) {
      query += " WHERE status = ?";
      params = [statusFilter];
    }

    query += " ORDER BY created_at DESC, id DESC";
    const rows = await db.all(query, params);
    const orders = await Promise.all(rows.map(buildOrderResponse));
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/orders/:id", async (req, res, next) => {
  try {
    const orderRow = await getOrderRow(Number(req.params.id));
    if (!orderRow) {
      res.status(404).json({ detail: "Order not found" });
      return;
    }

    res.json(await buildOrderResponse(orderRow));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/admin/orders/:id", async (req, res, next) => {
  try {
    const nextStatus = req.body?.status;
    if (typeof nextStatus !== "string" || !ORDER_STATUSES.has(nextStatus)) {
      res.status(400).json({ detail: "Invalid order status" });
      return;
    }

    const orderId = Number(req.params.id);
    const existing = await getOrderRow(orderId);
    if (!existing) {
      res.status(404).json({ detail: "Order not found" });
      return;
    }

    await db.run("UPDATE orders SET status = ? WHERE id = ?", [nextStatus, orderId]);
    const updated = await getOrderRow(orderId);
    res.json(await buildOrderResponse(updated));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ detail: "Internal server error" });
});

await initDatabase();

app.listen(PORT, () => {
  console.log(`Crayfish Farm API running on http://127.0.0.1:${PORT}`);
});

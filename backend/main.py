from __future__ import annotations

import json
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "crayfish_farm.db"
ORDER_STATUSES = {"pending", "confirmed", "completed", "cancelled"}


class ProductBase(BaseModel):
    title_am: str = Field(min_length=1)
    desc_am: str = Field(min_length=1)
    title_en: str = Field(min_length=1)
    desc_en: str = Field(min_length=1)
    title_ru: str = Field(min_length=1)
    desc_ru: str = Field(min_length=1)
    minWeight: int = Field(ge=1)
    maxWeight: int = Field(ge=1)
    pricePerKg: int = Field(ge=1)
    images: list[str] = Field(min_length=1)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class OrderItemCreate(BaseModel):
    productId: int = Field(gt=0)
    quantity: int = Field(ge=1)
    weightGrams: int = Field(gt=0)


class OrderCreate(BaseModel):
    customerName: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    email: str | None = None
    notes: str | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "completed", "cancelled"]


class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(populate_by_name=True)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def create_schema() -> None:
    with get_connection() as connection:
        connection.execute(
            """
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
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                total_amount INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
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
            )
            """
        )
        connection.commit()


def row_to_product(row: sqlite3.Row) -> dict[str, object]:
    return {
        "id": row["id"],
        "title_am": row["title_am"],
        "desc_am": row["desc_am"],
        "title_en": row["title_en"],
        "desc_en": row["desc_en"],
        "title_ru": row["title_ru"],
        "desc_ru": row["desc_ru"],
        "minWeight": row["min_weight"],
        "maxWeight": row["max_weight"],
        "pricePerKg": row["price_per_kg"],
        "images": json.loads(row["images"]),
    }


def fetch_product_row(connection: sqlite3.Connection, product_id: int) -> sqlite3.Row | None:
    return connection.execute(
        """
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
        """,
        (product_id,),
    ).fetchone()


def create_product_record(connection: sqlite3.Connection, payload: ProductCreate) -> dict[str, object]:
    cursor = connection.execute(
        """
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
        """,
        (
            payload.title_am,
            payload.desc_am,
            payload.title_en,
            payload.desc_en,
            payload.title_ru,
            payload.desc_ru,
            payload.minWeight,
            payload.maxWeight,
            payload.pricePerKg,
            json.dumps(payload.images),
        ),
    )
    row = fetch_product_row(connection, cursor.lastrowid)
    connection.commit()
    if row is None:
        raise HTTPException(status_code=500, detail="Failed to create product")
    return row_to_product(row)


def update_product_record(
    connection: sqlite3.Connection,
    product_id: int,
    payload: ProductUpdate,
) -> dict[str, object]:
    existing = fetch_product_row(connection, product_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Product not found")

    connection.execute(
        """
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
        """,
        (
            payload.title_am,
            payload.desc_am,
            payload.title_en,
            payload.desc_en,
            payload.title_ru,
            payload.desc_ru,
            payload.minWeight,
            payload.maxWeight,
            payload.pricePerKg,
            json.dumps(payload.images),
            product_id,
        ),
    )
    row = fetch_product_row(connection, product_id)
    connection.commit()
    if row is None:
        raise HTTPException(status_code=500, detail="Failed to update product")
    return row_to_product(row)


def order_row_to_dict(connection: sqlite3.Connection, row: sqlite3.Row) -> dict[str, object]:
    items = connection.execute(
        """
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
        """,
        (row["id"],),
    ).fetchall()

    return {
        "id": row["id"],
        "customerName": row["customer_name"],
        "phone": row["phone"],
        "email": row["email"],
        "notes": row["notes"],
        "status": row["status"],
        "totalAmount": row["total_amount"],
        "createdAt": row["created_at"],
        "items": [
            {
                "id": item["id"],
                "productId": item["product_id"],
                "productTitle": item["product_title"],
                "quantity": item["quantity"],
                "weightGrams": item["weight_grams"],
                "pricePerKg": item["price_per_kg"],
                "lineTotal": item["line_total"],
            }
            for item in items
        ],
    }


def fetch_order_row(connection: sqlite3.Connection, order_id: int) -> sqlite3.Row | None:
    return connection.execute(
        """
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
        """,
        (order_id,),
    ).fetchone()


def create_order_record(connection: sqlite3.Connection, payload: OrderCreate) -> dict[str, object]:
    line_items: list[dict[str, object]] = []
    total_amount = 0

    for item in payload.items:
        product_row = fetch_product_row(connection, item.productId)
        if product_row is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.productId} not found",
            )

        line_total = int(product_row["price_per_kg"] / 1000 * item.weightGrams * item.quantity)
        line_items.append(
            {
                "product_id": product_row["id"],
                "product_title": product_row["title_en"],
                "quantity": item.quantity,
                "weight_grams": item.weightGrams,
                "price_per_kg": product_row["price_per_kg"],
                "line_total": line_total,
            }
        )
        total_amount += line_total

    cursor = connection.execute(
        """
        INSERT INTO orders (
            customer_name,
            phone,
            email,
            notes,
            status,
            total_amount
        )
        VALUES (?, ?, ?, ?, 'pending', ?)
        """,
        (
            payload.customerName,
            payload.phone,
            payload.email,
            payload.notes,
            total_amount,
        ),
    )
    order_id = cursor.lastrowid

    connection.executemany(
        """
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
        """,
        [
            (
                order_id,
                item["product_id"],
                item["product_title"],
                item["quantity"],
                item["weight_grams"],
                item["price_per_kg"],
                item["line_total"],
            )
            for item in line_items
        ],
    )
    order_row = fetch_order_row(connection, order_id)
    connection.commit()
    if order_row is None:
        raise HTTPException(status_code=500, detail="Failed to create order")
    return order_row_to_dict(connection, order_row)


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_schema()
    yield


app = FastAPI(title="Crayfish Farm API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/products")
def list_products(
    search: str | None = Query(default=None, min_length=1),
) -> list[dict[str, object]]:
    query = """
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
    """
    params: tuple[object, ...] = ()

    if search:
        pattern = f"%{search.lower()}%"
        query += """
            WHERE
                LOWER(title_am) LIKE ?
                OR LOWER(title_en) LIKE ?
                OR LOWER(title_ru) LIKE ?
                OR LOWER(desc_am) LIKE ?
                OR LOWER(desc_en) LIKE ?
                OR LOWER(desc_ru) LIKE ?
        """
        params = (pattern, pattern, pattern, pattern, pattern, pattern)

    query += " ORDER BY id"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()

    return [row_to_product(row) for row in rows]


@app.get("/api/products/{product_id}")
def get_product(product_id: int) -> dict[str, object]:
    with get_connection() as connection:
        row = fetch_product_row(connection, product_id)

    if row is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return row_to_product(row)


@app.post("/api/orders", status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate) -> dict[str, object]:
    with get_connection() as connection:
        return create_order_record(connection, payload)


@app.get("/api/admin/products")
def admin_list_products() -> list[dict[str, object]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
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
            """
        ).fetchall()

    return [row_to_product(row) for row in rows]


@app.post("/api/admin/products", status_code=status.HTTP_201_CREATED)
def admin_create_product(payload: ProductCreate) -> dict[str, object]:
    with get_connection() as connection:
        return create_product_record(connection, payload)


@app.put("/api/admin/products/{product_id}")
def admin_update_product(product_id: int, payload: ProductUpdate) -> dict[str, object]:
    with get_connection() as connection:
        return update_product_record(connection, product_id, payload)


@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(product_id: int) -> dict[str, str]:
    with get_connection() as connection:
        row = fetch_product_row(connection, product_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.execute("DELETE FROM products WHERE id = ?", (product_id,))
        connection.commit()

    return {"message": "Product deleted"}


@app.get("/api/admin/orders")
def admin_list_orders(
    status_filter: Literal["pending", "confirmed", "completed", "cancelled"] | None = Query(
        default=None,
        alias="status",
    ),
) -> list[dict[str, object]]:
    query = """
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
    """
    params: tuple[object, ...] = ()

    if status_filter:
        query += " WHERE status = ?"
        params = (status_filter,)

    query += " ORDER BY created_at DESC, id DESC"

    with get_connection() as connection:
        rows = connection.execute(query, params).fetchall()
        return [order_row_to_dict(connection, row) for row in rows]


@app.get("/api/admin/orders/{order_id}")
def admin_get_order(order_id: int) -> dict[str, object]:
    with get_connection() as connection:
        row = fetch_order_row(connection, order_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Order not found")
        return order_row_to_dict(connection, row)


@app.patch("/api/admin/orders/{order_id}")
def admin_update_order_status(order_id: int, payload: OrderStatusUpdate) -> dict[str, object]:
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status")

    with get_connection() as connection:
        row = fetch_order_row(connection, order_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Order not found")

        connection.execute(
            "UPDATE orders SET status = ? WHERE id = ?",
            (payload.status, order_id),
        )
        connection.commit()
        updated = fetch_order_row(connection, order_id)
        if updated is None:
            raise HTTPException(status_code=500, detail="Failed to update order")
        return order_row_to_dict(connection, updated)

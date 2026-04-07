# API Documentation

Base URL for local development:

```text
http://127.0.0.1:8000
```

The backend also exposes interactive FastAPI docs at:

- `/docs`
- `/redoc`

## Conventions

- Request and response bodies use JSON.
- Product fields use camelCase in the API.
- Prices are returned as integer AMD amounts.
- Weights are expressed in grams in orders.

## Public Endpoints

### `GET /api/health`

Returns a simple healthcheck response.

Response:

```json
{
  "status": "ok"
}
```

### `GET /api/products`

Returns all products.

Optional query params:

- `search`: filters by title/description across Armenian, English, and Russian

Example:

```text
GET /api/products?search=crayfish
```

Response:

```json
[
  {
    "id": 1,
    "title_am": "Փոքր խեցգետին (Մանր)",
    "desc_am": "…",
    "title_en": "Small Crayfish (Snack Size)",
    "desc_en": "The perfect companion for a cold beer.",
    "title_ru": "Мелкий рак (Закусочный)",
    "desc_ru": "…",
    "minWeight": 35,
    "maxWeight": 70,
    "pricePerKg": 12000,
    "images": [
      "/images/manr-mijin.jpg",
      "/images/delikates.jpg"
    ]
  }
]
```

### `GET /api/products/{id}`

Returns one product by id.

Example:

```text
GET /api/products/1
```

Success response:

```json
{
  "id": 1,
  "title_am": "Փոքր խեցգետին (Մանր)",
  "desc_am": "…",
  "title_en": "Small Crayfish (Snack Size)",
  "desc_en": "The perfect companion for a cold beer.",
  "title_ru": "Мелкий рак (Закусочный)",
  "desc_ru": "…",
  "minWeight": 35,
  "maxWeight": 70,
  "pricePerKg": 12000,
  "images": [
    "/images/manr-mijin.jpg",
    "/images/delikates.jpg"
  ]
}
```

Not found:

```json
{
  "detail": "Product not found"
}
```

### `POST /api/orders`

Creates a new order. Pricing is calculated on the server using current product prices.

Request body:

```json
{
  "customerName": "Jane Doe",
  "phone": "+37499123456",
  "email": "jane@example.com",
  "notes": "Please call before delivery",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "weightGrams": 50
    },
    {
      "productId": 3,
      "quantity": 1,
      "weightGrams": 90
    }
  ]
}
```

Success response:

```json
{
  "id": 1,
  "customerName": "Jane Doe",
  "phone": "+37499123456",
  "email": "jane@example.com",
  "notes": "Please call before delivery",
  "status": "pending",
  "totalAmount": 4380,
  "createdAt": "2026-04-07 12:00:00",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productTitle": "Small Crayfish (Snack Size)",
      "quantity": 2,
      "weightGrams": 50,
      "pricePerKg": 12000,
      "lineTotal": 1200
    },
    {
      "id": 2,
      "productId": 3,
      "productTitle": "Large Crayfish (Premium)",
      "quantity": 1,
      "weightGrams": 90,
      "pricePerKg": 22000,
      "lineTotal": 1980
    }
  ]
}
```

If a product id does not exist:

```json
{
  "detail": "Product 999 not found"
}
```

## Admin Endpoints

These are currently open server endpoints with no authentication yet. Add auth before exposing them publicly.

### `GET /api/admin/products`

Returns all products for admin management.

### `POST /api/admin/products`

Creates a product.

Request body:

```json
{
  "title_am": "Նոր ապրանք",
  "desc_am": "Նկարագրություն",
  "title_en": "New Product",
  "desc_en": "Description",
  "title_ru": "Новый товар",
  "desc_ru": "Описание",
  "minWeight": 20,
  "maxWeight": 40,
  "pricePerKg": 15000,
  "images": [
    "/images/4amsakan.jpg"
  ]
}
```

Success response:

```json
{
  "id": 5,
  "title_am": "Նոր ապրանք",
  "desc_am": "Նկարագրություն",
  "title_en": "New Product",
  "desc_en": "Description",
  "title_ru": "Новый товар",
  "desc_ru": "Описание",
  "minWeight": 20,
  "maxWeight": 40,
  "pricePerKg": 15000,
  "images": [
    "/images/4amsakan.jpg"
  ]
}
```

### `PUT /api/admin/products/{id}`

Updates an existing product.

Request body is the same shape as `POST /api/admin/products`.

Not found:

```json
{
  "detail": "Product not found"
}
```

### `DELETE /api/admin/products/{id}`

Deletes a product.

Success response:

```json
{
  "message": "Product deleted"
}
```

### `GET /api/admin/orders`

Returns all orders with their items.

Optional query params:

- `status`: one of `pending`, `confirmed`, `completed`, `cancelled`

Example:

```text
GET /api/admin/orders?status=pending
```

### `GET /api/admin/orders/{id}`

Returns one order with nested items.

Not found:

```json
{
  "detail": "Order not found"
}
```

### `PATCH /api/admin/orders/{id}`

Updates order status.

Request body:

```json
{
  "status": "confirmed"
}
```

Allowed statuses:

- `pending`
- `confirmed`
- `completed`
- `cancelled`

Invalid status:

```json
{
  "detail": "Invalid order status"
}
```

## Suggested Next Steps

- Add authentication for `/api/admin/*`
- Add pagination for admin orders
- Add order deletion/cancellation rules
- Add image upload support instead of path-only strings

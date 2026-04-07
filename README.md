# Crayfish Farm

This project now includes:

- a React + Vite frontend
- a Python FastAPI backend
- a SQLite database used as the source of truth for products and orders

## Backend

Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the API:

```bash
python -m uvicorn backend.main:app --reload --app-dir .
```

Available endpoints:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/orders`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`
- `GET /api/admin/orders`
- `GET /api/admin/orders/{id}`
- `PATCH /api/admin/orders/{id}`

The SQLite database file is `backend/crayfish_farm.db`.
Products are now stored directly in the database and managed through the admin API.

Detailed endpoint docs are in [API.md](./API.md).

## Frontend

Install Node dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run frontend and backend together:

```bash
npm start
```

During local development, Vite proxies `/api` requests to `http://127.0.0.1:8000`.

## Production

If the frontend and backend are deployed on different origins, set `VITE_API_BASE_URL` for the frontend build so API calls point to the backend host.

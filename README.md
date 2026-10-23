# Users CRUD API

A REST API built with Node.js, Express, and MySQL.

## Requirements

- Node.js 18 or newer
- MySQL 8 or newer

## Setup

1. Create the database and table by running `database/schema.sql` in MySQL:

   ```powershell
   mysql -u root -p < database/schema.sql
   ```

2. Install dependencies and configure the connection:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

   Edit `.env` with your MySQL credentials. The default database name is `users_crud`.

3. Start the API:

   ```powershell
   npm start
   ```

   The service listens on `http://localhost:3000` by default.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/users` | Create a user; `name` and `email` are required, `age` is optional. |
| `GET` | `/api/users` | Return all users. |
| `GET` | `/api/users/:id` | Return one user. |
| `PUT` | `/api/users/:id` | Update one or more supplied user fields. |
| `DELETE` | `/api/users/:id` | Delete a user. |

User fields are `name` (non-empty, maximum 100 characters), `email` (valid and unique), and `age` (integer 0–150 or `null`). Unknown fields are rejected. Success responses return JSON except successful deletion (`204 No Content`). Invalid input returns `400`; missing users return `404`; duplicate email returns `409`.

Example create request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "age": 36
}
```

## Postman

Import `postman/Users-CRUD.postman_collection.json` into Postman and run the collection in order. The **Create user** request checks its response and stores the returned `id` in the `userId` collection variable. The remaining requests include assertions for their expected response codes and data.

## Tests

Run validation tests with:

```powershell
npm test
```

The Postman collection is included to exercise all five endpoints against a running API and configured MySQL instance.

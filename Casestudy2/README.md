# Employee App Backend Integration — Assignment 3

This project serves the supplied frontend from `dist/Frontend` and provides CRUD APIs backed by MongoDB Atlas.

## Requirements
- Node.js 18 or newer
- MongoDB Atlas database and database user

## Setup
1. Open a terminal in this folder (`Casestudy2`).
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Edit `.env` and set `MONGO_URI` to the connection string copied from MongoDB Atlas. Do not commit `.env`.
5. In Atlas, add your current public IP address to the Network Access IP access list.
6. Start the app: `npm start`
7. Open `http://localhost:3000` in a browser.
8. Check backend status at `http://localhost:3000/api/health`.

## API endpoints
- `GET /api/employeelist` — list employees
- `GET /api/employeelist/:id` — get one employee
- `POST /api/employeelist` — create employee; JSON body: `name`, `location`, `position`, `salary`
- `PUT /api/employeelist` — update employee; JSON body must include `_id` (or `id`) plus `name`, `location`, `position`, `salary`
- `DELETE /api/employeelist/:id` — delete employee

The supplied frontend build under `dist/Frontend` is intentionally unchanged.

## If Atlas reports `querySrv ECONNREFUSED`
- Confirm the hostname in `MONGO_URI` exactly matches the Atlas Drivers connection string.
- Check whether `nslookup -type=SRV _mongodb._tcp.<your-cluster-hostname>` succeeds in PowerShell.
- Try a different network (such as a mobile hotspot) or a trusted DNS resolver if SRV DNS queries are blocked.
- Check Atlas Network Access and database-user credentials.

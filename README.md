# ERP Inventory and Sales Management System

A full-stack, comprehensive, and role-based POS (Point of Sale), Inventory, and Customer Management system. Built specifically for complex retail and B2B workflows (e.g., FPV Drone parts, Electronics, etc.), this application manages products, tracks dynamic inventory, securely manages user roles, records sales history, and aggregates data for rich dashboard analytics.

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query (React Query), Recharts, React Router v6
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JSON Web Tokens (JWT), Cloudinary (Image uploads)
- **Deployment:** Docker, NGINX, Multi-stage builds

## Key Features
- **Role-Based Access Control (RBAC):** Admin (Full access), Manager (Operational access), Employee (View & Sell only).
- **Interactive Dashboard:** Aggregates live sales data, low stock alerts, revenue graphs, and total categorical metrics.
- **Inventory Management:** Full CRUD operations on products. Real-time stock status (In Stock, Low Stock, Out of Stock). Cloudinary integration for image uploads.
- **Category Management:** Dynamic category creation, renaming, and deletion (restricted to Admins). Modifying a category automatically updates all associated products.
- **Point of Sale (POS) & Cart:** Search and filter products by category. Intuitive cart management with quantity adjustments, auto-calculated grand totals, and immediate database sync to decrease stock upon successful sale.
- **Customer & Sales Tracking:** Every sale binds dynamically to customer phone numbers. Customers' total historical purchases increase recursively with each transaction.

---

##  Running the Project Locally (Without Docker)

### Prerequisites
- Node.js (v18 or v20)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for image uploads)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory based on the `.env.example` (or use these exact keys):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

##  Running with Docker (Recommended for Testing Full Project)

If you want to run the full project (Database, Backend, and Frontend) instantly on a single machine, we have provided a root-level `docker-compose.yml`. 

1. Ensure Docker and Docker Compose are installed on your machine.
2. Clone the repository into a single "mother" folder.
3. Ensure that the `docker-compose.yml` file is at the root of the project.
4. Replace the environment variables inside `docker-compose.yml` with your actual MongoDB and Cloudinary credentials.
5. Open your terminal at the root directory and run:
   ```bash
   docker-compose up --build
   ```
6. The Backend will be available at `http://localhost:5000` and the Frontend at `http://localhost:80`.

---

##  Deploying Separately (Vercel, Render, Railway, etc.)

Because the Frontend and Backend are decoupled, you do **not** need the `docker-compose.yml` for production deployments if you are using platforms like Vercel or Render.

- **Backend:** Point your hosting provider (e.g., Render, Railway) to the `backend/` directory. It uses the provided `backend/Dockerfile` to build and deploy.
- **Frontend:** Point your hosting provider (e.g., Vercel, Netlify) to the `frontend/` directory. Vercel will automatically detect Vite and run `npm run build` and serve the `dist/` folder. Alternatively, you can use the `frontend/Dockerfile` if deploying to a containerized host.

---


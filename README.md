# Team Task Manager

A full-stack, production-ready SaaS application for managing team projects and tasks. Features a premium dark-mode aesthetic, dynamic dashboard analytics, and a fully functional Kanban board with role-based access control (RBAC).

## 🚀 Features

- **Professional UI/UX:** High-end dark mode design with glassmorphism, radial gradients, and smooth Framer Motion animations.
- **Role-Based Access Control:** Differentiates between `ADMIN` (can manage everything) and `MEMBER` (can view and manage assigned tasks).
- **Dynamic Dashboard:** Real-time statistics showing total projects, tasks, overdue items, and task completion charts.
- **Kanban Board:** Interactive, horizontally scrollable board to track tasks across `TODO`, `IN PROGRESS`, and `DONE` states.
- **Database:** SQLite or MySQL (with automatic driver correction for production).
- **Authentication:** Secure JWT-based login and signup flow with password visibility toggles.
- **Responsive Layout:** Adaptive sidebar and navigation that works seamlessly across devices.

## 🛠 Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (Local) / MySQL (Production via Railway)
- **Authentication:** JWT (JSON Web Tokens), Passlib (Bcrypt)
- **Server:** Uvicorn

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Vanilla CSS (Custom Design System)
- **State Management & Fetching:** React Query (TanStack Query), Axios
- **Animations:** Framer Motion
- **Icons & Charts:** Lucide React, Recharts

## 💻 Local Development Setup

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The API documentation will be available at http://localhost:8000/docs*

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The application will be available at http://localhost:5173*

## 🚢 Deployment

The project is configured for **Railway** using Nixpacks.
- **Node.js:** 20.x
- **Python:** 3.11.x
- **Database:** Managed MySQL instance.

To deploy, simply push to your connected GitHub repository. The `railway.toml` handles the build and environment setup automatically.

## 🎨 Recent Updates
- **API Optimization:** Replaced hardcoded URLs in `axios.js` with relative `/api` paths for seamless environment switching.
- **Security UI:** Added show/hide password toggles to Login and Signup pages.
- **Clean Interface:** Removed redundant placeholders from form inputs for a more professional, minimal look.
- **Deployment Ready:** Integrated Docker and Railway configurations for automated full-stack deployment.
- **Database Fixes:** Implemented automatic `mysql+pymysql` driver resolution for production environments.
- **UI Overhaul:** Complete redesign to a premium SaaS aesthetic with optimized Kanban boards and responsive sidebar.


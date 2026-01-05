# ERP Analytics Module 4

This project is the **Predictive Analytics & Insights Dashboard** module for the AI-Driven Academic ERP System. It provides data visualization and predictive insights using a Django backend and a React (Vite) frontend.

## Tech Stack

*   **Frontend:** React, Vite, TailwindCSS (assumed)
*   **Backend:** Django, Django REST Framework
*   **Database:** SQLite (default) / PostgreSQL (production)
*   **ML/Analytics:** Python (Pandas, Scikit-learn, etc.)

## Project Structure

*   `backend_django/`: Django backend application.
*   `frontend/`: React frontend application.

## Setup & installation

Follow these steps to run the project locally.

### Prerequisites

*   **Node.js** (v16 or higher)
*   **Python** (v3.10 or higher)

### 1. Backend Setup (Django)

Navigate to the backend directory:

```bash
cd backend_django
```

Create a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

> **Note for current local setup:** If you are using the existing `python_env` folder, run:
> ```powershell
> ..\python_env\python.exe manage.py runserver
> ```
> (The `activate` script is missing from your local env, so use the executable directly).

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

The backend API will be running at `http://127.0.0.1:8000/`.

### 2. Frontend Setup (React + Vite)

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

> **Note for current local setup:** Since you are using a local `node_js` folder, you need to add it to your path temporarily so `vite` can find `node`. Run this single line command:
> ```powershell
> $env:PATH = "..\node_js;" + $env:PATH; npm run dev
> ```

The frontend will be running at `http://localhost:5173/` (or the port shown in your terminal).

## Usage

1.  Ensure both backend and frontend servers are running.
2.  Open your browser and navigate to the frontend URL.
3.  The dashboard should load and fetch data from the Django API.

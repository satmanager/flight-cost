# flight-cost

Flight Optimization App
==================================================

Project Description
-------------------
This application solves the "Flight Optimization" problem. It identifies the 
best value flight (cheapest price per kilometer) for a traveler who cares 
about efficiency rather than just the lowest raw cost.

It consists of two parts:
1. Backend (Python): Handles logic, API connections, and Haversine distance calculations.
2. Frontend (React): A user-friendly web interface to search for flights.

Technology Stack
----------------
- Backend: Python 3, Flask, Pipenv (dependency management), Haversine.
- Frontend: React.js, Axios, Webpack (via Create React App).
- External API: Kiwi Tequila API.

Prerequisites
-------------
- Python 3.8+
- Node.js 14+ & npm
- Pipenv (`pip install pipenv`)

==================================================
PART 1: BACKEND SETUP (Python)
==================================================

1. Install Dependencies
   Open a terminal in the backend folder and run:
   $ cd backend
   $ pipenv install

2. Configure Environment Variables
   Create a file named `.env` in the root folder.
   Add your Kiwi API key inside this file:
   
   KIWI_API_KEY=your_actual_api_key_here

   (Note: This file is ignored by Git for security).

3. Usage Option A: Command Line Interface (CLI)
   You can run the script directly without the web server.

   $ pipenv run python flight_optimizer.py --from London --to Paris Berlin Madrid

4. Usage Option B: API Server
   To let the React frontend communicate with Python, start the server:
   
   $ pipenv run python server.py
   
   > Server will start at: http://localhost:5000

==================================================
PART 2: FRONTEND SETUP (React)
==================================================

1. Navigate to the frontend folder
   $ cd frontend

2. Install Dependencies
   $ npm install

3. (Optional) Configure Environment
   If you change the backend port, create a `.env` file in the 'frontend' 
   folder:
   
   REACT_APP_API_URL=http://localhost:5000/api/optimize

4. Test the application

    You can test the app frontend using
    $ npm test

5. Run the Application

   MODE A: Development (Hot Reloading)
   Use this while coding or testing.
   $ npm start
   > Opens http://localhost:3000

   MODE B: Production Build (Webpack Optimized)
   Use this to simulate a real deployment.
   
   Step 1: Build the app
   $ npm run build
   
   Step 2: Serve the build
   $ npx serve -s build
   > Opens http://localhost:3000


# Film-Todos

A full-stack web application where users can search for movies using the OMDb API, and authenticated users can save them to a personal watchlist and manage their movie collection.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Assignment Requirements](#assignment-requirements)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Author](#author)

---

## Features

- User Authentication - Register and login with JWT-based authentication
- Movie Search - Search for movies using the OMDb API with pagination
- Full Movie Data Storage - All OMDb fields (Genre, Director, Actors, Runtime, imdbRating, Plot) are stored locally when adding to watchlist
- Watchlist Management - Add/remove movies to/from your personal watchlist
- Seen/Unseen Tracking - Mark movies as seen or unseen with a simple toggle
- Filter by Status - Filter your watchlist by All, Seen, or Unseen movies
- Pagination - Browse search results and watchlist with pagination
- Responsive Design - Works on desktop and mobile devices
- API Documentation - Swagger/OpenAPI documentation at /api-docs

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Express | Runtime and Web Framework |
| TypeScript | Type Safety |
| SQL Server + mssql | Database and Driver |
| JWT + bcrypt | Authentication |
| Zod | Input Validation |
| Swagger | API Documentation |
| Jest | Unit Testing |

### Frontend

| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| TypeScript | Type Safety |
| React Router | Navigation |
| Vite | Build Tool |
| React Icons | Icon Library |

---

## Project Structure
film-todos/
├── backend/
│ ├── src/
│ │ ├── controllers/ # Request handlers
│ │ ├── routes/ # API routes
│ │ ├── services/ # Business logic
│ │ ├── repositories/ # Database operations
│ │ ├── middleware/ # Auth, validation, error handling
│ │ ├── validators/ # Zod schemas
│ │ ├── utils/ # Helpers (db, AppError)
│ │ ├── scripts/ # Database migration scripts
│ │ └── index.ts # Server entry point
│ ├── package.json
│ └── tsconfig.json
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── pages/ # Page components
│ │ ├── services/ # API service calls
│ │ ├── contexts/ # React context (auth)
│ │ ├── types/ # TypeScript interfaces
│ │ └── App.tsx # App entry point
│ ├── package.json
│ └── tsconfig.json
├── README.md
├── .env.example
└── docker-compose.yml

text

---

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- SQL Server (local or Docker container)
- Git (for cloning)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/xachilleas/film-todos.git
cd film-todos
2. Install backend dependencies
bash
cd backend
npm install
3. Install frontend dependencies
bash
cd ../frontend
npm install
Environment Variables
Create a .env file in the backend/ directory:

env
# Backend .env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# Database
DB_HOST=localhost
DB_PORT=50720
APP_DATABASE=FilmTodosDB
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# OMDb API
OMDB_API_KEY=your_omdb_api_key
Note: Get your OMDb API key from OMDb API (omdbapi.com/apikey.aspx)

Frontend Environment
Create a .env file in the frontend/ directory:

env
VITE_API_URL=http://localhost:3000
Database Setup
Option 1: Using Docker (Recommended)
bash
# Run SQL Server container
docker run -e "ACCEPT_EULA=Y" \
           -e "SA_PASSWORD=YourPassword123!" \
           -p 50720:1433 \
           -d mcr.microsoft.com/mssql/server:2022-latest
Option 2: Local SQL Server
Install SQL Server locally

Create a database named FilmTodosDB

Run the database setup script:

bash
cd backend
node src/scripts/create-database.js
Database Migrations
After the initial setup, run these migration scripts to add new features:

bash
# Add full movie data fields (Extension 1)
node src/scripts/add-movie-columns.js

# Add seen/unseen tracking (Extension 2)
node src/scripts/add-seen-column.js
Running the Application
Start the Backend Server
bash
cd backend
npm run dev
Server runs at: http://localhost:3000

Start the Frontend
bash
cd frontend
npm run dev
Frontend runs at: http://localhost:5173

API Documentation
Once the backend is running, access Swagger documentation at:

text
http://localhost:3000/api-docs
Key API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login and get JWT token
GET	/api/movies/search?title=...	Search movies
GET	/api/movies/:id	Get movie details
GET	/api/watchlist?page=1&filter=seen	Get user's watchlist with optional filter
POST	/api/watchlist	Add movie to watchlist
PATCH	/api/watchlist/:imdbId/seen	Toggle seen/unseen status
DELETE	/api/watchlist/:imdbId	Remove from watchlist
Watchlist Filters
The watchlist endpoint supports the following filters:

filter=all - Show all movies (default)

filter=seen - Show only seen movies

filter=unseen - Show only unseen movies

Testing
Run Backend Tests
bash
cd backend
npm test

# Watch mode
npm run test:watch
Test Coverage
text
Backend: 37+ unit tests
- AuthController: 8 tests
- MoviesController: 8 tests
- OMDbService: 6 tests
- WatchlistService: 6 tests
- WatchlistRepository: 9 tests
Assignment Requirements Checklist
Requirement	Status
Domain Model (Users + Watchlist)	Done
Database (SQL Server)	Done
Layered Architecture	Done
REST API	Done
Authentication/Authorization (JWT)	Done
Frontend (React)	Done
Unit Tests (Jest - 37+ tests)	Done
Swagger Documentation	Done
Full Movie Data Storage (Extension 1)	Done
Seen/Unseen Tracking (Extension 2)	Done
Docker Setup	In Progress
README.md	Done
Future Improvements
Add email verification on registration

Implement "forgot password" feature

Add movie ratings and reviews

Social sharing of watchlist

Export watchlist to CSV

Mobile app (React Native)

Recommended movies based on watchlist

Collaborative watchlists (shared lists)

License
This project is created as a final assignment for the Coding Factory 9 program at Athens University of Economics and Business.

Author
Achilleas

GitHub: @xachilleas

Acknowledgements
OMDb API for providing movie data

Coding Factory 9 for the curriculum

All instructors and mentors
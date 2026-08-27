# Film-Todos

A full-stack web application where users can search for movies using the OMDb API, and authenticated users can save them to a personal watchlist and manage their movie collection. (WOMM)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Assignment Requirements](#assignment-requirements)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Author](#author)

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

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker Desktop (for containerized setup)
- Git (for cloning)

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/xachilleas/film-todos.git
   cd film-todos
Install backend dependencies

bash
cd backend
npm install
Install frontend dependencies

bash
cd ../frontend
npm install
Docker Setup
Quick Start with Docker Compose
Start all services:

bash
docker-compose up -d --build
Verify containers are running:

bash
docker ps
You should see three containers running:

film-todos-frontend (port 5173)

film-todos-backend (port 3000)

film-todos-sqlserver (port 50720)

Access the application:

Frontend: http://localhost:5173

Backend API: http://localhost:3000

API Documentation: http://localhost:3000/api-docs

Docker Commands Reference
bash
# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up -d --build

# Check container health status
docker ps
Database Management with Docker
Connect to SQL Server using DBeaver or any SQL client:

Host: localhost

Port: 50720

Username: sa

Password: AChi1978

Database: FilmTodosDB

View tables from command line:

bash
# View all tables
docker exec -it film-todos-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P AChi1978 -d FilmTodosDB -C -Q "SELECT name FROM sys.tables"

# View Users table
docker exec -it film-todos-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P AChi1978 -d FilmTodosDB -C -Q "SELECT * FROM Users"

# View WatchlistItems table
docker exec -it film-todos-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P AChi1978 -d FilmTodosDB -C -Q "SELECT * FROM WatchlistItems"
Troubleshooting Docker Issues
Issue: "Invalid object name 'Users'"

Solution: The database tables haven't been created. Run the database setup scripts or create tables manually.

Issue: "Invalid column name 'username'"

Solution: Missing columns in the Users table. Add the missing column:

bash
docker exec -it film-todos-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P AChi1978 -d FilmTodosDB -C -Q "ALTER TABLE Users ADD username NVARCHAR(255)"
Issue: Frontend not serving

Solution: Rebuild the containers:

bash
docker-compose down --remove-orphans
docker-compose up -d --build
Issue: Port conflicts

Solution: Check if ports 3000, 5173, or 50720 are in use and stop the conflicting services.

Environment Variables
Backend Configuration
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
Note: Get your OMDb API key from OMDb API

Frontend Configuration
Create a .env file in the frontend/ directory:

env
VITE_API_URL=http://localhost:3000
Docker Environment
When using Docker Compose, the backend uses these environment variables (configured in docker-compose.yml):

env
DB_HOST=film-todos-sqlserver
DB_USER=sa
DB_PASSWORD=AChi1978
DB_DATABASE=FilmTodosDB
DB_PORT=1433
Database Setup
Option 1: Using Docker Compose (Recommended)
The Docker Compose setup includes SQL Server and automatically creates the database. The tables need to be created either through the application's migration scripts or manually.

Option 2: Using Docker Container Only
bash
docker run -e "ACCEPT_EULA=Y" \
-e "SA_PASSWORD=YourPassword123!" \
-p 50720:1433 \
-d mcr.microsoft.com/mssql/server:2022-latest
Option 3: Local SQL Server Installation
Install SQL Server locally, create a database named FilmTodosDB, and run the database setup script:

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
Database Schema
Users Table

Column	Type	Description
id	INT	Primary Key
username	NVARCHAR(255)	Unique username
email	NVARCHAR(255)	Unique email
password	NVARCHAR(255)	Hashed password
full_name	NVARCHAR(255)	User's full name
created_at	DATETIME2	Creation timestamp
updated_at	DATETIME2	Last update timestamp
WatchlistItems Table

Column	Type	Description
id	INT	Primary Key
user_id	INT	Foreign Key to Users
imdb_id	NVARCHAR(50)	IMDB movie ID
title	NVARCHAR(255)	Movie title
year	INT	Release year
poster	NVARCHAR(500)	Poster URL
Genre	NVARCHAR(255)	Movie genre
Director	NVARCHAR(255)	Director name
Actors	NVARCHAR(500)	Cast members
Runtime	NVARCHAR(50)	Movie runtime
imdbRating	DECIMAL(3,1)	IMDB rating
Plot	NVARCHAR(MAX)	Movie plot
seen	BIT	Watch status
added_at	DATETIME2	When added to watchlist
created_at	DATETIME2	Creation timestamp
updated_at	DATETIME2	Last update timestamp
Running the Application
Without Docker
Start the Backend Server:

bash
cd backend
npm run dev
Server runs at: http://localhost:3000

Start the Frontend:

bash
cd frontend
npm run dev
Frontend runs at: http://localhost:5173

With Docker
bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
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
Run Backend Tests:

bash
cd backend
npm test

# Watch mode
npm run test:watch
Test Coverage
Backend: 37+ unit tests

AuthController: 8 tests

MoviesController: 8 tests

OMDbService: 6 tests

WatchlistService: 6 tests

WatchlistRepository: 9 tests

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
Docker Setup	Done
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
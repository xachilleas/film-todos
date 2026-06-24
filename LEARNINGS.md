# Film-Todos: Complete Learning & Knowledge Summary

A comprehensive guide covering everything we learned while building the Film-Todos full-stack application. This document captures all key concepts, code patterns, best practices, and architectural decisions from our cleanup exercise.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Backend File-by-File Learnings](#backend-file-by-file-learnings)
4. [Frontend Architecture](#frontend-architecture)
5. [Frontend File-by-File Learnings](#frontend-file-by-file-learnings)
6. [Database Design](#database-design)
7. [Authentication Flow](#authentication-flow)
8. [Testing Strategy](#testing-strategy)
9. [Best Practices Summary](#best-practices-summary)
10. [Common Issues & Solutions](#common-issues-solutions)
11. [Key Takeaways](#key-takeaways)

---

## Project Overview

### What We Built
A full-stack web application where users can search for movies using the OMDb API, and authenticated users can save them to a personal watchlist.

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Backend Runtime | Node.js + Express |
| Language | TypeScript |
| Database | SQL Server |
| Database Driver | mssql |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| API Documentation | Swagger |
| Frontend | React + Vite |
| Styling | CSS |
| Testing | Jest |

---

## Backend Architecture

### Layered Architecture Pattern
┌─────────────────────────────────────────────┐
│ Routes │ ← Define endpoints
├─────────────────────────────────────────────┤
│ Controllers │ ← Handle HTTP requests/responses
├─────────────────────────────────────────────┤
│ Services │ ← Business logic
├─────────────────────────────────────────────┤
│ Repositories │ ← Database operations
├─────────────────────────────────────────────┤
│ Database │ ← SQL Server
└─────────────────────────────────────────────┘

text

### Why This Architecture?

| Layer | Responsibility | Benefit |
|-------|----------------|---------|
| **Routes** | Define API endpoints | Clear API structure |
| **Controllers** | Handle request/response | Separation of HTTP concerns |
| **Services** | Business logic | Reusable, testable logic |
| **Repositories** | Database operations | Isolate data access |
| **Database** | Data storage | Single source of truth |

### Key Principle: Separation of Concerns

Each layer has a single responsibility:
- Controllers don't know about databases
- Services don't know about HTTP
- Repositories don't know about business logic

This makes the code:
- **Testable** - Each layer can be tested in isolation
- **Maintainable** - Changes in one layer don't affect others
- **Understandable** - Clear where to find specific logic

---

## Backend File-by-File Learnings

### 1. index.ts - Server Entry Point

**What We Learned:**

**Express Setup:**
```typescript
const app = express();
app.use(cors());          // Enable Cross-Origin Resource Sharing
app.use(express.json());  // Parse JSON request bodies
Why CORS?

Frontend (React) runs on different port (5173) than backend (3000)

CORS allows cross-origin requests

Without it, browser would block API calls

Why express.json()?

Parses incoming JSON request bodies

Makes req.body available in controllers

Without it, req.body would be undefined

Error Handler Placement:

typescript
// 1. All routes
app.use('/api', routes);

// 2. 404 handler - catches unmatched routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// 3. Global error handler - ALWAYS LAST
app.use(errorHandler);
Key Learning: Error handler must be last, after all routes and middleware.

2. swagger.ts - API Documentation
What We Learned:

OpenAPI Specification:

typescript
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Film-Todos API',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],  // Where to find route docs
};
How Swagger Works:

swagger-jsdoc scans route files

Looks for @swagger comments

Generates a JSON specification

swagger-ui-express renders it as UI

Security in Swagger:

bearerAuth lets users paste JWT tokens

All protected endpoints use this scheme

Users can test authenticated endpoints in UI

3. db.ts - Database Connection
What We Learned:

Connection Pool Pattern:

typescript
let connectionPool: sql.ConnectionPool | null = null;

export const connectDB = async () => {
    if (!connectionPool) {
        connectionPool = await sql.connect(config);
    }
    return connectionPool;
};
Why Connection Pooling?

Reuses database connections

More efficient than opening/closing for each query

Singleton pattern - one pool shared across app

trustServerCertificate:

typescript
options: {
    trustServerCertificate: true  // Required for local development
}
Required for local development with self-signed certificates

In production, use proper SSL

Security Note: Database credentials come from environment variables, never hardcoded.

4. auth.ts - JWT Authentication Middleware
What We Learned:

JWT Authentication Flow:

text
Request → Extract Token → Verify Token → Attach User → Route Handler
Extending Express Request:

typescript
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}
Adds userId to Express Request type

TypeScript recognizes req.userId in route handlers

Token Format:

text
Authorization: Bearer <your-jwt-token>
Standard JWT authentication format

Bearer prefix is required

Error Cases Handled:

Scenario	Response
No Authorization header	401 - No token provided
Wrong format	401 - No token provided
Token missing after Bearer	401 - Token missing
Invalid token	401 - Invalid or expired token
Malformed token	401 - Invalid token structure
5. errorHandler.ts - Global Error Handler
What We Learned:

Error Handler Pattern:

typescript
const errorHandler = (err: Error | AppError, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        status: 'error',
        message: message
    });
};
Operational vs Programming Errors:

Type	isOperational	Example
Operational	true	Validation failure, Not found, Unauthorized
Programming	false	Database crash, Undefined variable
Why This Matters:

Operational errors should return user-friendly messages

Programming errors should be logged but return generic messages

6. validate.ts - Zod Validation Middleware
What We Learned:

DRY (Don't Repeat Yourself) Pattern:

typescript
const formatZodErrors = (error: ZodError) => {
    return error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
};

const sendValidationError = (res: Response, error: ZodError) => {
    const errors = formatZodErrors(error);
    res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
    });
};
Extracted duplicate error formatting to helper functions

Single source of truth for error format

Validation Functions:

Function	Validates	Use Case
validate	Body + Query + Params	Complex endpoints
validateBody	Only body	POST/PUT requests
validateQuery	Only query	GET with filters
validateParams	Only params	URL parameters
Why return is Important:

typescript
if (error instanceof ZodError) {
    sendValidationError(res, error);
    return;  // ← Prevents calling next()
}
Without return, the function would call next(error) too.

7. AppError.ts - Custom Error Class
What We Learned:

Why Extend Error:

Creates custom error type for instanceof detection

Adds extra properties (statusCode, isOperational)

Works seamlessly with Express error handler

Why Object.setPrototypeOf is Needed:

typescript
Object.setPrototypeOf(this, AppError.prototype);
Fixes prototype chain when extending built-in classes

Without it, err instanceof AppError would be false

When to Use:

typescript
// Expected errors (operational)
throw new AppError('User not found', 404);
throw new AppError('Invalid credentials', 401);

// Unexpected errors (programming)
throw new Error('Something unexpected happened');
8. schemas.ts - Zod Schemas
What We Learned:

Zod Validation Rules:

Method	Purpose	Example
min()	Minimum length/number	z.string().min(3)
max()	Maximum length/number	z.string().max(50)
email()	Valid email format	z.string().email()
regex()	Pattern matching	z.string().regex(/^tt\d+$/)
transform()	Transform value	page: z.string().transform(Number)
IMDb ID Format:

OMDb uses tt followed by numbers

Regex: /^tt\d+$/

Example: tt1375666

Pagination Best Practices:

typescript
page: z.string()
    .optional()
    .transform(val => val || '1')  // Default to page 1
    .refine(val => !isNaN(parseInt(val)), {  // Must be a number
        message: 'Page must be a valid number'
    })
9. UserRepository.ts - User Database Operations
What We Learned:

Repository Pattern:

text
Controller → Service → Repository → Database
Repository handles all database operations for a specific entity

Isolates database code from business logic

Using OUTPUT INSERTED:

sql
INSERT INTO Users (username, email, password)
OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.created_at
VALUES (@username, @email, @password)
Returns the created record in one query

More efficient than separate INSERT + SELECT

Why Omit<User, 'id' | 'created_at'>:

Prevents passing auto-generated fields

TypeScript enforces correct usage

Fields are generated by database

SQL Injection Prevention:

typescript
// ✅ Safe - parameterized query
.input('email', email)
.query('SELECT * FROM Users WHERE email = @email')

// ❌ Dangerous - string concatenation
.query(`SELECT * FROM Users WHERE email = '${email}'`)
10. WatchlistRepository.ts - Watchlist Database Operations
What We Learned:

Existence Check Pattern:

typescript
async save(item) {
    const exists = await this.exists(item.user_id, item.imdb_id);
    if (exists) {
        throw new Error('Movie already in watchlist');
    }
    // Insert only if not exists
}
Prevents duplicate entries

User-friendly error message

Pagination Pattern:

typescript
async findByUserId(userId, limit, offset) {
    // 1. Get total count
    const countResult = await pool.request()
        .query('SELECT COUNT(*) as total FROM WatchlistItems WHERE user_id = @userId');

    // 2. Get paginated data
    const result = await pool.request()
        .query('SELECT * FROM WatchlistItems ... OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');

    // 3. Return both
    return { items: result.recordset, total: total };
}
Two Queries for Pagination:

Query 1: COUNT(*) - Total items

Query 2: Data with OFFSET/FETCH - Actual items

Return both for frontend to display total/pages

11. OMDbService.ts - OMDb API Service
What We Learned:

Environment Variables for API Keys:

typescript
constructor() {
    this.apiKey = process.env.OMDB_API_KEY || '';
    if (!this.apiKey) {
        throw new Error('OMDB_API_KEY is not defined in .env file');
    }
}
Fails fast if API key missing

Clear error message for debugging

Handling "Movie Not Found" Gracefully:

typescript
if (response.data.Response === 'False') {
    if (response.data.Error === 'Movie not found!') {
        return { Search: [], totalResults: '0', Response: 'True' };
    }
    throw new Error(response.data.Error);
}
Empty results are not an error

Returns empty array instead of throwing

Type Safety with Generics:

typescript
const response = await axios.get<OMDbSearchResponse>(this.baseUrl, {
    params: { ... }
});
Tells TypeScript what shape the response data has

TypeScript provides IntelliSense for response fields

12. WatchlistService.ts - Watchlist Business Logic
What We Learned:

Service Layer Orchestration:

typescript
async addToWatchlist(userId: number, imdbId: string) {
    // 1. Fetch from external API
    const movieData = await this.omdbService.getMovieById(imdbId);
    
    // 2. Transform data
    const movieToSave = {
        user_id: userId,
        imdb_id: movieData.imdbID,
        title: movieData.Title,
        // ...
    };
    
    // 3. Save to database
    return await this.watchlistRepository.save(movieToSave);
}
Service orchestrates multiple dependencies

Coordinates data flow between layers

Dependency Injection:

typescript
constructor(
    private omdbService: OMDbService,
    private watchlistRepository: WatchlistRepository
) {}
Dependencies are injected, not created inside

Makes testing easier (can mock dependencies)

Decouples service from implementations

Pagination Metadata:

typescript
return {
    data: result.items,
    pagination: {
        currentPage: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    }
};
Frontend knows exactly how many pages

Can display "Page 3 of 10"

Knows when to disable navigation buttons

13. AuthController.ts - Authentication Controller
What We Learned:

Authentication Flow:

text
Register:
User → Controller → Hash Password → Save User → Generate Token → Return Token

Login:
User → Controller → Find User → Verify Password → Generate Token → Return Token
Password Hashing with bcrypt:

typescript
const hashedPassword = await bcrypt.hash(password, 10);
Salt rounds: 10 provides good security vs performance balance

Never store plain text passwords

Security: Generic Error Messages:

typescript
if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
}
if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
}
Both errors return SAME message

Prevents attackers from knowing if email exists

Standard security practice

JWT Token Generation:

typescript
const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
);
Token includes userId and email

Expires in 7 days

Used for authentication on subsequent requests

14. MoviesController.ts - Movie Controller
What We Learned:

Controller Flow Pattern:

text
Extract → Validate → Call Service → Format → Send Response
Pagination Logic:

typescript
const hasNextPage = results.Search && results.Search.length === 10;
const hasPrevPage = pageNum > 1;

pagination: {
    currentPage: pageNum,
    limit: 10,
    nextPage: hasNextPage ? pageNum + 1 : null,
    prevPage: hasPrevPage ? pageNum - 1 : null
}
OMDb returns up to 10 results per page

If we get exactly 10 results, assume next page exists

Generic Error Messages:

typescript
catch (error) {
    console.error('OMDb search error:', error);  // Log for debugging
    res.status(500).json({ message: 'Failed to search movies' });  // Generic for client
}
Don't expose internal details to clients

Log the real error for developers

15. WatchlistController.ts - Watchlist Controller
What We Learned:

Nested Try-Catch Pattern:

typescript
try {
    // Authentication and validation
    if (!userId) throw new AppError(...);
    if (!imdbId) throw new AppError(...);

    try {
        // Business logic
        const result = await watchlistService.addToWatchlist(userId, imdbId);
        // Send success
    } catch (error) {
        // Handle specific errors (duplicate)
        if (error.message === 'Movie already in watchlist') {
            res.status(409).json(...);
            return;
        }
        throw error; // Re-throw others
    }
} catch (error) {
    next(error); // Global error handler
}
HTTP Status Codes Used:

Status	Meaning	Use Case
200	OK	Successful GET, DELETE
201	Created	Successful POST
400	Bad Request	Invalid input
401	Unauthorized	Not authenticated
409	Conflict	Movie already in watchlist
Frontend Architecture
React Component Structure
text
App.tsx (Root)
├── AuthProvider (Context)
│   └── Router
│       ├── Navbar
│       ├── Routes
│       │   ├── Home (Search page)
│       │   ├── Login
│       │   ├── Register
│       │   ├── MovieDetails
│       │   └── Watchlist
│       └── Footer
Data Flow
text
Component → Service → API → Backend → Database
     ↑                                    ↓
     └───────────── Response ─────────────┘
Key Frontend Patterns
Pattern	Purpose	Example
Context	Global state management	AuthProvider
Custom Hooks	Reusable logic	useAuth()
Services	API calls	movieService, watchlistService
Interceptors	Request/Response handling	Token injection, 401 handling
Frontend File-by-File Learnings
1. main.tsx - Application Entry Point
What We Learned:

React 18+ Rendering:

typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
createRoot is the React 18+ method

! (non-null assertion) tells TypeScript it won't be null

React.StrictMode:

Development-only checks

Highlights deprecated APIs

Double-invokes functions to detect side effects

Context Provider Pattern:

typescript
<AuthProvider>
    <App />
</AuthProvider>
AuthProvider wraps entire app

All components can access authentication state

Font Loading with Fontsource:

typescript
import '@fontsource/kreon/400.css';  // Regular weight
Modern way to load fonts

Bundled with application

No CDN dependency

2. App.tsx - Main App Component
What We Learned:

Sticky Footer Pattern:

typescript
<div style={{
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
}}>
    <Navbar />
    <main style={{ flex: 1 }}>  {/* Pushes footer down */}
        <Routes>...</Routes>
    </main>
    <Footer />
</div>
flex: 1 makes main grow

Footer stays at bottom when content is short

Footer moves down when content is long

Route Parameter:

typescript
<Route path="/movie/:id" element={<MovieDetails />} />
:id is a URL parameter

Accessible via useParams() in MovieDetails

3. AuthContext.tsx - Authentication Context
What We Learned:

Context Provider Pattern:

typescript
<AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
    {children}
</AuthContext.Provider>
Custom Hook Pattern:

typescript
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
Encapsulates useContext call

Provides helpful error messages

Type-safe

LocalStorage Persistence:

typescript
// Save
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Restore
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
User stays logged in after page refresh

Session persists until logout

4. api.ts - API Client Configuration
What We Learned:

Axios Instance:

typescript
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
});
Single source of truth for API config

All requests share base URL

Request Interceptor - Token Injection:

typescript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
Automatically adds token to every request

No manual token handling in components

Response Interceptor - 401 Handling:

typescript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
Handles token expiration globally

Auto-redirects to login

Cleans up invalid state

5. movieService.ts - Movie API Calls
What We Learned:

Interface Extension Pattern:

typescript
export interface Movie { ... }
export interface MovieDetail extends Movie { ... }
DRY - no duplicate fields

Clear relationship between types

Easy to maintain

Service Object Pattern:

typescript
export const movieService = {
    searchMovies: async (title: string): Promise<Movie[]> => { ... },
    getMovieDetails: async (id: string): Promise<MovieDetail> => { ... }
};
Organizes related functions

Clear namespace

Consistent with backend service layer

6. Navbar.tsx - Navigation Component
What We Learned:

Navigation with State:

typescript
const goToHome = (): void => {
    navigate('/', {
        state: { clearSearch: true }
    });
};
Passes data to destination route

Home component uses useLocation().state

Clean way to trigger actions on navigation

Conditional Rendering:

typescript
{user ? (
    // Show authenticated links
    <Link to="/watchlist">my watchlist</Link>
    <button onClick={handleLogout}>logout</button>
) : (
    // Show unauthenticated link
    <Link to="/login">login</Link>
)}
User Display:

typescript
{user.username || user.email}
Falls back to email if username is missing

Handles different user data structures

7. Toast.tsx - Toast Notification Component
What We Learned:

Toast Lifecycle:

typescript
useEffect(() => {
    const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);  // Wait for fade-out
    }, duration);
    return () => clearTimeout(timer);
}, [duration, onClose]);
Toast appears with fadeInUp animation

After duration, toast fades out

After 300ms fade-out, onClose removes component

Positioning with Fixed:

typescript
position: 'fixed',
bottom: '30px',
left: '50%',
transform: 'translateX(-50%)',
position: fixed - stays while scrolling

left: 50% + transform: translateX(-50%) - perfect centering

Color Mapping Object:

typescript
const colors = {
    success: '#28a745',
    error: '#dc3545',
    info: '#007bff'
};
Centralized color definitions

Easy to update

Type-safe

8. Login.tsx - Login Page
What We Learned:

Redirect After Login:

typescript
const from = location.state?.from || '/';

const handleSubmit = async (e: React.FormEvent) => {
    await login(email, password);
    navigate(from);  // Redirect back to intended page
};
from is passed when user tries to access protected route

After login, redirected to original destination

Error Handling Pattern:

typescript
try {
    await login(email, password);
    navigate(from);
} catch (err: any) {
    setError(err.response?.data?.message || 'Login failed');
}
Displays specific error messages from backend

Falls back to generic message if unavailable

Controlled Inputs:

typescript
<input
    value={email}
    onChange={(e) => setEmail(e.target.value)}
/>
React controls the input value

Single source of truth

Easy to validate

9. Register.tsx - Registration Page
What We Learned:

Client-Side Validation:

typescript
if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
}
if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
}
Instant feedback for users

Prevents unnecessary API calls

Loading State Pattern:

typescript
const [loading, setLoading] = useState(false);

setLoading(true);
try {
    await register(...);
} finally {
    setLoading(false);
}

<button disabled={loading}>
    {loading ? 'Creating account...' : 'create account'}
</button>
Prevents double submission

Visual feedback

finally ensures loading always resets

10. Home.tsx - Home Page
What We Learned:

URL State Synchronization:

typescript
// Update URL
navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`, { replace: true });

// Read from URL
const params = new URLSearchParams(location.search);
const searchQuery = params.get('search');
Search results are bookmarkable

Browser history works correctly

Shareable URLs with search results

Poster Fallback Pattern:

typescript
const showPlaceholder = !movie.Poster ||
    movie.Poster === 'N/A' ||
    movie.Poster === '' ||
    failedImages.has(movie.imdbID);

// Track failed images
onError={() => {
    setFailedImages(prev => new Set(prev).add(movie.imdbID));
}}
Handles missing or invalid poster URLs

Prevents broken image icons

Uses professional Material Design icon

Set State with Set:

typescript
setFailedImages(prev => new Set(prev).add(movie.imdbID));
Prevents duplicate entries

O(1) lookup performance

Perfect for tracking unique items

11. MovieDetails.tsx - Movie Details Page
What We Learned:

Conditional Back Navigation:

typescript
{fromWatchlist ? (
    <Link to="/watchlist">← back to watchlist</Link>
) : (
    <Link to={location.state?.fromSearch ? `/?search=${...}` : '/'}>
        ← back to search results
    </Link>
)}
Maintains context (where user came from)

Better UX than always going home

Conditional Action Buttons:

typescript
{fromWatchlist ? (
    // Show Remove button
    <button onClick={handleRemoveFromWatchlist}>Remove from Watchlist</button>
) : (
    // Show Add button
    <button onClick={handleAddToWatchlist}>add to watchlist</button>
)}
Different actions based on context

Clear user expectations

Authentication Check Pattern:

typescript
if (!user) {
    navigate('/login', { state: { from: `/movie/${id}` } });
    return;
}
Redirects to login with return URL

User returns to movie after login

12. Watchlist.tsx - Watchlist Page
What We Learned:

Pagination State Management:

typescript
const [currentPage, setCurrentPage] = useState(1);
const [nextPage, setNextPage] = useState<number | null>(null);
const [prevPage, setPrevPage] = useState<number | null>(null);
currentPage - Current view

nextPage/prevPage - Provided by backend

null means no page in that direction

Removal Loading State:

typescript
const [removingId, setRemovingId] = useState<string | null>(null);

<button disabled={removingId === item.imdb_id}>
    {removingId === item.imdb_id ? '...' : <FiTrash2 />}
</button>
Shows loading state per item

Prevents double-click removal

Better UX than disabling all buttons

Empty State Redirect:

typescript
if (freshResponse.data.length === 0 && currentPage > 1) {
    setCurrentPage(currentPage - 1);
}
If last item on page is removed

Automatically goes back one page

13. types/index.ts - TypeScript Types
What We Learned:

Generic API Response:

typescript
export interface ApiResponse<T> {
    status: "success" | "error";
    message?: string;
    data: T;
    pagination?: { ... };
}
Single source of truth for API responses

Type-safe data extraction

Consistent across endpoints

Type vs Interface:

Use	For
Interface	Object shapes, extends/implements
Type	Unions, intersections, complex types
Type Aliases for API Responses:

typescript
export type AuthResponse = ApiResponse<AuthData>;
export type MoviesSearchResponse = ApiResponse<Movie[]>;
Each endpoint has specific response type

TypeScript knows exact data shape

Database Design
Users Table
sql
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
WatchlistItems Table
sql
CREATE TABLE WatchlistItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    imdb_id NVARCHAR(20) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    year NVARCHAR(10) NOT NULL,
    poster NVARCHAR(500) NOT NULL,
    added_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_User_Movie UNIQUE (user_id, imdb_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
Key Design Decisions:

UNIQUE constraint on (user_id, imdb_id) prevents duplicates

ON DELETE CASCADE removes watchlist items when user is deleted

IDENTITY(1,1) auto-increments IDs

Authentication Flow
Registration Flow
text
1. User submits username, email, password
2. Backend validates input (Zod)
3. Checks if email already exists
4. Hashes password with bcrypt (10 rounds)
5. Creates user in database
6. Generates JWT token (expires in 7 days)
7. Returns token + user data to frontend
8. Frontend stores token and user in localStorage
9. User is now authenticated
Login Flow
text
1. User submits email and password
2. Backend validates input
3. Finds user by email
4. Compares password with bcrypt
5. Generates JWT token (expires in 7 days)
6. Returns token + user data to frontend
7. Frontend stores token and user in localStorage
8. User is now authenticated
Protected Route Flow
text
1. User navigates to /watchlist
2. Frontend checks if user is authenticated
3. If not, redirects to /login with `from` state
4. After login, redirects back to /watchlist
Testing Strategy
Test Structure (AAA Pattern)
typescript
// --- ARRANGE ---
// Set up test data, mocks, and dependencies
const mockUserData = { username: 'test', email: 'test@example.com' };
mockUserRepository.findByEmail.mockResolvedValue(null);

// --- ACT ---
// Execute the code being tested
await authController.register(mockReq, mockRes);

// --- ASSERT ---
// Verify the results
expect(mockRes.status).toHaveBeenCalledWith(201);
expect(mockRes.json).toHaveBeenCalledWith({ status: 'success' });
Mocking Dependencies
typescript
jest.mock('../../repositories/UserRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Create mocked instance
mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;

// Mock return values
mockUserRepository.findByEmail.mockResolvedValue(null);
(bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
Test Coverage Summary
File	Tests
AuthController	8 tests
MoviesController	8 tests
OMDbService	6 tests
WatchlistService	6 tests
Total: 37+ unit tests

Best Practices Summary
Code Organization
Layered Architecture - Controllers → Services → Repositories

Separation of Concerns - Each layer has single responsibility

DRY Principle - Don't Repeat Yourself (extract helpers)

Dependency Injection - Inject dependencies, don't create them

TypeScript Best Practices
Use explicit return types - : Promise<void> on async functions

Use interface for objects - export interface User { ... }

Use type for unions - type Status = 'success' | 'error'

Use import type for types - import type { User } from '../types'

Use readonly for immutability - readonly id: number

React Best Practices
Use functional components - const Component = () => { ... }

Use hooks for state - useState, useEffect, useContext

Use custom hooks - Encapsulate reusable logic

Use context for global state - Auth, Theme, etc.

Use services for API calls - Separate from components

Security Best Practices
Never store plain text passwords - Hash with bcrypt

Use environment variables - Never hardcode secrets

Use generic error messages - "Invalid credentials" not "User not found"

Validate all input - Both client and server

Use HTTPS in production - Encrypt all traffic

Testing Best Practices
Test one thing per test - Single responsibility

Mock external dependencies - Isolate the unit

Test both success and failure cases - Error handling

Use AAA pattern - Arrange, Act, Assert

Keep tests readable - Good descriptions

Common Issues & Solutions
Issue 1: Database Connection Failures
Problem: Cannot connect to SQL Server

Solutions:

Check if SQL Server is running

Verify credentials in .env

Check trustServerCertificate: true for local development

Verify database exists

Issue 2: JWT Token Expired
Problem: User gets 401 after prolonged use

Solution:

Token expires in 7 days (configured in sign)

User must login again

Frontend intercepts 401 and redirects to login

Issue 3: TypeScript Errors with JSX
Problem: JSX.Element type not found

Solutions:

Use React.ReactElement instead

Use React.FC type

Remove explicit return type

Ensure import React from 'react' is present

Issue 4: OMDb API Key Issues
Problem: Search not working

Solutions:

Verify API key in .env

Check if key is valid (get from omdbapi.com)

Check rate limits (1000 requests/day for free tier)

Check network tab for error details

Issue 5: Poster Images Not Showing
Problem: Movie posters don't load

Solutions:

Check if poster URL is valid

Check if poster is N/A (use fallback)

Check if image failed (use onError handler)

Use Material Design icon as fallback

Issue 6: CORS Errors
Problem: Frontend can't connect to backend

Solutions:

Ensure cors() middleware is used in backend

Check if frontend URL matches CORS allowed origins

Check if backend is running on correct port

Key Takeaways
Backend Key Takeaways
Layered Architecture keeps code organized and maintainable

Error Handling should be consistent (AppError + global handler)

Validation should happen at the edge (Zod middleware)

Authentication should be stateless (JWT)

Testing is essential (isolated, fast, comprehensive)

Frontend Key Takeaways
Context is great for global state (auth)

Custom Hooks encapsulate reusable logic (useAuth)

Services separate API calls from components

Interceptors handle cross-cutting concerns (auth)

Toast Notifications improve user experience

Overall Architecture Takeaways
Separation of Concerns makes code testable and maintainable

TypeScript provides type safety and better developer experience

Environment Variables keep secrets secure

Clean Code with comments and documentation is professional

Testing catches bugs early and ensures reliability

Quick Reference: Commands
Backend
bash
npm run dev          # Start development server
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run build        # Build for production
Frontend
bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
Docker
bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 50720:1433 -d mcr.microsoft.com/mssql/server:2022-latest
Git
bash
git add .
git commit -m "docs: add learning document"
git push
Congratulations!
You've successfully built a professional full-stack web application with:

✅ Clean, layered architecture

✅ TypeScript type safety

✅ JWT authentication

✅ REST API with Swagger documentation

✅ React frontend with responsive design

✅ Unit tests with Jest

✅ Professional documentation

This project demonstrates all the skills required for the Coding Factory assignment!

Document created on: 2026
Author: Achilleas CF9
Project: Film-Todos
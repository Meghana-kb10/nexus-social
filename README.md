# Nexus Social

A full-stack social media application built for the **3W Full Stack Internship Assignment — Round 1**.

## 🌐 Live Application

**Frontend:**
[https://nexus-social-ten.vercel.app](https://nexus-social-ten.vercel.app)

**Backend API:**
[https://nexus-social-api.onrender.com](https://nexus-social-api.onrender.com)

### How to open

1. Open the **Frontend** URL in a modern browser.
2. Select **Sign Up** to create an account, or select **Try Demo Account** on the login page.
3. After signing in, use the feed to create posts, interact with posts, follow users, explore content, and view profiles.
4. The frontend, API, and database are deployed, so no local setup is required to use the live application.

## 📱 About the application

Nexus Social is a mini social-media platform inspired by the provided TaskMaster/TaskPlanet social-page UI reference. It combines a public multi-user feed with account management, profiles, social interactions, and a responsive interface with a modern dark visual direction and subtle Three.js elements.

## ✨ Main features

- User signup, login, logout, session restoration, and server-managed demo sign-in
- JWT-based authentication for user-specific operations
- Text-only, image-only, and text-plus-image posts
- Public multi-user feed with All, Latest, Popular, and Following filters
- Pagination with **Load More**
- Like/unlike and comments with persisted counts
- Follow/unfollow relationships, suggested users, and follower/following lists
- Own and other-user profile pages with post and engagement statistics
- Search, Explore, trending hashtags, and post detail pages
- Derived notifications for likes and comments on a user’s posts
- Post permalinks with copy-to-clipboard sharing
- Light/dark theme switching, loading, validation, empty, error, and toast states
- Responsive desktop, tablet, and mobile layouts with desktop sidebar and mobile bottom navigation

## 🎨 Frontend

The frontend is built with **React** and **Vite**, using React Router for navigation and Axios for API communication. Reusable components cover authentication, layouts, feed creation, post cards, shared UI, widgets, and profile views.

The design follows the supplied social-page reference while using a custom Nexus Social visual style:

- Responsive three-column desktop layout
- Mobile bottom navigation
- Persisted light/dark theme
- Custom Three.js orb, ambient background, and loading spinner components
- Reduced-motion support for visual effects

The frontend is deployed on **Vercel**.

## ⚙️ Backend

The backend is built with **Node.js**, **Express**, and **Mongoose**. It exposes REST endpoints for authentication, posts, likes, comments, profiles, follows, suggestions, notifications, and trending hashtags.

JWT bearer tokens protect account-specific and mutation endpoints. Passwords are hashed with `bcryptjs` and are not returned in standard API responses. The default feed endpoint is public and returns all users’ posts newest first, with filtering and pagination options.

The backend is deployed on **Render**.

### API overview

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` |
| Posts | `GET/POST /api/posts`, `GET /api/posts/:id`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comments` |
| Discovery | `GET /api/posts/trending/hashtags` |
| Users | `POST /api/users/:userId/follow`, `GET /api/users/suggestions`, `GET /api/users/notifications`, `GET /api/users/:userId/profile` |
| Operations | `GET /api/health` |

## 🗄️ Database

The application uses **MongoDB Atlas** through Mongoose. The server explicitly selects the `mini_social_db` database.

Main collections:

- `users` — accounts, avatars, badges, and follower/following relationships
- `posts` — author snapshots, post content/images, embedded likes, embedded comments, counters, and timestamps

## 🛠️ Technologies used

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router DOM, Axios, CSS, Three.js |
| Backend | Node.js, Express 5, Mongoose, JSON Web Token, bcryptjs, CORS, dotenv |
| Database | MongoDB Atlas |
| Testing tools | Playwright Test (desktop/tablet/mobile configuration), browser/API verification scripts |
| Deployment | Vercel, Render |

## 🧪 Testing

The repository contains browser/API verification scripts for authentication, posts, feed filtering and pagination, likes, comments, and related flows. It also includes a Playwright configuration for desktop, tablet, and mobile browser projects.

At present, no Playwright spec files are committed under `client/e2e/`, so browser specs must be added before `npx playwright test` can run a Playwright suite. Some legacy verification scripts create test data, and `server/test-posts.js` clears posts during setup; use them only with a disposable local database, never production.

## 📂 Project structure

```text
nexus-social/
├── client/                 # React + Vite frontend
│   ├── src/api/            # Axios client and API modules
│   ├── src/components/     # Feed, layout, widget, common, and Three.js components
│   ├── src/context/        # Authentication and theme state
│   └── src/pages/          # Route-level pages
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── controllers/    # Request handlers
│       ├── middleware/     # JWT protection
│       ├── models/         # User and post schemas
│       └── routes/         # REST route definitions
├── vercel.json             # SPA rewrite configuration
└── README.md
```

## 👩‍💻 Author

**Meghana K B**
**3W Full Stack Internship Assignment — Round 1**

---

## Optional: local development setup

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Atlas or a local MongoDB instance

### 1. Run the backend

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Update `server/.env` using the variable names in `server/.env.example`:

```env
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your long random secret>
CLIENT_URL=http://localhost:5173
```

Then start the API:

```powershell
npm run dev
```

### 2. Run the frontend

In a second terminal:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

The default client environment file points to the local API:

```env
VITE_API_URL=http://localhost:5000/api
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

> On macOS/Linux, use `cp .env.example .env` in place of `Copy-Item .env.example .env`.

### Local quality checks

```powershell
cd client
npm run lint
npm run build
```

Environment templates are committed, but `.env` files and production credentials must not be committed.

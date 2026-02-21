# Felicity Event Management System

A centralized event management platform built with the MERN stack for IIIT Hyderabad's Felicity fest. Supports three roles: Participant, Organizer, and Admin.

---

## 1. Libraries and Frameworks

### Frontend

| Library | Version | Why |
|---|---|---|
| React | 19.2.0 | Core UI library. Used to build all pages and components. |
| React DOM | 19.2.0 | Required to render React components in the browser. |
| React Router DOM | 7.13.0 | Handles page routing and navigation across the app. |
| Axios | 1.13.3 | Used for all API calls to the backend. Handles auth token attachment via an interceptor. |
| Socket.io-client | 4.8.3 | Connects the browser to the backend WebSocket server for the real-time discussion forum. |
| html5-qrcode | 2.3.8 | Enables QR code scanning via the device camera in the browser for attendance tracking. |
| Vite | 7.2.4 | Build tool and dev server. Significantly faster than Create React App. |
| @vitejs/plugin-react | 5.1.1 | Adds React Fast Refresh and JSX support to Vite. |
| ESLint | 9.39.1 | Catches code errors and enforces consistent style. |

### Backend

| Library | Version | Why |
|---|---|---|
| Express.js | 5.2.1 | Web framework for building REST API routes. |
| Mongoose | 9.1.5 | Defines and validates data models for MongoDB. Used for all database operations. |
| jsonwebtoken | 9.0.3 | Issues and verifies JWT tokens for user authentication on protected routes. |
| bcrypt | 6.0.0 | Hashes passwords for organizer creation and password reset flows. |
| bcryptjs | 3.0.3 | Pure JS bcrypt used in the User model. Works on all platforms without native compilation. |
| Socket.io | 4.8.3 | Server-side WebSocket library for the real-time forum. Manages event-based rooms. |
| Multer | 2.0.2 | Handles file uploads. Used for merchandise payment proof images. |
| Nodemailer | 8.0.0 | Sends emails for registration confirmations, credentials, and password resets. |
| QRCode | 1.5.4 | Generates QR code images embedded in ticket confirmation emails. |
| CORS | 2.8.6 | Allows the frontend origin to make API requests to the backend. |
| dotenv | 17.2.3 | Loads secrets and config from a .env file into environment variables. |
| Validator | 13.15.26 | Validates email format during user registration. |
| uuid | 13.0.0 | Generates unique ticket IDs for every registration used in QR codes. |
| Axios (backend) | 1.13.5 | Used for server-side reCAPTCHA verification and Discord webhook calls. |

---

## 2. Advanced Features

### Tier A: Core Advanced Features (2 of 3 chosen, 8 marks each)

#### 1. Merchandise Payment Approval Workflow

**Why chosen**: Merchandise sales require payment confirmation before stock is committed or tickets are issued. This prevents abuse and ensures organizers control who receives goods.

**How it works**:
- Participants upload a payment proof image when ordering. The order is set to Pending.
- Organizers review the proof on the event management page and approve or reject it.
- On approval: stock is decremented, a QR-coded ticket is generated, and a confirmation email is sent.
- On rejection: the participant is emailed a rejection notice and stock is unchanged.

**Key decisions**:
- Stock is only decremented on explicit organizer approval, not at order placement.
- Images are limited to 5MB and restricted to image MIME types.

#### 2. QR Scanner and Attendance Tracking

**Why chosen**: Manual check-in at large events is slow and error-prone. QR codes allow fast, verifiable entry using only a browser.

**How it works**:
- Every registration has a unique ticket ID (UUID) embedded in a QR code sent by email.
- Organizers open the scanner on the event page. The browser camera reads the QR code.
- The decoded ticket ID is verified on the server. If valid and not previously scanned, attendance is marked with a timestamp.
- Duplicate scans are rejected with an error.

**Key decisions**:
- Browser-based scanning removes the need for a native app.
- Only the decoded ticket string is sent to the server, not raw image data.

---

### Tier B: Real-time and Communication Features (2 of 3 chosen, 6 marks each)

#### 1. Real-Time Discussion Forum

**Why chosen**: Participants need a way to ask event-related questions directly on the platform rather than through external group chats.

**How it works**:
- A chat component (`eventchat.jsx`) on the event details page lets registered participants and the organizer post messages.
- Messages support replies via a parent message ID field.
- Organizers can pin or delete messages. All users can react with likes or dislikes.
- All actions are broadcast in real-time via Socket.io to every user on that event's page.
- Full message history is loaded from MongoDB on page open; real-time updates are layered on top.

**Key decisions**:
- Each event has its own Socket.io room (keyed by event ID) to isolate conversations.
- Socket.io was used instead of polling for lower latency.

#### 2. Organizer Password Reset Workflow

**Why chosen**: Organizers cannot self-register or self-reset passwords. A structured, admin-supervised process is needed to safely restore access.

**How it works**:
- Organizers submit a reset request with their email and a reason via the login area.
- The admin views all pending requests on a dedicated dashboard page.
- On approval: a new password is auto-generated, hashed, saved, and emailed to the organizer.
- On rejection: the admin can add a comment. All requests retain their status for audit history.

**Key decisions**:
- Passwords are auto-generated randomly and hashed with bcrypt before storage.
- The approval endpoint is restricted to admin role only.

---

### Tier C: Integration and Enhancement Features (1 of 3 chosen, 2 marks)

#### 1. Bot Protection (Google reCAPTCHA v2)

**Why chosen**: Login and registration pages are vulnerable to automated attacks. CAPTCHA adds a human verification step before credentials are processed.

**How it works**:
- Google reCAPTCHA v2 is embedded in the login and registration pages.
- The token returned by the reCAPTCHA widget is sent to the backend with the form data.
- The backend verifies the token with Google's siteverify API via Axios before processing the request.

**Note**: The reCAPTCHA rendering and token checks are disabled in the current codebase for easier local development and testing.

---

## 3. Setup and Installation

### Requirements
- Node.js v18+
- npm
- MongoDB (local or Atlas)
- SMTP email account (Gmail or similar)

### Backend

```
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<secret-key>
PORT=5000
EMAIL_USER=<smtp-email>
EMAIL_PASS=<smtp-password>
```

Start the server:

```
npm start
```

Runs on `http://localhost:5000`.

### Frontend

```
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```
npm run dev
```

Runs on `http://localhost:5173`.

### Admin Account

The admin account must be created directly in the database. Insert a document into the `users` collection with `role: "admin"`, a valid email, and a bcrypt-hashed password. There is no UI for admin registration.

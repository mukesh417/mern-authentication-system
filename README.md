# MERN Stack Authentication System

A secure, full-stack authentication system built with MongoDB, Express, React, and Node.js. This project features JWT-based authentication with cookie storage, email verification, and password reset functionality using SMTP.

## 🚀 Features

-   **User Authentication**: Secure Sign-up and Login using JWT and HTTP-only cookies.
-   **Security**: Password hashing using `bcryptjs` and route protection.
-   **Email Verification**: Account verification via 6-digit OTP sent to the user's email.
-   **Password Reset**: Forgot password flow with OTP-based reset.
-   **State Management**: Real-time user state synchronization across the frontend using React Context API.
-   **Responsive UI**: Modern, sleek interface built with Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
-   React.js
-   Tailwind CSS
-   Axios
-   React Router DOM
-   React Toastify

**Backend:**
-   Node.js & Express.js
-   MongoDB (Mongoose)
-   JSON Web Tokens (JWT)
-   Nodemailer (SMTP)

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-link>
    ```

2.  **Setup Backend:**
    - Navigate to `server` folder: `cd server`
    - Install dependencies: `npm install`
    - Create a `.env` file and add the following:
      ```
      MONGODB_URI = your_mongodb_connection_string
      JWT_SECRET = your_secret_key
      SMTP_USER = your_smtp_username
      SMTP_PASS = your_smtp_password
      SENDER_EMAIL = your_email
      NODE_ENV = development
      ```
    - Start the server: `npm run server`

3.  **Setup Frontend:**
    - Navigate to `client` folder: `cd client`
    - Install dependencies: `npm install`
    - Create a `.env` file and add:
      ```
      VITE_BACKEND_URL = http://localhost:4000
      ```
    - Start the frontend: `npm run dev`

## 🛡️ Security Best Practices Implemented

-   **HTTP-only Cookies**: JWT tokens are stored in `httpOnly` cookies to prevent Cross-Site Scripting (XSS) attacks.
-   **Bcrypt Hashing**: Passwords are never stored in plain text; they are hashed with a salt factor of 10.
-   **CORS Configuration**: Restricts API access to authorized domains only.
-   **Input Validation**: Backend checks for missing details and existing users before processing requests.

---

*Built as a project for learning and implementing secure MERN authentication flows.*

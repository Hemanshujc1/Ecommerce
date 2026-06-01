# E-Commerce Application

A full-stack e-commerce application featuring a modern React-based frontend and a robust Node.js/Express backend. This project provides user authentication, secure API endpoints, and a responsive user interface designed for a seamless shopping experience.

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Data Fetching:** [Axios](https://axios-http.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database ORM:** [Sequelize](https://sequelize.org/)
- **Database:** MySQL (`mysql2`)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt` for password hashing
- **Security:** `helmet`, `cors`, `express-rate-limit`, `hpp`, `xss-clean`
- **File Uploads:** `multer`, `express-fileupload`
- **Mailing:** `nodemailer`

---

## 📁 Project Structure

The repository is structured into two main directories:

- `/Frontend`: Contains the Next.js application, including components, pages, context, and styles.
- `/Backend`: Contains the Express.js server, including controllers, models, routes, middlewares, and database configurations.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MySQL](https://www.mysql.com/) installed and running

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `Backend` directory.
   - Add necessary environment variables (e.g., Database credentials, JWT Secret, Port).
4. Start the backend server:
   ```bash
   npm run start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` or `.env.local` file in the `Frontend` directory if needed for API URL configuration.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security Features (Backend)
- **Helmet:** Sets secure HTTP headers.
- **Rate Limiting:** Prevents brute-force attacks by limiting repeated requests.
- **XSS Clean:** Sanitizes user input to prevent Cross-Site Scripting.
- **HPP:** Protects against HTTP Parameter Pollution.
- **CORS:** Configured to restrict unauthorized cross-origin requests.

## 📝 API Documentation
Detailed API documentation for user authentication (Registration, Login, Profile, Logout) can be found in the [Backend README](./Backend/README.md).

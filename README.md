# 🎓 Learnozi

Learnozi is a full-stack web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). 

## 🚀 Technologies Used

### Frontend (`learnozi-frontend`)
- **React.js** (v18)
- **Vite** (Next-generation frontend tooling for fast builds)
- **React Router DOM** (For seamless frontend navigation)
- **Axios** (For API requests)

### Backend (`learnozi-backend`)
- **Node.js & Express.js** (v5.x for robust server-side routing)
- **MongoDB** with **Mongoose** (NoSQL Database modeling)
- **JSON Web Token (JWT) & Bcrypt.js** (For secure user authentication)
- **Helmet, CORS, Express Rate & Mongo Sanitize Limit** (For security optimizations and middleware handling)

## 📂 Project Structure

```text
Learnozi/
├── learnozi-frontend/   # React Client
└── learnozi-backend/    # Express REST API Server
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB locally installed, or a MongoDB Atlas URI string

### 1. Backend Setup
```bash
cd learnozi-backend
npm install
npm run dev
```
> **Note**: Make sure to create a `.env` file in the backend folder containing `PORT`, `MONGO_URI`, and `JWT_SECRET` (depending on your setup).

### 2. Frontend Setup
```bash
cd learnozi-frontend
npm install
npm run dev
```

## 📜 License
This project is licensed under the ISC License.

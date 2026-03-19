# HouseTutor 🏥

A modern spaced repetition learning platform designed for medical students to master complex medical knowledge through intelligent flashcards and image occlusion techniques.

## 📖 Overview

HouseTutor is a full-stack web application that implements evidence-based spaced repetition algorithms to help medical students efficiently memorize and retain medical information. The platform supports traditional flashcards, nested sub-questions, and advanced image occlusion features similar to Anki, making it ideal for studying anatomy, radiology, and other visual medical subjects.

## ✨ Features

### 🎴 Smart Flashcard System
- Create and organize flashcards into themed decks by medical category
- Support for nested sub-questions to break down complex topics
- Rich text support with images for visual learning
- Explanations field for detailed understanding

### 🧠 Spaced Repetition Algorithm
- Intelligent review scheduling based on the SuperMemo SM-2 algorithm
- Tracks easiness factor, review intervals, and consecutive correct answers
- Personalized learning paths that adapt to your performance
- Next review date calculation to optimize retention

### 🖼️ Image Occlusion
- Create interactive image-based flashcards for anatomy and radiology
- Multiple occlusion modes:
  - **All mode**: Reveal all answers at once
  - **One-by-one mode**: Progressive revelation for focused learning
- Draw custom occlusion shapes directly on medical images
- Label support for detailed anatomical structures

### 👥 User Management
- Secure authentication and authorization
- Personal deck management
- Public deck sharing for collaborative learning
- Individual progress tracking per user

### 📊 Deck Organization
- Categorized decks (Anatomy, Pharmacology, Pathology, etc.)
- Public/private deck visibility
- Deck descriptions and metadata
- Multi-user deck support

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js (v22+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, express-rate-limit

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Authentication**: NextAuth.js

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL (containerized)
- **Development**: ts-node-dev with hot reload
- **Linting**: ESLint

## 📁 Project Structure

```
HouseTutor/
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models & business logic
│   │   ├── routes/       # API route definitions
│   │   ├── middleware/   # Auth & validation middleware
│   │   ├── config/       # App configuration
│   │   └── database/     # Database connection
│   ├── prisma/           # Database schema & migrations
│   └── uploads/          # User-uploaded images
├── frontend/             # Next.js client application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # Reusable React components
│   │   ├── services/     # API integration layer
│   │   ├── types/        # TypeScript type definitions
│   │   └── lib/          # Utility functions
└── compose.yml           # Docker Compose configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22.x or higher
- Docker & Docker Compose
- PostgreSQL (if running locally without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MunyinSam/HouseTutor.git
   cd HouseTutor
   ```

2. **Set up environment variables**
   
   Create `.env` files in both `backend/` and `frontend/` directories:
   
   **Backend (.env)**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/housetutor"
   JWT_SECRET="your-secret-key"
   PORT=8000
   ```
   
   **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Start with Docker Compose** (Recommended)
   ```bash
   docker-compose up -d
   ```

4. **Or run manually**
   
   **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npm run dev
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: Authentication and profile management
- **Decks**: Flashcard collections with categories
- **Questions**: Individual flashcards with optional parent-child relationships
- **Flashcards**: Review metadata linked to questions
- **Reviews**: Spaced repetition progress tracking per user
- **ImageOcclusions**: Image-based learning cards with occlusion data

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for HTTP header security
- CORS configuration
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM

## 📝 API Documentation

The backend exposes RESTful endpoints for:
- `/api/auth` - User authentication
- `/api/decks` - Deck management
- `/api/questions` - Question CRUD operations
- `/api/flashcards` - Flashcard generation
- `/api/reviews` - Review scheduling and tracking
- `/api/image-occlusions` - Image occlusion management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍⚕️ About

Originally developed as "GregoryHouse" to help second-year medical students master medical knowledge through evidence-based learning techniques.

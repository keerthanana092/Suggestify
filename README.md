# 🌌 Suggestify

**Suggestify** is a premium, AI-powered discovery engine that finds your next favorite thing based on "vibe" rather than just keywords. Whether you're looking for a gritty cyberpunk movie, a hyper-focus playlist, or an underrated sci-fi book, Suggestify uses Google Gemini AI to understand your intent and provide curated recommendations.

![Suggestify Preview](frontend/public/suggestify_logo.png)

## ✨ Features

-   **Vibe-Based Discovery**: Describe a feeling, mood, or specific scenario, and let the AI find the perfect match.
-   **Multi-Domain Search**: Instant recommendations across Movies, Books, Songs, Courses, and Products.
-   **Intelligent Reasoning**: Every match comes with a "Why it matches" explanation powered by Gemini AI.
-   **Personalized Profile**: Save your favorite discoveries to your collection.
-   **Modern UI/UX**: A sleek, dark-themed interface built with glassmorphism, fluid animations (Framer Motion), and a responsive layout.
-   **Secure Authentication**: Robust user system with JWT-based sessions and encrypted password storage.

## 🚀 Tech Stack

### Frontend
-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS & Vanilla CSS (Custom Glassmorphism)
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **State Management**: React Context API

### Backend
-   **Runtime**: Node.js / Express
-   **AI Engine**: Google Gemini Pro (via `@google/genai`)
-   **Database**: Prisma ORM with SQLite (Easily swappable to PostgreSQL/MySQL)
-   **Security**: JWT (JSON Web Tokens) & Bcrypt.js

## 🛠️ Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   A Google AI (Gemini) API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/suggestify.git
    cd suggestify
    ```

2.  **Install dependencies**:
    ```bash
    # Install root, frontend, and backend dependencies
    npm run install-all
    ```

3.  **Environment Setup**:
    Create a `.env` file in the `backend` directory:
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your_ultra_secret_key"
    GEMINI_API_KEY="your_google_gemini_api_key"
    PORT=5000
    ```

4.  **Database Migration**:
    ```bash
    cd backend
    npx prisma migrate dev --name init
    cd ..
    ```

### Running the App

Run both frontend and backend concurrently from the root directory:
bash
npm run dev

<img width="1919" height="876" alt="Screenshot 2026-04-26 161058" src="https://github.com/user-attachments/assets/b207f1d9-6134-481e-a7f1-915865f3e466" />
<img width="1872" height="870" alt="Screenshot 2026-04-26 161355" src="https://github.com/user-attachments/assets/9b2a6812-c15a-45a5-a5c3-304c26e0ee65" />
<img width="1841" height="876" alt="Screenshot 2026-04-26 161410" src="https://github.com/user-attachments/assets/de037bc0-0a97-4ee8-b498-fbd92ef3de53" />
<img width="1877" height="875" alt="Screenshot 2026-04-26 161306" src="https://github.com/user-attachments/assets/41dd8dfd-fbfe-43f7-83bd-ad3b899ad23f" />
<img width="1861" height="861" alt="Screenshot 2026-04-26 161240" src="https://github.com/user-attachments/assets/402dcba6-4c8e-45d0-9fed-295927427ba5" />
<img width="1896" height="854" alt="Screenshot 2026-04-26 161216" src="https://github.com/user-attachments/assets/978ab8ca-04ac-4906-be23-a508377122b6" />

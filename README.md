# 🚀 PrepForge: AI-Powered Technical Interview Prep

**PrepForge** is a state-of-the-art technical interview preparation platform designed to bridge the gap between learning and landing your dream job. It combines a rigorous problem-solving environment with cutting-edge AI assistance.

## ✨ Features

### 📊 Intelligent Dashboard
- **Progress Tracking:** Monitor your current streak, total score, and solving accuracy.
- **Topic Analysis:** Visualize your strongest topics through automated tag aggregation.
- **Smart Recommendations:** Receive AI-driven suggestions for your next challenge based on your past performance.

### 💻 Advanced Problem Workspace
- **Multi-Language Support:** Solve problems in JavaScript, Python, or C++.
- **Integrated Editor:** A professional-grade Monaco editor experience with smooth animations.
- **Personal Notes:** Save private notes, complexity analysis, and reminders directly within each problem workspace.

### 🎙️ AI Mock Interview Simulator
- **Real-time Feedback:** Get graded on your interview performance with detailed AI critiques.
- **Session Timer:** Experience the pressure of real interviews with a professional countdown timer.
- **Live Hints:** Access "Interview Tips" during sessions to help structure your answers using the STAR method.

### 📄 AI Resume Analyzer
- **ATS Optimization:** Get feedback on how well your resume performs against automated filters.
- **Skill Gap Identification:** Discover missing technical and soft skills for your target roles.
- **Role-Specific Advice:** Receive tailored summaries and improvement tips for Frontend, Backend, ML, and Data roles.

## 🛠️ Technology Stack

- **Frontend:** Next.js, Tailwind CSS, Framer Motion, Zustand, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB (Atlas), JWT Auth.
- **AI Engine:** Google Gemini AI Integration.
- **Execution:** Judge0 API for real-time code execution.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   ```

2. **Install dependencies:**
   ```bash
   # Root
   npm install
   # Frontend
   cd frontend && npm install
   # Server
   cd ../server && npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `/server` directory with:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `JUDGE0_API_KEY`

4. **Run the application:**
   ```bash
   # From root
   npm run dev
   ```

---

## ☁️ Deployment Guide

### 🎨 Frontend (Vercel)
1. Push your code to GitHub.
2. Connect your repo to Vercel.
3. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://prepforge-api.onrender.com/api`)
4. Build Command: `npm run build`
5. Output Directory: `.next`

### ⚙️ Backend (Render)
1. Connect your repo to Render as a **Web Service**.
2. Root Directory: `server`
3. Runtime: `Node`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long random string.
   - `FRONTEND_URL`: Your Vercel domain (e.g., `https://prepforge.vercel.app`)
   - `GEMINI_API_KEY`: Your Google AI key.
   - `JUDGE0_API_KEY`: Your Judge0 key.

---
Built with ❤️ for the developer community.

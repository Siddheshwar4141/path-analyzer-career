# Career Path Analyzer – Full Stack Assignment (CodeAtRandom AI)

This project implements all required features from the assignment:

- Career goal input page  
- Skill gap analyzer API  
- Career roadmap generator API  
- HackerNews top stories integration  
- Combined UI dashboard  

The application is deployed and fully working on Render.

---

## 🔗 Live Links
- **URL:** https://path-analyzer-career-1.onrender.com
- **GitHub Repository:** https://github.com/Siddheshwar4141/path-analyzer-career  

# Setup & Run

## Clone
git clone https://github.com/Siddheshwar4141/path-analyzer-career  
cd path-analyzer-career

## Backend
cd backendnpm  
install node  
index.js

## Frontend
cd frontend  
npm install  
npm run dev


## 🧰 Tech Stack

**Frontend:** React (Vite), Axios, CSS  
**Backend:** Node.js, Express.js, Axios, CORS  
**Deployment:** Render (Frontend + Backend) 


## 📌 Features

### 1. Career Goal Input Page  
User enters:
- Target role  
- Current skills (comma-separated)  

### 2. Skill Gap Analyzer (POST /api/skill-gap)  
Returns:
- Matched skills  
- Missing skills  
- Recommended learning order  
- Suggestions  

### 3. Career Roadmap Generator (POST /api/roadmap)  
Returns a 3-phase roadmap for the selected role.

### 4. HackerNews Integration  
Fetches top 5 latest technology stories.

### 5. Combined Dashboard  
- Left: Skill Gap Results  
- Right: Career Roadmap  
- Bottom: Latest Tech News  

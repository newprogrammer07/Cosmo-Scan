# 🌌 Cosmo Scan – Interstellar Asteroid Tracker & Risk Analyser

A full-stack web platform for **real-time monitoring, risk analysis, and visualisation of Near-Earth Objects (NEOs)** using live space-agency data.

This project was built as part of a hackathon challenge to make complex asteroid trajectory data **accessible, understandable, and actionable** for researchers, enthusiasts, and the general public.

---

## 🚀 Project Overview

**Cosmic Watch** fetches real-time asteroid data from the **NASA NeoWs API** and presents it through an interactive dashboard that allows users to:

- Track Near-Earth Objects in real time  
- Analyse asteroid risk levels based on scientific parameters  
- Save and monitor specific asteroids  
- Receive alerts for close-approach events  
- Visualise asteroid orbits relative to Earth  
- Collaborate via live discussions  

The platform is fully containerised using **Docker**, making it easy to deploy and test.

---

## 🔗 Important Links

> Replace the links below after deployment

- **🌐 Deployed Application:**  
  [ _Paste PPT link here_](https://cosmoscan.netlify.app/)

- **🎥 Demo Video:**  
  [ _Paste PPT link here_](https://drive.google.com/file/d/1z5CxnUeItb6A84-6L9pusOI3eiF6oHcL/view?usp=drive_link)

- **📊 Presentation (PPT):**  
 [ _Paste PPT link here_](https://docs.google.com/presentation/d/1BQhNjXSNDHkafFoskRmwrq1veJ7B8Os-/edit?usp=drive_link&ouid=116666437119853478801&rtpof=true&sd=true)

---

## ✨ Features Implemented

### 🔐 User Authentication & Verification
- Secure user registration and login
- JWT-based authentication
- Password hashing and secure session handling
- User-specific saved (watched) asteroids

### 📡 Real-Time Asteroid Data Feed
- Live integration with **NASA NeoWs API**
- Displays:
  - Asteroid name & ID
  - Estimated diameter
  - Relative velocity
  - Missed distance from Earth
  - Close-approach date

### ⚠️ Risk Analysis Engine
- Automatic classification of asteroids as:
  - Hazardous / Non-Hazardous
- Risk scoring based on:
  - Diameter
  - Velocity
  - Proximity to Earth
- Clear, human-readable risk indicators
- Updates automatically everyday @9 am

### 🔔 Alert & Notification System
- Dashboard alerts for upcoming close approaches
- Custom alert parameters per user
- Scheduled risk notifications

### 🌍 3D Visualisation
- Interactive 3D asteroid orbit visualisation
- Shows asteroid trajectory relative to Earth
- Built using modern 3D web technologies

### 💬 Real-Time Chat
- Live community discussion threads
- Asteroid-specific conversations
- Powered by WebSockets / Socket.io

### 🐳 Containerised Deployment
- Fully Dockerised frontend, backend, and database
- `docker-compose.yml` for one-command setup
- Production-ready container structure

---

## 🧠 Tech Stack

### Frontend
- React / Next.js
- Modern UI with dark space-themed design
- Responsive layout

### Backend
- Node.js / Express (or FastAPI if applicable)
- RESTful API architecture
- Secure authentication & authorization

### Database
- PostgreSQL (Prisma Schema)

### APIs
- NASA NeoWs (Near Earth Object Web Service)

### DevOps
- Docker & Docker Compose
- Git & GitHub version control

---

## 🧪 API Documentation

- A **fully documented Postman Collection** is included in the repository
- Covers:
  - Asteroid feed endpoints
  - Lookup endpoints
  - User profile & authentication endpoints
- Includes environment variables and test cases

📁 Location:  
/postman/Cosmo_Scan_API.postman_collection.json

---

## 🐳 Running the Project Using Docker Only

### Prerequisites
Make sure you have:
- **Docker**
- **Docker Compose**

Installed on your system.

---

### 🔧 Steps to Run

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cosmic-watch
2. **Create environment files

  Add required environment variables in:

    backend/.env
    frontend/.env
    
3. **Build and start containers
   
       docker-compose up --build

4. **Access the application

    Frontend: http://localhost:3000

    Backend API: http://localhost:5000 (or configured port)

5. **Stop containers

    docker-compose down

🔐 Security Practices Followed

Password hashing

JWT authentication

Secure API access

Environment variable protection

Clean separation of frontend & backend

📜 Hackathon Compliance

✅ All code written during the hackathon timeframe

✅ No plagiarism or direct code copying

✅ AI-LOG.md included to document LLM assistance

✅ GitHub submission before deadline

✅ Working demo available

✅ Dockerised deployment

✅ Postman API documentation included

🏆 Team Information

👥 Team Name

Juggernauts

👤 Team Members

Siddharth Kumar Jena

Ashutosh Nayak

Ayutayam Sutar

Sushree Adyasha Sahoo

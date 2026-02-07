# 🌌 Cosmo Scan - Interstellar Asteroid Tracker

> **A full-stack, containerized platform for real-time Near-Earth Object (NEO) monitoring, risk analysis, and community alerts.**

![Project Banner](https://img.shields.io/badge/Status-Hackathon_Ready-success?style=for-the-badge) 
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker&style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-blueviolet?style=for-the-badge)

## 📖 Project Overview
Cosmo Scan simplifies complex space data from NASA into an accessible, user-friendly dashboard. It features a custom **Risk Analysis Engine** that evaluates asteroids based on velocity, diameter, and miss distance to assign a "Threat Score" (0-100). Users can track hazardous objects, receive alerts, and discuss findings in real-time.

---

## 🚀 Key Features
* **Real-Time NASA Feed:** Fetches live asteroid data from the NASA NeoWs API.
* **Risk Analysis Engine:** Algorithms calculate a "Risk Score" (Critical, High, Moderate, Low) for every object.
* **Interactive Dashboard:** View asteroid details, orbital data, and visualize approach vectors.
* **User System:** Secure Authentication (Signup/Login) to save a personal **Watchlist**.
* **Community Chat:** Real-time discussion threads powered by WebSockets (Socket.io).
* **Containerized Deployment:** Fully Dockerized with multi-stage builds for easy setup.

---

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** PostgreSQL (with Prisma ORM)
* **DevOps:** Docker, Docker Compose (Multi-stage builds)

---

## ⚙️ Prerequisites
To run this project, you only need **one** tool installed:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Ensure it is running)

*Note: You do **NOT** need Node.js or PostgreSQL installed on your machine. Docker handles everything.*

---

## 📦 How to Run (1-Click Setup)

### 1. Clone the Repository
```bash
git clone (https://github.com/newprogrammer07/Cosmo-Scan.git)
cd cosmo-Scan
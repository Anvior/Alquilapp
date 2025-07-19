# AlquilApp – AI-Powered Peer-to-Peer Rental Platform

Full-stack web solution for sustainable object sharing, integrating AI-based recommendations, containerized architecture, and automated testing.

VIDEO: https://drive.google.com/file/d/1Nsr3JuWM2ZhZzy4R2JyisHs-zziR--WI/view

## 🚀 Overview

AlquilApp is a modular web platform designed to facilitate peer-to-peer rental of everyday items. The system enables users to publish, discover, and rent objects with ease—encouraging responsible consumption and circular economy principles.

This project was developed as a full-stack engineering solution and includes a conversational AI assistant, custom product recommendation engine, and complete containerization using Docker Compose.

## 🧠 Key Features

- 🔐 Secure login system (bcrypt) + password recovery via email (nodemailer)
- 🛒 Full rental flow: product publishing, renting, reviewing, reporting
- 💬 Real-time messaging between users
- 💼 Wallet simulation with transaction history
- ⚙️ Admin dashboard for managing users and incidents
- 🤖 AI microservice with:
  - Smart product recommendations
  - Chatbot using semantic similarity (MiniLM via SentenceTransformers)
- 🧪 50+ automated tests (Vitest, Vue Testing Library, Pytest)

## 📦 Tech Stack

| Layer       | Technologies                                           |
|-------------|--------------------------------------------------------|
| Frontend    | Vue.js, Vue Router, CSS, Vitest, Docker                |
| Backend     | Node.js, Express, MySQL, bcrypt, multer, nodemailer    |
| AI Module   | Python, Flask, SentenceTransformers, Docker            |
| DevOps      | Docker, Git, GitHub                            |

## 🏗️ Architecture

The system follows a service-oriented architecture composed of:

- `frontend/` – SPA frontend with Vue.js and reusable components
- `backend/` – REST API with user, product, rental and chat logic
- `ia/` – Independent Flask microservice for chatbot + recommender
- `docker-compose.yml` – Unified orchestration of all services

## 🔧 Deployment

### 1. Clone the repository

```bash
git clone https://github.com/TUNOMBREUSUARIO/alquilapp.git
cd alquilapp
2. Create .env files (examples provided in each module)
3. Build and run the platform

docker-compose up --build

Services:

Frontend → http://localhost:8080

Backend → http://localhost:3000

AI service → http://localhost:5000

🧪 Testing
Layer	Framework	Coverage
Frontend	Vitest + Testing Library	Components, routing, UI
Backend	Vitest	API, auth, rentals, errors
IA	Pytest	Endpoints and logic

🌍 Project Value
AlquilApp is not just a technical exercise. It’s a complete system tackling real-world needs:

Encourages sustainable consumption habits

Promotes accessibility and usability in digital tools

Modular, scalable and production-ready design

Developed with autonomy, clarity, and ethical reflection

🧑‍💻 Author
Anartz Azumendi
👨‍🎓 Dual Bachelor in Computer Engineering & Industrial Electronics
🇪🇸 Based in Spain, open to relocate
✈️ Available for technical roles in Switzerland or international environments
📧 anartz2001@gmail.com

Ready to discuss further improvements, integrations or deployment opportunities.


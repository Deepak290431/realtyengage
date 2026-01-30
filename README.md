# RealtyEngage - Customer Engagement Platform

[![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue.svg)](https://www.mongodb.com/mern-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RealtyEngage is a comprehensive, state-of-the-art Customer Engagement Platform (CEP) tailored for real estate developers and property management firms. Built using the **MERN stack**, it provides a seamless bridge between property seekers and developers through AI-driven search, automated enquiries, secure payments, and post-sales support.

---

## 📂 Project Structure

This repository is organized into a primary workspace:

- **[Customer Engagement Platform](./Customer%20Engagement%20Platform/)**: The core application suite.
  - **[Frontend](./Customer%20Engagement%20Platform/frontend/)**: React + Vite + Tailwind CSS dashboard and portal.
  - **[Backend](./Customer%20Engagement%20Platform/backend/)**: Node.js + Express + MongoDB REST API.

---

## ✨ Key Features

### 🏢 Property Exploration & Management
- **Intuitive Discovery**: Advanced search and filtering (location, price, type, status).
- **Interactive Maps**: Full Google Maps integration for property visualization and nearby facilities.
- **Admin Control**: Robust CRUD operations for developers to manage listings in real-time.
- **Image Portfolios**: High-quality image galleries for every project.

### 🤖 AI-Powered Support
- **Intelligent Chatbot**: Context-aware AI assistant to handle common customer queries instantly.
- **Voice Search**: Hands-free property discovery using advanced voice recognition.

### 💳 Financial & Sales Operations
- **Secure Payments**: Integrated Razorpay gateway for reservations and installments.
- **EMI Calculator**: Built-in financial planning tools for prospective buyers.
- **Transaction Tracking**: Detailed history and downloadable invoices for every payment.

### 📊 Performance Analytics
- **Admin Dashboard**: Real-time business metrics, revenue tracking, and inquiry management.
- **Customer Portal**: Personalized dashboard for tracking enquiries, payments, and site visits.

---

## 🛠️ Technology Stack

| Layer | Stack |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Framer Motion, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Integrations** | Razorpay (Payments), Google Maps (GIS), Nodemailer (Mail) |
| **Deployment** | Netlify (Frontend), Render (Backend) |

---

## 🚀 Quick Start

For detailed setup instructions, please see the **[Module README](./Customer%20Engagement%20Platform/README.md)**.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deepak290431/realtyengage.git
   ```
2. **Setup Backend**:
   - `cd "Customer Engagement Platform/backend"`
   - `npm install`
   - Configure `.env` (refer to `.env.example`)
   - `npm run dev`
3. **Setup Frontend**:
   - `cd "Customer Engagement Platform/frontend"`
   - `npm install`
   - `npm run dev`

---

## 👨‍💻 Author

Created with ❤️ by **Deepak**
- [GitHub](https://github.com/Deepak290431)
- [Project Documentation](./PROJECT_PLAN.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if applicable).

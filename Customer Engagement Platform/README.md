# RealtyEngage - Customer Engagement Platform

A comprehensive Customer Engagement Platform for real estate companies built with the MERN stack (MongoDB, Express.js, React.js, Node.js). The platform enables customers to explore villa projects, make enquiries, process payments, and receive post-sales support.

## ✨ Features

### 🏢 Property Management
- **CRUD Operations**: Add, update, delete, and view properties with real-time database updates
- **Advanced Search**: Filter properties by location, price range, type, and status
- **Image Management**: Upload and manage property images
- **Google Maps Integration**: Interactive maps showing property locations and nearby facilities
- **Virtual Tours**: Schedule and manage property visits

### 👤 User Management
- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Role-Based Access**: Admin and customer roles with different permissions
- **Profile Management**: Update profile, change password, upload avatar
- **Session Management**: Automatic token refresh and secure logout

### 💬 Customer Engagement
- **AI Chatbot**: Intelligent chatbot with context-aware responses
- **Enquiry System**: Submit and track property enquiries
- **Support Tickets**: Create and manage support requests
- **Real-time Updates**: Get instant notifications and updates

### 💳 Payment Processing
- **Payment Gateway**: Integrated Razorpay for secure transactions
- **EMI Calculator**: Calculate monthly installments with different parameters
- **Payment History**: Track all transactions and download receipts
- **Payment Plans**: Multiple payment options and schemes

### 📊 Dashboards
- **Customer Dashboard**: View properties, payments, and activities
- **Admin Dashboard**: Monitor business metrics, revenue, and user activities
- **Analytics**: Visual charts and statistics
- **Reports**: Generate and export various reports

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Razorpay** - Payment gateway
- **Express Validator** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/realtyengage.git
cd realtyengage
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/realtyengage

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Admin Credentials
DEFAULT_ADMIN_EMAIL=admin@realtyengage.com
DEFAULT_ADMIN_PASSWORD=Admin@123
DEFAULT_ADMIN_FIRSTNAME=Admin
DEFAULT_ADMIN_LASTNAME=User
DEFAULT_ADMIN_PHONE=9876543210

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@realtyengage.com

# Razorpay (Optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret

# Cloudinary (Optional for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Razorpay (Optional)
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

### 4. Database Setup

```bash
# Make sure MongoDB is running
# For local MongoDB:
mongod

# Create admin user (from backend directory)
cd backend
npm run seed:admin
```

### 5. Start the Application

```bash
# Terminal 1 - Start Backend Server
cd backend
npm run dev

# Terminal 2 - Start Frontend Development Server
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (if implemented)

## 👤 Default Login Credentials

### Admin Account
- **Email**: admin@realtyengage.com
- **Password**: Admin@123

### Test Customer Account
- **Email**: customer@test.com
- **Password**: Customer@123

> ⚠️ **Important**: Change these credentials in production!

## 🔥 Key Functionalities

### Real-time Features
- ✅ **Live Data Updates**: All CRUD operations update the database in real-time
- ✅ **Authentication**: JWT-based auth with automatic token refresh
- ✅ **Profile Management**: Update profile, change password with instant DB updates
- ✅ **Image Uploads**: Upload and store images for profiles and properties
- ✅ **Payment Processing**: Secure payment gateway integration
- ✅ **AI Chatbot**: Context-aware responses with conversation history
- ✅ **Search & Filter**: Advanced search with multiple filter options
- ✅ **Google Maps**: Interactive maps with location markers

### Admin Features
- ✅ Create, update, delete properties
- ✅ View and respond to customer enquiries
- ✅ Manage user accounts
- ✅ View revenue and analytics
- ✅ Handle support tickets
- ✅ Generate reports

### Customer Features
- ✅ Browse and search properties
- ✅ Submit enquiries
- ✅ Make payments
- ✅ Track payment history
- ✅ Use EMI calculator
- ✅ Create support tickets
- ✅ Chat with AI assistant
- ✅ Manage profile

## 🧪 Testing

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realtyengage.com","password":"Admin@123"}'
```

### Frontend Testing
1. Open http://localhost:5173
2. Login with admin credentials
3. Test all CRUD operations
4. Verify database updates in MongoDB

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Projects/Properties
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `POST /api/users/avatar` - Upload profile picture

### Enquiries
- `GET /api/enquiries` - Get all enquiries
- `POST /api/enquiries` - Create new enquiry
- `PUT /api/enquiries/:id` - Update enquiry
- `POST /api/enquiries/:id/respond` - Respond to enquiry

### Payments
- `GET /api/payments` - Get payment history
- `POST /api/payments` - Create payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/calculate-emi` - Calculate EMI

### Support
- `GET /api/support/tickets` - Get support tickets
- `POST /api/support/tickets` - Create ticket
- `POST /api/support/tickets/:id/reply` - Reply to ticket

### Chatbot
- `POST /api/chatbot/message` - Send message to AI
- `GET /api/chatbot/history` - Get chat history
- `GET /api/chatbot/suggestions` - Get suggestions

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check MongoDB URI in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing process: `npx kill-port 5000`

3. **CORS Errors**
   - Check allowed origins in `server.js`
   - Ensure frontend URL is whitelisted

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT secrets in `.env`
   - Verify token expiry settings

## 🔒 Security Considerations

- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Validate and sanitize all inputs
- Use environment variables for sensitive data
- Regular security audits

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop (1920×1080 and above)
- Laptop (1366×768)
- Tablet (768×1024)
- Mobile (320×568 and above)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Created with ❤️ by the RealtyEngage Team
- UI/UX Designer
- QA Tester

## 📞 Support

For support, email support@realtyengage.com or raise an issue in the project repository.

## 🙏 Acknowledgments

- MERN Stack community
- Material-UI team
- All open-source contributors

---

**Note**: This is a development version. For production deployment, ensure all security measures are in place, including:
- Secure environment variables
- HTTPS enforcement
- Rate limiting
- Input validation
- Regular security audits

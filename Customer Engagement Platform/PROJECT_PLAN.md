# RealtyEngage Customer Engagement Platform - Development Plan

## Executive Summary
A comprehensive Customer Engagement Platform for real estate companies, built with MERN stack, featuring project showcasing, enquiry management, payment processing, and customer support with advanced AI and mapping capabilities.

---

## Part 1: Architecture & Technology Stack

### 1.1 Technology Stack Confirmation

#### Frontend
- **Framework**: React.js 18.x
- **Routing**: React Router DOM v6
- **State Management**: Redux Toolkit (for complex state) + Context API (for theme/auth)
- **UI Framework**: Material-UI (MUI) v5 or Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup validation
- **Charts**: Recharts (for admin dashboard analytics)

#### Backend
- **Runtime**: Node.js 18.x LTS
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas (cloud) / MongoDB Community (local)
- **ODM**: Mongoose 7.x
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer + Cloudinary (for image storage)
- **Email Service**: Nodemailer + SendGrid
- **Payment Gateway**: Razorpay SDK

#### DevOps & Deployment
- **Frontend Hosting**: Netlify (with CI/CD)
- **Backend Hosting**: Render.com
- **Database**: MongoDB Atlas (free tier initially)
- **Environment Management**: dotenv
- **API Documentation**: Swagger/OpenAPI

### 1.2 API Design (REST Endpoints)

#### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
PUT    /api/auth/profile
```

#### Projects Endpoints
```
GET    /api/projects           (public, with filters)
GET    /api/projects/:id       (public)
POST   /api/projects           (admin only)
PUT    /api/projects/:id       (admin only)
DELETE /api/projects/:id       (admin only)
POST   /api/projects/:id/images (admin only)
```

#### Enquiry Endpoints
```
POST   /api/enquiries          (authenticated)
GET    /api/enquiries          (admin: all, customer: own)
GET    /api/enquiries/:id      (authorized users)
PUT    /api/enquiries/:id      (admin only)
DELETE /api/enquiries/:id      (admin only)
```

#### Payment Endpoints
```
POST   /api/payments/initiate
POST   /api/payments/verify
GET    /api/payments           (admin: all, customer: own)
GET    /api/payments/:id       (authorized users)
GET    /api/payments/stats     (admin only)
```

#### Support Endpoints
```
POST   /api/support/requests
GET    /api/support/requests   (admin: all, customer: own)
GET    /api/support/requests/:id
PUT    /api/support/requests/:id (admin: all fields, customer: limited)
POST   /api/support/requests/:id/comments
```

#### Dashboard Endpoints
```
GET    /api/dashboard/customer-stats (admin only)
GET    /api/dashboard/project-stats  (admin only)
GET    /api/dashboard/revenue-stats  (admin only)
GET    /api/users                    (admin only)
PUT    /api/users/:id/status         (admin only)
```

---

## Part 2: Feature Breakdown & Schema Design

### 2.1 User Management Schema

```javascript
// User Schema (users collection)
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed with bcrypt),
  firstName: String (required),
  lastName: String (required),
  phone: String (required),
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  statusType: {
    type: String,
    enum: [
      'just_enquired',
      'paid_initial',
      'full_payment_pending',
      'full_payment_moved_in',
      'emi_customer'
    ],
    default: 'just_enquired'
  },
  profilePicture: String (URL),
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  preferences: {
    theme: String (light/dark),
    notifications: Boolean
  },
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### 2.2 Projects Management Schema

```javascript
// Project Schema (projects collection)
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  shortDescription: String,
  area: String (required, e.g., "Whitefield, Bangalore"),
  status: {
    type: String,
    enum: ['upcoming', 'in_progress', 'completed'],
    required: true
  },
  specifications: [{
    type: String,
    value: String
  }] // e.g., [{type: "Bedrooms", value: "2BHK"}, {type: "Amenity", value: "Swimming Pool"}],
  pricing: {
    basePrice: Number,
    pricePerSqFt: Number,
    currency: String (default: 'INR'),
    paymentPlans: [{
      name: String,
      description: String,
      downPayment: Number,
      emiMonths: Number,
      interestRate: Number
    }]
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    nearbyLandmarks: [String]
  },
  dimensions: {
    totalArea: Number,
    builtUpArea: Number,
    carpetArea: Number,
    units: String (default: 'sqft')
  },
  availability: {
    totalUnits: Number,
    availableUnits: Number,
    soldUnits: Number
  },
  developer: {
    name: String,
    logo: String,
    description: String
  },
  features: [String], // Quick feature tags
  documents: [{
    name: String,
    url: String,
    type: String // brochure, floor_plan, etc.
  }],
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Enquiry Management Schema

```javascript
// Enquiry Schema (enquiries collection)
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User', required),
  projectId: ObjectId (ref: 'Project', required),
  enquiryType: {
    type: String,
    enum: ['general', 'pricing', 'site_visit', 'documentation'],
    default: 'general'
  },
  details: String (required),
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'whatsapp'],
    default: 'email'
  },
  preferredContactTime: String,
  status: {
    type: String,
    enum: ['new', 'in_progress', 'follow_up', 'converted', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: ObjectId (ref: 'User'), // Admin who's handling
  notes: [{
    text: String,
    addedBy: ObjectId (ref: 'User'),
    addedAt: Date
  }],
  followUpDate: Date,
  responseTime: Number, // in hours
  resolutionTime: Number, // in hours
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Payment Schema

```javascript
// Payment Schema (payments collection)
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User', required),
  projectId: ObjectId (ref: 'Project', required),
  amount: Number (required),
  currency: String (default: 'INR'),
  paymentType: {
    type: String,
    enum: ['booking', 'down_payment', 'emi', 'full_payment', 'other'],
    required: true
  },
  method: {
    type: String,
    enum: ['card', 'bank_transfer', 'upi', 'cash', 'cheque'],
    required: true
  },
  gatewayDetails: {
    provider: String (e.g., 'razorpay'),
    orderId: String,
    paymentId: String,
    signature: String,
    transactionId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  receiptNumber: String (auto-generated),
  invoice: {
    number: String,
    url: String
  },
  metadata: {
    unitNumber: String,
    paymentPlan: String,
    installmentNumber: Number,
    totalInstallments: Number
  },
  refundDetails: {
    amount: Number,
    reason: String,
    date: Date,
    refundId: String
  },
  failureReason: String,
  createdAt: Date,
  updatedAt: Date,
  paidAt: Date
}
```

### 2.5 Support Request Schema

```javascript
// SupportRequest Schema (supportrequests collection)
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User', required),
  ticketNumber: String (auto-generated, unique),
  type: {
    type: String,
    enum: ['feedback', 'grievance', 'suggestion', 'technical', 'billing'],
    required: true
  },
  category: String, // Sub-category
  subject: String (required),
  description: String (required),
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_review', 'pending_customer', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: ObjectId (ref: 'User'),
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  comments: [{
    text: String,
    author: ObjectId (ref: 'User'),
    isInternal: Boolean, // Admin-only notes
    createdAt: Date
  }],
  resolution: {
    text: String,
    resolvedBy: ObjectId (ref: 'User'),
    resolvedAt: Date
  },
  rating: {
    score: Number (1-5),
    feedback: String,
    ratedAt: Date
  },
  sla: {
    responseTime: Number, // hours
    resolutionTime: Number, // hours
    breached: Boolean
  },
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

---

## Part 3: Advanced Feature Integration

### 3.1 AI Chat Bot Assistant

#### Implementation Approach
- **Option 1 (Recommended)**: Integrate Dialogflow ES/CX
  - Create intents for FAQs (pricing, availability, amenities)
  - Set up entities for project names, locations, specifications
  - Use fulfillment webhooks to fetch real-time data from backend

- **Option 2**: Custom Implementation with OpenAI API
  - Use GPT-3.5/4 for natural language understanding
  - Create prompt templates for real estate context
  - Implement rate limiting and caching

#### Frontend Integration
```javascript
// Floating chat widget component structure
- Position: Bottom-right corner (fixed)
- States: Minimized bubble, Expanded chat window
- Features: Typing indicators, quick replies, rich cards for projects
- Persistence: Store chat history in localStorage
```

#### Backend Integration
```javascript
// Chat endpoints
POST /api/chat/message
GET  /api/chat/history
POST /api/chat/feedback
```

### 3.2 Google Maps Integration

#### Implementation
```javascript
// Required Libraries
- @react-google-maps/api
- Environment variable: REACT_APP_GOOGLE_MAPS_API_KEY

// Features to implement:
1. Project Location Display
   - Custom markers with project status colors
   - Info windows with project summary
   - Cluster view for multiple projects

2. Interactive Features
   - Click marker to view project details
   - Draw polygon to search projects in area
   - Distance calculator from current location

3. Integration Points
   - Projects Page: Full map view with all projects
   - Project Detail: Single location with nearby amenities
   - Admin Dashboard: Heat map of enquiries/sales
```

### 3.3 Voice Search Assistant

#### Implementation using Web Speech API
```javascript
// Browser compatibility check
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Features:
1. Voice Commands
   - "Show me 2BHK projects"
   - "Projects in Whitefield"
   - "Projects under 50 lakhs"
   - "Show completed projects"

2. Implementation Steps
   - Add microphone icon to search bar
   - Request microphone permission
   - Convert speech to text
   - Parse intent and entities
   - Execute search with filters

3. Fallback Strategy
   - Show transcript for confirmation
   - Suggest corrections if no results
   - Provide text input option
```

### 3.4 Theme Toggle (Light/Dark Mode)

#### Implementation Strategy
```javascript
// Using CSS Variables + React Context

1. CSS Variables Setup
   :root {
     --primary-color: #1976d2;
     --background: #ffffff;
     --text-primary: #333333;
   }
   
   [data-theme="dark"] {
     --primary-color: #90caf9;
     --background: #121212;
     --text-primary: #ffffff;
   }

2. Theme Context Provider
   - Store theme preference in localStorage
   - Apply theme on app initialization
   - Provide toggle function to all components

3. Toggle Component
   - Animated switch in header
   - Keyboard shortcut (Ctrl+Shift+D)
   - System preference detection
```

---

## Part 4: Dashboards & Role-Based Access Control (RBAC)

### 4.1 Customer Dashboard

#### Dashboard Components

```javascript
// 1. Overview Section
- Welcome message with statusType badge
- Quick stats (enquiries made, payments completed, tickets raised)
- Recent notifications

// 2. My Projects Section
- Projects enquired about
- Projects with payments
- Saved/Wishlist projects

// 3. Payment History
- Table view with filters (date range, status, amount)
- Download receipts/invoices
- EMI schedule (if applicable)
- Next payment reminder

// 4. Support History
- List of all tickets with status badges
- Filter by type and status
- Quick action buttons (view, reopen)
- Satisfaction ratings

// 5. Profile Management
- Personal information update
- Change password
- Notification preferences
- Document uploads (ID, address proof)
```

### 4.2 Admin Dashboard

#### Key Components

```javascript
// 1. Analytics Overview
- Total customers by statusType (pie chart)
- Revenue metrics (monthly, quarterly, yearly)
- Project performance (bar chart)
- Conversion funnel (enquiry → payment → move-in)

// 2. Project Management CRUD
- DataGrid with inline editing
- Bulk actions (activate/deactivate)
- Image gallery management
- Availability tracker
- Quick stats per project

// 3. Enquiry Management
- Real-time enquiry feed
- Assignment to sales team
- Follow-up scheduler
- Conversion tracking
- Response time metrics

// 4. Payment Management
- Transaction list with advanced filters
- Payment verification status
- Refund processing
- Revenue reports
- EMI defaulters tracking

// 5. Customer Management
- Customer list with statusType
- Bulk status update
- Communication history
- Document verification
- Move-in/Move-out tracking

// 6. Support Ticket Management
- Ticket queue by priority
- SLA monitoring
- Assignment and escalation
- Performance metrics
- Knowledge base management
```

### 4.3 Role-Based Access Control Implementation

#### Middleware Structure

```javascript
// authMiddleware.js
const authenticateToken = (req, res, next) => {
  // Verify JWT token
  // Attach user to request
};

// roleMiddleware.js
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Route Protection Examples
app.post('/api/projects', 
  authenticateToken, 
  authorizeRoles('admin'), 
  createProject
);

app.get('/api/enquiries',
  authenticateToken,
  getEnquiries // Controller handles role-based filtering
);
```

#### Frontend Route Protection

```javascript
// ProtectedRoute Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  
  return children;
};

// Usage
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Setup project structure
- Configure MongoDB schemas
- Implement authentication system
- Create basic CRUD APIs

### Phase 2: Core Features (Week 3-4)
- Build Projects module
- Implement Enquiry system
- Create Support ticket system
- Develop customer dashboard

### Phase 3: Payment Integration (Week 5)
- Integrate Razorpay
- Build payment flows
- Create invoice generation

### Phase 4: Advanced Features (Week 6-7)
- Integrate Google Maps
- Implement voice search
- Add AI chatbot
- Theme toggle

### Phase 5: Admin Features (Week 8)
- Build admin dashboard
- Create analytics
- Implement reporting

### Phase 6: Testing & Deployment (Week 9-10)
- Unit and integration testing
- Performance optimization
- Deploy to Netlify/Render
- Documentation

---

## Security Considerations

1. **Authentication & Authorization**
   - JWT with refresh tokens
   - Role-based permissions
   - Session management

2. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention (using Mongoose)
   - XSS protection
   - CORS configuration

3. **Payment Security**
   - PCI DSS compliance (via Razorpay)
   - Webhook signature verification
   - SSL/TLS encryption

4. **API Security**
   - Rate limiting
   - API key management
   - Request throttling

---

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Caching strategies

2. **Backend**
   - Database indexing
   - Query optimization
   - Redis caching
   - CDN for static assets

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring
   - Analytics (Google Analytics)

---

## Conclusion

This comprehensive plan provides a solid foundation for developing the RealtyEngage Customer Engagement Platform. The modular approach allows for iterative development and easy scaling as the platform grows.

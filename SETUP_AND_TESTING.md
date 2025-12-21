# CodeShack Backend - Setup & Testing Guide

## ✅ Backend Status: LIVE & READY

Your CodeShack backend is now fully configured and running!

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already configured with default settings:

-   **Port**: 5000
-   **MongoDB**: mongodb://localhost:27017/codeshack
-   **JWT Secret**: Configured (change in production!)

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on: `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Available Endpoints

#### **Users** (`/api/users`)

-   `POST /register` - Register new user (junior/mentor)
-   `POST /login` - User authentication
-   `GET /:userId` - Get user profile
-   `PATCH /:userId` - Update user profile
-   `DELETE /:userId` - Delete user
-   `GET /mentors/approved` - Get all approved mentors
-   `GET /role/:role` - Get users by role
-   `POST /:userId/change-password` - Change password

#### **Doubts** (`/api/doubts`)

-   `POST /user/:userId` - Create a new doubt
-   `GET /` - Get all doubts (with filters)
-   `GET /:doubtId` - Get doubt by ID
-   `PATCH /:doubtId` - Update doubt
-   `DELETE /:doubtId` - Delete doubt
-   `GET /user/:userId` - Get doubts by user
-   `GET /tag/:tag` - Get doubts by tag
-   `GET /stats/overview` - Get doubt statistics

#### **Answers** (`/api/answers`)

-   `POST /:doubtId/mentor/:mentorId` - Create answer
-   `GET /doubt/:doubtId` - Get answers for a doubt
-   `GET /:answerId` - Get answer by ID
-   `PATCH /:answerId` - Update answer
-   `DELETE /:answerId` - Delete answer
-   `GET /mentor/:mentorId` - Get answers by mentor
-   `GET /helpful/top` - Get most helpful answers

#### **Comments** (`/api/comments`)

-   `POST /:doubtId/user/:userId` - Create comment
-   `GET /doubt/:doubtId` - Get comments for a doubt
-   `GET /:commentId` - Get comment by ID
-   `PATCH /:commentId` - Update comment
-   `DELETE /:commentId` - Delete comment
-   `GET /:commentId/replies` - Get replies to comment
-   `GET /user/:userId` - Get comments by user

#### **Upvotes** (`/api/upvotes`)

-   `POST /:answerId` - Upvote an answer
-   `DELETE /:answerId` - Remove upvote
-   `GET /:answerId` - Get upvotes for answer
-   `GET /user/:userId` - Get upvotes by user
-   `GET /:answerId/check/:userId` - Check if user upvoted

#### **Mentor Profiles** (`/api/mentor-profiles`)

-   `POST /:mentorId` - Create mentor profile
-   `GET /:mentorId` - Get mentor profile
-   `PATCH /:mentorId` - Update mentor profile
-   `DELETE /:mentorId` - Delete mentor profile

#### **Junior Space Posts** (`/api/junior-space-posts`)

-   `POST /user/:userId` - Create post
-   `GET /` - Get all posts
-   `GET /:postId` - Get post by ID
-   `PATCH /:postId` - Update post
-   `DELETE /:postId` - Delete post
-   `GET /user/:userId` - Get posts by user

#### **Admin** (`/api/admin`) 🔒 Protected

-   `POST /approve-mentor/:mentorId` - Approve mentor
-   `POST /reject-mentor/:mentorId` - Reject mentor
-   `GET /actions` - Get admin actions log
-   `GET /stats` - Get platform statistics

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Select `CodeShack-API.postman_collection.json`
4. Collection will be imported with all endpoints and sample data

### Testing Workflow

#### Step 1: Register Users

1. **Register Junior**: Use "Register Junior" request
2. **Register Mentor**: Use "Register Mentor" request
3. Copy the `userId` from responses to collection variables

#### Step 2: Login

1. Use "Login" request with registered credentials
2. Copy the `token` from response for authenticated requests

#### Step 3: Create Content

1. **Create Doubt**: Junior posts a question
    - Copy `doubtId` from response
2. **Create Answer**: Mentor answers the doubt
    - Copy `answerId` from response
3. **Create Comment**: Users comment on doubts
4. **Upvote Answer**: Users upvote helpful answers

#### Step 4: Query Data

-   Get all doubts with filters (status, tags)
-   Get user profiles and their activity
-   Get mentor profiles and statistics
-   Get most helpful answers

### Collection Variables

Update these in Postman environment:

-   `baseUrl`: http://localhost:5000
-   `userId`: User ID from registration
-   `mentorId`: Mentor user ID
-   `doubtId`: Doubt ID from creation
-   `answerId`: Answer ID from creation
-   `commentId`: Comment ID from creation
-   `adminToken`: JWT token for admin user

## 📁 Project Structure

```
Connect-Juniors-Codeshack-Backend/
├── controllers/          # Business logic
│   ├── user.controller.js
│   ├── doubt.controller.js
│   ├── answer.controller.js
│   ├── comment.controller.js
│   ├── upvote.controller.js
│   ├── mentorProfile.controller.js
│   ├── juniorSpacePost.controller.js
│   └── admin.controller.js
├── models/              # Mongoose schemas
│   ├── user.model.js
│   ├── doubt.model.js
│   ├── answer.model.js
│   ├── comment.model.js
│   ├── upvote.model.js
│   ├── mentorProfile.model.js
│   ├── juniorSpacePost.model.js
│   └── adminAction.model.js
├── routes/              # API routes
│   ├── user.routes.js
│   ├── doubt.routes.js
│   ├── answer.routes.js
│   ├── comment.routes.js
│   ├── upvote.routes.js
│   ├── mentorProfile.routes.js
│   ├── juniorSpacePost.routes.js
│   └── admin.routes.js
├── schema/              # Zod validation schemas
│   ├── user.schema.js
│   ├── doubt.schema.js
│   ├── answer.schema.js
│   ├── comment.schema.js
│   ├── mentorProfile.schema.js
│   └── juniorSpacePost.schema.js
├── middleware/          # Express middleware
│   ├── validate.middleware.js
│   └── auth.middleware.js
├── database/            # Database connection
│   └── connection.js
├── index.js            # Application entry point
├── package.json        # Dependencies
├── .env                # Environment variables
└── .env.sample         # Environment template
```

## 🔒 Authentication

Protected routes require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

Get token from login/register responses.

## 🛠️ Common Issues & Solutions

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use

Change port in `.env`:

```
PORT=3000
```

### JWT Secret Error

Make sure `JWT_SECRET` is set in `.env` file.

## 📝 Sample Test Data

### Junior User

```json
{
    "name": "Alice Junior",
    "email": "alice@example.com",
    "password": "password123",
    "role": "junior",
    "bio": "Aspiring developer learning web development"
}
```

### Mentor User

```json
{
    "name": "Bob Mentor",
    "email": "bob@example.com",
    "password": "password123",
    "role": "mentor",
    "bio": "Senior developer with 10 years of experience"
}
```

### Sample Doubt

```json
{
    "title": "How to use async/await in Node.js?",
    "description": "I'm having trouble understanding async/await...",
    "tags": ["javascript", "nodejs", "async", "promises"]
}
```

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ All routes are configured
3. ✅ Validation middleware is active
4. ✅ MongoDB connection is ready
5. 📱 Import Postman collection and start testing!

## 📞 Support

For issues or questions:

-   Check controller documentation in `controllers/CONTROLLERS_DOCUMENTATION.md`
-   Review schema definitions in `SchemaModels.md`
-   Verify route configurations in `routes/` directory

---

**Happy Testing! 🚀**

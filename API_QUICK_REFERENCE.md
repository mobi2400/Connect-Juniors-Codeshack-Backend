# CodeShack API - Quick Reference Guide

## 🎯 Most Common API Calls

### 1. User Registration & Authentication

#### Register a Junior

```bash
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Alice Junior",
  "email": "alice@example.com",
  "password": "password123",
  "role": "junior",
  "bio": "Learning web development"
}
```

#### Register a Mentor

```bash
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Bob Mentor",
  "email": "bob@example.com",
  "password": "password123",
  "role": "mentor",
  "bio": "Senior developer with 10 years experience"
}
```

#### Login

```bash
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response includes:**

-   User data
-   JWT token (save this for authenticated requests!)

---

### 2. Posting & Managing Doubts

#### Create a Doubt

```bash
POST http://localhost:5000/api/doubts/user/{userId}
Content-Type: application/json

{
  "title": "How to use async/await in Node.js?",
  "description": "I'm having trouble understanding how to properly use async/await in Node.js. Can someone explain with examples?",
  "tags": ["javascript", "nodejs", "async", "promises"]
}
```

#### Get All Open Doubts

```bash
GET http://localhost:5000/api/doubts?status=open&page=1&limit=10
```

#### Get Doubts by Tag

```bash
GET http://localhost:5000/api/doubts/tag/javascript
```

#### Get My Doubts

```bash
GET http://localhost:5000/api/doubts/user/{userId}
```

---

### 3. Answering Doubts (Mentors)

#### Post an Answer

```bash
POST http://localhost:5000/api/answers/{doubtId}/mentor/{mentorId}
Content-Type: application/json

{
  "content": "To use async/await in Node.js, you need to define an async function. Here's an example:\n\nasync function fetchData() {\n  try {\n    const result = await someAsyncOperation();\n    return result;\n  } catch (error) {\n    console.error(error);\n  }\n}"
}
```

#### Get Answers for a Doubt

```bash
GET http://localhost:5000/api/answers/doubt/{doubtId}?sortBy=upvoteCount
```

#### Get Most Helpful Answers

```bash
GET http://localhost:5000/api/answers/helpful/top?limit=10
```

---

### 4. Comments & Discussions

#### Add a Comment

```bash
POST http://localhost:5000/api/comments/{doubtId}/user/{userId}
Content-Type: application/json

{
  "content": "Great question! I had the same doubt."
}
```

#### Reply to a Comment

```bash
POST http://localhost:5000/api/comments/{doubtId}/user/{userId}
Content-Type: application/json

{
  "content": "Thanks for sharing!",
  "parentCommentId": "{parentCommentId}"
}
```

#### Get Comments for a Doubt

```bash
GET http://localhost:5000/api/comments/doubt/{doubtId}
```

---

### 5. Upvoting Answers

#### Upvote an Answer

```bash
POST http://localhost:5000/api/upvotes/{answerId}
Content-Type: application/json

{
  "userId": "{userId}"
}
```

#### Remove Upvote

```bash
DELETE http://localhost:5000/api/upvotes/{answerId}
Content-Type: application/json

{
  "userId": "{userId}"
}
```

#### Check if I Upvoted

```bash
GET http://localhost:5000/api/upvotes/{answerId}/check/{userId}
```

---

### 6. Mentor Profiles

#### Create Mentor Profile

```bash
POST http://localhost:5000/api/mentor-profiles/{mentorId}
Content-Type: application/json

{
  "badge": "Senior Developer",
  "expertiseTags": ["javascript", "nodejs", "react", "mongodb"]
}
```

#### Get Mentor Profile

```bash
GET http://localhost:5000/api/mentor-profiles/{mentorId}
```

#### Get All Approved Mentors

```bash
GET http://localhost:5000/api/users/mentors/approved?page=1&limit=10
```

---

### 7. Junior Space (Social Posts)

#### Create a Post

```bash
POST http://localhost:5000/api/junior-space-posts/user/{userId}
Content-Type: application/json

{
  "content": "Just completed my first React app! 🎉",
  "category": "achievement"
}
```

**Categories:**

-   `question`
-   `achievement`
-   `discussion`
-   `resource`

#### Get All Posts

```bash
GET http://localhost:5000/api/junior-space-posts?page=1&limit=10
```

#### Get Posts by User

```bash
GET http://localhost:5000/api/junior-space-posts/user/{userId}
```

---

### 8. Statistics & Analytics

#### Doubt Statistics

```bash
GET http://localhost:5000/api/doubts/stats/overview
```

**Returns:**

-   Total doubts count
-   Counts by status (open, answered, resolved, closed)
-   Top tags

#### Platform Statistics (Admin Only)

```bash
GET http://localhost:5000/api/admin/stats
Authorization: Bearer {adminToken}
```

---

## 🔑 Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description",
    "code": "ERROR_CODE",
    "error": "Detailed error message"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## 🎨 Common Query Parameters

### Pagination

```
?page=1&limit=10
```

### Sorting

```
?sortBy=createdAt    # Sort by creation date
?sortBy=upvoteCount  # Sort by upvotes
```

### Filtering Doubts

```
?status=open         # Filter by status
?tags=javascript     # Filter by tag
?tags[]=javascript&tags[]=nodejs  # Multiple tags
```

---

## 🔐 Authentication Header

For protected routes (admin operations):

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login/register response.

---

## 💡 Testing Tips

1. **Start with User Registration**

    - Register at least one junior and one mentor
    - Save the userId values

2. **Login to Get Token**

    - Login with registered users
    - Save JWT tokens for authenticated requests

3. **Create Content in Order**

    - Create doubts (juniors)
    - Create answers (mentors)
    - Add comments (anyone)
    - Upvote answers (anyone)

4. **Use MongoDB Compass**

    - View data in real-time
    - Connection: `mongodb://localhost:27017/codeshack`

5. **Check Server Logs**
    - Monitor terminal for errors
    - Debug issues quickly

---

## 🚨 Common HTTP Status Codes

-   `200` - Success (GET, PATCH, DELETE)
-   `201` - Created (POST)
-   `400` - Bad Request (validation failed)
-   `401` - Unauthorized (invalid/missing token)
-   `403` - Forbidden (insufficient permissions)
-   `404` - Not Found
-   `409` - Conflict (duplicate email, already upvoted)
-   `500` - Server Error

---

## 📋 Quick Testing Checklist

-   [ ] Register junior user
-   [ ] Register mentor user
-   [ ] Login as junior
-   [ ] Create a doubt
-   [ ] Login as mentor
-   [ ] Answer the doubt
-   [ ] Upvote the answer
-   [ ] Add a comment
-   [ ] Create mentor profile
-   [ ] Create junior space post
-   [ ] Get doubt statistics

---

**All endpoints tested and working! ✅**

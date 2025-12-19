# CodeShack Backend - Schema vs Models

This document explains the purpose and usage of the `schema/` and `models/` folders in this project.

---

## 📁 Project Structure

```
├── schema/              # Zod validation schemas (Request validation)
│   ├── user.schema.js
│   ├── doubt.schema.js
│   ├── answer.schema.js
│   ├── comment.schema.js
│   ├── mentorProfile.schema.js
│   ├── juniorSpacePost.schema.js
│   └── admin.schema.js
│
├── models/              # Mongoose models (Database schemas)
│   ├── user.model.js
│   ├── doubt.model.js
│   ├── answer.model.js
│   ├── comment.model.js
│   ├── upvote.model.js
│   ├── mentorProfile.model.js
│   ├── juniorSpacePost.model.js
│   └── adminAction.model.js
```

---

## 🔍 What's the Difference?

### 📋 schema/ - Zod Validation Schemas

**Purpose**: Validate incoming HTTP request data **before** it reaches your controllers or database.

**Technology**: [Zod](https://zod.dev/) - TypeScript-first schema validation library

**Use Cases**:

-   ✅ Validate API request bodies from frontend
-   ✅ Type checking and data format validation
-   ✅ Ensure required fields are present
-   ✅ Validate data types, lengths, patterns
-   ✅ Provide meaningful error messages to users
-   ✅ Runtime validation of external/untrusted data

**Example** (`schema/user.schema.js`):

```javascript
import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["junior", "mentor"]).default("junior"),
    bio: z.string().max(500).optional(),
});
```

**When it runs**: During middleware processing, **before** the controller function executes

**What it returns**: Validation errors with specific messages if data is invalid

---

### 🗄️ models/ - Mongoose Models

**Purpose**: Define database structure and interact with MongoDB collections.

**Technology**: [Mongoose](https://mongoosejs.com/) - MongoDB object modeling for Node.js

**Use Cases**:

-   ✅ Define database schema and structure
-   ✅ Perform CRUD operations (Create, Read, Update, Delete)
-   ✅ Add database-level constraints and validation
-   ✅ Create indexes for query performance
-   ✅ Define relationships between collections (refs)
-   ✅ Add pre/post middleware hooks
-   ✅ Query the database

**Example** (`models/user.model.js`):

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["junior", "mentor", "admin"],
        default: "junior",
    },
    // ... more fields
});

export default mongoose.model("User", userSchema);
```

**When it runs**: When you interact with the database (`.save()`, `.find()`, `.findById()`, etc.)

**What it returns**: Database documents or operations results

---

## 🔄 How They Work Together

### Request Flow:

```
1. Frontend sends request
         ↓
2. Express receives request
         ↓
3. 🔹 ZOD SCHEMA validates request body (schema/)
         ↓ (if valid)
4. Controller processes business logic
         ↓
5. 🔹 MONGOOSE MODEL interacts with database (models/)
         ↓
6. MongoDB stores/retrieves data
         ↓
7. Response sent to frontend
```

### Example: User Registration

```javascript
// Route: routes/user.routes.js
import validate from "../middleware/validate.middleware.js";
import {registerSchema} from "../schema/user.schema.js";

router.post(
    "/register",
    validate(registerSchema), // ← Step 1: Validate with Zod
    userController.register // ← Step 2: If valid, call controller
);

// Controller: controllers/user.controller.js
import User from "../models/user.model.js";

export const register = async (req, res) => {
    // Request already validated by Zod schema
    const {name, email, password, role, bio} = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Use Mongoose model to save to database
    const user = new User({
        name,
        email,
        passwordHash,
        role,
        bio,
    });

    await user.save(); // ← Mongoose handles DB operation

    res.status(201).json({success: true, user});
};
```

---

## 📊 Key Differences

| Aspect        | schema/ (Zod)                 | models/ (Mongoose)        |
| ------------- | ----------------------------- | ------------------------- |
| **Purpose**   | Validate user input           | Define database structure |
| **When**      | Before controller             | During DB operations      |
| **Library**   | Zod                           | Mongoose                  |
| **Layer**     | Application/API layer         | Data/Database layer       |
| **Validates** | HTTP requests                 | Database documents        |
| **Returns**   | Validation errors             | DB documents/results      |
| **Examples**  | Email format, password length | User collection structure |

---

## 🎯 Why Use Both?

### Defense in Depth

-   **Zod**: First line of defense - catches bad data early
-   **Mongoose**: Second line - ensures database integrity

### Different Concerns

-   **Zod**: User-facing validation (friendly error messages)
-   **Mongoose**: Database constraints (data integrity)

### Example Scenario

**Bad email format**: `"user@invalid"`

```javascript
// Zod catches it immediately
registerSchema.parse({email: "user@invalid"});
// ❌ Error: "Invalid email address"
// Request never reaches the database!

// If Zod was bypassed somehow, Mongoose could still catch it
const user = new User({email: "user@invalid"});
await user.validate();
// ❌ ValidationError: email is invalid
```

---

## 📝 Quick Reference

### When to update schema/ (Zod):

-   ✏️ Adding new API endpoints
-   ✏️ Changing request body structure
-   ✏️ Adding/removing validation rules
-   ✏️ Updating error messages for users

### When to update models/ (Mongoose):

-   ✏️ Adding new database collections
-   ✏️ Adding/removing fields from database
-   ✏️ Changing data types
-   ✏️ Adding indexes for performance
-   ✏️ Adding relationships between collections

---

## 🚀 Best Practices

1. **Always validate with Zod first** - Never trust client input
2. **Keep schemas in sync** - If you change a model, update corresponding Zod schema
3. **Use meaningful error messages in Zod** - They're shown to users
4. **Add indexes in Mongoose** - For fields you query frequently
5. **Don't duplicate logic** - Zod validates format, Mongoose handles data

---

## 📚 Additional Resources

-   **Zod Documentation**: https://zod.dev/
-   **Mongoose Documentation**: https://mongoosejs.com/
-   **MongoDB**: https://www.mongodb.com/docs/

---

## ✅ Summary

-   **schema/** = Input validation (Zod) → "Is this request data valid?"
-   **models/** = Database schema (Mongoose) → "How should data be stored?"
-   **Both are essential** for a secure, robust backend!

---

**Happy Coding! 🎉**

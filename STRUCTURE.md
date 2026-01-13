# Backend Folder Structure

This backend follows a **production-level modular architecture** with proper separation of concerns.

## 📁 Folder Structure

```
Backend/
├── prisma/
│   └── schema.prisma              # Prisma schema with 17 models
├── src/
│   ├── config/                    # Configuration files
│   │   ├── prisma.ts             # Prisma client instance
│   │   ├── env.ts                # Environment variables
│   │   └── logger.ts             # Logger configuration
│   │
│   ├── controllers/               # Route controllers (Request handling)
│   │   ├── user.controller.ts
│   │   ├── project.controller.ts
│   │   └── ...
│   │
│   ├── services/                  # Business logic layer
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   └── ...
│   │
│   ├── repositories/              # Data access layer (Prisma calls)
│   │   ├── user.repository.ts
│   │   ├── project.repository.ts
│   │   └── ...
│   │
│   ├── routes/                    # API route definitions
│   │   ├── user.routes.ts
│   │   ├── project.routes.ts
│   │   └── ...
│   │
│   ├── middlewares/               # Express middlewares
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── error.middleware.ts   # Error handling
│   │   ├── validation.middleware.ts  # Request validation
│   │   ├── logger.middleware.ts  # Request/response logging
│   │   └── rateLimit.middleware.ts   # Rate limiting
│   │
│   ├── types/                     # TypeScript types and interfaces
│   │   └── index.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── response.ts           # Response formatters
│   │   ├── validation.ts         # Validation helpers
│   │   ├── date.ts               # Date/time utilities
│   │   └── pagination.ts         # Pagination helpers
│   │
│   ├── routes.ts                  # Central route registration
│   ├── app.ts                     # Express app configuration
│   └── server.ts                  # Server entry point
│
├── package.json
├── tsconfig.json
└── .env
```

## 🏗️ Architecture Pattern

This project follows a **Layered Architecture** (Controller-Service-Repository) pattern:

- **Controller Layer** (`src/controllers/*.controller.ts`):
  - Handles incoming HTTP requests
  - Validates input data
  - Calls schema validation
  - Delegates business logic to services
  - Sends HTTP responses (using standardized format)

- **Service Layer** (`src/services/*.service.ts`):
  - Contains all business logic
  - Orchestrates data operations
  - Handles complex validations and calculations
  - Independent of HTTP layer (req/res)

- **Repository Layer** (`src/repositories/*.repository.ts`):
  - Handles direct database interactions using Prisma
  - Abducts database queries from business logic
  - Provides clean data access methods

- **Routes Layer** (`src/routes/*.routes.ts`):
  - Defines API endpoints
  - Maps URLs to controllers
  - Applies middlewares (auth, validation)

## 📋 Modules Overview

| Module             | Description                        | Prisma Model               |
| ------------------ | ---------------------------------- | -------------------------- |
| **users**          | User management and authentication | User, UserSettings         |
| **projects**       | Project CRUD operations            | Project, ProjectSnapshot   |
| **tasks**          | Task management                    | Task, SubTask, TaskHistory |
| **budget**         | Budget tracking                    | Budget                     |
| **team**           | Team management                    | Team                       |
| **notification**   | User notifications                 | Notification               |
| **comment**        | Task comments                      | Comment                    |
| **attachment**     | File attachments                   | Attachment                 |
| **time-tracking**  | Time tracking                      | TimeTracking               |
| **calendar**       | Calendar events                    | CalendarEvent              |
| **tag**            | Tag management                     | Tag                        |
| **label**          | Label management                   | Label                      |
| **activity-log**   | Activity logging                   | ActivityLog                |
| **search-history** | Search history                     | SearchHistory              |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB database
- Supabase account (for authentication)

### Environment Variables

Create a `.env` file in the Backend directory:

```env
DATABASE_URL="mongodb+srv://..."
PORT=5000
SUPABASE_URL="https://..."
SUPABASE_JWT_SECRET="..."
```

### Installation

```bash
npm install
npm run prisma:generate
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## 📝 Implementation Status

All module files have been created with TODO placeholders. Implement functionality as needed based on frontend requirements.

### Existing Implementations

- ✅ User module (complete)
- ✅ Project module (complete)
- ✅ Task module (complete)
- ✅ Auth middleware
- ✅ Error middleware

### To Be Implemented

- ⏳ Budget module
- ⏳ Team module
- ⏳ Notification module
- ⏳ Comment module
- ⏳ Attachment module
- ⏳ TimeTracking module
- ⏳ Calendar module
- ⏳ Tag module
- ⏳ Label module
- ⏳ ActivityLog module
- ⏳ SearchHistory module
- ⏳ Validation middleware
- ⏳ Logger middleware
- ⏳ Rate limit middleware

## 🔗 API Routes

All routes are prefixed with `/api`:

- `/api/users` - User management
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/budgets` - Budget tracking
- `/api/teams` - Team management
- `/api/notifications` - Notifications
- `/api/comments` - Comments
- `/api/attachments` - File attachments
- `/api/time-tracking` - Time tracking
- `/api/calendar` - Calendar events
- `/api/tags` - Tags
- `/api/labels` - Labels
- `/api/activity-logs` - Activity logs
- `/api/search-history` - Search history

## 🛠️ Development Guidelines

1. **Follow the Layered Architecture**:
   - **Controllers**: Parsing request, validation, sending response. NO business logic.
   - **Services**: Business logic, data manipulation. NO HTTP references (res, req).
   - **Repositories**: Database queries only.
2. **Use TypeScript**: Maintain strong typing throughout. Use shared types in `src/types`.
3. **Error handling**: Throw `AppError` in services/controllers. Use `errorMiddleware` for global handling.
4. **Authentication**: Protect private routes with `authMiddleware`.
5. **Validation**: Use Zod schemas in controllers/middlewares.
6. **Naming Conventions**:
   - Files: `feature.type.ts` (e.g., `user.controller.ts`)
   - Classes: `FeatureType` (e.g., `UserController`)

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

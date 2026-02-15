**Secure Task Management System (RBAC)**

Author: Abhishek Saraswat

**Overview**

This project implements a secure Task Management System using Role-Based Access Control (RBAC) within an NX monorepo architecture.

The system enforces:

JWT-based authentication

Organization-level task scoping

Hierarchical role permissions (Owner > Admin > Viewer)

Guard-based backend authorization

The primary focus of this implementation is secure architecture, correctness, and modular design rather than UI polish.

**Monorepo Architecture (NX)**
apps/
  api/         → NestJS backend
  dashboard/   → Angular frontend

libs/
  data/        → Shared DTOs & types

Why NX?

Clear separation between backend and frontend

Scalable structure

Shared typing capability

Enterprise-ready architecture

**Tech Stack
Backend**

NestJS

TypeScript

JWT Authentication

Guard-based RBAC enforcement

**Frontend**

Angular (Standalone components)

HTTP Interceptor for JWT

Route Guards

**Setup Instructions**
1. Install Dependencies
npm install

2. Run Backend
npx nx serve api


Backend runs at:

http://localhost:3000

3. Run Frontend
npx nx serve dashboard


Frontend runs at:

http://localhost:4200

**Authentication Flow
**
User logs in with email/password.

Backend validates credentials.

JWT token is returned.

Token stored in localStorage.

HTTP interceptor attaches token to requests.

Backend guards validate token and role.

**Role Hierarchy**
Role	Permissions
Viewer	Read-only access to tasks
Admin	Create & update tasks
Owner	Full access including audit logs

Hierarchy:

Owner > Admin > Viewer


Role validation is enforced at:

Guard level

Service level

Controller level

**Security Design**

JWT validation on all protected routes

Role hierarchy enforcement

Organization scoping on queries

Server-side permission validation

Basic audit logging

**Key API Endpoints**
Authentication
POST /auth/login

**Tasks**
GET    /tasks
POST   /tasks
PUT    /tasks/:id
DELETE /tasks/:id

**Audit Logs**
GET /audit-log

**Tradeoffs & Limitations**

UI minimal for assessment purposes

Basic audit log implementation

No refresh token implementation

Simplified organization hierarchy

The primary focus was backend correctness and secure RBAC enforcement.



Author

Abhishek Saraswat
Full Stack & Backend-Focused Engineer
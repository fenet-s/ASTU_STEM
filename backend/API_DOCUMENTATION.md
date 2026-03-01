# 🛠 ASTU Backend API Documentation

This document provides a detailed overview of the API endpoints available in the Adama Science and Technology University (ASTU) Smart Complaint System.

## 🔑 Authentication
All private routes require an `x-auth-token` header containing a valid JWT.

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Authenticate user & get token | Public |

---

## 🎫 Ticket Management (`/api/tickets`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submit a new complaint (with image) | Student |
| `GET` | `/all` | Fetch tickets based on role/department | Staff/Admin |
| `GET` | `/my` | Fetch student's submitted tickets | Student |
| `PATCH` | `/:id` | Update ticket status and remarks | Staff/Admin |

---

## 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch recent notifications for user | Private |
| `PUT` | `/read-all` | Mark all notifications as read | Private |

---

## 👥 User Management (`/api/users`)
| Method | Endpoint | Description | Access |
| :--- | :--- | : :--- | :--- |
| `GET` | `/` | List all registered users | Admin |
| `PATCH` | `/:id` | Update user role or department | Admin |

---

## 📊 Analytics (`/api/analytics`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Get system-wide complaint statistics | Admin |

---

## 🤖 AI & RAG (`/api/rag`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat` | Chat with the Gemini AI assistant | Student |

---

## 🏗 Data Models

### User
- `name`: User's full name
- `email`: Unique ASTU email
- `password`: Hashed password
- `role`: `Student`, `Staff`, or `Admin`
- `department`: Assigned department (for Staff)

### Ticket
- `student`: Reference to User
- `title`: Brief summary
- `description`: Detailed issue
- `category`: `Dormitory`, `Lab Equipment`, `Internet`, etc.
- `status`: `Open`, `In Progress`, `Resolved`
- `attachmentUrl`: Cloudinary image link

### Notification
- `userId`: Recipient ID
- `title`: Notification title
- `message`: Contextual message
- `link`: In-app navigation path
- `isRead`: Boolean status

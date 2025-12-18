# 🚗 Vehicle Rental System

## 🎯 Project Overview

A backend API for a vehicle rental management system that handles:
- **Vehicles** - Manage vehicle inventory with availability tracking
- **Customers** - Manage customer accounts and profiles
- **Bookings** - Handle vehicle rentals, returns and cost calculation
- **Authentication** - Secure role-based access control (Admin and Customer roles)

---

## 🛠️ Technology Stack

- **Node.js** + **TypeScript**
- **Express.js** (web framework)
- **PostgreSQL** (database)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT authentication)

---

## 📁 Code Structure

> **IMPORTANT:** Your implementation **MUST** follow a **modular pattern** with clear separation of concerns. Organize your code into feature-based modules (e.g., auth, users, vehicles, bookings) with proper layering (routes, controllers, services).

---

## 📊 Database Tables

### Users
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| name | Required |
| email | Required, unique, lowercase |
| password | Required, min 6 characters |
| phone | Required |
| role | 'admin' or 'customer' |

### Vehicles
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| vehicle_name | Required |
| type | 'car', 'bike', 'van' or 'SUV' |
| registration_number | Required, unique |
| daily_rent_price | Required, positive |
| availability_status | 'available' or 'booked' |

### Bookings
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| customer_id | Links to Users table |
| vehicle_id | Links to Vehicles table |
| rent_start_date | Required |
| rent_end_date | Required, must be after start date |
| total_price | Required, positive |
| status | 'active', 'cancelled' or 'returned' |

---

## 🔐 Authentication & Authorization

### User Roles
- **Admin** - Full system access to manage vehicles, users and all bookings
- **Customer** - Can register, view vehicles, create/manage own bookings

### Authentication Flow
1. Passwords are hashed using bcrypt before storage into the database
2. User login via `/api/v1/auth/signin` and receives a JWT (JSON Web Token)
3. Protected endpoints require token in header: `Authorization: Bearer <token>`
4. Validates the token and checks user permissions
5. Access granted if authorized, otherwise returns 401 (Unauthorized) or 403 (Forbidden)

---

## 🌐 API Endpoints

> 📖 **For detailed request/response specifications, see the [API Reference](API_REFERENCE.md)**

> ⚠️ **IMPORTANT:** All API endpoint implementations **MUST** exactly match the specifications defined in **[API Reference](API_REFERENCE.md)**. This includes:
> - Exact URL patterns (e.g., `/api/v1/vehicles/:vehicleId`)
> - Request body structure and field names
> - Response format and data structure

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/signup` | Public | Register new user account |
| POST | `/api/v1/auth/signin` | Public | Login and receive JWT token |

---

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/vehicles` | Admin only | Add new vehicle with name, type, registration, daily rent price and availability status |
| GET | `/api/v1/vehicles` | Public | View all vehicles in the system |
| GET | `/api/v1/vehicles/:vehicleId` | Public | View specific vehicle details |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin only | Update vehicle details, daily rent price or availability status |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only | Delete vehicle (only if no active bookings exist) |

---

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin only | View all users in the system |
| PUT | `/api/v1/users/:userId` | Admin or Own | Admin: Update any user's role or details<br>Customer: Update own profile only |
| DELETE | `/api/v1/users/:userId` | Admin only | Delete user (only if no active bookings exist) |

---

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Customer or Admin | Create booking with start/end dates<br>• Validates vehicle availability<br>• Calculates total price (daily rate × duration)<br>• Updates vehicle status to "booked" |
| GET | `/api/v1/bookings` | Role-based | Admin: View all bookings<br>Customer: View own bookings only |
| PUT | `/api/v1/bookings/:bookingId` | Role-based | Customer: Cancel booking (before start date only)<br>Admin: Mark as "returned" (updates vehicle to "available")<br>System: Auto-mark as "returned" when period ends |


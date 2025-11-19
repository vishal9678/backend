# EcoTech Backend API

Backend server for the EcoTech Smart Junk Pickup Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecotech
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Items
- `POST /api/items` - Create new item (protected)
- `GET /api/items/my-items` - Get user's items (protected)
- `GET /api/items/all` - Get all items (agent/admin)
- `GET /api/items/:id` - Get single item (protected)
- `DELETE /api/items/:id` - Delete item (protected)

### Pickups
- `GET /api/pickups/my-pickups` - Get user's pickups (protected)
- `GET /api/pickups/agent-pickups` - Get agent's pickups (agent)
- `GET /api/pickups/pending` - Get pending pickups (agent)
- `POST /api/pickups/:pickupId/accept` - Accept pickup (agent)
- `PUT /api/pickups/:pickupId/status` - Update pickup status (agent/admin)
- `GET /api/pickups/all` - Get all pickups (admin)

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/agents` - Get all agents (admin)
- `PUT /api/admin/agents/:agentId/verify` - Verify agent (admin)
- `POST /api/admin/categories` - Create category (admin)
- `GET /api/admin/categories` - Get all categories
- `PUT /api/admin/categories/:id` - Update category (admin)
- `DELETE /api/admin/categories/:id` - Delete category (admin)
- `GET /api/admin/analytics` - Get analytics (admin)
- `GET /api/admin/notifications` - Get all notifications (admin)

### User
- `GET /api/user/notifications` - Get user notifications (protected)
- `PUT /api/user/notifications/:id/read` - Mark notification as read (protected)

## Real-time Updates

The server uses Socket.io for real-time updates. Clients can connect and join user-specific rooms to receive notifications.



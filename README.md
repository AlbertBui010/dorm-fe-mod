# Frontend - Hệ thống Ký túc xá STU

Modern React frontend application built with Vite cho hệ thống quản lý ký túc xá STU.

## ⚡ Built with Vite

This project uses Vite for fast development and optimized builds:

- ⚡️ Lightning fast HMR (Hot Module Replacement)
- 📦 Optimized bundling with Rollup
- 🔧 Zero-config TypeScript support
- 🎯 Modern ES modules support

## Tính năng

### 🔐 Authentication

- Đăng nhập cho Nhân viên (username/email + password)
- Đăng nhập cho Sinh viên (email + password)
- JWT token authentication
- Protected routes

### 🎯 Dashboard

- Dashboard riêng cho từng role (Nhân viên/Sinh viên)
- Hiển thị thông tin profile
- Quick actions dựa trên quyền
- Thống kê nhanh

### 🛠️ API Testing Tool

- Test các endpoints một cách trực quan
- Quick select common endpoints
- Support GET, POST, PUT, DELETE
- View response data và headers
- Authentication status check

### 🎨 UI Components

- Modern UI với Tailwind CSS
- Reusable components (Button, Input, Card, Table, Modal)
- Responsive design
- Toast notifications

## Cài đặt

```bash
# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Cấu trúc thư mục

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Basic UI components
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## API Configuration

Backend API URL được cấu hình trong `src/utils/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```

Vite Environment Variables: Create `.env` file in frontend folder:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Hệ thống Ký túc xá STU
```

## Authentication Flow

1. **Login**: POST `/api/auth/login`
   - Input: `username/email` và `password`
   - Response: JWT token và user info
2. **Profile**: GET `/api/auth/profile`

   - Headers: `Authorization: Bearer <token>`
   - Response: User profile data

3. **Logout**: POST `/api/auth/logout`
   - Clears local token storage

## Routing

- `/login` - Login page (public)
- `/dashboard` - Main dashboard (protected)
- `/api-test` - API testing tool (protected)
- `/` - Redirects to dashboard or login

## Components

### UI Components

#### Button

```jsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

#### Input

```jsx
<Input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### Card

```jsx
<Card title="Card Title">
  <p>Card content</p>
</Card>
```

### Pages

#### LoginPage

- Form validation
- Error handling
- Automatic redirection

#### DashboardPage

- Role-based content
- Profile display
- Quick actions

#### ApiTestPage

- Interactive API testing
- Request/response view
- Authentication status

## Development

### Running the app

1. Start backend server first:

```bash
cd backend && npm run dev
```

2. Start frontend (Vite):

```bash
cd frontend && npm run dev
```

3. Or use VS Code tasks:

- `Start Backend Server`
- `Start Frontend Dev Server` (now uses Vite)
- `Start Full Stack` (both at once)

Access the app at: **http://localhost:5173**

### Testing APIs

1. Login với tài khoản test
2. Navigate to `/api-test`
3. Select endpoint từ quick select
4. Send request và view response

### Adding new features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update routing in `App.jsx`
4. Add API services in `src/services/`

## Dependencies

### Core

- React 18.2.0
- React Router DOM 6.8.1
- React Scripts 5.0.1

### UI & Styling

- Tailwind CSS 3.3.6
- Lucide React (icons)
- React Hot Toast (notifications)

### HTTP Client

- Axios 1.6.2

### Testing

- React Testing Library
- Jest DOM

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production with Vite
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

Create `.env` file trong frontend folder:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Hệ thống Ký túc xá STU
```

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues

Make sure backend CORS is configured correctly:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### API Connection

Check if backend is running on port 3001:

```bash
curl http://localhost:3001/api/auth/profile
```

### Authentication Issues

1. Check if token exists in localStorage
2. Verify token format in API requests
3. Check backend authentication middleware

### Build Issues

```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

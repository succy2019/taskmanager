# 📋 TaskManager Pro

A modern, professional task management application built with Hono, Bun, and SQLite. Features beautiful dashboards, smooth animations, and comprehensive user/admin functionality.

## ✨ Features

### 🎨 Modern UI/UX
- **Professional dark theme** with gradient accents
- **Smooth animations** and transitions throughout the application
- **Responsive design** that works on all devices
- **Interactive charts** and analytics with Chart.js
- **Beautiful loading states** and micro-interactions

### 👤 User Features
- **User authentication** with secure JWT tokens
- **Personal dashboard** with task statistics and progress tracking
- **Task management** - Create, update, delete, and organize tasks
- **Advanced search** and filtering capabilities
- **Profile management** and settings
- **Real-time progress tracking** with animated progress bars

### 👑 Admin Features
- **Comprehensive admin dashboard** with system analytics
- **User management** - View all users and their activity
- **Task oversight** - Monitor all tasks across the system
- **Interactive charts** showing task completion trends
- **System statistics** and performance metrics
- **Quick actions** for common administrative tasks

### 🔒 Security
- **JWT-based authentication** with secure cookies
- **Role-based access control** (User/Admin)
- **Input validation** and sanitization
- **CORS protection** and security headers

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Create admin user**
   ```bash
   bun run seed-admin
   ```
   This creates an admin user with:
   - 📧 Email: `admin@taskmanager.com`
   - 🔑 Password: `admin123`

4. **Start the development server**
   ```bash
   bun run dev
   ```

## 🌐 Usage

### 🏠 Main Application
- Access the application at `http://localhost:9000`
- **Landing page** with modern hero section and call-to-action
- **Register** a new user account or **login** with existing credentials

### 👤 User Dashboard
- After login, users are redirected to `http://localhost:9000/user-dashboard.html`
- **Statistics overview** with animated cards showing task counts
- **Quick actions** for common tasks
- **Task management** with filtering and search
- **Progress tracking** with visual progress bars
- **Profile management** modal

### 👑 Admin Dashboard
- Access admin login at `http://localhost:9000/admin-login.html`
- Login with admin credentials (see installation step 3)
- **Comprehensive dashboard** with system analytics
- **User management** table with user information
- **Task oversight** across all users
- **Interactive charts** showing trends and distributions
- **Quick administrative actions**

## 🎨 Design Features

### 🌈 Color Scheme
- **Primary**: Gradient from purple to blue (`#667eea` to `#764ba2`)
- **Success**: Green tones for completed tasks
- **Warning**: Orange tones for in-progress items
- **Danger**: Red tones for urgent actions
- **Dark theme** with carefully selected contrasts

### ✨ Animations
- **Fade-in animations** for page transitions
- **Slide-in effects** for content loading
- **Hover animations** on interactive elements
- **Shimmer effects** on buttons and cards
- **Smooth transitions** for state changes
- **Loading spinners** for async operations

### 📱 Responsive Design
- **Mobile-first** approach
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly** buttons and interactions
- **Optimized typography** for all devices

## 🔧 API Endpoints

### 🔐 Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### 📝 Tasks
- `GET /api/tasks` - Get user tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### 👑 Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/users` - Get all users
- `GET /api/admin/tasks` - Get all tasks

## 🗂️ File Structure

```
taskmanager/
├── public/
│   ├── index.html              # Main landing page
│   ├── admin-login.html        # Admin login page
│   ├── admin-dashboard.html    # Admin dashboard
│   └── user-dashboard.html     # User dashboard
├── src/
│   ├── controller/
│   │   ├── adminController.ts  # Admin operations
│   │   ├── taskController.ts   # Task management
│   │   └── userController.ts   # User operations
│   ├── middleware/
│   │   └── authmiddleware.ts   # JWT authentication
│   ├── models/
│   │   └── index.ts           # Data models
│   ├── repository/
│   │   └── database.ts        # Database operations
│   └── index.ts               # Main server file
├── seed-admin.ts              # Admin user seeder
├── package.json
└── README.md
```

## 🛠️ Technology Stack

- **Backend**: [Hono](https://hono.dev/) - Fast web framework
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Database**: SQLite with prepared statements
- **Frontend**: Vanilla JavaScript with modern ES6+
- **Styling**: CSS3 with custom properties and animations
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome 6
- **Fonts**: Inter font family

## 🔒 Security Features

- **JWT tokens** stored in HTTP-only cookies
- **Password validation** (in production, use proper hashing)
- **Input sanitization** and validation
- **CORS protection** with proper headers
- **SQL injection prevention** with prepared statements
- **XSS protection** with proper escaping

## 🚀 Performance Features

- **Optimized database queries** with indexes
- **Lazy loading** for dashboard components
- **Debounced search** to reduce API calls
- **Efficient animations** using CSS transforms
- **Minimal dependencies** for fast loading

## 📈 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] File attachments for tasks
- [ ] Team collaboration features
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app with PWA support
- [ ] Integration with calendar applications
- [ ] Task templates and workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using modern web technologies**

# Smart Study Planner

A full-stack study management application designed to help students organize their academic activities, manage tasks, create structured study schedules, and track their learning progress.

## Features

- **User Authentication:** Secure registration and login using JWT authentication and password hashing.
- **Subject Management:** Add and manage academic subjects.
- **Task Management:** Create, organize, update completion status, and delete study and personal tasks.
- **Smart Study Plan Generator:** Generate prioritized study schedules based on available hours, task priorities, and deadlines.
- **Study Timer:** Track focused study sessions with start, pause, resume, and reset functionality.
- **Study History:** View completed study sessions and track total study time.
- **Calendar:** View scheduled tasks by date with search and filtering options.
- **Dashboard:** Monitor tasks, study goals, weekly progress, and study streaks.

## Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
smart-study-planner/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Indhumathi288/smart-study-planner.git
cd smart-study-planner
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Set up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite, usually:

`http://localhost:5173`

## Application Modules

| Module | Description |
|---|---|
| Dashboard | Study statistics and progress tracking |
| Subjects | Academic subject management |
| Tasks | Study and personal task management |
| Study Plan | Prioritized timetable generation |
| Study Timer | Focused study session tracking |
| Study History | Completed session records |
| Calendar | Date-wise task management |

## Future Enhancements

- Edit and update subject details.
- More advanced study analytics.
- Improved study schedule customization.
- Application deployment.

## Author

**Indhumathi Palani**

GitHub: [Indhumathi288](https://github.com/Indhumathi288)

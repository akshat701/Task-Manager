# 🚀 TaskFlow — Task Management System
## ✨ Features

### 🔐 Authentication

* User registration & login
* Protected routes (redirects if unauthenticated)

---

### 📁 Projects

* View all projects
* Create new project (description, deadline, members)
* Project-level task stats (total, todo, in-progress, done)

---

### ✅ Tasks

* Create / Edit tasks
* Fields:

  * Title
  * Status (Todo / In Progress / Done)
  * Priority (Low / Medium / High)
  * Assignee
  * Due date
* Kanban-style task board
* Drag & drop between columns

---

### 🎯 Advanced UX

* Optimistic UI updates
* Loading states (spinner + blur)
* Toast notifications
* Empty states

---


## 🛠️ Tech Stack

* **Frontend:** React + TypeScript
* **Routing:** React Router
* **State Management:** Zustand
* **Styling:** Tailwind CSS
* **Drag & Drop:** @hello-pangea/dnd
* **Backend (Mock):** json-server
* **Containerization:** Docker + Docker Compose

---

## 🐳 Docker Setup (Recommended)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/akshat701/taskflow-akshatgoyal.git
cd taskflow-akshatgoyal
```

---

### 2️⃣ Run with Docker

```bash
docker compose up --build
```

---

### 3️⃣ Access the app

* 🌐 Frontend: http://localhost:5173
* 🔗 API: http://localhost:4000

---

### 🛑 Stop containers

```bash
docker compose down
```

---

## ⚙️ Local Setup (Without Docker)

### 1️⃣ Install dependencies

```bash
npm install
```

---

### 2️⃣ Run backend

```bash
npx json-server --watch db.json --port 4000
```

---

### 3️⃣ Start frontend

```bash
npm run dev
```

---

### 4️⃣ Open in browser

```
http://localhost:5173
```

---

## 🔑 Test Credentials

```
Email: test@example.com  
Password: password123
```

---

## 💡 Notes

* Docker setup includes:

  * Nginx for serving frontend
  * json-server as backend
* SPA routing handled via nginx (`try_files /index.html`)
* Ensure ports **5173** and **4000** are free

---


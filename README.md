attendance-system/
│
├── backend/                 # Node + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── attendanceController.js
│   │   │   └── subscriptionController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── subscriptionMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   └── subscriptionRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   │
│   │   └── app.js
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/                # Vue 3 + Vite + Tailwind
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   │   └── charts/
│   │   │
│   │   ├── views/
│   │   │   ├── auth/
│   │   │   │   ├── Login.vue
│   │   │   │   └── Register.vue
│   │   │   │
│   │   │   ├── superadmin/
│   │   │   │   └── Dashboard.vue
│   │   │   │
│   │   │   ├── orgadmin/
│   │   │   │   ├── Dashboard.vue
│   │   │   │   ├── Employees.vue
│   │   │   │   └── Attendance.vue
│   │   │   │
│   │   │   └── employee/
│   │   │       └── Dashboard.vue
│   │   │
│   │   ├── router/
│   │   │   └── index.js
│   │   │
│   │   ├── store/
│   │   │   └── authStore.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.vue
│   │   └── main.js
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
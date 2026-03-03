# -Track Timi
digital attendance and reporting tracking system

## Development Setup

### Backend

1. **Navigate to backend folder**
   ```bash
   cd Backed
   ```
2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   The API will listen on `http://localhost:3000` by default.

### Frontend

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```
2. **Create a `.env` file** (already provided) with the API URL:
   ```text
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
   The development server proxies `/api` requests to the backend so you can
   leave the value as `/api` when running `npm run dev`.
3. **Install packages**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173` and will forward API
   calls to the backend.

> ⚠️ Make sure the backend is running before attempting to register or log in.


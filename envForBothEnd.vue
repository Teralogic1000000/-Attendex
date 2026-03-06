<!-- backend endpoint -->
PORT=3000
JWT_SECRET=cc9151c7-d1ae-4bb7-921f-3c8c82bade54
JWT_REFRESH_SECRET=8a3f9c2b-5e7d-4a1c-9f3e-2d8b6c4f1a7e
DATABASE_URL=postgresql://postgres.nocmacsjslykcmumwhzc:cZsHohAb6fu99iAa@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
NODE_ENV=development

<!-- frontend endpoint -->
 # frontend environment variables
# specify the API base URL (include /api if backend serves routes under that prefix)
VITE_API_BASE_URL=http://localhost:3000/api

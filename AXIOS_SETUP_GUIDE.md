# Integrasi Axios Auth - Setup Checklist

## ✅ Sudah Dikerjakan

### Frontend (React)

1. **Auth.tsx Updated** - Integrasi axios untuk:
   - Login: POST `/auth/login`
   - Register: POST `/auth/register`
   - Reset Password: POST `/auth/forgot-password`
   - Token disimpan di localStorage
   - Auto redirect jika sudah login
   - Error handling untuk setiap endpoint

2. **Axios Instance Configured**:
   - Base URL: `http://localhost:8000/api`
   - Headers: `Content-Type: application/json`, `Accept: application/json`
   - Authorization header auto-attached untuk setiap request

### Backend (Laravel)

1. **routes/api.php** - Created API routes untuk:
   - POST `/auth/login` - Login user
   - POST `/auth/register` - Daftar user baru
   - POST `/auth/forgot-password` - Reset password
   - POST `/auth/logout` - Logout (dengan auth:sanctum)
   - GET `/auth/user` - Get user info (dengan auth:sanctum)

2. **App\Http\Controllers\Api\Auth\AuthApiController.php** - Created
   - Login method dengan token generation
   - Register method dengan user creation
   - Forgot password method
   - Logout method
   - Get user method

3. **User Model Updated**:
   - Added `HasApiTokens` trait untuk Sanctum support
   - Supports `createToken()` untuk API authentication

4. **CORS Configuration**:
   - Created `config/cors.php`
   - Allowed origins: `localhost:3000`, `localhost:5173`, `localhost:8080`
   - Applied `HandleCors` middleware di `bootstrap/app.php`

## ⚠️ PENTING - Setup yang Harus Dilakukan

### 1. Publish Sanctum Migration (CRITICAL)

```bash
cd backend
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Ini membuat table `personal_access_tokens` yang diperlukan untuk menyimpan API tokens.

### 2. Pastikan Backend Running di Port 8000

```bash
cd backend
php artisan serve
```

Frontend axios akan hit `http://localhost:8000/api`

### 3. Pastikan Frontend Running di Port 5173 (Vite Default)

```bash
cd frontend
npm run dev
```

CORS sudah allow origins di port 5173 dan 3000

### 4. Clear Laravel Cache (Opsional tapi recommended)

```bash
cd backend
php artisan config:cache
php artisan route:cache
```

## 🧪 Testing

### Test Login:

1. Buka `http://localhost:5173` (atau port frontend Anda)
2. Masuk tab "Sign In"
3. Gunakan email dan password user yang sudah ada
4. Seharusnya redirect ke `/dashboard` dan token tersimpan di localStorage

### Test Sign Up:

1. Masuk tab "Sign Up"
2. Isi form dengan data baru (email belum terdaftar)
3. Password dan confirm password harus sama
4. Submit - seharusnya create account dan auto login

### Test Reset Password:

1. Masuk tab reset password
2. Masukkan email yang terdaftar
3. Backend akan send email dengan reset link

### Check Stored Token:

Buka DevTools (F12) → Application → LocalStorage
Seharusnya ada items:

- `token` - Bearer token dari server
- `user` - User object (JSON)

## 🔧 API Endpoints Reference

| Method | Endpoint                    | Body                                             | Response                 |
| ------ | --------------------------- | ------------------------------------------------ | ------------------------ |
| POST   | `/api/auth/login`           | `{email, password}`                              | `{token, user, message}` |
| POST   | `/api/auth/register`        | `{name, email, password, password_confirmation}` | `{token, user, message}` |
| POST   | `/api/auth/forgot-password` | `{email}`                                        | `{message}`              |
| POST   | `/api/auth/logout`          | -                                                | `{message}`              |
| GET    | `/api/auth/user`            | -                                                | `{user}`                 |

## 📝 Catatan Penting

1. **Token Storage**: Token disimpan di localStorage (tidak session) agar persist setelah refresh
2. **CORS**: Jika dapat error CORS, check `config/cors.php` dan pastikan frontend origin sudah included
3. **Validation**: Backend akan return error jika:
   - Email sudah terdaftar (register)
   - Email/password salah (login)
   - Email tidak ditemukan (forgot password)
4. **Error Handling**: Auth.tsx sudah catch semua error dan tampilkan alert ke user

## 🚀 Next Steps (Opsional)

1. Setup refresh token logic untuk token expiry
2. Buat utility file untuk API calls (saat ini inline di Auth.tsx)
3. Setup user context/Redux untuk store user globally
4. Add protection ke protected routes (PrivateRoute component)
5. Implement social login OAuth (Google, Facebook)

---

Status: ✅ Ready untuk Testing

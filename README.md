# 🎂 Birthday Card Automation System

**Hệ thống thiệp sinh nhật tự động – FPT Telecom**  
Node.js + Express + Puppeteer + React + Vite

---

## Tổng quan

Hệ thống cho phép:
- ✅ Thiết kế template thiệp sinh nhật bằng giao diện kéo thả (React)
- ✅ Gán tag cho template để gọi qua API
- ✅ Nhận data nhân viên từ n8n → render ảnh PNG bằng Puppeteer → trả binary
- ✅ n8n dùng ảnh để gửi email hoặc đăng lên FPT Place

---

## Yêu cầu hệ thống

| Thứ | Phiên bản |
|---|---|
| Node.js | ≥ 18 |
| PostgreSQL | ≥ 15 |
| Docker | ≥ 24 (optional) |

---

## Cài đặt & Chạy Local

### 1. Clone & install

```bash
git clone <repo-url>
cd birthday-card-system

# Backend
npm install

# Frontend
cd frontend && npm install
```

### 2. Cấu hình môi trường

```bash
# Backend
cp .env.example .env
# Chỉnh sửa .env với thông tin DB và API key của bạn

# Frontend
cd frontend
cp .env.example .env
# Điền VITE_API_KEY trùng với API_KEY_SECRET trong .env backend
```

### 3. Khởi tạo database

```bash
# Nếu dùng psql local
psql -U postgres -c "CREATE DATABASE birthday_card;"
psql -U postgres -d birthday_card -f src/models/schema.sql
```

### 4. Chạy development server

```bash
# Terminal 1 – Backend API (port 3000)
npm run dev

# Terminal 2 – Frontend (port 5173)
cd frontend && npm run dev
```

Truy cập: **http://localhost:5173**

---

## Chạy với Docker

```bash
# Copy và cấu hình .env
cp .env.example .env
# Điền API_KEY_SECRET

# Khởi động toàn bộ stack
docker-compose up -d

# Xem logs
docker-compose logs -f app
```

- **Backend API:** http://localhost:3000/api/v1
- **PostgreSQL:** localhost:5432

---

## Biến môi trường (Backend)

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `PORT` | Không | Port server (mặc định: 3000) |
| `DATABASE_URL` | **Có** | PostgreSQL connection string |
| `API_KEY_SECRET` | **Có** | API key để xác thực request |
| `PUPPETEER_CONCURRENCY` | Không | Số workers Puppeteer (mặc định: 3) |
| `PUPPETEER_TIMEOUT_MS` | Không | Timeout render (mặc định: 30000ms) |
| `AVATAR_ALLOWED_DOMAINS` | Không | Domain cho phép fetch avatar, cách nhau bởi dấu phẩy |
| `RATE_LIMIT_MAX_REQUESTS` | Không | Số request tối đa/phút per API key (mặc định: 30) |

---

## API Reference

### Authentication

Mọi request (trừ `/health`) phải có header:
```
X-API-Key: <your-api-key>
```

### Endpoints

#### `GET /api/v1/health`
Health check – không cần auth.

```json
{ "status": "ok", "timestamp": "2026-04-10T00:00:00.000Z" }
```

---

#### `POST /api/v1/render`
Render thiệp từ tag + data nhân viên → trả binary PNG.

**Request:**
```json
{
  "tag": "fpt-telecom-birthday",
  "data": {
    "name": "Nguyễn Văn A",
    "birthday": "15/04/1995",
    "department": "Kinh doanh miền Nam",
    "position": "Trưởng phòng",
    "wish": "Chúc mừng sinh nhật! Chúc anh luôn mạnh khỏe.",
    "avatar_url": "https://hrm.fpt.vn/avatars/nguyen-van-a.jpg"
  },
  "width": 800,
  "height": 450
}
```

**Response:** `Content-Type: image/png` (binary)

**Lỗi:**
| Code | Tình huống |
|---|---|
| 400 | Thiếu `tag` hoặc `data.name` |
| 401 | Thiếu/sai API key |
| 404 | Tag không tồn tại hoặc không có template active |
| 504 | Render timeout > 30s |

---

#### `POST /api/v1/preview`
Render với `canvas_json` trực tiếp → trả base64 PNG (dùng trong Designer UI).

```json
// Request
{ "canvas_json": { ... }, "data": { "name": "Test", "wish": "Hello!" } }

// Response
{ "image_base64": "data:image/png;base64,..." }
```

---

#### `GET /api/v1/templates`
```
Query: ?tag=fpt-telecom&is_active=true&search=thiep&page=1&limit=20
```

#### `POST /api/v1/templates`
```json
{ "name": "Thiệp FPT 2026", "canvas_json": { ... }, "tag_ids": ["uuid1"] }
```

#### `PUT /api/v1/templates/:id`
#### `DELETE /api/v1/templates/:id` (soft delete)
#### `POST /api/v1/templates/:id/duplicate`

---

#### `GET /api/v1/tags`
#### `POST /api/v1/tags`
```json
{ "name": "fpt-telecom-birthday", "color": "#185FA5", "description": "..." }
```
#### `PUT /api/v1/tags/:id`
#### `DELETE /api/v1/tags/:id`

---

#### `GET /api/v1/logs`
```
Query: ?status=error&template_id=uuid&date_from=2026-04-01&limit=50
```

---

## Tích hợp n8n

### Cấu hình node HTTP Request

| Field | Giá trị |
|---|---|
| Method | `POST` |
| URL | `http://your-server:3000/api/v1/render` |
| Header | `X-API-Key: <api_key>` |
| Content-Type | `application/json` |
| **Response Format** | **File (Binary)** |

### Body mẫu

```json
{
  "tag": "fpt-telecom-birthday",
  "data": {
    "name": "{{ $json.fullName }}",
    "birthday": "{{ $json.dob }}",
    "department": "{{ $json.department }}",
    "position": "{{ $json.position }}",
    "wish": "{{ $json.ai_wish }}",
    "avatar_url": "{{ $json.avatar_url }}"
  }
}
```

### Xử lý binary response
- **Gửi email:** node Send Email → attachment = binary PNG field
- **Đăng FPT Place:** node HTTP Request → upload binary

---

## Chạy Tests

```bash
npm test
```

Test coverage:
- `tests/htmlBuilder.test.js` – Unit tests placeholder replacement & HTML builder
- `tests/avatarFetcher.test.js` – Unit tests SSRF protection & fallback
- `tests/api.test.js` – Integration tests tất cả API endpoints (DB & Puppeteer mocked)

---

## Cấu trúc dự án

```
birthday-card-system/
├── src/
│   ├── app.js                    # Express app entry point
│   ├── controllers/
│   │   ├── templateController.js
│   │   ├── tagController.js
│   │   ├── renderController.js
│   │   └── logController.js
│   ├── services/
│   │   ├── templateService.js
│   │   ├── tagService.js
│   │   ├── renderService.js
│   │   └── renderLogService.js
│   ├── puppeteer/
│   │   ├── htmlBuilder.js        # canvas_json → HTML
│   │   ├── avatarFetcher.js      # URL → base64 (SSRF protected)
│   │   └── renderEngine.js       # Puppeteer cluster pool
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── db.js                 # pg Pool
│   │   └── schema.sql            # DB migration
│   └── routes/
│       ├── index.js
│       ├── templates.js
│       ├── tags.js
│       ├── render.js
│       └── logs.js
├── frontend/                     # React + Vite + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── Templates/        # Danh sách & quản lý template
│       │   ├── Designer/         # Canvas kéo thả
│       │   ├── Tags/             # Quản lý tag
│       │   ├── Logs/             # Render logs
│       │   └── Settings/         # Cài đặt & n8n guide
│       └── components/
│           └── Designer/         # Canvas, Sidebar, Toolbar, Modals
├── tests/
│   ├── htmlBuilder.test.js
│   ├── avatarFetcher.test.js
│   └── api.test.js
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## Bảo mật

- **API Key** bắt buộc với mọi request từ n8n
- **SSRF protection** – `avatar_url` chỉ cho phép domain whitelist
- **Rate limiting** – max 30 req/phút per API key
- **XSS prevention** – HTML special chars được escape trước khi render
- **Soft delete** – template chỉ bị ẩn, không xóa khỏi DB

---

## Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| `Puppeteer launch failed` | Chắc chắn chạy đúng args `--no-sandbox` (bắt buộc trong Docker) |
| `Tag not found` | Kiểm tra tag slug chính xác và template đã gán tag, `is_active = true` |
| `timeout exceeded` | Tăng `PUPPETEER_TIMEOUT_MS` hoặc giảm `PUPPETEER_CONCURRENCY` |
| `401 Invalid API key` | So sánh `X-API-Key` header với `API_KEY_SECRET` trong `.env` |
| Avatar không hiện | Kiểm tra domain có trong `AVATAR_ALLOWED_DOMAINS` không |

---

*FPT Telecom Internal Tools Team – v1.0 – 04/2026*

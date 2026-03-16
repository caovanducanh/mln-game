# EconGame - Trò Chơi Kinh Tế Lớp Học

## 🏭 Giới Thiệu

Mô phỏng kinh tế cạnh tranh cho lớp học (~35 người chơi).
Tạo công ty, tuyển nhân viên, sản xuất hàng hóa, cạnh tranh và thâu tóm!

## 🛠️ Tech Stack

- **Backend**: Spring Boot 3 (Java 21)
- **Frontend**: Next.js 14 (App Router, TailwindCSS)
- **Database**: PostgreSQL 16
- **Auth**: Google OAuth2 + JWT (HttpOnly Cookie)
- **Realtime**: WebSocket STOMP + SockJS
- **Container**: Docker + Docker Compose

## 🚀 Cách Chạy

### Yêu cầu
- Docker Desktop đã cài đặt
- Ports 3000, 5050, 5432, 8080 không bị chiếm

### Bước 1: Clone và cấu hình
```bash
cd mln-game
# Kiểm tra file .env đã có sẵn Google OAuth credentials
```

### Bước 2: Chạy hệ thống
```bash
docker compose up --build
```

### Bước 3: Truy cập
| Service | URL |
|---------|-----|
| 🎮 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080 |
| 🗄️ PgAdmin | http://localhost:5050 |

### Bước 4: Đăng nhập
1. Vào http://localhost:3000
2. Click "Đăng nhập bằng Google"
3. Đăng nhập bằng tài khoản Google

### Bước 5: Tạo Admin
Trong PgAdmin (http://localhost:5050), chạy SQL:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

## 🎮 Luật Chơi

### Sản xuất
- 1 nhân viên + $10 chi phí = 1 sản phẩm
- 1 sản phẩm bán được $20
- Lợi nhuận = $20 - $10 - lương

### Mỗi vòng (60 giây)
1. Trả lương (bắt buộc, trước lợi nhuận)
2. Sản xuất hàng hóa
3. Bán sản phẩm
4. Kiểm tra phá sản

### Tính năng đặc biệt
- 🔥 **Phá hoại**: CEO trả $30→40→50 để trừ ngân sách đối thủ
- 👑 **Thâu tóm**: Cần > 1.5× ngân sách đối thủ
- ✊ **Đình công**: Lương < $10 → nhân viên bỏ phiếu
- 🧨 **Bê bối**: Admin kích hoạt → -$20, -20 uy tín

### Sự kiện (Admin kích hoạt)
| Sự kiện | Hiệu ứng |
|---------|----------|
| Khủng hoảng kinh tế | Nhu cầu giảm 50% |
| Bùng nổ thị trường | Giá ×1.5, nhu cầu ×2 |
| Luật lao động | Lương tối thiểu $12 |
| Đình công toàn ngành | Lương < $10 → ngừng sản xuất |
| Chính sách thuế | Thuế 20% doanh thu |
| Bê bối tham nhũng | -$20 ngân sách, -20 uy tín |

## 📁 Cấu Trúc Dự Án

```
mln-game/
├── docker-compose.yml
├── .env
├── be/                    # Spring Boot Backend
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/econgame/
│       ├── config/        # Security, OAuth2, JWT, WebSocket
│       ├── entity/        # JPA Entities
│       ├── repository/    # Spring Data JPA
│       ├── service/       # Business Logic
│       │   └── game/      # GameEngine, RoundProcessor, EventProcessor
│       ├── controller/    # REST APIs
│       └── dto/           # Request/Response DTOs
└── fe-web/                # Next.js Frontend
    ├── Dockerfile
    └── src/
        ├── app/           # Pages (Vietnamese UI)
        ├── components/    # Reusable Components
        ├── store/         # Zustand State
        ├── lib/           # API + WebSocket
        └── types/         # TypeScript Types
```

## 🔌 API Endpoints

### Auth
- `GET /api/me` - Thông tin người dùng hiện tại

### Công ty
- `POST /api/company` - Tạo công ty
- `GET /api/companies` - Danh sách công ty
- `POST /api/company/{id}/salary` - Đặt lương
- `POST /api/company/{id}/sabotage` - Phá hoại
- `POST /api/company/{id}/takeover` - Thâu tóm

### Nhân viên
- `POST /api/worker/join/{companyId}` - Gia nhập
- `POST /api/worker/quit` - Nghỉ việc
- `POST /api/worker/strike/{companyId}` - Đình công

### Game (Admin)
- `POST /api/game/start` - Bắt đầu game
- `POST /api/game/next-round` - Vòng tiếp
- `GET /api/game/state` - Trạng thái game
- `POST /api/events/trigger` - Kích hoạt sự kiện

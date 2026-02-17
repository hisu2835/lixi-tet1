# 🧧 Web Lì Xì Tết - Rút Thăm May Mắn

> Ứng dụng web rút thăm lì xì Tết Nguyên Đán với hiệu ứng đẹp mắt, thuật toán random có tỷ lệ, và trang quản trị.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Tính Năng

- 🎆 Hiệu ứng rơi (tiền, hoa đào, hoa mai, đèn lồng...)
- 🧧 Phong bì lì xì truyền thống - Click để rút thăm
- 🎯 Thuật toán Weighted Random (tỷ lệ theo mệnh giá)
- 🎇 Pháo hoa + Confetti khi trúng giải lớn
- 🎮 Nút CHEAT ẩn (góc phải trên + góc trái dưới)
- 📊 Database lưu trữ mệnh giá + lịch sử
- ⚙️ Trang Admin quản lý thêm/xóa/sửa mệnh giá

## 🚀 Chạy Trên Máy Tính (Local)

### Bước 1: Cài Node.js
Tải và cài [Node.js](https://nodejs.org/) phiên bản 18 trở lên.

### Bước 2: Cài thư viện
```bash
npm install
```

### Bước 3: Chạy server
```bash
npm start
```

### Bước 4: Mở trình duyệt
- Trang chính: http://localhost:3000
- Trang admin: http://localhost:3000/admin.html

## 🌐 Deploy Lên Web (Render.com - MIỄN PHÍ)

### Bước 1: Đưa code lên GitHub
### Bước 2: Vào [render.com](https://render.com) → Đăng ký/Đăng nhập bằng GitHub
### Bước 3: New → Web Service → Chọn repo GitHub
### Bước 4: Cấu hình:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

→ Render sẽ cấp cho bạn link dạng: `https://ten-app.onrender.com`

## 📁 Cấu Trúc Thư Mục

```
file tết/
├── server.js          # Backend - API + thuật toán random
├── database.js        # Module quản lý dữ liệu (JSON)
├── package.json       # Cấu hình project + dependencies
├── .gitignore         # File bỏ qua khi push GitHub
├── public/            # Frontend
│   ├── index.html     # Giao diện rút thăm lì xì
│   ├── style.css      # CSS + hiệu ứng Tết
│   ├── script.js      # Logic frontend + hiệu ứng rơi
│   └── admin.html     # Trang quản trị mệnh giá
└── data/              # Database (tự tạo khi chạy)
    ├── menh_gia.json  # Danh sách mệnh giá
    └── lich_su.json   # Lịch sử rút lì xì
```

## 🎮 Easter Egg (Cheat)
Nhấn vào góc **PHẢI TRÊN** hoặc **TRÁI DƯỚI** màn hình để luôn trúng JACKPOT!

## 📝 License
MIT - Tự do sử dụng

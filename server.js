// =====================================================
// SERVER CHÍNH - Backend Web Lì Xì Tết
// Sử dụng Express.js để tạo API
// Bao gồm thuật toán random có tỷ lệ (weighted random)
// và cơ chế cheat cho nút bí mật
// =====================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  layTatCaMenhGia,
  themMenhGia,
  xoaMenhGia,
  capNhatSoLuong,
  giamSoLuong,
  luuLichSu,
  layLichSu,
  layMenhGiaCaoNhat,
  layMenhGiaConPhongBi
} = require('./database');

// Khởi tạo ứng dụng Express
const app = express();
// PORT lấy từ biến môi trường (khi deploy) hoặc mặc định 3000 (khi chạy local)
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE - Cấu hình các tính năng cơ bản
// =====================================================

// Cho phép đọc dữ liệu JSON từ request body
app.use(express.json());

// Cho phép truy cập từ các domain khác (Cross-Origin)
app.use(cors());

// Phục vụ các file tĩnh (HTML, CSS, JS) từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// THUẬT TOÁN RANDOM CÓ TỶ LỆ (WEIGHTED RANDOM)
// 
// Nguyên lý hoạt động:
// - Mỗi mệnh giá được gán một "trọng số" (weight)
// - Mệnh giá từ 0đ - 200đ: trọng số CAO (dễ trúng)
// - Mệnh giá 500đ trở lên: trọng số THẤP (khó trúng)
// - Mệnh giá càng cao → trọng số càng thấp → càng hiếm
//
// Ví dụ: 
//   0đ có trọng số 100, 500đ có trọng số 20
//   → Xác suất trúng 0đ gấp 5 lần trúng 500đ
// =====================================================
function tinhTrongSo(menh_gia) {
  // Mệnh giá 0đ - 200đ: tỷ lệ ngang nhau, trọng số cao
  if (menh_gia <= 200) {
    return 100; // Trọng số cơ bản cao nhất
  }

  // Mệnh giá 500đ: bắt đầu giảm tỷ lệ
  if (menh_gia === 500) return 30;

  // Mệnh giá 1.000đ
  if (menh_gia === 1000) return 20;

  // Mệnh giá 2.000đ
  if (menh_gia === 2000) return 15;

  // Mệnh giá 5.000đ
  if (menh_gia === 5000) return 8;

  // Mệnh giá 10.000đ
  if (menh_gia === 10000) return 5;

  // Mệnh giá 20.000đ
  if (menh_gia === 20000) return 3;

  // Mệnh giá 50.000đ
  if (menh_gia === 50000) return 1.5;

  // Mệnh giá 100.000đ trở lên: cực kỳ hiếm
  if (menh_gia >= 100000) return 0.5;

  // Mặc định cho các mệnh giá khác >= 500đ
  return Math.max(0.1, 50 - (menh_gia / 100));
}

// =====================================================
// HÀM RÚT THĂM - Chọn ngẫu nhiên mệnh giá theo tỷ lệ
//
// Bước 1: Lấy tất cả mệnh giá còn phong bì
// Bước 2: Tính trọng số cho mỗi mệnh giá
// Bước 3: Tạo "vùng xác suất" cho mỗi mệnh giá
// Bước 4: Random một số và xem rơi vào vùng nào
// =====================================================
function rutThamLiXi(cheatMode = false) {
  // -----------------------------------------------
  // CHEAT MODE - Luôn trả về mệnh giá cao nhất
  // Khi người dùng nhấn vào nút bí mật ẩn
  // -----------------------------------------------
  if (cheatMode) {
    const menhGiaCaoNhat = layMenhGiaCaoNhat();
    if (menhGiaCaoNhat) {
      // Giảm số lượng phong bì của mệnh giá đó
      giamSoLuong(menhGiaCaoNhat.menh_gia);
      // Lưu vào lịch sử (đánh dấu là cheat)
      luuLichSu(menhGiaCaoNhat.menh_gia, 'VIP', 1);
      return {
        thanh_cong: true,
        menh_gia: menhGiaCaoNhat.menh_gia,
        thong_diep: taoThongDiep(menhGiaCaoNhat.menh_gia),
        la_cheat: true
      };
    }
  }

  // -----------------------------------------------
  // BƯỚC 1: Lấy danh sách mệnh giá còn phong bì
  // -----------------------------------------------
  const danhSachMenhGia = layMenhGiaConPhongBi();

  // Nếu hết phong bì
  if (danhSachMenhGia.length === 0) {
    return {
      thanh_cong: false,
      thong_diep: '🎋 Đã hết lì xì rồi! Chúc bạn năm mới vui vẻ!'
    };
  }

  // -----------------------------------------------
  // BƯỚC 2: Tính trọng số cho từng mệnh giá
  // Nhân trọng số với số lượng phong bì còn lại
  // -----------------------------------------------
  const mangTrongSo = danhSachMenhGia.map(item => ({
    menh_gia: item.menh_gia,
    trong_so: tinhTrongSo(item.menh_gia) * Math.min(item.so_luong, 10)
    // Giới hạn nhân tối đa 10 để tránh lệch quá nhiều
  }));

  // -----------------------------------------------
  // BƯỚC 3: Tính tổng trọng số
  // -----------------------------------------------
  const tongTrongSo = mangTrongSo.reduce(
    (tong, item) => tong + item.trong_so, 0
  );

  // -----------------------------------------------
  // BƯỚC 4: Random một số từ 0 đến tổng trọng số
  // Rồi duyệt qua từng mệnh giá, trừ dần trọng số
  // Khi số random <= 0 → đó là mệnh giá trúng
  // -----------------------------------------------
  let soRandom = Math.random() * tongTrongSo;

  for (const item of mangTrongSo) {
    soRandom -= item.trong_so;
    if (soRandom <= 0) {
      // Đã tìm được mệnh giá trúng!
      giamSoLuong(item.menh_gia);
      luuLichSu(item.menh_gia, 'Khách', 0);
      return {
        thanh_cong: true,
        menh_gia: item.menh_gia,
        thong_diep: taoThongDiep(item.menh_gia),
        la_cheat: false
      };
    }
  }

  // Trường hợp dự phòng (hiếm khi xảy ra)
  const menhGiaCuoi = mangTrongSo[mangTrongSo.length - 1];
  giamSoLuong(menhGiaCuoi.menh_gia);
  luuLichSu(menhGiaCuoi.menh_gia, 'Khách', 0);
  return {
    thanh_cong: true,
    menh_gia: menhGiaCuoi.menh_gia,
    thong_diep: taoThongDiep(menhGiaCuoi.menh_gia),
    la_cheat: false
  };
}

// =====================================================
// TẠO THÔNG ĐIỆP - Hiển thị lời chúc theo mệnh giá
// Mệnh giá cao → lời chúc đặc biệt hơn
// =====================================================
function taoThongDiep(menh_gia) {
  if (menh_gia === 0) {
    const loiChuc = [
      '🎋 Chúc may mắn lần sau nhé!',
      '🌸 Năm mới bình an, thử lại nhé!',
      '🎍 Lộc chưa đến, nhưng phúc luôn bên!'
    ];
    return loiChuc[Math.floor(Math.random() * loiChuc.length)];
  }

  if (menh_gia <= 200) {
    return `🧧 Chúc mừng! Bạn nhận được ${menh_gia.toLocaleString('vi-VN')}đ lì xì!`;
  }

  if (menh_gia <= 2000) {
    return `🎊 Tuyệt vời! Bạn nhận được ${menh_gia.toLocaleString('vi-VN')}đ lì xì!`;
  }

  if (menh_gia <= 10000) {
    return `🎆 Xuất sắc! Bạn nhận được ${menh_gia.toLocaleString('vi-VN')}đ lì xì! Năm mới phát tài!`;
  }

  if (menh_gia <= 50000) {
    return `🏮 ĐẠI PHÁT! Bạn nhận được ${menh_gia.toLocaleString('vi-VN')}đ lì xì! Tài lộc đầy nhà!`;
  }

  return `🐉 JACKPOT! 🎉🎉🎉 Bạn nhận được ${menh_gia.toLocaleString('vi-VN')}đ lì xì! CHÚC MỪNG NĂM MỚI!`;
}

// =====================================================
// API ENDPOINTS - Các đường dẫn API
// =====================================================

// ----- API RÚT THĂM LÌ XÌ (POST) -----
// Body: { cheat: true/false }
// Trả về: { thanh_cong, menh_gia, thong_diep }
app.post('/api/rut-lixi', (req, res) => {
  try {
    const { cheat } = req.body;
    const ketQua = rutThamLiXi(cheat === true);
    res.json(ketQua);
  } catch (error) {
    console.error('❌ Lỗi khi rút lì xì:', error);
    res.status(500).json({
      thanh_cong: false,
      thong_diep: 'Có lỗi xảy ra, vui lòng thử lại!'
    });
  }
});

// ----- API LẤY DANH SÁCH MỆNH GIÁ (GET) -----
// Trả về tất cả mệnh giá trong database
app.get('/api/menh-gia', (req, res) => {
  try {
    const danhSach = layTatCaMenhGia();
    res.json({ thanh_cong: true, du_lieu: danhSach });
  } catch (error) {
    console.error('❌ Lỗi khi lấy mệnh giá:', error);
    res.status(500).json({ thanh_cong: false });
  }
});

// ----- API THÊM MỆNH GIÁ MỚI (POST) -----
// Body: { menh_gia: 10000, so_luong: 5 }
app.post('/api/menh-gia', (req, res) => {
  try {
    const { menh_gia, so_luong } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (menh_gia === undefined || menh_gia < 0) {
      return res.status(400).json({
        thanh_cong: false,
        thong_diep: 'Mệnh giá không hợp lệ!'
      });
    }

    themMenhGia(menh_gia, so_luong || 1);
    res.json({
      thanh_cong: true,
      thong_diep: `Đã thêm mệnh giá ${menh_gia.toLocaleString('vi-VN')}đ!`
    });
  } catch (error) {
    console.error('❌ Lỗi khi thêm mệnh giá:', error);
    res.status(500).json({ thanh_cong: false });
  }
});

// ----- API XÓA MỆNH GIÁ (DELETE) -----
// Tham số URL: id
app.delete('/api/menh-gia/:id', (req, res) => {
  try {
    const { id } = req.params;
    xoaMenhGia(id);
    res.json({
      thanh_cong: true,
      thong_diep: 'Đã xóa mệnh giá thành công!'
    });
  } catch (error) {
    console.error('❌ Lỗi khi xóa mệnh giá:', error);
    res.status(500).json({ thanh_cong: false });
  }
});

// ----- API CẬP NHẬT SỐ LƯỢNG (PUT) -----
// Body: { so_luong: 10 }
app.put('/api/menh-gia/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { so_luong } = req.body;
    capNhatSoLuong(id, so_luong);
    res.json({
      thanh_cong: true,
      thong_diep: 'Đã cập nhật số lượng!'
    });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật:', error);
    res.status(500).json({ thanh_cong: false });
  }
});

// ----- API LẤY LỊCH SỬ RÚT LÌ XÌ (GET) -----
app.get('/api/lich-su', (req, res) => {
  try {
    const lichSu = layLichSu(20);
    res.json({ thanh_cong: true, du_lieu: lichSu });
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử:', error);
    res.status(500).json({ thanh_cong: false });
  }
});

// ----- API LẤY THỐNG KÊ (GET) -----
app.get('/api/thong-ke', (req, res) => {
  try {
    const danhSach = layTatCaMenhGia();
    const tongPhongBi = danhSach.reduce((t, i) => t + i.so_luong, 0);
    const tongTien = danhSach.reduce((t, i) => t + (i.menh_gia * i.so_luong), 0);
    res.json({
      thanh_cong: true,
      tong_phong_bi: tongPhongBi,
      tong_tien: tongTien,
      so_menh_gia: danhSach.length
    });
  } catch (error) {
    res.status(500).json({ thanh_cong: false });
  }
});

// =====================================================
// KHỞI ĐỘNG SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('');
  console.log('🧧 ==========================================');
  console.log('🏮  WEB LÌ XÌ TẾT - Rút Thăm May Mắn');
  console.log('🧧 ==========================================');
  console.log(`🌐  Trang chính: http://localhost:${PORT}`);
  console.log(`⚙️   Trang admin: http://localhost:${PORT}/admin.html`);
  console.log('🧧 ==========================================');
  console.log('');
});

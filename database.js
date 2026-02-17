// =====================================================
// DATABASE MODULE - Quản lý dữ liệu bằng file JSON
// File này chịu trách nhiệm tạo, thêm, xóa,
// và lấy dữ liệu các mệnh giá tiền lì xì
// Sử dụng file JSON để lưu trữ (đơn giản, không cần
// cài thêm thư viện database phức tạp)
// =====================================================

const fs = require('fs');
const path = require('path');

// Đường dẫn file lưu trữ dữ liệu
const DATA_PATH = path.join(__dirname, 'data');
const MENH_GIA_FILE = path.join(DATA_PATH, 'menh_gia.json');
const LICH_SU_FILE = path.join(DATA_PATH, 'lich_su.json');

// =====================================================
// TẠO THƯ MỤC VÀ FILE NẾU CHƯA CÓ
// =====================================================
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true });
}

// =====================================================
// HÀM ĐỌC/GHI FILE JSON
// =====================================================

/** Đọc dữ liệu từ file JSON */
function docFile(duongDan, macDinh = []) {
  try {
    if (fs.existsSync(duongDan)) {
      const noiDung = fs.readFileSync(duongDan, 'utf8');
      return JSON.parse(noiDung);
    }
  } catch (err) {
    console.error('❌ Lỗi đọc file:', err);
  }
  return macDinh;
}

/** Ghi dữ liệu vào file JSON */
function ghiFile(duongDan, duLieu) {
  try {
    fs.writeFileSync(duongDan, JSON.stringify(duLieu, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Lỗi ghi file:', err);
  }
}

// =====================================================
// KHỞI TẠO DỮ LIỆU MẪU - Nếu file trống thì thêm
// dữ liệu mặc định để có sẵn các mệnh giá lì xì
// =====================================================
function khoiTaoDuLieuMau() {
  const duLieuHienTai = docFile(MENH_GIA_FILE);

  if (duLieuHienTai.length === 0) {
    // Dữ liệu mẫu: mệnh giá (VNĐ) và số lượng phong bì
    const duLieuMau = [
      // Mệnh giá nhỏ (0đ - 200đ) - Tỷ lệ cao, số lượng nhiều
      { id: 1, menh_gia: 0, so_luong: 50, ngay_tao: layThoiGian() },
      { id: 2, menh_gia: 100, so_luong: 50, ngay_tao: layThoiGian() },
      { id: 3, menh_gia: 200, so_luong: 50, ngay_tao: layThoiGian() },

      // Mệnh giá trung bình (500đ - 2.000đ) - Tỷ lệ thấp hơn
      { id: 4, menh_gia: 500, so_luong: 20, ngay_tao: layThoiGian() },
      { id: 5, menh_gia: 1000, so_luong: 15, ngay_tao: layThoiGian() },
      { id: 6, menh_gia: 2000, so_luong: 10, ngay_tao: layThoiGian() },

      // Mệnh giá cao (5.000đ - 10.000đ) - Tỷ lệ thấp
      { id: 7, menh_gia: 5000, so_luong: 5, ngay_tao: layThoiGian() },
      { id: 8, menh_gia: 10000, so_luong: 3, ngay_tao: layThoiGian() },

      // Mệnh giá rất cao (20.000đ - 100.000đ) - Tỷ lệ rất thấp
      { id: 9, menh_gia: 20000, so_luong: 2, ngay_tao: layThoiGian() },
      { id: 10, menh_gia: 50000, so_luong: 1, ngay_tao: layThoiGian() },
      { id: 11, menh_gia: 100000, so_luong: 1, ngay_tao: layThoiGian() },

      // Jackpot - Mệnh giá cao nhất - Cực hiếm
      { id: 12, menh_gia: 200000, so_luong: 1, ngay_tao: layThoiGian() },
      { id: 13, menh_gia: 500000, so_luong: 1, ngay_tao: layThoiGian() },
    ];

    ghiFile(MENH_GIA_FILE, duLieuMau);
    ghiFile(LICH_SU_FILE, []);
    console.log('✅ Đã thêm dữ liệu mẫu vào database!');
  }
}

/** Lấy thời gian hiện tại dạng chuỗi */
function layThoiGian() {
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

/** Tạo ID mới (tự động tăng) */
function taoIdMoi(danhSach) {
  if (danhSach.length === 0) return 1;
  return Math.max(...danhSach.map(item => item.id)) + 1;
}

// Khởi tạo khi module được load
khoiTaoDuLieuMau();

// =====================================================
// XUẤT CÁC HÀM ĐỂ SERVER SỬ DỤNG
// =====================================================
module.exports = {
  // Lấy tất cả mệnh giá lì xì
  layTatCaMenhGia: () => {
    return docFile(MENH_GIA_FILE).sort((a, b) => a.menh_gia - b.menh_gia);
  },

  // Thêm một mệnh giá lì xì mới
  themMenhGia: (menh_gia, so_luong = 1) => {
    const danhSach = docFile(MENH_GIA_FILE);
    // Kiểm tra xem mệnh giá đã tồn tại chưa
    const viTri = danhSach.findIndex(item => item.menh_gia === menh_gia);
    if (viTri !== -1) {
      // Nếu đã tồn tại, cộng thêm số lượng
      danhSach[viTri].so_luong += so_luong;
    } else {
      // Nếu chưa có, thêm mới
      danhSach.push({
        id: taoIdMoi(danhSach),
        menh_gia: menh_gia,
        so_luong: so_luong,
        ngay_tao: layThoiGian()
      });
    }
    ghiFile(MENH_GIA_FILE, danhSach);
  },

  // Xóa một mệnh giá lì xì theo ID
  xoaMenhGia: (id) => {
    let danhSach = docFile(MENH_GIA_FILE);
    danhSach = danhSach.filter(item => item.id !== parseInt(id));
    ghiFile(MENH_GIA_FILE, danhSach);
  },

  // Cập nhật số lượng một mệnh giá
  capNhatSoLuong: (id, so_luong) => {
    const danhSach = docFile(MENH_GIA_FILE);
    const viTri = danhSach.findIndex(item => item.id === parseInt(id));
    if (viTri !== -1) {
      danhSach[viTri].so_luong = parseInt(so_luong);
      ghiFile(MENH_GIA_FILE, danhSach);
    }
  },

  // Giảm số lượng khi có người rút trúng mệnh giá đó
  giamSoLuong: (menh_gia) => {
    const danhSach = docFile(MENH_GIA_FILE);
    const viTri = danhSach.findIndex(
      item => item.menh_gia === menh_gia && item.so_luong > 0
    );
    if (viTri !== -1) {
      danhSach[viTri].so_luong -= 1;
      ghiFile(MENH_GIA_FILE, danhSach);
    }
  },

  // Lưu lịch sử rút lì xì
  luuLichSu: (menh_gia, ten_nguoi = 'Khách', la_cheat = 0) => {
    const lichSu = docFile(LICH_SU_FILE);
    lichSu.unshift({
      id: taoIdMoi(lichSu),
      menh_gia: menh_gia,
      ten_nguoi: ten_nguoi,
      thoi_gian: layThoiGian(),
      la_cheat: la_cheat
    });
    // Chỉ giữ 100 bản ghi gần nhất
    if (lichSu.length > 100) lichSu.length = 100;
    ghiFile(LICH_SU_FILE, lichSu);
  },

  // Lấy lịch sử rút lì xì
  layLichSu: (gioi_han = 10) => {
    const lichSu = docFile(LICH_SU_FILE);
    return lichSu.slice(0, gioi_han);
  },

  // Lấy mệnh giá cao nhất trong database (dùng cho cheat)
  layMenhGiaCaoNhat: () => {
    const danhSach = docFile(MENH_GIA_FILE)
      .filter(item => item.so_luong > 0)
      .sort((a, b) => b.menh_gia - a.menh_gia);
    return danhSach.length > 0 ? danhSach[0] : null;
  },

  // Lấy tất cả mệnh giá còn phong bì (số lượng > 0)
  layMenhGiaConPhongBi: () => {
    return docFile(MENH_GIA_FILE)
      .filter(item => item.so_luong > 0)
      .sort((a, b) => a.menh_gia - b.menh_gia);
  }
};

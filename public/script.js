// =====================================================
// SCRIPT CHÍNH - Logic Frontend Web Lì Xì Tết
// Bao gồm:
// - Hiệu ứng rơi (tiền, hoa, lá)
// - Logic rút thăm lì xì
// - Hiệu ứng pháo hoa khi trúng giải lớn
// - Nút cheat ẩn
// - Cập nhật lịch sử rút
// =====================================================

// =====================================================
// BIẾN TOÀN CỤC
// =====================================================

// Trạng thái đang rút thăm (tránh spam click)
let dangRutTham = false;

// Địa chỉ API backend
const API_URL = '';

// =====================================================
// HIỆU ỨNG RƠI - Tạo icon tiền, hoa, lá rơi như tuyết
// 
// Nguyên lý: Tạo liên tục các phần tử HTML có icon,
// đặt vị trí ngẫu nhiên trên đỉnh màn hình,
// dùng CSS animation để chúng rơi xuống dưới
// =====================================================

// Danh sách các icon sẽ rơi - Chủ đề Tết Việt Nam
const danhSachIcon = [
  '💰', // Túi tiền
  '🧧', // Phong bì đỏ
  '💵', // Tiền giấy
  '🪙', // Đồng xu
  '🌸', // Hoa đào (miền Bắc)
  '🌺', // Hoa mai (miền Nam)
  '🍀', // Cỏ 4 lá may mắn
  '🎋', // Cây tre - Tết
  '🎍', // Cây tùng
  '🏮', // Đèn lồng
  '✨', // Ánh sáng lấp lánh
  '🎊', // Confetti
  '🎆', // Pháo hoa
  '🌿', // Lá xanh
  '🍃', // Lá rơi
  '🎐', // Chuông gió
  '💮', // Hoa trắng
  '🐍', // Con rắn (Năm Tỵ)
];

/**
 * TẠO MỘT VẬT RƠI
 * Hàm này tạo một phần tử HTML chứa icon ngẫu nhiên,
 * đặt nó ở vị trí ngẫu nhiên trên đỉnh màn hình,
 * với tốc độ rơi và kích thước ngẫu nhiên
 */
function taoVatRoi() {
  // Lấy container chứa các vật rơi
  const container = document.getElementById('hieu-ung-roi');

  // Tạo phần tử span mới
  const vatRoi = document.createElement('span');
  vatRoi.classList.add('vat-roi');

  // Chọn icon ngẫu nhiên từ danh sách
  const iconNgauNhien = danhSachIcon[Math.floor(Math.random() * danhSachIcon.length)];
  vatRoi.textContent = iconNgauNhien;

  // Vị trí ngang ngẫu nhiên (0% đến 100% chiều rộng)
  vatRoi.style.left = Math.random() * 100 + '%';

  // Kích thước ngẫu nhiên (nhỏ đến lớn)
  const kichThuoc = 0.8 + Math.random() * 1.5; // 0.8em đến 2.3em
  vatRoi.style.fontSize = kichThuoc + 'em';

  // Tốc độ rơi ngẫu nhiên (chậm đến nhanh)
  const tocDoRoi = 5 + Math.random() * 10; // 5s đến 15s
  vatRoi.style.animationDuration = tocDoRoi + 's';

  // Độ trễ khởi động ngẫu nhiên (để không rơi cùng lúc)
  vatRoi.style.animationDelay = Math.random() * 3 + 's';

  // Độ mờ ngẫu nhiên (mờ đến rõ)
  vatRoi.style.opacity = 0.3 + Math.random() * 0.5;

  // Thêm vào container
  container.appendChild(vatRoi);

  // Tự động xóa sau khi rơi xong (tránh tốn bộ nhớ)
  setTimeout(() => {
    if (vatRoi.parentNode) {
      vatRoi.remove();
    }
  }, (tocDoRoi + 3) * 1000);
}

/**
 * BẮT ĐẦU HIỆU ỨNG RƠI
 * Tạo vật rơi liên tục mỗi 300ms
 * và tạo sẵn một vài vật để có ngay khi mở trang
 */
function batDauHieuUngRoi() {
  // Tạo sẵn 15 vật rơi ban đầu
  for (let i = 0; i < 15; i++) {
    setTimeout(taoVatRoi, i * 200);
  }

  // Tiếp tục tạo vật rơi mỗi 400ms
  setInterval(taoVatRoi, 400);
}

// =====================================================
// RÚT THĂM LÌ XÌ - Gọi API và hiển thị kết quả
// =====================================================

/**
 * HÀM RÚT LÌ XÌ CHÍNH
 * @param {boolean} cheat - True nếu dùng nút cheat ẩn
 * 
 * Quy trình:
 * 1. Kiểm tra đang rút chưa (tránh spam)
 * 2. Hiệu ứng mở phong bì (animation)
 * 3. Gọi API backend để rút thăm
 * 4. Hiển thị kết quả
 * 5. Nếu trúng lớn → bắn pháo hoa
 * 6. Cập nhật lịch sử
 */
async function rutLiXi(cheat = false) {
  // Tránh spam click - nếu đang rút thì bỏ qua
  if (dangRutTham) return;
  dangRutTham = true;

  // Lấy các phần tử HTML cần thao tác
  const phongBi = document.getElementById('nut-rut-lixi');
  const ketQua = document.getElementById('ket-qua');
  const soTien = document.getElementById('so-tien');
  const loiChuc = document.getElementById('loi-chuc');
  const nutRutLai = document.getElementById('nut-rut-lai');

  // Ẩn kết quả cũ và nút rút lại
  ketQua.classList.add('an');
  nutRutLai.classList.add('an');

  // Hiệu ứng mở phong bì (rung lắc 0.8s)
  phongBi.classList.add('dang-mo');

  try {
    // -----------------------------------------------
    // GỌI API BACKEND - Gửi yêu cầu rút thăm
    // Nếu cheat = true → backend sẽ trả mệnh giá cao nhất
    // -----------------------------------------------
    const response = await fetch(`${API_URL}/api/rut-lixi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cheat: cheat })
    });

    const data = await response.json();

    // Đợi animation phong bì xong (0.8s)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Xóa animation mở phong bì
    phongBi.classList.remove('dang-mo');

    if (data.thanh_cong) {
      // -----------------------------------------------
      // HIỂN THỊ KẾT QUẢ
      // -----------------------------------------------
      
      // Định dạng số tiền với dấu chấm phân cách
      const tienDinhDang = data.menh_gia.toLocaleString('vi-VN');
      
      // Hiển thị số tiền
      soTien.textContent = `${tienDinhDang} đ`;
      
      // Hiển thị lời chúc
      loiChuc.textContent = data.thong_diep;

      // Hiển thị khung kết quả
      ketQua.classList.remove('an');

      // Hiển thị nút rút lại
      nutRutLai.classList.remove('an');

      // -----------------------------------------------
      // HIỆU ỨNG ĐẶC BIỆT THEO MỨC TIỀN
      // Trúng >= 5000đ → bắn pháo hoa
      // Trúng >= 50000đ → bắn confetti + pháo hoa
      // -----------------------------------------------
      if (data.menh_gia >= 50000) {
        // JACKPOT! Hiệu ứng hoành tráng
        banPhaoHoa(5); // 5 đợt pháo hoa
        banConfetti(100); // 100 confetti
      } else if (data.menh_gia >= 10000) {
        // Giải lớn - Pháo hoa vừa
        banPhaoHoa(3);
        banConfetti(50);
      } else if (data.menh_gia >= 5000) {
        // Giải khá - Pháo hoa nhẹ
        banPhaoHoa(1);
      }

      // Cập nhật số phong bì còn lại
      capNhatThongKe();

      // Cập nhật lịch sử
      capNhatLichSu();

    } else {
      // Hết phong bì
      soTien.textContent = '😢';
      loiChuc.textContent = data.thong_diep;
      ketQua.classList.remove('an');
    }

  } catch (error) {
    // Lỗi kết nối
    console.error('Lỗi:', error);
    phongBi.classList.remove('dang-mo');
    soTien.textContent = '❌';
    loiChuc.textContent = 'Không kết nối được server! Hãy chắc chắn server đang chạy.';
    ketQua.classList.remove('an');
  }

  // Cho phép rút lại sau 1 giây
  setTimeout(() => {
    dangRutTham = false;
  }, 1000);
}

/**
 * RÚT LẠI - Reset giao diện để rút thêm lần nữa
 */
function rutLai() {
  const ketQua = document.getElementById('ket-qua');
  const nutRutLai = document.getElementById('nut-rut-lai');
  
  // Ẩn kết quả và nút rút lại
  ketQua.classList.add('an');
  nutRutLai.classList.add('an');
}

// =====================================================
// PHÁO HOA - Hiệu ứng khi trúng giải lớn
// Tạo các hạt bay ra từ một điểm trung tâm
// =====================================================

/**
 * BẮN PHÁO HOA
 * @param {number} soDot - Số đợt pháo hoa
 */
function banPhaoHoa(soDot = 1) {
  const container = document.getElementById('phao-hoa');
  
  for (let dot = 0; dot < soDot; dot++) {
    setTimeout(() => {
      // Vị trí trung tâm ngẫu nhiên
      const tamX = 20 + Math.random() * 60; // 20% đến 80% chiều rộng
      const tamY = 20 + Math.random() * 40; // 20% đến 60% chiều cao

      // Tạo 30 hạt pháo hoa mỗi đợt
      for (let i = 0; i < 30; i++) {
        const hat = document.createElement('div');
        hat.classList.add('phao-hoa-hat');

        // Vị trí bắt đầu = tâm
        hat.style.left = tamX + '%';
        hat.style.top = tamY + '%';

        // Hướng bay ngẫu nhiên (360 độ)
        const goc = (i / 30) * 360;
        const khoangCach = 80 + Math.random() * 150;
        const x = Math.cos(goc * Math.PI / 180) * khoangCach;
        const y = Math.sin(goc * Math.PI / 180) * khoangCach;

        hat.style.setProperty('--x', x + 'px');
        hat.style.setProperty('--y', y + 'px');

        // Màu ngẫu nhiên (vàng, đỏ, cam, hồng)
        const mauSac = [
          '#FFD700', '#FF4444', '#FF6B6B', '#FFA500',
          '#FF69B4', '#FFFF00', '#FF1493', '#FFC0CB'
        ];
        hat.style.backgroundColor = mauSac[Math.floor(Math.random() * mauSac.length)];
        hat.style.boxShadow = `0 0 6px ${hat.style.backgroundColor}`;

        container.appendChild(hat);

        // Xóa sau 2 giây
        setTimeout(() => hat.remove(), 2000);
      }
    }, dot * 500); // Mỗi đợt cách nhau 500ms
  }
}

/**
 * BẮN CONFETTI - Giấy confetti bay tung tóe
 * @param {number} soLuong - Số lượng confetti
 */
function banConfetti(soLuong = 50) {
  for (let i = 0; i < soLuong; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

      // Vị trí bắt đầu ngẫu nhiên trên đỉnh
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';

      // Hình dạng ngẫu nhiên (vuông hoặc tròn)
      const hinhDang = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.borderRadius = hinhDang;

      // Kích thước ngẫu nhiên
      const kichThuoc = 5 + Math.random() * 10;
      confetti.style.width = kichThuoc + 'px';
      confetti.style.height = kichThuoc + 'px';

      // Màu ngẫu nhiên
      const mauSac = [
        '#FFD700', '#FF4444', '#FF6B6B', '#4CAF50',
        '#2196F3', '#FF9800', '#E91E63', '#9C27B0'
      ];
      confetti.style.backgroundColor = mauSac[Math.floor(Math.random() * mauSac.length)];

      // Tốc độ rơi ngẫu nhiên
      confetti.style.animationDuration = (2 + Math.random() * 3) + 's';

      document.body.appendChild(confetti);

      // Xóa sau 5 giây
      setTimeout(() => confetti.remove(), 5000);
    }, i * 30); // Mỗi confetti cách nhau 30ms
  }
}

// =====================================================
// CẬP NHẬT THỐNG KÊ - Số phong bì còn lại
// =====================================================
async function capNhatThongKe() {
  try {
    const response = await fetch(`${API_URL}/api/thong-ke`);
    const data = await response.json();

    if (data.thanh_cong) {
      const soPhongBi = document.getElementById('so-phong-bi');
      soPhongBi.innerHTML = `📦 Còn lại: <strong>${data.tong_phong_bi}</strong> phong bì | 💰 Tổng: <strong>${data.tong_tien.toLocaleString('vi-VN')}đ</strong>`;
    }
  } catch (error) {
    console.error('Lỗi cập nhật thống kê:', error);
  }
}

// =====================================================
// CẬP NHẬT LỊCH SỬ - Hiển thị các lần rút gần nhất
// =====================================================
async function capNhatLichSu() {
  try {
    const response = await fetch(`${API_URL}/api/lich-su`);
    const data = await response.json();

    if (data.thanh_cong) {
      const danhSach = document.getElementById('danh-sach-lich-su');
      
      if (data.du_lieu.length === 0) {
        danhSach.innerHTML = '<p style="text-align:center; opacity:0.5;">Chưa có ai rút lì xì</p>';
        return;
      }

      // Tạo HTML cho từng dòng lịch sử
      danhSach.innerHTML = data.du_lieu.map(item => {
        // Icon theo mệnh giá
        let icon = '🧧';
        if (item.menh_gia >= 50000) icon = '🐉';
        else if (item.menh_gia >= 10000) icon = '🏮';
        else if (item.menh_gia >= 5000) icon = '🎆';
        else if (item.menh_gia >= 500) icon = '🎊';
        else if (item.menh_gia === 0) icon = '🎋';

        // Đánh dấu nếu là cheat
        const cheatTag = item.la_cheat ? ' ⭐' : '';

        return `
          <div class="lich-su-item">
            <span>${icon} ${item.ten_nguoi}${cheatTag}</span>
            <span class="lich-su-tien">${item.menh_gia.toLocaleString('vi-VN')}đ</span>
            <span class="lich-su-thoi-gian">${item.thoi_gian}</span>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Lỗi cập nhật lịch sử:', error);
  }
}

// =====================================================
// KHỞI CHẠY - Khi trang web tải xong
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Bắt đầu hiệu ứng rơi
  batDauHieuUngRoi();

  // 2. Cập nhật thống kê ban đầu
  capNhatThongKe();

  // 3. Cập nhật lịch sử ban đầu
  capNhatLichSu();

  // 4. Log thông tin nút cheat cho dev biết
  console.log('🎮 Mẹo: Có 2 nút cheat ẩn ở góc PHẢI TRÊN và góc TRÁI DƯỚI màn hình!');
  console.log('👆 Nhấn vào đó để luôn trúng JACKPOT!');
});

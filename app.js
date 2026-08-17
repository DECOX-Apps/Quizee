// ===== TRẠNG THÁI TRÒ CHƠI =====
let danhSachHienTai = [];
let viTriHienTai = 0;
let soCauDung = 0;
let soCauSai = 0;
let soCauBoQua = 0;
let tenCuaNguoiChoi = "";
let thoiGianBatDau = 0;
let dangPhatNhac = false;

// Bộ đếm giờ (đã chuyển sang dùng CSS transform + 1 timeout duy nhất thay vì setInterval liên tục,
// giúp trình duyệt giao việc animate cho GPU thay vì tính toán layout mỗi 100ms)
let dongHoDemNguoc;
let henGioCanhBao1;
let henGioCanhBao2;
let thoiGianChuyenCau;
const THOI_GIAN_MOI_CAU = 20; // giây (giữ nguyên tổng thời gian như bản gốc: 0.5% mỗi 100ms x 200 lần)

// Debounce cho việc tự căn chỉnh kích thước khi xoay màn hình / đổi cỡ cửa sổ
let henGioCanChinh;

function batTatNhac() {
    const nhac = document.getElementById('nhac-nen');
    const nut = document.getElementById('nut-am-nhac');
    if (dangPhatNhac) {
        nhac.pause();
        nut.innerText = "🎵 Bật nhạc";
    } else {
        nhac.play().catch(() => alert("Vui lòng chạm vào màn hình!"));
        nut.innerText = "🔇 Dừng nhạc";
    }
    dangPhatNhac = !dangPhatNhac;
}

function xaoTronDapAn(cauHoi) {
    if (cauHoi.t === "mcq") {
        let dapAnDung = cauHoi.o[cauHoi.c];
        let mangDapAn = [...cauHoi.o];
        for (let i = mangDapAn.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mangDapAn[i], mangDapAn[j]] = [mangDapAn[j], mangDapAn[i]];
        }
        cauHoi.c = mangDapAn.indexOf(dapAnDung);
        cauHoi.o = mangDapAn;
    }
    return cauHoi;
}

function batDauTroChoi() {
    tenCuaNguoiChoi = document.getElementById('ten-nguoi-choi').value.trim();
    if (!tenCuaNguoiChoi) return alert("Enter Name");

    // Đặt lại toàn bộ trạng thái mỗi lần bắt đầu (cần thiết vì giờ là 1 trang duy nhất,
    // không còn tải lại trang giữa các lượt chơi như bản 2-trang trước đây)
    viTriHienTai = 0;
    soCauDung = 0;
    soCauSai = 0;
    soCauBoQua = 0;

    danhSachHienTai = [...tapHopCauHoi].sort(() => Math.random() - 0.5).map(xaoTronDapAn);
    thoiGianBatDau = Date.now();

    document.getElementById('bang-dang-nhap').classList.remove('hien-thi');
    document.getElementById('bang-cau-hoi').classList.add('hien-thi');
    taiCauHoiHienTai();
}

function taiCauHoiHienTai() {
    dungDongHo();
    if (viTriHienTai >= danhSachHienTai.length) return ketThucTroChoi();

    const cauHoi = danhSachHienTai[viTriHienTai];
    document.getElementById('van-ban-tien-do').innerText = `CÂU ${viTriHienTai + 1} / ${danhSachHienTai.length}`;

    // Ép hiệu ứng xuất hiện chạy lại cho câu hỏi mới (xoá rồi ép reflow rồi thêm lại class)
    const tieuDe = document.getElementById('tieu-de-cau-hoi');
    tieuDe.classList.remove('hieu-ung-vao');
    void tieuDe.offsetWidth;
    tieuDe.innerText = cauHoi.q;
    tieuDe.classList.add('hieu-ung-vao');

    const vanBanTrangThai = document.getElementById('van-ban-trang-thai');
    vanBanTrangThai.innerText = "";

    const khuVuc = document.getElementById('khu-vuc-dap-an');
    khuVuc.innerHTML = "";

    if (cauHoi.t === "mcq") {
        cauHoi.o.forEach((luaChon, viTri) => {
            const nutBam = document.createElement('button');
            nutBam.className = 'nut-chon';
            nutBam.innerText = luaChon;
            nutBam.style.animationDelay = (viTri * 0.07) + 's'; // xuất hiện lần lượt từng nút
            nutBam.onclick = () => kiemTraTracNghiem(viTri, cauHoi.c);
            khuVuc.appendChild(nutBam);
        });
    } else {
        const hopVanBan = document.createElement('input');
        hopVanBan.type = "text";
        hopVanBan.placeholder = "Enter Answer...";
        hopVanBan.className = 'hieu-ung-vao';

        const nutNop = document.createElement('button');
        nutNop.className = 'nut-hanh-dong hieu-ung-vao';
        nutNop.style.animationDelay = '0.08s';
        nutNop.innerText = "Nộp Câu Trả Lời";
        nutNop.onclick = () => kiemTraTuLuan(hopVanBan.value, cauHoi.a);

        khuVuc.appendChild(hopVanBan);
        khuVuc.appendChild(nutNop);
        hopVanBan.focus();
    }

    document.getElementById('nut-bo-qua').disabled = false;
    kichHoatDongHo();
}

// Dừng đồng hồ đếm ngược và "đóng băng" thanh thời gian đúng tại vị trí hiện tại
// (thay vì để hiệu ứng CSS tự chạy tiếp tới 0 sau khi người chơi đã trả lời xong)
function dungDongHo() {
    clearTimeout(dongHoDemNguoc);
    clearTimeout(henGioCanhBao1);
    clearTimeout(henGioCanhBao2);
    const thanhThoiGian = document.getElementById('thanh-thoi-gian');
    if (thanhThoiGian) {
        const transformHienTai = getComputedStyle(thanhThoiGian).transform;
        thanhThoiGian.style.transition = 'none';
        thanhThoiGian.style.transform = transformHienTai;
    }
}

function kichHoatDongHo() {
    const thanhThoiGian = document.getElementById('thanh-thoi-gian');
    dungDongHo();
    thanhThoiGian.classList.remove('canh-bao', 'nguy-hiem');

    // Đặt lại về đầy 100% ngay lập tức, không hiệu ứng
    thanhThoiGian.style.transition = 'none';
    thanhThoiGian.style.transform = 'scaleX(1)';
    void thanhThoiGian.offsetWidth; // ép reflow 1 lần để hiệu ứng bên dưới chạy đúng từ đầu

    // Từ đây giao cho GPU: chỉ animate "transform", không đụng tới "width" (tránh layout liên tục)
    thanhThoiGian.style.transition = `transform ${THOI_GIAN_MOI_CAU}s linear, background-color 0.4s ease`;
    thanhThoiGian.style.transform = 'scaleX(0)';

    henGioCanhBao1 = setTimeout(() => thanhThoiGian.classList.add('canh-bao'), THOI_GIAN_MOI_CAU * 500);
    henGioCanhBao2 = setTimeout(() => thanhThoiGian.classList.add('nguy-hiem'), THOI_GIAN_MOI_CAU * 750);
    dongHoDemNguoc = setTimeout(() => boQuaCauHoi(true), THOI_GIAN_MOI_CAU * 1000);
}

function boQuaCauHoi(hetGio = false) {
    dungDongHo();
    khoaTatCaNut();
    soCauBoQua++;
    const vanBanTrangThai = document.getElementById('van-ban-trang-thai');
    if (hetGio) {
        vanBanTrangThai.innerText = "Hết Giờ!";
        vanBanTrangThai.style.color = "var(--mau-sai)";
    } else {
        vanBanTrangThai.innerText = "Đã Bỏ Qua!";
        vanBanTrangThai.style.color = "var(--mau-canh-bao)";
    }
    thoiGianChuyenCau = setTimeout(chuyenCauTiepTheo, 1500);
}

function kiemTraTracNghiem(viTriChon, viTriDung) {
    dungDongHo();
    khoaTatCaNut();
    const danhSachNut = document.querySelectorAll('.nut-chon');
    const vanBanTrangThai = document.getElementById('van-ban-trang-thai');

    if (viTriChon === viTriDung) {
        danhSachNut[viTriChon].classList.add('chon-dung');
        soCauDung++;
        vanBanTrangThai.innerText = "Chính Xác! ";
        vanBanTrangThai.style.color = "var(--mau-dung)";
    } else {
        danhSachNut[viTriChon].classList.add('chon-sai');
        danhSachNut[viTriDung].classList.add('chon-dung');
        soCauSai++;
        vanBanTrangThai.innerText = "Sai!";
        vanBanTrangThai.style.color = "var(--mau-sai)";
    }
    thoiGianChuyenCau = setTimeout(chuyenCauTiepTheo, 2000);
}

function kiemTraTuLuan(giaTriNhap, danhSachDapAn) {
    dungDongHo();
    khoaTatCaNut();
    const tuKhoa = giaTriNhap.trim().toLowerCase();
    const vanBanTrangThai = document.getElementById('van-ban-trang-thai');

    if (danhSachDapAn.some(dapAn => tuKhoa.includes(dapAn.toLowerCase()))) {
        soCauDung++;
        vanBanTrangThai.innerText = "Chính xác!";
        vanBanTrangThai.style.color = "var(--mau-dung)";
    } else {
        soCauSai++;
        vanBanTrangThai.innerText = `Sai, đáp án là: ${danhSachDapAn[0]}`;
        vanBanTrangThai.style.color = "var(--mau-sai)";
    }
    thoiGianChuyenCau = setTimeout(chuyenCauTiepTheo, 2000);
}

function khoaTatCaNut() {
    document.querySelectorAll('.nut-chon, .nut-hanh-dong').forEach(nut => nut.disabled = true);
}

function chuyenCauTiepTheo() {
    viTriHienTai++;
    taiCauHoiHienTai();
}

function ketThucTroChoi() {
    const diemSoCuoiCung = Math.round((soCauDung / danhSachHienTai.length) * 100);
    const thoiGianHoanThanh = Math.floor((Date.now() - thoiGianBatDau) / 1000);

    document.getElementById('bang-cau-hoi').classList.remove('hien-thi');
    document.getElementById('bang-ket-qua').classList.add('hien-thi');

    hienThiKetQua(diemSoCuoiCung, soCauDung, soCauSai, soCauBoQua, thoiGianHoanThanh);
    chayHieuUngPhaoHoa();
}

function hienThiKetQua(diem, dung, sai, boQua, thoiGian) {
    demSoDiem(document.getElementById('diem-so-cuoi-cung'), diem);
    document.getElementById('chi-tiet-thong-ke').innerHTML = `
        Đúng: <b>${dung}</b> câu <br>
        Sai: <b>${sai}</b> câu <br>
        Bỏ qua: <b>${boQua}</b> câu <br>
        Thoi gian: <b>${thoiGian}</b> giây
    `;
}

// Hiệu ứng đếm số điểm chạy dần lên (dùng requestAnimationFrame, mượt và nhẹ cho phần cứng)
function demSoDiem(phanTu, giaTriDich, thoiLuong = 1200) {
    const batDau = performance.now();
    function buoc(hienTai) {
        const tienDo = Math.min((hienTai - batDau) / thoiLuong, 1);
        const eased = 1 - Math.pow(1 - tienDo, 3); // ease-out
        phanTu.innerText = Math.round(eased * giaTriDich) + "D";
        if (tienDo < 1) requestAnimationFrame(buoc);
    }
    requestAnimationFrame(buoc);
}

function choiLaiTuDau() {
    viTriHienTai = 0;
    soCauDung = 0;
    soCauSai = 0;
    soCauBoQua = 0;
    danhSachHienTai = [];
    const oTen = document.getElementById('ten-nguoi-choi');
    if (oTen) oTen.value = '';
    document.getElementById('bang-ket-qua').classList.remove('hien-thi');
    document.getElementById('bang-dang-nhap').classList.add('hien-thi');
}

// ===== HIỆU ỨNG PHÁO HOA GIẤY KHI HOÀN THÀNH (canvas + requestAnimationFrame) =====
function chayHieuUngPhaoHoa() {
    const canvas = document.getElementById('phao-hoa');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const chieuRong = canvas.width;
    const chieuCao = canvas.height;
    const mauSac = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#fbbf24'];
    const soManh = 150;
    const cacManh = Array.from({ length: soManh }, () => ({
        x: Math.random() * chieuRong,
        y: -20 - Math.random() * chieuCao * 0.6,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        mau: mauSac[Math.floor(Math.random() * mauSac.length)],
        vy: 2.5 + Math.random() * 3,
        vx: -2 + Math.random() * 4,
        goc: Math.random() * 360,
        vGoc: -8 + Math.random() * 16
    }));

    let batDauLuc = null;
    const THOI_LUONG_MS = 3200;

    function ve(hienTai) {
        if (batDauLuc === null) batDauLuc = hienTai;
        const troiQua = hienTai - batDauLuc;
        ctx.clearRect(0, 0, chieuRong, chieuCao);
        cacManh.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;
            m.vy += 0.02;
            m.goc += m.vGoc;
            ctx.save();
            ctx.translate(m.x, m.y);
            ctx.rotate(m.goc * Math.PI / 180);
            ctx.fillStyle = m.mau;
            ctx.fillRect(-m.w / 2, -m.h / 2, m.w, m.h);
            ctx.restore();
        });
        if (troiQua < THOI_LUONG_MS) {
            requestAnimationFrame(ve);
        } else {
            ctx.clearRect(0, 0, chieuRong, chieuCao);
        }
    }
    requestAnimationFrame(ve);
}

// ===== HÀM TỰ CĂN CHỈNH: đảm bảo canvas luôn khớp kích thước màn hình =====
// (phù hợp mọi loại thiết bị: điện thoại, máy tính bảng, desktop, kể cả khi xoay ngang/dọc)
function canChinhKichThuoc() {
    const canvas = document.getElementById('phao-hoa');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
function xuLyThayDoiKichThuoc() {
    clearTimeout(henGioCanChinh);
    henGioCanChinh = setTimeout(canChinhKichThuoc, 150);
}
window.addEventListener('resize', xuLyThayDoiKichThuoc);
window.addEventListener('orientationchange', canChinhKichThuoc);
canChinhKichThuoc();

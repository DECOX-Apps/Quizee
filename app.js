let danhSachHienTai = [];
let viTriHienTai = 0;
let soCauDung = 0;
let soCauSai = 0;
let soCauBoQua = 0;
let cheDoCoDinh = false;
let thoiGianBatDau = 0;
let dangPhatNhac = false;
let dongHoDemNguoc;
let henGioCanhBao1;
let henGioCanhBao2;
let thoiGianChuyenCau;
const THOI_GIAN_MOI_CAU = 20;
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

function batDauTroChoi(nguon, coDinh) {
    viTriHienTai = 0;
    soCauDung = 0;
    soCauSai = 0;
    soCauBoQua = 0;
    cheDoCoDinh = !!coDinh;

    const ban = nguon.map(c => ({ ...c, o: c.o ? [...c.o] : c.o }));
    danhSachHienTai = coDinh ? ban : ban.sort(() => Math.random() - 0.5).map(xaoTronDapAn);
    thoiGianBatDau = Date.now();

    document.getElementById('bang-dang-nhap').classList.remove('hien-thi');
    document.getElementById('bang-nhap-ma').classList.remove('hien-thi');
    document.getElementById('bang-cau-hoi').classList.add('hien-thi');
    taiCauHoiHienTai();
}

function tiepTucDoVui() {
    batDauTroChoi(tapHopCauHoi, false);
}

function moOMaCode() {
    document.getElementById('bang-dang-nhap').classList.remove('hien-thi');
    document.getElementById('bang-nhap-ma').classList.add('hien-thi');
    const o = document.getElementById('o-nhap-ma');
    o.value = '';
    o.focus();
}

function quayLaiMenu() {
    document.getElementById('bang-nhap-ma').classList.remove('hien-thi');
    document.getElementById('bang-dang-nhap').classList.add('hien-thi');
}

function xacNhanMa() {
    const ma = document.getElementById('o-nhap-ma').value.trim();
    if (ma === "037217") {
        batDauTroChoi(boCauHoiSoSanh, true);
    } else {
        alert("Mã không đúng!");
    }
}

function taiCauHoiHienTai() {
    dungDongHo();
    if (viTriHienTai >= danhSachHienTai.length) return ketThucTroChoi();

    const cauHoi = danhSachHienTai[viTriHienTai];
    document.getElementById('van-ban-tien-do').innerText = `CÂU ${viTriHienTai + 1} / ${danhSachHienTai.length}`;
    const tieuDe = document.getElementById('tieu-de-cau-hoi');
    tieuDe.classList.remove('hieu-ung-vao');
    void tieuDe.offsetWidth;
    tieuDe.innerText = cauHoi.q;
    tieuDe.classList.add('hieu-ung-vao');

    const vanBanTrangThai = document.getElementById('van-ban-trang-thai');
    vanBanTrangThai.innerText = "";
    document.getElementById('khung-giai-thich').innerHTML = "";

    const khuVuc = document.getElementById('khu-vuc-dap-an');
    khuVuc.innerHTML = "";

    if (cauHoi.t === "mcq") {
        cauHoi.o.forEach((luaChon, viTri) => {
            const nutBam = document.createElement('button');
            nutBam.className = 'nut-chon';
            nutBam.innerText = luaChon;
            nutBam.style.animationDelay = (viTri * 0.07) + 's';
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
    thanhThoiGian.style.transition = 'none';
    thanhThoiGian.style.transform = 'scaleX(1)';
    void thanhThoiGian.offsetWidth;
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
    if (!hienGiaiThich(-1)) thoiGianChuyenCau = setTimeout(chuyenCauTiepTheo, 1500);
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
    if (!hienGiaiThich(viTriChon)) thoiGianChuyenCau = setTimeout(chuyenCauTiepTheo, 2000);
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

function hienGiaiThich(viTriChon) {
    const cauHoi = danhSachHienTai[viTriHienTai];
    if (!cauHoi || !cauHoi.e) return false;
    const khung = document.getElementById('khung-giai-thich');
    const dapAnDung = cauHoi.o[cauHoi.c];
    let dongChon;
    if (viTriChon < 0) {
        dongChon = '<p class="gt-chon gt-bo">Bạn chưa chọn đáp án nào.</p>';
    } else if (viTriChon === cauHoi.c) {
        dongChon = `<p class="gt-chon gt-dung">✅ Bạn chọn <b>${cauHoi.o[viTriChon]}</b> — chính xác!</p>`;
    } else {
        dongChon = `<p class="gt-chon gt-sai">❌ Bạn chọn <b>${cauHoi.o[viTriChon]}</b> — chưa đúng.</p>`;
    }
    khung.innerHTML = `${dongChon}<p>Đáp án đúng: <b>${dapAnDung}</b></p><p>💡 ${cauHoi.e}</p>`;
    const nutTiep = document.createElement('button');
    nutTiep.className = 'nut-hanh-dong';
    nutTiep.innerText = viTriHienTai + 1 >= danhSachHienTai.length ? 'Xem kết quả' : 'Câu tiếp theo →';
    nutTiep.addEventListener('click', () => {
        clearTimeout(thoiGianChuyenCau);
        chuyenCauTiepTheo();
    });
    khung.appendChild(nutTiep);
    khung.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return true;
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
function demSoDiem(phanTu, giaTriDich, thoiLuong = 1200) {
    const batDau = performance.now();
    function buoc(hienTai) {
        const tienDo = Math.min((hienTai - batDau) / thoiLuong, 1);
        const eased = 1 - Math.pow(1 - tienDo, 3);
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
    document.getElementById('bang-ket-qua').classList.remove('hien-thi');
    document.getElementById('bang-dang-nhap').classList.add('hien-thi');
}
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

function ganSuKien() {
    const gan = (id, ham) => {
        const nut = document.getElementById(id);
        if (nut) nut.addEventListener('click', ham);
    };
    gan('nut-tiep-tuc', tiepTucDoVui);
    gan('nut-nhap-ma', moOMaCode);
    gan('nut-xac-nhan', xacNhanMa);
    gan('nut-quay-lai', quayLaiMenu);
    const o = document.getElementById('o-nhap-ma');
    if (o) o.addEventListener('keydown', e => { if (e.key === 'Enter') xacNhanMa(); });
}
ganSuKien();

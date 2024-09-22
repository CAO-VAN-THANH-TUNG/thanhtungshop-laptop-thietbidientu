var nameProduct, maProduct, sanPhamHienTai; // Tên sản phẩm trong trang này, 
// là biến toàn cục để có thể dùng ở bát cứ đâu trong trang
// không cần tính toán lấy tên từ url nhiều lần

window.onload = function () {
    khoiTao();

    // thêm tags (từ khóa) vào khung tìm kiếm
    var tags = ["mouse", "laptop", "Keyboard", ];
    for (var t of tags) addTags(t, "index.html?search=" + t, true);

    phanTich_URL_chiTietSanPham();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // Thêm gợi ý sản phẩm
    sanPhamHienTai && suggestion();
}

function khongTimThaySanPham() {
    document.getElementById('productNotFound').style.display = 'block';
    document.getElementsByClassName('chitietSanpham')[0].style.display = 'none';
}

function removeVietnameseTones(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}
function phanTich_URL_chiTietSanPham() {
    nameProduct = window.location.href.split('?')[1]; // lấy tên sản phẩm từ URL
    if (!nameProduct) return khongTimThaySanPham();

    // Chuẩn hóa tên sản phẩm từ URL
    nameProduct = nameProduct.split('-').join(' ');
    nameProduct = removeVietnameseTones(nameProduct.trim()); // Loại bỏ dấu tiếng Việt và loại bỏ khoảng trắng thừa

    // Tìm kiếm sản phẩm theo tên đã chuẩn hóa
    console.log("Tên sản phẩm từ URL:", nameProduct);

    for (var p of list_products) {
        console.log("So sánh với sản phẩm:", p.name);
        if (removeVietnameseTones(p.name) === nameProduct || p.name === nameProduct) {
            maProduct = p.masp;
            break;
        }
    }
    

    sanPhamHienTai = timKiemTheoMa(list_products, maProduct);
    if (!sanPhamHienTai) return khongTimThaySanPham();

    var divChiTiet = document.getElementsByClassName('chitietSanpham')[0];

    // Đổi title
    document.title = nameProduct + ' - Thế giới điện thoại';

    // Cập nhật tên h1
    var h1 = divChiTiet.getElementsByTagName('h1')[0];
    h1.innerHTML = nameProduct;

    // Cập nhật sao
    var rating = "";
    if (sanPhamHienTai.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            if (i <= sanPhamHienTai.star) {
                rating += `<i class="fa fa-star"></i>`;
            } else {
                rating += `<i class="fa fa-star-o"></i>`;
            }
        }
        rating += `<span> ` + sanPhamHienTai.rateCount + ` đánh giá</span>`;
    }
    divChiTiet.getElementsByClassName('rating')[0].innerHTML = rating;

    // Cập nhật giá và khuyến mãi
    var price = divChiTiet.getElementsByClassName('area_price')[0];
    if (sanPhamHienTai.promo.name !== 'giareonline') {
        price.innerHTML = `<strong>` + sanPhamHienTai.price + `₫</strong>`;
        price.innerHTML += new Promo(sanPhamHienTai.promo.name, sanPhamHienTai.promo.value).toWeb();
    } else {
        document.getElementsByClassName('ship')[0].style.display = 'block';
        price.innerHTML = `<strong>` + sanPhamHienTai.promo.value + `₫</strong>
                           <span>` + sanPhamHienTai.price + `₫</span>`;
    }

    // Cập nhật thông số
    var info = document.getElementsByClassName('info')[0];
    var s = addThongSo('Màn Hình', sanPhamHienTai.detail.screen);
    s += addThongSo('Hệ Điều Hành', sanPhamHienTai.detail.os);
    s += addThongSo('Bộ Vi Xử Lý', sanPhamHienTai.detail.cpu);
    s += addThongSo('RAM', sanPhamHienTai.detail.ram);
    s += addThongSo('Dung Lượng Lưu Trữ', sanPhamHienTai.detail.rom);
    s += addThongSo('Cổng Kết Nối', sanPhamHienTai.detail.usbPorts);
    s += addThongSo('Hỗ Trợ Thẻ Nhớ', sanPhamHienTai.detail.storageExpansion);
    s += addThongSo('Pin', sanPhamHienTai.detail.battery);
    
    info.innerHTML = s;

    // Cập nhật hình
    var hinh = divChiTiet.getElementsByClassName('picture')[0];
    hinh.getElementsByTagName('img')[0].src = sanPhamHienTai.img;
    document.getElementById('bigimg').src = sanPhamHienTai.img;

    // Hình nhỏ
    for (var i = 0; i < sanPhamHienTai.images.length; i++) {
        addSmallImg(sanPhamHienTai.images[i]);
    }

    // Khởi động thư viện hỗ trợ banner
    var owl = $('.owl-carousel');
    owl.owlCarousel({
        items: 5,
        center: true,
        smartSpeed: 450
    });
}



// Chi tiết khuyến mãi
function getDetailPromo(sp) {
    switch (sp.promo.name) {
        case 'tragop':
            var span = `<span style="font-weight: bold"> lãi suất ` + sp.promo.value + `% </span>`;
            return `Khách hàng có thể mua trả góp sản phẩm với ` + span + `với thời hạn 1 tháng kể từ khi mua hàng.`;

        case 'giamgia':
            var span = `<span style="font-weight: bold">` + sp.promo.value + `</span>`;
            return `Khách hàng sẽ được giảm ` + span + `₫ khi tới mua trực tiếp tại cửa hàng`;

        case 'moiramat':
            return `Khách hàng sẽ được uống thử miễn phí tại cửa hàng. Có thể đổi trả lỗi trong vòng 2 tháng.`;

        case 'giareonline':
            var del = stringToNum(sp.price) - stringToNum(sp.promo.value);
            var span = `<span style="font-weight: bold">` + numToString(del) + `</span>`;
            return `Sản phẩm sẽ được giảm ` + span + `₫ khi mua hàng online bằng thẻ VPBank hoặc Khen Anh Tùng Đẹp Trai`;

        default:
            var span = `<span style="font-weight: bold">Cô Người Yêu </span>`;
            return `Cơ hội trúng ` + span + ` khi trả góp Home Credit`;
    }
}

function addThongSo(ten, giatri) {
    return `<li>
                <p>` + ten + `</p>
                <div>` + giatri + `</div>
            </li>`;
}

// add hình
function addSmallImg(img) {
    var newDiv = `<div class='item'>
                        <a>
                            <img src=` + img + ` onclick="changepic(this.src)">
                        </a>
                    </div>`;
    var banner = document.getElementsByClassName('owl-carousel')[0];
    banner.innerHTML += newDiv;
}

// đóng mở xem hình
function opencertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(1)";
}

function closecertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(0)";
}

// đổi hình trong chế độ xem hình
function changepic(src) {
    document.getElementById("bigimg").src = src;
}

// Thêm sản phẩm vào các khung sản phẩm
function addKhungSanPham(list_sanpham, tenKhung, color, ele) {
    // convert color to code
    var gradient = `background-image: linear-gradient(120deg, ` + color[0] + ` 0%, ` + color[1] + ` 50%, ` + color[0] + ` 100%);`
    var borderColor = `border-color: ` + color[0];
    var borderA = `	border-left: 2px solid ` + color[0] + `;
					border-right: 2px solid ` + color[0] + `;`;

    // mở tag
    var s = `<div class="khungSanPham" style="` + borderColor + `">
				<h3 class="tenKhung" style="` + gradient + `">* ` + tenKhung + ` *</h3>
				<div class="listSpTrongKhung flexContain">`;

    for (var i = 0; i < list_sanpham.length; i++) {
        s += addProduct(list_sanpham[i], null, true);
        // truyền vào 'true' để trả về chuỗi rồi gán vào s
    }

    // thêm khung vào contain-khung
    ele.innerHTML += s;
}

/// gợi ý sản phẩm
function suggestion() {
    // ====== Lay ra thong tin san pham hien tai ====== 
    const giaSanPhamHienTai = stringToNum(sanPhamHienTai.price);

    // ====== Tìm các sản phẩm tương tự theo tiêu chí ====== 
    const sanPhamTuongTu = list_products
        // Lọc sản phẩm trùng
        .filter((_) => _.masp !== sanPhamHienTai.masp)
        // Tính điểm cho từng sản phẩm
        .map(sanPham => {
            // Tiêu chí 1: giá sản phẩm ko lệch nhau quá 1 triệu
            const giaSanPham = stringToNum(sanPham.price);
            let giaTienGanGiong = Math.abs(giaSanPham - giaSanPhamHienTai) < 1000000;

            // Tiêu chí 2: các thông số kỹ thuật giống nhau
            let soLuongChiTietGiongNhau = 0;
            for (let key in sanPham.detail) {
                let value = sanPham.detail[key];
                let currentValue = sanPhamHienTai.detail[key];

                if (value == currentValue) soLuongChiTietGiongNhau++;
            }
            let giongThongSoKyThuat = soLuongChiTietGiongNhau >= 3;

            // Tiêu chí 3: cùng hãng sản xuất 
            let cungHangSanXuat = sanPham.company === sanPhamHienTai.company

            // Tiêu chí 4: cùng loại khuyến mãi
            let cungLoaiKhuyenMai = sanPham.promo?.name === sanPhamHienTai.promo?.name;

            // Tiêu chí 5: có đánh giá, số sao
            let soDanhGia = Number.parseInt(sanPham.rateCount, 10)
            let soSao = Number.parseInt(sanPham.star, 10);

            // Tính điểm cho sản phẩm này (càng thoả nhiều tiêu chí điểm càng cao => càng nên gợi ý)
            let diem = 0;
            if (giaTienGanGiong) diem += 20;
            if (giongThongSoKyThuat) diem += soLuongChiTietGiongNhau;
            if (cungHangSanXuat) diem += 15;
            if (cungLoaiKhuyenMai) diem += 10;
            if (soDanhGia > 0) diem += (soDanhGia + '').length;
            diem += soSao;

            // Thêm thuộc tính diem vào dữ liệu trả về
            return {
                ...sanPham,
                diem: diem
            };
        })
        // Sắp xếp theo số điểm cao xuống thấp
        .sort((a, b) => b.diem - a.diem)
        // Lấy ra 10 sản phẩm đầu tiên
        .slice(0, 10);

    console.log(sanPhamTuongTu)

    // ====== Hiển thị 5 sản phẩm lên web ====== 
    if (sanPhamTuongTu.length) {
        let div = document.getElementById('goiYSanPham');
        addKhungSanPham(sanPhamTuongTu, 'Bạn có thể thích', ['#434aa8', '#ec1f1f'], div);
    }
}
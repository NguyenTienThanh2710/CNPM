document.addEventListener('DOMContentLoaded', function() {
    // Tải danh sách sản phẩm nổi bật
    loadFeaturedProducts();
    
    // Khởi tạo các sự kiện và chức năng khác
    initializeEvents();
});

// Tải danh sách sản phẩm nổi bật
async function loadFeaturedProducts() {
    const products = await fetchProducts();
    
    if (products.length > 0) {
        // Hiển thị các sản phẩm nổi bật trên trang chủ
        const featuredProducts = products.slice(0, 6); // Lấy tối đa 6 sản phẩm
        displayProducts(featuredProducts, '.product-list');
    }
}

// Khởi tạo các sự kiện
function initializeEvents() {
    // Xử lý sự kiện tìm kiếm
    const searchForm = document.querySelector('form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput && searchInput.value.trim()) {
                // Chuyển hướng đến trang tìm kiếm với tham số query
                window.location.href = `/search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
    
    // Kiểm tra trạng thái đăng nhập và cập nhật UI
    checkAuthAndUpdateUI();
}

// Kiểm tra trạng thái đăng nhập và cập nhật UI
async function checkAuthAndUpdateUI() {
    const isLoggedIn = await checkAuthStatus();
    
    // Cập nhật UI tùy thuộc vào trạng thái đăng nhập
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (isLoggedIn && user) {
            // Người dùng đã đăng nhập
            const dropdownMenu = userDropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <li><a class="dropdown-item" href="/account.html">Tài khoản của tôi</a></li>
                    <li><a class="dropdown-item" href="/orders.html">Đơn hàng của tôi</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-btn">Đăng xuất</a></li>
                `;
                
                // Thêm sự kiện đăng xuất
                const logoutBtn = dropdownMenu.querySelector('#logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                }
            }
            
            // Cập nhật icon và tên người dùng
            const navLink = userDropdown.querySelector('.nav-link');
            if (navLink) {
                navLink.innerHTML = `
                    <i class="bi bi-person-check"></i> ${user.username}
                `;
            }
        }
    }
}

// Xử lý đăng xuất
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        // Gọi API đăng xuất
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Hiển thị thông báo thành công
        showAlert('Đăng xuất thành công!', 'success');
        
        // Chuyển hướng về trang chủ
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('Error logging out:', error);
        
        // Trong trường hợp lỗi, vẫn xóa thông tin người dùng và chuyển hướng
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

// Hiển thị thông báo
function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertBox.setAttribute('role', 'alert');
    alertBox.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertBox);
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => {
            alertBox.remove();
        }, 300);
    }, 3000);
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}


// Đặt đoạn mã này trong file cart.js hoặc main.js

// Thêm sự kiện cho tất cả các nút "Thêm vào giỏ"
document.addEventListener('DOMContentLoaded', function() {
    // Tìm tất cả nút "Thêm vào giỏ"
    const addToCartButtons = document.querySelectorAll('[id^="btnThemVaoGio"]');
    
    // Gắn sự kiện cho mỗi nút
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Lấy thông tin sản phẩm từ data attribute hoặc từ DOM
            const productCard = this.closest('.product-card');
            const productId = this.getAttribute('data-product-id');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = parseFloat(productCard.querySelector('.product-price').getAttribute('data-price'));
            const productImage = productCard.querySelector('.product-image').getAttribute('src');
            
            // Gọi hàm thêm vào giỏ hàng
            addToCart(productId, productName, productPrice, productImage);
        });
    });
});

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    // Lấy giỏ hàng hiện tại từ localStorage hoặc tạo mới nếu chưa có
    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        // Nếu sản phẩm đã có, tăng số lượng
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        // Nếu sản phẩm chưa có, thêm mới
        cart.items.push({
            id: Date.now().toString(), // ID duy nhất cho item trong giỏ hàng
            productId: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    // Tính lại tổng giá trị giỏ hàng
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật hiển thị số lượng sản phẩm trong giỏ hàng
    updateCartCount();
    
    // Hiển thị thông báo thành công
    showAlert('Đã thêm sản phẩm vào giỏ hàng!', 'success');
}

// Cập nhật số lượng sản phẩm hiển thị trên icon giỏ hàng
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
        cartCountElement.textContent = cart.items.length;
    }
}

// Hiển thị thông báo
function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertBox.setAttribute('role', 'alert');
    alertBox.style.zIndex = '1050';
    alertBox.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertBox);
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => {
            alertBox.remove();
        }, 300);
    }, 3000);
}
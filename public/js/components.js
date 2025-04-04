document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        fetch('/components/header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                // Sau khi tải header, kiểm tra trạng thái đăng nhập
                checkLoginStatus();
                // Cập nhật số lượng trong giỏ hàng
                updateCartCount();
            })
            .catch(error => console.error('Error loading header:', error));
    }
    
    // Load footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('/components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(error => console.error('Error loading footer:', error));
    }
});

// Kiểm tra trạng thái đăng nhập và cập nhật UI
function checkLoginStatus() {
    // Giả lập kiểm tra đăng nhập từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Người dùng đã đăng nhập
        setTimeout(() => {
            const userDropdown = document.getElementById('user-dropdown');
            if (userDropdown) {
                userDropdown.querySelector('.dropdown-menu').innerHTML = `
                    <li><a class="dropdown-item" href="/account.html">Tài khoản của tôi</a></li>
                    <li><a class="dropdown-item" href="/orders.html">Đơn hàng</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Đăng xuất</a></li>
                `;
                
                // Thay đổi icon và thêm tên người dùng
                userDropdown.querySelector('.nav-link').innerHTML = `
                    <i class="bi bi-person-check"></i> ${user.username}
                `;
            }
        }, 100);
    }
}

// Cập nhật số lượng trong giỏ hàng
function updateCartCount() {
    setTimeout(() => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            // Lấy dữ liệu giỏ hàng từ localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
            cartCount.textContent = cart.items.length;
        }
    }, 100);
}

// Đăng xuất
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
}

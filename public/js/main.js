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
        // Hiển thị tất cả sản phẩm trên trang chủ
        displayProducts(products, '.product-list');
    }
}

// Khởi tạo các sự kiện
function initializeEvents() {
    // Xử lý sự kiện tìm kiếm
    const searchForm = document.querySelector('form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
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

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(productId, quantity = 1) {
    try {
        // Lấy thông tin sản phẩm từ API
        const response = await fetch('/api/products/' + productId);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin sản phẩm');
        }
        const product = await response.json();

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
                name: product.name,
                price: product.price,
                image: product.image || '/images/product-placeholder.jpg',
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

    } catch (error) {
        console.error('Error adding to cart:', error);
        showAlert('Không thể thêm sản phẩm vào giỏ hàng!', 'danger');
    }
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

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}


// Xử lý sự kiện submit form tìm kiếm
function handleSearch(event) {
    event.preventDefault();
    const searchForm = document.getElementById('search-form');
    if (!searchForm) {
        console.error('Search form not found');
        return;
    }
    
    const searchQuery = new FormData(searchForm).get('q');
    if (searchQuery.trim()) {
        // Thêm category=laptop vào URL nếu người dùng đang tìm laptop
        const isLaptopSearch = searchQuery.toLowerCase().includes('laptop');
        const searchUrl = `/search.html?q=${encodeURIComponent(searchQuery.trim())}${isLaptopSearch ? '&category=laptop' : ''}`;
        window.location.href = searchUrl;
    }
}
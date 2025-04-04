 // Thêm sản phẩm vào giỏ hàng
async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': getUserId()
            },
            body: JSON.stringify({ productId, quantity })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add product to cart');
        }
        
        const result = await response.json();
        
        // Cập nhật dữ liệu giỏ hàng trong localStorage
        localStorage.setItem('cart', JSON.stringify(result));
        
        // Cập nhật số lượng sản phẩm trong giỏ hàng trên header
        updateCartCount();
        
        // Hiển thị thông báo thành công
        showAlert('Đã thêm sản phẩm vào giỏ hàng!', 'success');
        
        return result;
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showAlert('Không thể thêm sản phẩm vào giỏ hàng!', 'danger');
        return null;
    }
}

// Lấy giỏ hàng hiện tại
async function getCart() {
    try {
        const response = await fetch('/api/cart', {
            headers: {
                'user-id': getUserId()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }
        
        const cart = await response.json();
        
        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        return cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        // Sử dụng dữ liệu từ localStorage nếu có lỗi
        return JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateCartItem(itemId, quantity) {
    try {
        const response = await fetch(`/api/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-id': getUserId()
            },
            body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update cart item');
        }
        
        const result = await response.json();
        
        // Cập nhật dữ liệu giỏ hàng trong localStorage
        localStorage.setItem('cart', JSON.stringify(result));
        
        // Hiển thị thông báo thành công
        showAlert('Đã cập nhật giỏ hàng!', 'success');
        
        return result;
    } catch (error) {
        console.error('Error updating cart item:', error);
        showAlert('Không thể cập nhật giỏ hàng!', 'danger');
        return null;
    }
}

// Xóa sản phẩm khỏi giỏ hàng
async function removeFromCart(itemId) {
    try {
        const response = await fetch(`/api/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'user-id': getUserId()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }
        
        const result = await response.json();
        
        // Cập nhật dữ liệu giỏ hàng trong localStorage
        localStorage.setItem('cart', JSON.stringify(result));
        
        // Cập nhật số lượng sản phẩm trong giỏ hàng trên header
        updateCartCount();
        
        // Hiển thị thông báo thành công
        showAlert('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
        
        return result;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showAlert('Không thể xóa sản phẩm khỏi giỏ hàng!', 'danger');
        return null;
    }
}

// Xóa toàn bộ giỏ hàng
async function clearCart() {
    try {
        const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
            headers: {
                'user-id': getUserId()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear cart');
        }
        
        const result = await response.json();
        
        // Cập nhật dữ liệu giỏ hàng trong localStorage
        localStorage.setItem('cart', JSON.stringify(result));
        
        // Cập nhật số lượng sản phẩm trong giỏ hàng trên header
        updateCartCount();
        
        // Hiển thị thông báo thành công
        showAlert('Đã xóa giỏ hàng!', 'success');
        
        return result;
    } catch (error) {
        console.error('Error clearing cart:', error);
        showAlert('Không thể xóa giỏ hàng!', 'danger');
        return null;
    }
}

// Hiển thị giỏ hàng trên trang giỏ hàng
async function displayCart() {
    const cart = await getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartItemsContainer) return;
    
    if (cart.items.length === 0) {
        // Hiển thị thông báo giỏ hàng trống
        cartItemsContainer.innerHTML = '';
        if (cartSummary) cartSummary.classList.add('d-none');
        if (emptyCart) emptyCart.classList.remove('d-none');
        return;
    }
    
    // Hiển thị các sản phẩm trong giỏ hàng
    let cartHTML = `
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col">Giá</th>
                        <th scope="col">Số lượng</th>
                        <th scope="col">Tổng</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cart.items.forEach(item => {
        cartHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image || '/images/product-placeholder.jpg'}" alt="${item.name}" class="img-thumbnail me-3" style="width: 80px;">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">Mã: ${item.productId}</small>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>
                    <div class="input-group" style="width: 130px;">
                        <button class="btn btn-outline-secondary btn-sm" type="button" 
                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" min="1"
                            onchange="updateCartItemQuantity('${item.id}', this.value)">
                        <button class="btn btn-outline-secondary btn-sm" type="button"
                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Hiển thị tổng thanh toán
    if (cartSummary) {
        cartSummary.classList.remove('d-none');
        document.getElementById('subtotal').textContent = formatCurrency(cart.total);
        document.getElementById('discount').textContent = formatCurrency(0);
        document.getElementById('shipping').textContent = formatCurrency(0);
        document.getElementById('total').textContent = formatCurrency(cart.total);
    }
    
    if (emptyCart) emptyCart.classList.add('d-none');
    
    // Thiết lập sự kiện cho nút xóa giỏ hàng
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', async function() {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
                const result = await clearCart();
                if (result) {
                    displayCart();
                }
            }
        });
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
async function updateCartItemQuantity(itemId, quantity) {
    quantity = parseInt(quantity);
    if (quantity <= 0) {
        if (confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            const result = await removeFromCart(itemId);
            if (result) {
                displayCart();
            }
        }
        return;
    }
    
    const result = await updateCartItem(itemId, quantity);
    if (result) {
        displayCart();
    }
}

// Xóa sản phẩm khỏi giỏ hàng
async function removeCartItem(itemId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        const result = await removeFromCart(itemId);
        if (result) {
            displayCart();
        }
    }
}

// Lấy ID người dùng
function getUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : 'guest';
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

// Khởi tạo trang giỏ hàng
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem đang ở trang giỏ hàng hay không
    if (window.location.pathname === '/cart.html') {
        displayCart();
    }
});


// Thêm vào file cart.js hoặc đặt trực tiếp trong trang cart.html

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem đang ở trang giỏ hàng không
    if (window.location.pathname.includes('/cart.html') || window.location.pathname.endsWith('/cart')) {
        displayCart();
    }
});

// Hiển thị giỏ hàng
function displayCart() {
    // Lấy dữ liệu giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartItemsContainer) {
        console.error('Không tìm thấy phần tử #cart-items');
        return;
    }
    
    // Kiểm tra giỏ hàng trống
    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (cartSummary) cartSummary.classList.add('d-none');
        if (emptyCart) emptyCart.classList.remove('d-none');
        return;
    }
    
    // Hiển thị các sản phẩm trong giỏ hàng
    let cartHTML = `
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col">Giá</th>
                        <th scope="col">Số lượng</th>
                        <th scope="col">Tổng</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cart.items.forEach(item => {
        cartHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image || '/images/product-placeholder.jpg'}" alt="${item.name}" class="img-thumbnail me-3" style="width: 80px;">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">Mã: ${item.productId}</small>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(item.price)}</td>
                <td>
                    <div class="input-group" style="width: 130px;">
                        <button class="btn btn-outline-secondary btn-sm" type="button" 
                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" min="1"
                            onchange="updateCartItemQuantity('${item.id}', this.value)">
                        <button class="btn btn-outline-secondary btn-sm" type="button"
                            onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Hiển thị tổng thanh toán
    if (cartSummary) {
        cartSummary.classList.remove('d-none');
        document.getElementById('subtotal').textContent = formatCurrency(cart.total);
        document.getElementById('discount').textContent = formatCurrency(0);
        document.getElementById('shipping').textContent = formatCurrency(0);
        document.getElementById('total').textContent = formatCurrency(cart.total);
    }
    
    if (emptyCart) emptyCart.classList.add('d-none');
    
    // Thiết lập sự kiện cho nút xóa giỏ hàng
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
                clearCart();
            }
        });
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartItemQuantity(itemId, quantity) {
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 0) quantity = 0;
    
    // Lấy giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    
    // Tìm index của sản phẩm cần cập nhật
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    if (quantity === 0) {
        // Nếu số lượng = 0, xóa sản phẩm khỏi giỏ hàng
        cart.items.splice(itemIndex, 1);
    } else {
        // Cập nhật số lượng
        cart.items[itemIndex].quantity = quantity;
    }
    
    // Tính lại tổng giá trị giỏ hàng
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật hiển thị
    displayCart();
    updateCartCount();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeCartItem(itemId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        // Lấy giỏ hàng từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
        
        // Lọc ra các sản phẩm không bị xóa
        cart.items = cart.items.filter(item => item.id !== itemId);
        
        // Tính lại tổng giá trị giỏ hàng
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Cập nhật hiển thị
        displayCart();
        updateCartCount();
        
        // Hiển thị thông báo
        showAlert('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
    }
}

// Xóa toàn bộ giỏ hàng
function clearCart() {
    // Tạo giỏ hàng trống
    const emptyCart = { items: [], total: 0 };
    
    // Lưu giỏ hàng trống vào localStorage
    localStorage.setItem('cart', JSON.stringify(emptyCart));
    
    // Cập nhật hiển thị
    displayCart();
    updateCartCount();
    
    // Hiển thị thông báo
    showAlert('Đã xóa toàn bộ giỏ hàng!', 'success');
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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



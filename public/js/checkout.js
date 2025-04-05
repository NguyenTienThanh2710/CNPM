document.addEventListener('DOMContentLoaded', function () {
    // Lấy dữ liệu giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };
    
    // Các phần tử trên trang cần dùng
    const cartContainer = document.getElementById('cart-container');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    const subtotal = document.getElementById('subtotal');
    const discount = document.getElementById('discount');
    const shipping = document.getElementById('shipping');
    const total = document.getElementById('total');

    // Kiểm tra giỏ hàng có trống không
    if (cart.items.length === 0) {
        emptyCart.classList.remove('d-none');
        cartSummary.classList.add('d-none');
        return;
    } else {
        cartSummary.classList.remove('d-none');
    }

    // Hiển thị sản phẩm trong giỏ hàng
    cart.items.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <h5>${item.name}</h5>
            <p>Giá: ${formatCurrency(item.price)}</p>
            <p>Số lượng: ${item.quantity}</p>
        `;
        cartContainer.appendChild(cartItemDiv);
    });

    // Tính toán và hiển thị tổng tiền
    const tempTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = 0; // Giảm giá có thể thêm vào sau
    const shippingFee = 30000; // Phí vận chuyển

    // Cập nhật hiển thị
    subtotal.textContent = formatCurrency(tempTotal);
    discount.textContent = formatCurrency(discountAmount);
    shipping.textContent = formatCurrency(shippingFee);
    total.textContent = formatCurrency(tempTotal - discountAmount + shippingFee);

    // Xử lý khi nhấn nút thanh toán
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', function () {
        // Chuyển hướng đến trang nhập thông tin người dùng
        window.location.href = '/checkout.html'; 
    });

    // Xóa giỏ hàng
    const clearCartBtn = document.getElementById('clear-cart-btn');
    clearCartBtn.addEventListener('click', function () {
        localStorage.removeItem('cart');
        location.reload();
    });
});

// Định dạng tiền tệ
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/order-success.html')) return;

    const orderInfo = localStorage.getItem('lastOrder');
    if (!orderInfo) {
        window.location.href = '/';
        return;
    }

    // Lấy thông tin người dùng hiện tại
    const user = getCurrentUser();
    
    // Hiển thị thông tin đơn hàng
    const orderData = JSON.parse(orderInfo);
    displayOrderDetails(orderData);
    
    // Cập nhật userId trong đơn hàng nếu người dùng đã đăng nhập
    if (user) {
        updateOrderUserId(orderData.orderId, user.id);
    }
});

// Lấy thông tin người dùng từ localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
        return null;
    }
}

// Cập nhật userId trong đơn hàng
async function updateOrderUserId(orderId, userId) {
    try {
        const response = await fetch(`/api/cart/orders/${orderId}/update-user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Không thể cập nhật thông tin người dùng cho đơn hàng');
        }

        console.log('Đã cập nhật userId cho đơn hàng:', orderId);
    } catch (error) {
        console.error('Lỗi khi cập nhật userId cho đơn hàng:', error);
    }
}



// Hiển thị thông tin chi tiết đơn hàng
function displayOrderDetails(order) {

    // Hiển thị mã đơn hàng và thời gian
    document.getElementById('orderId').textContent = order.orderId;
    document.getElementById('orderDate').textContent = new Date(order.orderDate).toLocaleString('vi-VN');

    // Hiển thị thông tin giao hàng
    const shippingInfo = document.getElementById('shipping-info');
    shippingInfo.innerHTML = `
        <p class="mb-2">Họ tên: ${order.fullName}</p>
        <p class="mb-2">Số điện thoại: ${order.phone}</p>
        <p class="mb-2">Email: ${order.email}</p>
        <p class="mb-2">Địa chỉ: ${order.address}</p>
        <p class="mb-0">Khu vực: ${order.ward}, ${order.district}, ${order.province}</p>
    `;

    // Hiển thị chi tiết sản phẩm
    const orderDetails = document.getElementById('order-details');
    let detailsHTML = '';
    const subtotal = order.total;
    const shippingFee = 30000; // Phí vận chuyển cố định
    
    order.items.forEach(item => {
        detailsHTML += `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">Số lượng: ${item.quantity}</small>
                </div>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `;
    });

    orderDetails.innerHTML = detailsHTML;

    // Cập nhật tổng tiền
    console.log('Subtotal:', subtotal); // Để debug
    console.log('Shipping Fee:', shippingFee); // Để debug
    document.getElementById('order-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('order-shipping').textContent = formatCurrency(shippingFee);
    document.getElementById('order-total').textContent = formatCurrency(subtotal + shippingFee);
}

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
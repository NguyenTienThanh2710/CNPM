document.addEventListener('DOMContentLoaded', async function() {
    if (!window.location.pathname.includes('/order-history.html')) return;

    // Kiểm tra trạng thái đăng nhập
    const isAuthenticated = await checkAuthStatus();
    const authRequiredElement = document.getElementById('auth-required');
    const orderHistoryContainer = document.getElementById('order-history-container');

    if (!isAuthenticated) {
        // Hiển thị thông báo yêu cầu đăng nhập
        authRequiredElement.classList.remove('d-none');
        return;
    }

    // Hiển thị container lịch sử đơn hàng
    orderHistoryContainer.classList.remove('d-none');

    // Lấy và hiển thị lịch sử đơn hàng
    await fetchAndDisplayOrderHistory();
});

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('Kiểm tra đăng nhập:', { userExists: !!user, tokenExists: !!token });
        
        if (!user || !token) {
            console.log('Người dùng chưa đăng nhập');
            return false;
        }
        
        // Kiểm tra token với server (tùy chọn)
        // const response = await fetch('/api/auth/check', {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // });
        // const data = await response.json();
        // return response.ok && data.isAuthenticated;
        
        console.log('Người dùng đã đăng nhập');
        return true;
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
        return false;
    }
}

// Lấy thông tin người dùng từ localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
        const user = JSON.parse(userJson);
        // Đảm bảo có ID người dùng
        if (!user.id && user._id) {
            user.id = user._id;
        }
        // Nếu không có id hoặc _id, gán id là '1' cho user đã đăng nhập
        if (!user.id && !user._id) {
            console.log('Không tìm thấy ID người dùng, sử dụng ID mặc định');
            user.id = user.email ? user.email.split('@')[0] : '1';
        }
        return user;
    } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
        return null;
    }
}

// Lấy và hiển thị lịch sử đơn hàng
async function fetchAndDisplayOrderHistory() {
    try {
        const user = getCurrentUser();
        if (!user) {
            // Hiển thị thông báo yêu cầu đăng nhập
            document.getElementById('auth-required').classList.remove('d-none');
            document.getElementById('order-history-container').classList.add('d-none');
            return;
        }

        // Lấy userId từ thông tin người dùng
        const userId = user.id || user._id;
        console.log('Đang lấy lịch sử đơn hàng cho userId:', userId);
        
        if (!userId) {
            console.error('Không tìm thấy ID người dùng trong thông tin user:', user);
            throw new Error('Không tìm thấy ID người dùng');
        }

        // Gọi API để lấy lịch sử đơn hàng
        const response = await fetch(`/api/cart/orders/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        console.log('Kết quả API:', response.status);

        if (!response.ok) {
            throw new Error('Không thể lấy lịch sử đơn hàng');
        }

        const orders = await response.json();
        displayOrderHistory(orders);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        showError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
    }
}

// Hiển thị lịch sử đơn hàng
function displayOrderHistory(orders) {
    const orderListElement = document.getElementById('order-list');
    const noOrdersElement = document.getElementById('no-orders');
    const totalOrdersElement = document.getElementById('total-orders');

    // Cập nhật số lượng đơn hàng
    totalOrdersElement.textContent = orders.length;

    if (orders.length === 0) {
        // Hiển thị thông báo không có đơn hàng
        noOrdersElement.classList.remove('d-none');
        return;
    }

    // Sắp xếp đơn hàng theo thời gian mới nhất
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Hiển thị danh sách đơn hàng
    orderListElement.innerHTML = orders.map(order => {
        // Tính tổng số sản phẩm
        const totalItems = order.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Định dạng ngày đặt hàng
        const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Hiển thị trạng thái đơn hàng
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'pending':
                statusClass = 'bg-warning';
                statusText = 'Đang xử lý';
                break;
            case 'processing':
                statusClass = 'bg-info';
                statusText = 'Đang chuẩn bị';
                break;
            case 'shipped':
                statusClass = 'bg-primary';
                statusText = 'Đang giao hàng';
                break;
            case 'delivered':
                statusClass = 'bg-success';
                statusText = 'Đã giao hàng';
                break;
            case 'cancelled':
                statusClass = 'bg-danger';
                statusText = 'Đã hủy';
                break;
            default:
                statusClass = 'bg-secondary';
                statusText = 'Không xác định';
        }

        return `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Đơn hàng #${order.orderId}</span>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Ngày đặt:</strong> ${orderDate}</p>
                        <p class="card-text"><strong>Tổng tiền:</strong> ${formatCurrency(order.cart.total + (order.shippingFee || 0))}</p>
                        <p class="card-text"><strong>Số sản phẩm:</strong> ${totalItems}</p>
                        <hr>
                        <h6>Sản phẩm:</h6>
                        <ul class="list-group list-group-flush">
                            ${order.cart.items.map(item => `
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <div>
                                        <span>${item.name}</span>
                                        <small class="d-block text-muted">SL: ${item.quantity}</small>
                                    </div>
                                    <span>${formatCurrency(item.price * item.quantity)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="card-footer">
                        <a href="/order-detail.html?id=${order.orderId}" class="btn btn-outline-primary btn-sm">Xem chi tiết</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Hiển thị thông báo lỗi
function showError(message) {
    const orderListElement = document.getElementById('order-list');
    orderListElement.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${message}
            </div>
        </div>
    `;
}

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
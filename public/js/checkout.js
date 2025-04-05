// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!window.location.pathname.includes('/checkout.html')) return;

    // Kiểm tra giỏ hàng trống ngay từ đầu
    const cartData = localStorage.getItem('cart') || localStorage.getItem('guest_cart');
    if (!cartData || !JSON.parse(cartData).items || JSON.parse(cartData).items.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Giỏ hàng trống',
            text: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán',
            confirmButtonText: 'Đồng ý'
        }).then(() => {
            window.location.href = '/cart.html';
        });
        return;
    }

    // Kiểm tra và tự động chọn phương thức thanh toán từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentMethod = urlParams.get('paymentMethod');
    if (paymentMethod) {
        const paymentInput = document.querySelector(`input[name="paymentMethod"][value="${paymentMethod}"]`);
        if (paymentInput) {
            paymentInput.checked = true;
        }
    }

    // Kiểm tra trạng thái đăng nhập
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
        // Lưu URL hiện tại để sau khi đăng nhập có thể quay lại
        localStorage.setItem('redirectUrl', window.location.href);
        window.location.href = '/login.html';
        return;
    }

    // Đảm bảo các phần tử DOM đã được tải
    const orderItemsContainer = document.getElementById('order-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTotal = document.getElementById('checkout-total');

    if (!orderItemsContainer || !checkoutSubtotal || !checkoutShipping || !checkoutTotal) {
        console.error('Không tìm thấy các phần tử DOM cần thiết');
        return;
    }

    // Hiển thị thông tin đơn hàng
    displayOrderSummary();
    setupCheckoutForm();
    initializeAddressSelects(); // Khởi tạo các dropdown địa chỉ
});

// Hiển thị thông tin đơn hàng
function displayOrderSummary() {
    // Kiểm tra và lấy dữ liệu giỏ hàng từ localStorage
    let cart;
    try {
        // Lấy dữ liệu giỏ hàng từ localStorage (kiểm tra cả giỏ hàng của người dùng đã đăng nhập và khách)
        let cartData = localStorage.getItem('cart');
        if (!cartData) {
            cartData = localStorage.getItem('guest_cart');
        }
        console.log('Cart data from localStorage:', cartData); // Debug log

        if (!cartData) {
            Swal.fire({
                icon: 'warning',
                title: 'Giỏ hàng trống',
                text: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán',
                confirmButtonText: 'Đồng ý'
            }).then(() => {
                window.location.href = '/cart.html';
            });
            return;
        }

        cart = JSON.parse(cartData);
        console.log('Parsed cart data:', cart); // Debug log

        if (!cart) {
            throw new Error('Dữ liệu giỏ hàng không tồn tại');
        }
        if (typeof cart !== 'object') {
            throw new Error('Dữ liệu giỏ hàng không phải là object');
        }
        if (!cart.items) {
            throw new Error('Giỏ hàng không có thuộc tính items');
        }
        if (!Array.isArray(cart.items)) {
            throw new Error('Giỏ hàng items không phải là mảng');
        }
        if (cart.items.length === 0) {
            throw new Error('Giỏ hàng không có sản phẩm nào');
        }

        // Lọc và kiểm tra tính hợp lệ của từng sản phẩm
        const validItems = cart.items.filter(item => {
            return item && 
                   typeof item === 'object' && 
                   item.name && 
                   typeof item.price === 'number' && 
                   typeof item.quantity === 'number' && 
                   item.quantity > 0 &&
                   item.image; // Đảm bảo có đường dẫn hình ảnh
        });

        if (validItems.length === 0) {
            throw new Error('Không có sản phẩm hợp lệ trong giỏ hàng');
        }

        cart.items = validItems;
        cart.total = validItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu giỏ hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi giỏ hàng',
            text: 'Đã xảy ra lỗi khi xử lý giỏ hàng. Vui lòng thử lại.',
            confirmButtonText: 'Quay lại giỏ hàng'
        }).then(() => {
            window.location.href = '/cart.html';
        });
        return;
    }

    const orderItemsContainer = document.getElementById('order-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTotal = document.getElementById('checkout-total');

    if (!orderItemsContainer) {
        console.error('Không tìm thấy phần tử #order-items');
        return;
    }

    if (cart.items.length === 0) {
        window.location.href = '/cart.html';
        return;
    }

    // Đảm bảo hàm formatCurrency tồn tại
    if (typeof formatCurrency !== 'function') {
        window.formatCurrency = function(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        };
    }

    let orderHTML = '';
    let subtotal = 0;

    // Hiển thị từng sản phẩm trong đơn hàng
    cart.items.forEach(item => {
        orderHTML += `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image || '/images/product-placeholder.jpg'}" 
                         alt="${item.name}" 
                         class="img-thumbnail me-3" 
                         style="width: 60px;">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">Số lượng: ${item.quantity}</small>
                    </div>
                </div>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `;
        subtotal += item.price * item.quantity;
    });

    // Cập nhật container và tổng tiền
    orderItemsContainer.innerHTML = orderHTML;
    
    // Tính phí vận chuyển và tổng cộng
    const shippingFee = 30000; // Phí vận chuyển cố định
    const total = subtotal + shippingFee;

    // Cập nhật hiển thị các khoản tiền
    checkoutSubtotal.textContent = formatCurrency(subtotal);
    checkoutShipping.textContent = formatCurrency(shippingFee);
    checkoutTotal.textContent = formatCurrency(total);
}

// Thiết lập form thanh toán
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation(); // Ngăn chặn sự kiện submit lan truyền

        // Kiểm tra các trường bắt buộc
        const requiredFields = ['fullName', 'phone', 'email', 'address', 'province', 'district', 'ward'];
        const emptyFields = requiredFields.filter(field => !document.getElementById(field).value.trim());

        if (emptyFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Thông tin chưa đầy đủ',
                text: 'Vui lòng điền đầy đủ thông tin giao hàng',
                confirmButtonText: 'Đồng ý'
            });
            return;
        }

        // Kiểm tra số điện thoại hợp lệ
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(document.getElementById('phone').value)) {
            Swal.fire({
                icon: 'error',
                title: 'Số điện thoại không hợp lệ',
                text: 'Vui lòng nhập số điện thoại hợp lệ',
                confirmButtonText: 'Đồng ý'
            });
            return;
        }

        // Kiểm tra email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(document.getElementById('email').value)) {
            Swal.fire({
                icon: 'error',
                title: 'Email không hợp lệ',
                text: 'Vui lòng nhập địa chỉ email hợp lệ',
                confirmButtonText: 'Đồng ý'
            });
            return;
        }

        // Lấy thông tin từ form
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            province: document.getElementById('province').value,
            district: document.getElementById('district').value,
            ward: document.getElementById('ward').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value
        };

        if (!formData.paymentMethod) {
            Swal.fire({
                icon: 'error',
                title: 'Chưa chọn phương thức thanh toán',
                text: 'Vui lòng chọn phương thức thanh toán',
                confirmButtonText: 'Đồng ý'
            });
            return;
        }

        // Lấy thông tin giỏ hàng
        const cart = JSON.parse(localStorage.getItem('cart') || localStorage.getItem('guest_cart'));
        if (!cart || !cart.items || cart.items.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Giỏ hàng của bạn đang trống',
                confirmButtonText: 'Đồng ý'
            }).then(() => {
                window.location.href = '/cart.html';
            });
            return;
        }

        try {
            // Hiển thị loading
            Swal.fire({
                title: 'Đang xử lý đơn hàng',
                text: 'Vui lòng đợi trong giây lát...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Gửi đơn hàng lên server
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    items: cart.items,
                    total: cart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Lỗi khi tạo đơn hàng');
            }

            // Lưu thông tin đơn hàng vào localStorage để hiển thị ở trang thành công
            const orderInfo = {
                ...formData,
                items: cart.items,
                total: cart.items.reduce((total, item) => total + (item.price * item.quantity), 0),
                orderDate: new Date().toISOString(),
                orderId: result.orderId || Date.now().toString()
            };

            try {
                // Xóa giỏ hàng và lưu thông tin đơn hàng
                localStorage.removeItem('cart');
                localStorage.removeItem('guest_cart');
                localStorage.setItem('lastOrder', JSON.stringify(orderInfo));

                // Thông báo thành công và chuyển hướng
                if (formData.paymentMethod === 'cod') {
                    // Nếu là thanh toán COD, chuyển hướng ngay lập tức
                    window.location.href = '/order-success.html';
                } else {
                    // Nếu là phương thức thanh toán khác, hiển thị thông báo trước
                    await Swal.fire({
                        icon: 'success',
                        title: 'Đặt hàng thành công',
                        text: 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất!',
                        confirmButtonText: 'Đồng ý'
                    });
                    window.location.href = '/order-success.html';
                }
            } catch (error) {
                console.error('Lỗi khi lưu thông tin đơn hàng:', error);
                throw new Error('Không thể lưu thông tin đơn hàng');
            }

        } catch (error) {
            console.error('Lỗi:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.message || 'Đã có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
                confirmButtonText: 'Đồng ý'
            });
        }
    });
}
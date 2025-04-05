// Hàm tăng số lượng sản phẩm
function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1;
}

// Hàm giảm số lượng sản phẩm
function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCartFromDetail(productId) {
    try {
        // Lấy thông tin sản phẩm từ API
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error('Không thể lấy thông tin sản phẩm');
        const product = await response.json();

        // Lấy số lượng từ input
        const quantity = parseInt(document.getElementById('quantity').value);

        // Lấy giỏ hàng hiện tại từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], total: 0 };

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.items.find(item => item.id === productId);

        if (existingItem) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            existingItem.quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
            cart.items.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        // Tính lại tổng giá trị giỏ hàng
        cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Cập nhật số lượng sản phẩm trên icon giỏ hàng
        updateCartCount();

        // Hiển thị thông báo thành công
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đã thêm sản phẩm vào giỏ hàng',
            showConfirmButton: false,
            timer: 1500
        });

    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể thêm sản phẩm vào giỏ hàng',
        });
    }
}

// Hàm xử lý mua ngay
async function buyNow(productId) {
    try {
        // Thêm sản phẩm vào giỏ hàng trước
        await addToCartFromDetail(productId);

        // Kiểm tra trạng thái đăng nhập bằng token trong localStorage
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const authData = await response.json();

        if (!authData.isAuthenticated) {
            // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
            localStorage.setItem('redirectUrl', '/checkout.html');
            window.location.href = '/login.html';
        } else {
            // Nếu đã đăng nhập, chuyển đến trang thanh toán
            window.location.href = '/checkout.html';
        }
    } catch (error) {
        console.error('Lỗi khi mua ngay:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể thực hiện chức năng mua ngay',
        });
    }
}

// Thêm sự kiện cho các nút khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Lấy id sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Thêm sự kiện cho nút thêm vào giỏ hàng
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => addToCartFromDetail(productId));
    }

    // Thêm sự kiện cho nút mua ngay
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => buyNow(productId));
    }
});
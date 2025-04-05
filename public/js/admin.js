// Kiểm tra quyền truy cập admin khi tải trang
document.addEventListener('DOMContentLoaded', async function() {
    // Kiểm tra xem người dùng đã đăng nhập chưa và có phải admin không
    const isAdmin = await checkAdminAccess();
    
    if (!isAdmin) {
        // Nếu không phải admin, chuyển hướng về trang chủ
        Swal.fire({
            icon: 'error',
            title: 'Truy cập bị từ chối',
            text: 'Bạn không có quyền truy cập trang quản trị',
            confirmButtonText: 'Quay lại trang chủ'
        }).then(() => {
            window.location.href = '/';
        });
        return;
    }
    
    // Hiển thị tên người dùng admin
    displayAdminInfo();
    
    // Tải dữ liệu cho các tab
    loadDashboardData();
    loadProductsData();
    loadOrdersData();
    loadUsersData();
    
    // Xử lý sự kiện đăng xuất
    setupLogoutEvent();
    
    // Thiết lập các sự kiện cho các nút
    setupButtonEvents();
});

// Thiết lập các sự kiện cho các nút
function setupButtonEvents() {
    // Nút thêm sản phẩm
    const addProductBtn = document.querySelector('#products .btn-primary');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            addNewProduct();
        });
    }
    
    // Nút thêm người dùng
    const addUserBtn = document.querySelector('#users .btn-primary');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            addNewUser();
        });
    }
}

// Kiểm tra quyền truy cập admin
async function checkAdminAccess() {
    try {
        // Kiểm tra xem có thông tin người dùng trong localStorage không
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        
        const user = JSON.parse(userStr);
        
        // Kiểm tra xem người dùng có role là admin không
        return user && user.role === 'admin';
    } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        return false;
    }
}

// Hiển thị thông tin admin
function displayAdminInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const adminUsername = document.getElementById('admin-username');
        if (adminUsername) {
            adminUsername.textContent = user.username || 'Admin';
        }
    }
}

// Thiết lập sự kiện đăng xuất
function setupLogoutEvent() {
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
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
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng xuất thành công!',
                    text: 'Đang chuyển hướng về trang đăng nhập...',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/login.html';
                });
                
            } catch (error) {
                console.error('Lỗi khi đăng xuất:', error);
                
                // Trong trường hợp lỗi, vẫn xóa thông tin người dùng và chuyển hướng
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        });
    }
}

// Tải dữ liệu tổng quan
async function loadDashboardData() {
    try {
        // Lấy số lượng sản phẩm
        const productsResponse = await fetch('/api/products');
        const products = await productsResponse.json();
        
        // Lấy số lượng đơn hàng (giả lập hoặc sử dụng API thực tế)
        let orders = [];
        try {
            const ordersResponse = await fetch('/api/cart/orders');
            if (ordersResponse.ok) {
                orders = await ordersResponse.json();
            }
        } catch (error) {
            console.error('Không thể tải dữ liệu đơn hàng:', error);
        }
        
        // Lấy số lượng người dùng (giả lập hoặc sử dụng API thực tế)
        let users = [];
        try {
            const usersResponse = await fetch('/api/auth/users');
            if (usersResponse.ok) {
                users = await usersResponse.json();
            } else {
                // Dữ liệu mẫu nếu API chưa được triển khai
                users = [
                    { id: '1', username: 'admin', role: 'admin' },
                    { id: '2', username: 'user1', role: 'user' },
                    { id: '1743829450453', username: 'huy', role: 'user' }
                ];
            }
        } catch (error) {
            console.error('Không thể tải dữ liệu người dùng:', error);
            // Dữ liệu mẫu nếu API gặp lỗi
            users = [
                { id: '1', username: 'admin', role: 'admin' },
                { id: '2', username: 'user1', role: 'user' },
                { id: '1743829450453', username: 'huy', role: 'user' }
            ];
        }
        
        // Tính tổng doanh thu từ các đơn hàng
        const totalRevenue = orders.reduce((total, order) => {
            // Chỉ tính các đơn hàng đã giao
            if (order.status === 'delivered') {
                return total + order.cart.total;
            }
            return total;
        }, 0);
        
        // Cập nhật giao diện
        document.querySelector('.bg-primary .card-text').textContent = products.length;
        document.querySelector('.bg-success .card-text').textContent = orders.filter(order => order.status === 'pending').length;
        document.querySelector('.bg-warning .card-text').textContent = users.length;
        document.querySelector('.bg-danger .card-text').textContent = formatCurrency(totalRevenue).replace('₫', '');
        
        // Cập nhật hoạt động gần đây
        updateRecentActivities(orders, products, users);
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu tổng quan:', error);
        showAlert('Không thể tải dữ liệu tổng quan', 'error');
    }
}

// Cập nhật hoạt động gần đây
function updateRecentActivities(orders, products, users) {
    const recentActivitiesList = document.querySelector('.card:nth-of-type(2) .list-group');
    if (!recentActivitiesList) return;
    
    let html = '';
    
    // Thêm đơn hàng mới nhất
    if (orders.length > 0) {
        const latestOrder = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0];
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Đơn hàng mới #${latestOrder.orderId}
                <span class="badge bg-primary rounded-pill">Mới</span>
            </li>
        `;
    }
    
    // Thêm sản phẩm mới nhất
    if (products.length > 0) {
        const latestProduct = products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Sản phẩm mới: ${latestProduct.name}
                <span class="badge bg-success rounded-pill">Thêm</span>
            </li>
        `;
    }
    
    // Thêm người dùng mới nhất
    if (users.length > 0) {
        const latestUser = users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Người dùng mới: ${latestUser.username}
                <span class="badge bg-info rounded-pill">Đăng ký</span>
            </li>
        `;
    }
    
    recentActivitiesList.innerHTML = html;
}

// Tải dữ liệu sản phẩm
async function loadProductsData() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
        
        const products = await response.json();
        const productList = document.getElementById('product-list');
        
        if (productList) {
            let html = '';
            products.forEach(product => {
                html += `
                    <tr>
                        <td>${product.id}</td>
                        <td>
                            <img src="${product.image || '/images/product-placeholder.jpg'}" 
                                 alt="${product.name}" 
                                 class="img-thumbnail" 
                                 style="width: 50px;">
                        </td>
                        <td>${product.name}</td>
                        <td>${formatCurrency(product.price)}</td>
                        <td>${product.category || 'Chưa phân loại'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary me-1" onclick="editProduct('${product.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            productList.innerHTML = html;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
        showAlert('Không thể tải dữ liệu sản phẩm', 'error');
    }
}

// Tải dữ liệu đơn hàng
async function loadOrdersData() {
    try {
        const response = await fetch('/api/cart/orders');
        if (!response.ok) throw new Error('Không thể tải dữ liệu đơn hàng');
        
        const orders = await response.json();
        const orderList = document.getElementById('order-list');
        
        if (orderList) {
            let html = '';
            orders.forEach(order => {
                const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN');
                let statusBadge = '';
                
                switch(order.status) {
                    case 'pending':
                        statusBadge = '<span class="badge bg-warning text-dark">Chờ xử lý</span>';
                        break;
                    case 'processing':
                        statusBadge = '<span class="badge bg-info">Đang xử lý</span>';
                        break;
                    case 'shipping':
                        statusBadge = '<span class="badge bg-primary">Đang giao</span>';
                        break;
                    case 'delivered':
                        statusBadge = '<span class="badge bg-success">Đã giao</span>';
                        break;
                    case 'cancelled':
                        statusBadge = '<span class="badge bg-danger">Đã hủy</span>';
                        break;
                    default:
                        statusBadge = '<span class="badge bg-secondary">Không xác định</span>';
                }
                
                html += `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${order.customerInfo.fullName}</td>
                        <td>${orderDate}</td>
                        <td>${formatCurrency(order.cart.total)}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="btn btn-sm btn-info me-1" onclick="viewOrderDetails('${order.orderId}')">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.orderId}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            orderList.innerHTML = html;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
        showAlert('Không thể tải dữ liệu đơn hàng', 'error');
    }
}

// Tải dữ liệu người dùng
async function loadUsersData() {
    try {
        const response = await fetch('/api/auth/users');
        if (!response.ok) {
            // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
            const users = [
                { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-01T00:00:00.000Z' },
                { id: '2', username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2023-01-02T10:30:00.000Z' },
                { id: '1743829450453', username: 'huy', email: 'minhhuy5929@gmail.com', role: 'user', createdAt: '2025-04-05T05:04:10.453Z' }
            ];
            renderUserList(users);
            return;
        }
        
        const users = await response.json();
        renderUserList(users);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        // Sử dụng dữ liệu mẫu nếu API gặp lỗi
        const users = [
            { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-01T00:00:00.000Z' },
            { id: '2', username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2023-01-02T10:30:00.000Z' },
            { id: '1743829450453', username: 'huy', email: 'minhhuy5929@gmail.com', role: 'user', createdAt: '2025-04-05T05:04:10.453Z' }
        ];
        renderUserList(users);
        showAlert('Đang sử dụng dữ liệu mẫu', 'warning');
    }
}

// Hiển thị danh sách người dùng
function renderUserList(users) {
    const userList = document.getElementById('user-list');
    
    if (userList) {
        let html = '';
        users.forEach(user => {
            const createdDate = new Date(user.createdAt).toLocaleDateString('vi-VN');
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                            ${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editUser('${user.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        userList.innerHTML = html;
    }
}

// Hiển thị thông báo
function showAlert(message, type = 'info') {
    Swal.fire({
        icon: type,
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Các hàm xử lý sản phẩm
function editProduct(productId) {
    // Lấy thông tin sản phẩm cần chỉnh sửa
    fetch(`/api/products/${productId}`)
        .then(response => {
            if (!response.ok) throw new Error('Không thể lấy thông tin sản phẩm');
            return response.json();
        })
        .then(product => {
            // Hiển thị form chỉnh sửa sản phẩm với SweetAlert2
            Swal.fire({
                title: 'Chỉnh sửa sản phẩm',
                html: `
                    <form id="edit-product-form" class="text-start">
                        <div class="mb-3">
                            <label for="product-name" class="form-label">Tên sản phẩm</label>
                            <input type="text" class="form-control" id="product-name" value="${product.name}" required>
                        </div>
                        <div class="mb-3">
                            <label for="product-price" class="form-label">Giá</label>
                            <input type="number" class="form-control" id="product-price" value="${product.price}" required>
                        </div>
                        <div class="mb-3">
                            <label for="product-category" class="form-label">Danh mục</label>
                            <select class="form-select" id="product-category">
                                <option value="">Chọn danh mục</option>
                                <option value="laptop" ${product.category === 'laptop' ? 'selected' : ''}>Laptop</option>
                                <option value="desktop" ${product.category === 'desktop' ? 'selected' : ''}>Máy tính để bàn</option>
                                <option value="monitor" ${product.category === 'monitor' ? 'selected' : ''}>Màn hình</option>
                                <option value="keyboard" ${product.category === 'keyboard' ? 'selected' : ''}>Bàn phím</option>
                                <option value="mouse" ${product.category === 'mouse' ? 'selected' : ''}>Chuột</option>
                                <option value="headphone" ${product.category === 'headphone' ? 'selected' : ''}>Tai nghe</option>
                                <option value="component" ${product.category === 'component' ? 'selected' : ''}>Linh kiện</option>
                                <option value="storage" ${product.category === 'storage' ? 'selected' : ''}>Lưu trữ</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="product-image" class="form-label">Hình ảnh sản phẩm</label>
                            <input type="file" class="form-control" id="product-image" accept="image/*">
                            <small class="text-muted">Hoặc nhập URL hình ảnh</small>
                            <input type="text" class="form-control mt-1" id="product-image-url" value="${product.image || ''}" placeholder="URL hình ảnh (tùy chọn)">
                            ${product.image ? `<div class="mt-2"><img src="${product.image}" class="img-thumbnail" style="max-height: 100px"></div>` : ''}
                        </div>
                        <div class="mb-3">
                            <label for="product-description" class="form-label">Mô tả</label>
                            <textarea class="form-control" id="product-description" rows="3">${product.description || ''}</textarea>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Lưu thay đổi',
                cancelButtonText: 'Hủy',
                focusConfirm: false,
                preConfirm: () => {
                    // Lấy dữ liệu từ form
                    const name = document.getElementById('product-name').value;
                    const price = document.getElementById('product-price').value;
                    const category = document.getElementById('product-category').value;
                    const imageFile = document.getElementById('product-image').files[0];
                    const imageUrl = document.getElementById('product-image-url').value;
                    const description = document.getElementById('product-description').value;
                    
                    if (!name || !price) {
                        Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                        return false;
                    }
                    
                    // Xử lý hình ảnh: ưu tiên file upload, nếu không có thì dùng URL
                    let image = imageUrl;
                    
                    if (imageFile) {
                        // Tạo URL tạm thời cho file đã chọn
                        image = URL.createObjectURL(imageFile);
                        
                        // Trong thực tế, bạn sẽ cần upload file lên server
                        // và sử dụng URL trả về từ server
                    }
                    
                    return { name, price, category, image, description };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Gọi API cập nhật sản phẩm
                    updateProduct(productId, result.value);
                }
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            showAlert('Không thể lấy thông tin sản phẩm', 'error');
        });
}

// Cập nhật sản phẩm
async function updateProduct(productId, productData) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error('Không thể cập nhật sản phẩm');
        }

        const updatedProduct = await response.json();
        showAlert('Cập nhật sản phẩm thành công', 'success');
        
        // Tải lại danh sách sản phẩm
        loadProductsData();
        
        return updatedProduct;
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        showAlert('Không thể cập nhật sản phẩm', 'error');
        return null;
    }
}

// Xóa sản phẩm
function deleteProduct(productId) {
    // Hiển thị hộp thoại xác nhận
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc3545'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể xóa sản phẩm');
                }

                showAlert('Xóa sản phẩm thành công', 'success');
                
                // Tải lại danh sách sản phẩm
                loadProductsData();
                
                // Tải lại dữ liệu tổng quan
                loadDashboardData();
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                showAlert('Không thể xóa sản phẩm', 'error');
            }
        }
    });
}

// Thêm sản phẩm mới
function addNewProduct() {
    Swal.fire({
        title: 'Thêm sản phẩm mới',
        html: `
            <form id="add-product-form" class="text-start">
                <div class="mb-3">
                    <label for="product-name" class="form-label">Tên sản phẩm</label>
                    <input type="text" class="form-control" id="product-name" required>
                </div>
                <div class="mb-3">
                    <label for="product-price" class="form-label">Giá</label>
                    <input type="number" class="form-control" id="product-price" required>
                </div>
                <div class="mb-3">
                    <label for="product-category" class="form-label">Danh mục</label>
                    <select class="form-select" id="product-category">
                        <option value="">Chọn danh mục</option>
                        <option value="laptop">Laptop</option>
                        <option value="desktop">Máy tính để bàn</option>
                        <option value="monitor">Màn hình</option>
                        <option value="keyboard">Bàn phím</option>
                        <option value="mouse">Chuột</option>
                        <option value="headphone">Tai nghe</option>
                        <option value="component">Linh kiện</option>
                        <option value="storage">Lưu trữ</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="product-image" class="form-label">Hình ảnh sản phẩm</label>
                    <input type="file" class="form-control" id="product-image" accept="image/*">
                    <small class="text-muted">Hoặc nhập URL hình ảnh</small>
                    <input type="text" class="form-control mt-1" id="product-image-url" placeholder="URL hình ảnh (tùy chọn)">
                </div>
                <div class="mb-3">
                    <label for="product-description" class="form-label">Mô tả</label>
                    <textarea class="form-control" id="product-description" rows="3"></textarea>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Thêm sản phẩm',
        cancelButtonText: 'Hủy',
        focusConfirm: false,
        preConfirm: () => {
            // Lấy dữ liệu từ form
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const category = document.getElementById('product-category').value;
            const imageFile = document.getElementById('product-image').files[0];
            const imageUrl = document.getElementById('product-image-url').value;
            const description = document.getElementById('product-description').value;
            
            if (!name || !price) {
                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                return false;
            }
            
            // Xử lý hình ảnh: ưu tiên file upload, nếu không có thì dùng URL
            let image = imageUrl;
            
            if (imageFile) {
                // Tạo URL tạm thời cho file đã chọn
                image = URL.createObjectURL(imageFile);
                
                // Trong thực tế, bạn sẽ cần upload file lên server
                // và sử dụng URL trả về từ server
            }
            
            return { name, price: Number(price), category, image, description };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(result.value)
                });

                if (!response.ok) {
                    throw new Error('Không thể thêm sản phẩm');
                }

                const newProduct = await response.json();
                showAlert('Thêm sản phẩm thành công', 'success');
                
                // Tải lại danh sách sản phẩm
                loadProductsData();
                
                // Tải lại dữ liệu tổng quan
                loadDashboardData();
                
                return newProduct;
            } catch (error) {
                console.error('Lỗi khi thêm sản phẩm:', error);
                showAlert('Không thể thêm sản phẩm', 'error');
                return null;
            }
        }
    });
}

// Xem chi tiết đơn hàng
function viewOrderDetails(orderId) {
    fetch(`/api/cart/orders/${orderId}`)
        .then(response => {
            if (!response.ok) throw new Error('Không thể lấy thông tin đơn hàng');
            return response.json();
        })
        .then(order => {
            // Tạo nội dung chi tiết đơn hàng
            let orderItems = '';
            order.cart.items.forEach(item => {
                orderItems += `
                    <tr>
                        <td>
                            <img src="${item.image || '/images/product-placeholder.jpg'}" 
                                alt="${item.name}" 
                                class="img-thumbnail" 
                                style="width: 50px;">
                        </td>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price)}</td>
                        <td>${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                `;
            });

            // Hiển thị modal chi tiết đơn hàng
            Swal.fire({
                title: `Chi tiết đơn hàng #${order.orderId}`,
                html: `
                    <div class="text-start">
                        <h5>Thông tin khách hàng</h5>
                        <p><strong>Họ tên:</strong> ${order.customerInfo.fullName}</p>
                        <p><strong>Email:</strong> ${order.customerInfo.email}</p>
                        <p><strong>Số điện thoại:</strong> ${order.customerInfo.phone}</p>
                        <p><strong>Địa chỉ:</strong> ${order.customerInfo.address}</p>
                        <p><strong>Ngày đặt hàng:</strong> ${new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="badge ${getStatusBadgeClass(order.status)}">
                                ${getStatusText(order.status)}
                            </span>
                        </p>
                        
                        <h5 class="mt-4">Sản phẩm</h5>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderItems}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" class="text-end"><strong>Tổng tiền sản phẩm:</strong></td>
                                        <td>${formatCurrency(order.cart.total)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="4" class="text-end"><strong>Phí vận chuyển:</strong></td>
                                        <td>${formatCurrency(order.shippingFee || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="4" class="text-end"><strong>Tổng thanh toán:</strong></td>
                                        <td class="fw-bold">${formatCurrency((order.cart.total || 0) + (order.shippingFee || 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `,
                width: '800px',
                confirmButtonText: 'Đóng'
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
            showAlert('Không thể lấy thông tin đơn hàng', 'error');
        });
}

// Lấy class cho badge trạng thái đơn hàng
function getStatusBadgeClass(status) {
    switch(status) {
        case 'pending': return 'bg-warning text-dark';
        case 'processing': return 'bg-info';
        case 'shipping': return 'bg-primary';
        case 'delivered': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Lấy text hiển thị cho trạng thái đơn hàng
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Chờ xử lý';
        case 'processing': return 'Đang xử lý';
        case 'shipping': return 'Đang giao';
        case 'delivered': return 'Đã giao';
        case 'cancelled': return 'Đã hủy';
        default: return 'Không xác định';
    }
}

// Cập nhật trạng thái đơn hàng
function updateOrderStatus(orderId) {
    fetch(`/api/cart/orders/${orderId}`)
        .then(response => {
            if (!response.ok) throw new Error('Không thể lấy thông tin đơn hàng');
            return response.json();
        })
        .then(order => {
            // Hiển thị form cập nhật trạng thái
            Swal.fire({
                title: 'Cập nhật trạng thái đơn hàng',
                html: `
                    <form id="update-order-form" class="text-start">
                        <div class="mb-3">
                            <label for="order-status" class="form-label">Trạng thái</label>
                            <select class="form-select" id="order-status">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                                <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                            </select>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Cập nhật',
                cancelButtonText: 'Hủy',
                preConfirm: () => {
                    return {
                        status: document.getElementById('order-status').value
                    };
                }
            }).then(result => {
                if (result.isConfirmed) {
                    // Gọi API cập nhật trạng thái đơn hàng
                    fetch(`/api/cart/orders/${orderId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(result.value)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Không thể cập nhật trạng thái đơn hàng');
                        return response.json();
                    })
                    .then(() => {
                        showAlert('Cập nhật trạng thái đơn hàng thành công', 'success');
                        // Tải lại danh sách đơn hàng
                        loadOrdersData();
                        // Tải lại dữ liệu tổng quan
                        loadDashboardData();
                    })
                    .catch(error => {
                        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
                        showAlert('Không thể cập nhật trạng thái đơn hàng', 'error');
                    });
                }
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
            showAlert('Không thể lấy thông tin đơn hàng', 'error');
        });
}

// Thêm người dùng mới
function addNewUser() {
    Swal.fire({
        title: 'Thêm người dùng mới',
        html: `
            <form id="add-user-form" class="text-start">
                <div class="mb-3">
                    <label for="user-username" class="form-label">Tên người dùng</label>
                    <input type="text" class="form-control" id="user-username" required>
                </div>
                <div class="mb-3">
                    <label for="user-email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="user-email" required>
                </div>
                <div class="mb-3">
                    <label for="user-password" class="form-label">Mật khẩu</label>
                    <input type="password" class="form-control" id="user-password" required>
                </div>
                <div class="mb-3">
                    <label for="user-role" class="form-label">Vai trò</label>
                    <select class="form-select" id="user-role">
                        <option value="user">Người dùng</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Thêm người dùng',
        cancelButtonText: 'Hủy',
        focusConfirm: false,
        preConfirm: () => {
            // Lấy dữ liệu từ form
            const username = document.getElementById('user-username').value;
            const email = document.getElementById('user-email').value;
            const password = document.getElementById('user-password').value;
            const role = document.getElementById('user-role').value;
            
            if (!username || !email || !password) {
                Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                return false;
            }
            
            return { username, email, password, role };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(result.value)
                });

                if (!response.ok) {
                    throw new Error('Không thể thêm người dùng mới');
                }

                const newUser = await response.json();
                showAlert('Thêm người dùng mới thành công', 'success');
                
                // Tải lại danh sách người dùng
                loadUsersData();
                
                // Tải lại dữ liệu tổng quan
                loadDashboardData();
                
                return newUser;
            } catch (error) {
                console.error('Lỗi khi thêm người dùng mới:', error);
                showAlert('Không thể thêm người dùng mới', 'error');
                return null;
            }
        }
    });
}

// Chỉnh sửa thông tin người dùng
function editUser(userId) {
    // Lấy thông tin người dùng cần chỉnh sửa
    fetch(`/api/auth/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
                const users = [
                    { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin' },
                    { id: '2', username: 'user1', email: 'user1@example.com', role: 'user' },
                    { id: '1743829450453', username: 'huy', email: 'minhhuy5929@gmail.com', role: 'user' }
                ];
                const user = users.find(u => u.id === userId);
                if (!user) throw new Error('Không tìm thấy người dùng');
                return user;
            }
            return response.json();
        })
        .then(user => {
            // Hiển thị form chỉnh sửa người dùng
            Swal.fire({
                title: 'Chỉnh sửa thông tin người dùng',
                html: `
                    <form id="edit-user-form" class="text-start">
                        <div class="mb-3">
                            <label for="user-username" class="form-label">Tên người dùng</label>
                            <input type="text" class="form-control" id="user-username" value="${user.username}" required>
                        </div>
                        <div class="mb-3">
                            <label for="user-email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="user-email" value="${user.email}" required>
                        </div>
                        <div class="mb-3">
                            <label for="user-role" class="form-label">Vai trò</label>
                            <select class="form-select" id="user-role">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Người dùng</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Quản trị viên</option>
                            </select>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Lưu thay đổi',
                cancelButtonText: 'Hủy',
                focusConfirm: false,
                preConfirm: () => {
                    // Lấy dữ liệu từ form
                    const username = document.getElementById('user-username').value;
                    const email = document.getElementById('user-email').value;
                    const role = document.getElementById('user-role').value;
                    
                    if (!username || !email) {
                        Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                        return false;
                    }
                    
                    return { username, email, role };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch(`/api/auth/users/${userId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify(result.value)
                        });

                        if (!response.ok) {
                            throw new Error('Không thể cập nhật thông tin người dùng');
                        }

                        showAlert('Cập nhật thông tin người dùng thành công', 'success');
                        
                        // Tải lại danh sách người dùng
                        loadUsersData();
                    } catch (error) {
                        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
                        showAlert('Không thể cập nhật thông tin người dùng', 'error');
                        
                        // Nếu API chưa được triển khai, vẫn tải lại danh sách để giả lập cập nhật
                        loadUsersData();
                    }
                }
            });
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            showAlert('Không thể lấy thông tin người dùng', 'error');
        });
}

// Xóa người dùng
function deleteUser(userId) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa người dùng này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc3545'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/auth/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể xóa người dùng');
                }

                showAlert('Xóa người dùng thành công', 'success');
                
                // Tải lại danh sách người dùng
                loadUsersData();
                
                // Tải lại dữ liệu tổng quan
                loadDashboardData();
            } catch (error) {
                console.error('Lỗi khi xóa người dùng:', error);
                showAlert('Không thể xóa người dùng', 'error');
                
                // Nếu API chưa được triển khai, vẫn tải lại danh sách để giả lập xóa
                loadUsersData();
            }
        }
    });
}
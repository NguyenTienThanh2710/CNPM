document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đường dẫn hiện tại
    if (!window.location.pathname.includes('/account.html')) return;

    // Kiểm tra trạng thái đăng nhập
    checkAuthStatus();

    // Khởi tạo các sự kiện
    initializeEvents();

    // Tải thông tin người dùng
    loadUserProfile();
});

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
        window.location.href = '/login.html?redirect=/account.html';
        return false;
    }
    
    return true;
}

// Khởi tạo các sự kiện
function initializeEvents() {
    // Xử lý chuyển đổi tab
    document.getElementById('profile-tab').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('profile');
    });
    
    document.getElementById('security-tab').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('security');
    });
    
    // Xử lý form cập nhật thông tin cá nhân
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Xử lý form đổi mật khẩu
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}

// Hiển thị section tương ứng
function showSection(section) {
    // Ẩn tất cả các section
    document.getElementById('profile-section').classList.add('d-none');
    document.getElementById('security-section').classList.add('d-none');
    
    // Bỏ active tất cả các tab
    document.getElementById('profile-tab').classList.remove('active');
    document.getElementById('security-tab').classList.remove('active');
    
    // Hiển thị section được chọn
    if (section === 'profile') {
        document.getElementById('profile-section').classList.remove('d-none');
        document.getElementById('profile-tab').classList.add('active');
    } else if (section === 'security') {
        document.getElementById('security-section').classList.remove('d-none');
        document.getElementById('security-tab').classList.add('active');
    }
}

// Tải thông tin người dùng
function loadUserProfile() {
    try {
        const userJson = localStorage.getItem('user');
        if (!userJson) return;
        
        const user = JSON.parse(userJson);
        
        // Điền thông tin vào form
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        showAlert('Không thể tải thông tin người dùng', 'danger');
    }
}

// Cập nhật thông tin cá nhân
async function updateProfile() {
    try {
        const userJson = localStorage.getItem('user');
        if (!userJson) return;
        
        const user = JSON.parse(userJson);
        
        // Lấy thông tin từ form
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        
        // Cập nhật thông tin người dùng
        user.fullName = fullName;
        user.phone = phone;
        user.address = address;
        
        // Lưu thông tin vào localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Hiển thị thông báo thành công
        showAlert('Cập nhật thông tin thành công', 'success');
        
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        showAlert('Không thể cập nhật thông tin', 'danger');
    }
}

// Đổi mật khẩu
async function changePassword() {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (newPassword !== confirmPassword) {
            showAlert('Mật khẩu mới và xác nhận mật khẩu không khớp', 'danger');
            return;
        }
        
        // Gọi API đổi mật khẩu (giả lập)
        // const response = await fetch('/api/auth/change-password', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${localStorage.getItem('token')}`
        //     },
        //     body: JSON.stringify({
        //         currentPassword,
        //         newPassword
        //     })
        // });
        
        // if (!response.ok) {
        //     throw new Error('Không thể đổi mật khẩu');
        // }
        
        // Giả lập đổi mật khẩu thành công
        // Reset form
        document.getElementById('password-form').reset();
        
        // Hiển thị thông báo thành công
        showAlert('Đổi mật khẩu thành công', 'success');
        
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        showAlert('Không thể đổi mật khẩu', 'danger');
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
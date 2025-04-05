document.addEventListener('DOMContentLoaded', function() {
    // Xử lý form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Đăng nhập không thành công');
                }
                
                // Lưu thông tin người dùng vào localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token || 'demo-token');
                
                // Khôi phục giỏ hàng của khách nếu có
                const guestCart = localStorage.getItem('guest_cart');
                if (guestCart) {
                    localStorage.setItem('cart', guestCart);
                    localStorage.removeItem('guest_cart');
                }
                
                // Hiển thị thông báo thành công
                showAlert('Đăng nhập thành công!', 'success');
                
                // Kiểm tra vai trò người dùng và chuyển hướng phù hợp
                setTimeout(() => {
                    // Nếu người dùng là admin, chuyển hướng đến trang quản trị
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        // Nếu không phải admin, chuyển hướng đến trang đã lưu hoặc trang chủ
                        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
                        localStorage.removeItem('redirectUrl');
                        window.location.href = redirectUrl;
                    }
                }, 1500);
                
            } catch (error) {
                const errorElement = document.getElementById('login-error');
                errorElement.textContent = error.message;
                errorElement.classList.remove('d-none');
            }
        });
    }
    
    // Xử lý form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Kiểm tra mật khẩu xác nhận
            if (password !== confirmPassword) {
                const errorElement = document.getElementById('register-error');
                errorElement.textContent = 'Mật khẩu xác nhận không khớp';
                errorElement.classList.remove('d-none');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Đăng ký không thành công');
                }
                
                // Hiển thị thông báo thành công
                showAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                
                // Chuyển hướng đến trang đăng nhập
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
                
            } catch (error) {
                const errorElement = document.getElementById('register-error');
                errorElement.textContent = error.message;
                errorElement.classList.remove('d-none');
            }
        });
    }
});

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.isAuthenticated) {
            // Xóa thông tin người dùng nếu phiên đăng nhập không hợp lệ
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
}

// Kiểm tra quyền admin
async function checkAdminAccess() {
    try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) return false;
        
        // Kiểm tra vai trò từ thông tin người dùng trong localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        
        const user = JSON.parse(userStr);
        return user && user.role === 'admin';
    } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        return false;
    }
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

// Xử lý form yêu cầu đặt lại mật khẩu
const resetRequestForm = document.getElementById('reset-request-form');
if (resetRequestForm) {
    resetRequestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('reset-email').value;
        const errorElement = document.getElementById('reset-request-error');
        const successElement = document.getElementById('reset-request-success');
        
        // Ẩn thông báo lỗi và thành công trước khi gửi yêu cầu
        errorElement.classList.add('d-none');
        successElement.classList.add('d-none');
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
            }
            
            // Hiển thị thông báo thành công
            successElement.textContent = 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.';
            successElement.classList.remove('d-none');
            
            // Lưu email để sử dụng ở bước tiếp theo
            localStorage.setItem('resetEmail', email);
            
            // Hiển thị form xác nhận sau 2 giây
            setTimeout(() => {
                document.getElementById('request-reset-container').classList.add('d-none');
                document.getElementById('confirm-reset-container').classList.remove('d-none');
            }, 2000);
            
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.classList.remove('d-none');
        }
    });
}

// Xử lý form xác nhận đặt lại mật khẩu
const resetConfirmForm = document.getElementById('reset-confirm-form');
if (resetConfirmForm) {
    resetConfirmForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const token = document.getElementById('reset-token').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorElement = document.getElementById('reset-confirm-error');
        const successElement = document.getElementById('reset-confirm-success');
        
        // Ẩn thông báo lỗi và thành công trước khi gửi yêu cầu
        errorElement.classList.add('d-none');
        successElement.classList.add('d-none');
        
        // Kiểm tra mật khẩu xác nhận
        if (password !== confirmPassword) {
            errorElement.textContent = 'Mật khẩu xác nhận không khớp';
            errorElement.classList.remove('d-none');
            return;
        }
        
        // Lấy email từ localStorage
        const email = localStorage.getItem('resetEmail');
        if (!email) {
            errorElement.textContent = 'Không tìm thấy thông tin email. Vui lòng thử lại từ đầu.';
            errorElement.classList.remove('d-none');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, token, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Không thể đặt lại mật khẩu');
            }
            
            // Hiển thị thông báo thành công
            successElement.textContent = 'Đặt lại mật khẩu thành công!';
            successElement.classList.remove('d-none');
            
            // Xóa email từ localStorage
            localStorage.removeItem('resetEmail');
            
            // Chuyển hướng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.classList.remove('d-none');
        }
    });
}
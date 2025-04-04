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
                
                // Hiển thị thông báo thành công
                showAlert('Đăng nhập thành công!', 'success');
                
                // Chuyển hướng về trang chủ
                setTimeout(() => {
                    window.location.href = '/';
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
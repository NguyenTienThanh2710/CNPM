 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Kiểm tra trạng thái đăng nhập
router.get('/check', authController.checkAuth);

// Đăng xuất
router.post('/logout', authController.logout);

// Quên mật khẩu - Gửi yêu cầu đặt lại
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu với token
router.post('/reset-password', authController.resetPassword);

// Lấy danh sách người dùng (chỉ dành cho admin)
router.get('/users', authController.getUsers);

// Lấy danh sách yêu cầu đặt lại mật khẩu (chỉ dành cho admin)
router.get('/password-reset-requests', authController.getPasswordResetRequests);

// Admin gửi mã xác nhận cho người dùng
router.post('/send-reset-token/:requestId', authController.sendResetToken);

// Admin xóa yêu cầu đặt lại mật khẩu
router.delete('/password-reset-request/:requestId', authController.deleteResetRequest);

module.exports = router;
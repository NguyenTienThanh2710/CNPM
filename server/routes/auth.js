 
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

module.exports = router;
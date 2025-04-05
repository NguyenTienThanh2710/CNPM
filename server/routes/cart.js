const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart-controller');

// Lấy giỏ hàng của người dùng
router.get('/', cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/add', cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update/:id', cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:id', cartController.removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear', cartController.clearCart);

// API đặt hàng
router.post('/orders', cartController.createOrder);

// API lấy thông tin đơn hàng
router.get('/orders/:orderId', cartController.getOrder);

module.exports = router;

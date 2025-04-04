const express = require('express');
const router = express.Router();
const productController = require('../controllers/product-controller');

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

// Thêm sản phẩm mới (chỉ admin)
router.post('/', productController.addProduct);

// Cập nhật sản phẩm (chỉ admin)
router.put('/:id', productController.updateProduct);

// Xóa sản phẩm (chỉ admin)
router.delete('/:id', productController.deleteProduct);

module.exports = router;

const fs = require('fs');
const path = require('path');
const cartsFile = path.join(__dirname, '../data/carts.json');
const productsFile = path.join(__dirname, '../data/products.json');

// Đọc dữ liệu giỏ hàng từ file
const getCarts = () => {
  try {
    if (!fs.existsSync(cartsFile)) {
      fs.writeFileSync(cartsFile, JSON.stringify({}), 'utf8');
      return {};
    }
    const data = fs.readFileSync(cartsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Đọc dữ liệu sản phẩm từ file
const getProducts = () => {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Lưu dữ liệu giỏ hàng vào file
const saveCarts = (carts) => {
  fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), 'utf8');
};

// Lấy giỏ hàng của người dùng
exports.getCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest'; // Trong thực tế, bạn sẽ lấy userId từ token
    const carts = getCarts();
    
    // Nếu giỏ hàng chưa tồn tại, tạo mới
    if (!carts[userId]) {
      carts[userId] = { items: [], total: 0 };
      saveCarts(carts);
    }
    
    res.status(200).json(carts[userId]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.headers['user-id'] || 'guest';
    const carts = getCarts();
    const products = getProducts();
    
    // Tìm sản phẩm theo ID
    const product = products.find(product => product.id === productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    // Nếu giỏ hàng chưa tồn tại, tạo mới
    if (!carts[userId]) {
      carts[userId] = { items: [], total: 0 };
    }
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = carts[userId].items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      // Nếu đã có, tăng số lượng
      carts[userId].items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới
      carts[userId].items.push({
        id: Date.now().toString(),
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });
    }
    
    // Tính lại tổng giá trị giỏ hàng
    carts[userId].total = carts[userId].items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    saveCarts(carts);
    
    res.status(200).json(carts[userId]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', error: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.headers['user-id'] || 'guest';
    const carts = getCarts();
    
    if (!carts[userId]) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    
    // Tìm vị trí sản phẩm trong giỏ hàng
    const itemIndex = carts[userId].items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Cập nhật số lượng
    carts[userId].items[itemIndex].quantity = quantity;
    
    // Xóa sản phẩm nếu số lượng <= 0
    if (quantity <= 0) {
      carts[userId].items.splice(itemIndex, 1);
    }
    
    // Tính lại tổng giá trị giỏ hàng
    carts[userId].total = carts[userId].items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    saveCarts(carts);
    
    res.status(200).json(carts[userId]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] || 'guest';
    const carts = getCarts();
    
    if (!carts[userId]) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    
    // Lọc ra các sản phẩm không bị xóa
    carts[userId].items = carts[userId].items.filter(item => item.id !== id);
    
    // Tính lại tổng giá trị giỏ hàng
    carts[userId].total = carts[userId].items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    saveCarts(carts);
    
    res.status(200).json(carts[userId]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = (req, res) => {
  try {
    const userId = req.headers['user-id'] || 'guest';
    const carts = getCarts();
    
    // Xóa giỏ hàng của người dùng
    if (carts[userId]) {
      carts[userId] = { items: [], total: 0 };
      saveCarts(carts);
    }
    
    res.status(200).json({ message: 'Đã xóa giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa giỏ hàng', error: error.message });
  }
};

// Tạo đơn hàng mới
exports.createOrder = (req, res) => {
  try {
    const { customerInfo, paymentMethod, cart, shippingFee } = req.body;
    const userId = req.headers['user-id'] || 'guest';

    // Validate dữ liệu đầu vào
    if (!customerInfo || !paymentMethod || !cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ' });
    }

    // Tạo mã đơn hàng
    const orderId = `ORD${Date.now()}`;

    // Tạo đơn hàng mới
    const order = {
      orderId,
      orderDate: new Date(),
      customerInfo,
      paymentMethod,
      cart,
      shippingFee,
      status: 'pending',
      userId
    };

    // Lưu đơn hàng vào file
    const ordersFile = path.join(__dirname, '../data/orders.json');
    let orders = [];

    try {
      if (fs.existsSync(ordersFile)) {
        orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
      }
    } catch (error) {
      console.error('Lỗi khi đọc file orders.json:', error);
    }

    orders.push(order);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');

    // Xóa giỏ hàng sau khi đặt hàng thành công
    const carts = getCarts();
    if (carts[userId]) {
      carts[userId] = { items: [], total: 0 };
      saveCarts(carts);
    }

    res.status(201).json({ orderId: order.orderId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};

// Lấy thông tin đơn hàng
exports.getOrder = (req, res) => {
  try {
    const { orderId } = req.params;
    const ordersFile = path.join(__dirname, '../data/orders.json');

    // Đọc file orders.json
    if (!fs.existsSync(ordersFile)) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const order = orders.find(order => order.orderId === orderId);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng', error: error.message });
  }
};

// Lấy lịch sử đơn hàng của người dùng
exports.getUserOrders = (req, res) => {
  try {
    const { userId } = req.params;
    const ordersFile = path.join(__dirname, '../data/orders.json');

    // Đọc file orders.json
    if (!fs.existsSync(ordersFile)) {
      return res.status(200).json([]);
    }

    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    
    // Lọc đơn hàng theo userId
    const userOrders = orders.filter(order => order.userId === userId);

    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử đơn hàng', error: error.message });
  }
};

// Cập nhật userId cho đơn hàng
exports.updateOrderUserId = (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;
    const ordersFile = path.join(__dirname, '../data/orders.json');

    // Đọc file orders.json
    if (!fs.existsSync(ordersFile)) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const orderIndex = orders.findIndex(order => order.orderId === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Cập nhật userId cho đơn hàng
    orders[orderIndex].userId = userId;

    // Lưu lại vào file
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');

    res.status(200).json({ message: 'Đã cập nhật userId cho đơn hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật userId cho đơn hàng', error: error.message });
  }
};

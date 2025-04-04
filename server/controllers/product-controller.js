const fs = require('fs');
const path = require('path');
const productsFile = path.join(__dirname, '../data/products.json');

// Đọc dữ liệu sản phẩm từ file
const getProducts = () => {
  try {
    const data = fs.readFileSync(productsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Lưu dữ liệu sản phẩm vào file
const saveProducts = (products) => {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
};

// Lấy tất cả sản phẩm
exports.getAllProducts = (req, res) => {
  try {
    const products = getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
  }
};

// Lấy chi tiết sản phẩm theo ID
exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const products = getProducts();
    
    const product = products.find(product => product.id === id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết sản phẩm', error: error.message });
  }
};

// Thêm sản phẩm mới (chỉ admin)
exports.addProduct = (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    const products = getProducts();
    
    // Tạo sản phẩm mới
    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price,
      image,
      category,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveProducts(products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm mới', error: error.message });
  }
};

// Cập nhật sản phẩm (chỉ admin)
exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;
    let products = getProducts();
    
    // Tìm vị trí sản phẩm cần cập nhật
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    // Cập nhật thông tin sản phẩm
    products[index] = {
      ...products[index],
      name: name || products[index].name,
      description: description || products[index].description,
      price: price || products[index].price,
      image: image || products[index].image,
      category: category || products[index].category,
      updatedAt: new Date().toISOString()
    };
    
    saveProducts(products);
    
    res.status(200).json(products[index]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
  }
};

// Xóa sản phẩm (chỉ admin)
exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    let products = getProducts();
    
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = products.find(product => product.id === id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    // Lọc ra các sản phẩm không bị xóa
    products = products.filter(product => product.id !== id);
    saveProducts(products);
    
    res.status(200).json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
  }
};

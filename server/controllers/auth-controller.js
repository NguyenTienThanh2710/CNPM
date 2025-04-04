const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, '../data/users.json');

// Đọc dữ liệu người dùng từ file
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Lưu dữ liệu người dùng vào file
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
};

// Đăng ký tài khoản mới
exports.register = (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = getUsers();

    // Kiểm tra xem email đã tồn tại chưa
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo người dùng mới
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // Lưu ý: Trong ứng dụng thực tế, bạn nên mã hóa mật khẩu
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản', error: error.message });
  }
};

// Đăng nhập
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();

    // Tìm người dùng theo email
    const user = users.find(user => user.email === email);

    // Kiểm tra người dùng và mật khẩu
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Trong ứng dụng thực tế, bạn sẽ tạo JWT token ở đây
    // và trả về token thay vì thông tin người dùng

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
  }
};

// Kiểm tra trạng thái đăng nhập
exports.checkAuth = (req, res) => {
  // Trong ứng dụng thực tế, bạn sẽ xác thực JWT token ở đây
  // và trả về thông tin người dùng từ token

  // Vì đây là demo, chúng ta giả định người dùng đã đăng nhập
  res.status(200).json({
    isAuthenticated: false,
    message: 'Bạn chưa đăng nhập'
  });
};

// Đăng xuất
exports.logout = (req, res) => {
  // Trong ứng dụng thực tế, bạn sẽ xử lý việc hủy token ở đây
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

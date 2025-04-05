const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, '../data/users.json');
const resetRequestsFile = path.join(__dirname, '../data/password-reset-requests.json');

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

  // Kiểm tra header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(200).json({
      isAuthenticated: false,
      message: 'Bạn chưa đăng nhập'
    });
  }

  // Trong demo này, chúng ta giả định token hợp lệ nếu nó tồn tại
  res.status(200).json({
    isAuthenticated: true,
    message: 'Đã xác thực thành công'
  });
};

// Đăng xuất
exports.logout = (req, res) => {
  // Trong ứng dụng thực tế, bạn sẽ xử lý việc hủy token ở đây
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

// Đọc dữ liệu yêu cầu đặt lại mật khẩu từ file
const getResetRequests = () => {
  try {
    const data = fs.readFileSync(resetRequestsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Lưu dữ liệu yêu cầu đặt lại mật khẩu vào file
const saveResetRequests = (requests) => {
  fs.writeFileSync(resetRequestsFile, JSON.stringify(requests, null, 2), 'utf8');
};

// Quên mật khẩu - Gửi yêu cầu đặt lại
exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;
    const users = getUsers();

    // Tìm người dùng theo email
    const user = users.find(user => user.email === email);

    // Kiểm tra xem email có tồn tại không
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Tạo token ngẫu nhiên (6 chữ số)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 3600000; // Hết hạn sau 1 giờ

    // Cập nhật thông tin token đặt lại mật khẩu cho người dùng
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    saveUsers(users);

    // Lưu yêu cầu đặt lại mật khẩu để admin xem
    const resetRequests = getResetRequests();
    const newRequest = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      email: user.email,
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
      status: 'pending', // pending, sent, completed, expired
      createdAt: new Date().toISOString()
    };
    resetRequests.push(newRequest);
    saveResetRequests(resetRequests);

    // Trong ứng dụng thực tế, bạn sẽ gửi email chứa token đến người dùng
    // Ở đây chúng ta chỉ giả lập việc gửi email

    res.status(200).json({
      message: 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.',
      // Trong môi trường phát triển, trả về token để dễ kiểm tra
      // Trong môi trường thực tế, KHÔNG nên trả về token
      token: resetToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xử lý yêu cầu đặt lại mật khẩu', error: error.message });
  }
};

// Đặt lại mật khẩu với token
exports.resetPassword = (req, res) => {
  try {
    const { email, token, password } = req.body;
    const users = getUsers();

    // Tìm người dùng theo email
    const user = users.find(user => user.email === email);

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
    }

    // Kiểm tra xem token có hợp lệ không
    if (!user.resetToken || user.resetToken !== token) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ' });
    }

    // Kiểm tra xem token có hết hạn không
    if (!user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Mã xác nhận đã hết hạn' });
    }

    // Cập nhật mật khẩu mới và xóa thông tin token
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    saveUsers(users);

    // Cập nhật trạng thái yêu cầu đặt lại mật khẩu
    const resetRequests = getResetRequests();
    const requestIndex = resetRequests.findIndex(req => req.email === email && req.resetToken === token);
    if (requestIndex !== -1) {
      resetRequests[requestIndex].status = 'completed';
      resetRequests[requestIndex].completedAt = new Date().toISOString();
      saveResetRequests(resetRequests);
    }

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
};

// Lấy danh sách người dùng (chỉ dành cho admin)
exports.getUsers = (req, res) => {
  try {
    const users = getUsers();
    
    // Loại bỏ thông tin mật khẩu và token trước khi trả về
    const usersWithoutSensitiveInfo = users.map(user => {
      const { password, resetToken, resetTokenExpiry, ...userInfo } = user;
      return userInfo;
    });
    
    res.status(200).json(usersWithoutSensitiveInfo);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

// Lấy danh sách yêu cầu đặt lại mật khẩu (chỉ dành cho admin)
exports.getPasswordResetRequests = (req, res) => {
  try {
    const resetRequests = getResetRequests();
    res.status(200).json(resetRequests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu cầu đặt lại mật khẩu', error: error.message });
  }
};

// Admin gửi mã xác nhận cho người dùng
exports.sendResetToken = (req, res) => {
  try {
    const { requestId } = req.params;
    const resetRequests = getResetRequests();
    
    // Tìm yêu cầu theo ID
    const requestIndex = resetRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lại mật khẩu' });
    }
    
    // Kiểm tra xem yêu cầu có hết hạn không
    if (resetRequests[requestIndex].resetTokenExpiry < Date.now()) {
      resetRequests[requestIndex].status = 'expired';
      saveResetRequests(resetRequests);
      return res.status(400).json({ message: 'Yêu cầu đặt lại mật khẩu đã hết hạn' });
    }
    
    // Cập nhật trạng thái yêu cầu
    resetRequests[requestIndex].status = 'sent';
    resetRequests[requestIndex].sentAt = new Date().toISOString();
    saveResetRequests(resetRequests);
    
    // Trong ứng dụng thực tế, bạn sẽ gửi email chứa token đến người dùng
    // Ở đây chúng ta chỉ giả lập việc gửi email
    
    res.status(200).json({
      message: 'Đã gửi mã xác nhận cho người dùng',
      token: resetRequests[requestIndex].resetToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gửi mã xác nhận', error: error.message });
  }
};

// Admin xóa yêu cầu đặt lại mật khẩu
exports.deleteResetRequest = (req, res) => {
  try {
    const { requestId } = req.params;
    let resetRequests = getResetRequests();
    
    // Kiểm tra xem yêu cầu có tồn tại không
    const request = resetRequests.find(req => req.id === requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu đặt lại mật khẩu' });
    }
    
    // Lọc ra các yêu cầu không bị xóa
    resetRequests = resetRequests.filter(req => req.id !== requestId);
    saveResetRequests(resetRequests);
    
    res.status(200).json({ message: 'Xóa yêu cầu đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa yêu cầu đặt lại mật khẩu', error: error.message });
  }
};

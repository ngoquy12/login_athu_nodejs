const express = require("express");
const server = express();
const port = 3001;
const bodyParser = require("body-parser");
server.use(express.json());
const jwt = require("jsonwebtoken");

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
const connection = require("./connectionMySQL");

const bcrypt = require("bcrypt");

server.post("/register", (req, res) => {
  const { UserName, Passwords } = req.body;

  // Trước khi đẩy dữ liệu lên db, mã hóa mật khẩu thông qua thư viện bcrypt
  bcrypt.hash(Passwords, 10, (err, hash) => {
    console.log(hash);
    if (err) {
      console.log("Thất bại", err);
      res.status(500).json({
        status: 500,
        message: err,
      });
    } else {
      // Lưu thông tin được hash lên db
      const query = "INSERT INTO user( UserName, Passwords) VALUES (?, ?);";
      connection.query(query, [UserName, hash], (err) => {
        if (err) {
          res.status(500).json({
            status: 500,
            message: err,
          });
        } else {
          res.status(201).json({
            status: "Ok",
            message: "Thêm mới thành công",
          });
        }
      });
    }
  });
});

// Chức năng đăng nhập
server.post("/login", (req, res) => {
  // Lấy thông tin từ người dùng gửi lên
  const { UserName, Passwords } = req.body;
  // Viết câu lệnh query lấy thông tin tất cả user
  const query = "SELECT * FROM user WHERE UserName=?";
  connection.query(query, [UserName], (err, result) => {
    if (err) {
      console.log("Đã có lỗi xảy ra", err);
    } else {
      // Nếu như có dữ liêu
      if (result.length === 0) {
        return res.status(404).json({
          status: "User not found",
          message: "User Không tồn tại trong hệ thống",
        });
      } else {
        // Lấy phần tử đầu tiên của mảng
        const user = result[0];
        // So sánh với chuỗi mật khẩu trong cơ sở dữ liệu
        bcrypt.compare(Passwords, user.Passwords, (err, isMatch) => {
          if (err) {
            return res.status(500).json({
              status: "Failed",
              message: err,
            });
          } else {
            if (!isMatch) {
              return res.status(404).json({
                status: "User not found",
                message: "User Không tồn tại trong hệ thống",
              });
            } else {
              // Chuỗi token
              const token = jwt.sign(
                {
                  id: user.id,
                  UserName: user.UserName,
                },
                "your secret key"
              );
              return res.status(200).json({ token });
            }
          }
        });
      }
    }
  });
});

server.listen(port, (req, res) => {
  console.log(`http://localhost:${port}`);
});

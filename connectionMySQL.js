const mysql = require("mysql");

// Khởi tạo kết nối đến database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  password: "22121944",
  database: "users",
  user: "root",
});

// Kiểm tra kết nối
connection.connect((err) => {
  if (err) {
    console.log("Kết nối thất bại", err);
  } else {
    console.log("Kết nối thành công");
  }
});

module.exports = connection;

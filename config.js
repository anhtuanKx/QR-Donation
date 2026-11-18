/* =========================================================
 * CẤU HÌNH TÀI KHOẢN NHẬN TIỀN — chỉ cần sửa file này
 * ========================================================= */
window.PAY_CONFIG = {
  bankName: "TPBank",                       // Tên ngân hàng
  bankFullName: "Ngân hàng TMCP Tiên Phong",
  bin: "970423",                            // Mã BIN ngân hàng (NAPAS). TPBank = 970423
  accountNumber: "00003605066",             // Số tài khoản
  accountHolder: "Chu Nguyễn Anh Tuấn",     // Tên chủ tài khoản (có dấu, để hiển thị)
  accountHolderAscii: "CHU NGUYEN ANH TUAN",// Tên không dấu (in trên ảnh QR)
  defaultMessage: "UNG HO TUAN",            // Nội dung mặc định khi nhập số tiền tùy chỉnh

  customMin: 1000,
  customMax: 500000000,

  // Các mệnh giá có sẵn. message: không dấu, tối đa 25 ký tự
  menu: [
    { id: "banhmi", title: "Ổ Bánh mì", amount: 20000, note: "Giòn rụm, đủ pate.", message: "MOI TUAN AN BANH MI", image: "images/banhmix.png" },
    { id: "pho", title: "Tô Phở", amount: 50000, note: "Nước dùng nóng hổi.", message: "MOI TUAN AN PHO", image: "images/phox.png" },
    { id: "lau", title: "Lẩu thơm ngon", amount: 100000, note: "Ngồi lâu, nói nhiều.", message: "MOI TUAN AN LAU", image: "images/laux.png" },
    { id: "buffet", title: "Mời Buffet", amount: 500000, note: "Ăn tới bến luôn.", message: "MOI TUAN DI BUFFET", image: "images/buffetx.png" }
  ]
};

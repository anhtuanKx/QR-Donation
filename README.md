# Website nhận thanh toán qua mã QR (VietQR)

Website tĩnh, chỉ gồm HTML/CSS/JS — không cần máy chủ, không cần cơ sở dữ liệu.
Mở trực tiếp file `index.html` bằng trình duyệt là chạy được.

## Cấu trúc
| File | Vai trò |
|---|---|
| `index.html` | Giao diện trang |
| `style.css` | Màu sắc, bố cục, hiệu ứng |
| `script.js` | Tạo mã VietQR, sao chép, tải ảnh QR |
| `config.js` | **Thông tin tài khoản ngân hàng & các mệnh giá — chỉ cần sửa file này** |
| `qrcode.js` | Thư viện vẽ mã QR (MIT, Kazuhiko Arase) — chạy offline |
| `images/` | Ảnh minh họa món ăn |

## Đổi thông tin ngân hàng
Mở `config.js`, sửa `bankName`, `bin`, `accountNumber`, `accountHolder`, `defaultMessage`…
Mã BIN một số ngân hàng: TPBank 970423 · Vietcombank 970436 · VietinBank 970415 · BIDV 970418 ·
Techcombank 970407 · MB 970422 · ACB 970416 · VPBank 970432 · Agribank 970405 · Sacombank 970403.
(Tra đầy đủ tại https://api.vietqr.io/v2/banks)

Mã QR được tạo ngay trên trình duyệt theo chuẩn VietQR (EMVCo/NAPAS 247), quét được bằng mọi app ngân hàng Việt Nam.
Website **không** tự xác nhận tiền đã vào tài khoản và **không** bao giờ hỏi mật khẩu/OTP.

## Đưa lên mạng miễn phí

### Cách 1 — Netlify Drop (nhanh nhất, không cần tài khoản GitHub)
1. Vào https://app.netlify.com/drop
2. Kéo thả cả thư mục `qr-thanh-toan` vào trang.
3. Nhận đường link dạng `https://ten-ngau-nhien.netlify.app`. Có thể đổi tên trong *Site settings → Change site name*.

### Cách 2 — GitHub Pages
1. Tạo repository mới trên https://github.com (ví dụ `qr-thanh-toan`), chọn *Public*.
2. Bấm *Add file → Upload files*, kéo thả toàn bộ file trong thư mục này (index.html phải nằm ở gốc), bấm *Commit*.
3. Vào *Settings → Pages* → *Source: Deploy from a branch* → chọn `main` / `(root)` → *Save*.
4. Sau 1–2 phút, website có tại `https://<ten-github>.github.io/qr-thanh-toan/`.

### Cách 3 — Vercel
1. Đưa code lên GitHub như cách 2 (bước 1–2).
2. Vào https://vercel.com → *Add New → Project* → chọn repository → *Deploy* (không cần cấu hình gì thêm).

Lưu ý: nút **Sao chép** hoạt động tốt nhất khi website chạy qua `https://` (sau khi đã đưa lên hosting).

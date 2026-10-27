# {Tên app} — Spec Lark Base Database

> Thay mọi ô `{…}` dạng chữ bằng nội dung thật. Giữ ô dạng số (`{90}`) nếu đó là giá trị cần người dùng xác nhận,
> và liệt kê chúng ở mục cuối. Kiểm tra: `node <skill>/scripts/lint_spec.mjs app-spec.md`.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng {tên app} dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho {người dùng}.
Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: {bước A}, {bước B}, {bước C} và {bước D}.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: {chỉ mình tôi / cả tổ chức / người cụ thể}.
- {Vai trò 1}: được xem …; được làm …; không được …
- {Vai trò 2}: …
- Trường nhạy cảm: {trường} chỉ {vai trò} được xem; không bao giờ trả về trình duyệt của người khác.

## 【3. Các bảng dữ liệu chính】
- {Bảng 1}: {trường chính}, trạng thái ({giá trị 1} / {giá trị 2} / …); liên kết {Bảng 2}.
- {Bảng 2}: …
- Nhật ký thao tác: đối tượng, loại thao tác, người thao tác, thời gian, nội dung trước và sau.
- Quy tắc lưu ảnh chụp (snapshot): {lưu gì, khi nào}.

## 【4. Các trang và chức năng chính】
* {Trang 1}: xem …; lọc theo …; quản lý …; thao tác …; trạng thái …
* {Trang 2}: …

## 【5. Quy tắc nghiệp vụ】
- Trạng thái: {A} → {B} → {C}; {từ chối/hủy} phải ghi lý do.
- Cách tính chỉ số: {Chỉ số} = {công thức}; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: bấm nhiều lần không tạo bản ghi trùng; {không vượt giới hạn …}; {chặn thao tác khi …}.
- Liên động: {khi X thì Y}.
- Lưu vết: {những thay đổi được ghi nhật ký}.
- Thông báo: {sự kiện} → {người nhận} (trong ứng dụng; nếu môi trường hỗ trợ thì gửi thêm tin nhắn Lark).

## 【6. Năng lực AI】
{Không dùng AI.} hoặc:
- Đầu vào: …
- Phân tích: chuyển yêu cầu thành dạng có cấu trúc để người dùng xác nhận; thiếu thông tin thì hỏi lại.
- Đầu ra: chỉ là bản nháp; người dùng xác nhận mới ghi vào Lark Base.
- Giới hạn: AI không được …
- Khi thất bại: giữ phần đã tạo, cho phép tạo tiếp; hỏi trước khi ghi đè.

## 【7. Bố cục】
{Điều hướng}; vùng chính: {chỉ số} → {thành phần trung tâm} → {danh sách}; chi tiết mở bằng ngăn kéo bên;
trên điện thoại ưu tiên {…}.

## 【8. Phong cách giao diện】
{Preset hoặc mô tả nền, màu nhấn, thẻ, viền}; mỗi trạng thái một màu cố định; hỗ trợ giao diện sáng và tối.
Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ; tiền tệ VND.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác đều ghi thật vào Lark Base; tải lại trang không mất dữ liệu đang làm.
- Các trang liên kết qua lại; từ thông báo mở đúng bản ghi.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {số lượng theo bảng}, phủ mọi trạng thái và vai trò, đi hết luồng chính.
- Tài khoản demo: {số người theo vai trò}; có thể chuyển vai trò để trải nghiệm.
- Kịch bản nghiệm thu:
  ① {luồng chính từ đầu đến cuối}
  ② {trường hợp biên}
  ③ {người A không xem/sửa được dữ liệu của người B; trường nhạy cảm không lộ}
  ④ Tải lại trang giữa chừng → dữ liệu đang làm vẫn còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- `{…}`: ý nghĩa — lý do chọn.

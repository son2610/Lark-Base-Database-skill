# Mẫu: Không gian hiệu suất cá nhân

> Nhóm: Cá nhân · Preset: `soft-lavender` (tiêu đề có chân từ `paper-terracotta` nếu muốn) · Bố cục: tối giản, thanh điều hướng dạng viên thuốc ở giữa · Nguồn: prompt mẫu "个人效率工作台" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: một người muốn gom việc, chọn việc quan trọng nhất trong ngày, tập trung theo phiên 25 phút và tổng kết. Biến thể: dùng cho cả nhóm nhỏ, mỗi người chỉ thấy dữ liệu của mình (lọc bằng `CURRENT_USER_ID()`).

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng không gian hiệu suất cá nhân dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho một người dùng. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: ghi nhanh việc, lập kế hoạch trong ngày, tập trung thực hiện, tổng kết.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: chỉ mình tôi (hoặc người cụ thể, mỗi người chỉ thấy dữ liệu của mình).
- Một người dùng; dữ liệu chỉ người tạo truy cập — mọi Function lọc theo người đang đăng nhập.

## 【3. Các bảng dữ liệu chính】
- Việc: tiêu đề, phân loại (Trọng tâm / Quan trọng / Thường / Tổng kết), ưu tiên, hạn, trạng thái (Chưa làm / Đang làm / Xong), trọng tâm hôm nay (ngày), mục tiêu (liên kết), người tạo, hoàn thành lúc.
- Mục tiêu: tên, kỳ (tuần/tháng/quý), tiến độ (công thức từ việc liên quan), trạng thái, người tạo.
- Phiên tập trung: việc, bắt đầu lúc, kết thúc lúc, số phút thực tế (FaaS tính), kết quả (xong / dở), trạng thái (Đang chạy / Đã kết thúc), người tạo.
- Tổng kết: ngày, cảm nhận hoàn thành (1–5), điều học được, việc tiếp theo, người tạo.

## 【4. Các trang và chức năng chính】
* Hôm nay: ngày, lời chào theo tên, việc trọng tâm hôm nay với nút "Bắt đầu tập trung 25 phút"; ô ghi nhanh với chọn phân loại; bốn thẻ tổng quan bên dưới.
* Việc: quản lý việc và mục tiêu, ưu tiên, hạn, trạng thái; tìm kiếm, lọc, sửa (ngăn kéo), hoàn thành, mở lại; đặt làm trọng tâm hôm nay; gắn mục tiêu và xem tiến độ.
* Tập trung: bắt đầu, tạm dừng, kết thúc theo việc đã chọn; hiển thị đếm ngược lớn và việc hiện tại; kết thúc thì chọn hoàn thành việc hoặc làm tiếp phiên mới.
* Tổng kết: theo ngày/tuần xem việc đã xong, thời gian tập trung, tiến độ mục tiêu; ghi cảm nhận, điều học được, việc tiếp theo; xem và sửa tổng kết cũ.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái việc: Chưa làm → Đang làm → Xong; mở lại thì xóa thời điểm hoàn thành và cập nhật thống kê.
- Cách tính chỉ số: Tỷ lệ hoàn thành hôm nay = Việc xong hôm nay / Việc có hạn hoặc trọng tâm hôm nay; Phút tập trung = tổng số phút thực tế của phiên đã kết thúc; tiến độ mục tiêu = việc xong / việc của mục tiêu; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: chỉ một phiên tập trung "Đang chạy" tại một thời điểm; tải lại trang tiếp tục đúng phiên đang chạy (thời gian tính theo thời điểm bắt đầu lưu trên máy chủ), không tạo phiên mới; kết thúc phiên hai lần không cộng phút hai lần; mỗi ngày một bản tổng kết (sửa bản cũ thay vì tạo mới).
- Lưu vết: không cần nhật ký thao tác.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Thanh trên dạng viên thuốc ở giữa (thương hiệu, Hôm nay, Việc, Tổng kết, tìm kiếm, tài khoản). Trang Hôm nay mở đầu bằng ngày và lời chào chữ lớn; bên trái việc trọng tâm và nút tập trung, bên phải ô ghi nhanh; dưới là bốn thẻ tổng quan. Sửa việc bằng ngăn kéo; trang tập trung nổi bật đồng hồ đếm ngược. Trên điện thoại ưu tiên ghi nhanh và tập trung.

## 【8. Phong cách giao diện】
Preset `soft-lavender`: nền gradient tím nhạt sang xanh nhạt, thẻ trắng bo lớn, nút tím; lời chào và tiêu đề trọng tâm dùng chữ có chân; số liệu rõ ràng. Văn phong nhẹ nhàng, khích lệ hành động và tổng kết. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang giữ trạng thái việc và phiên tập trung đang chạy.
- Các trang cập nhật đồng bộ sau khi ghi.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {20} việc (công việc và đời sống), {3} mục tiêu, {12} phiên tập trung trong 7 ngày qua, {5} bản tổng kết.
- Kịch bản nghiệm thu:
  ① Ghi nhanh một việc → đặt làm trọng tâm → bắt đầu tập trung 25 phút → kết thúc và đánh dấu xong → thẻ tổng quan và tổng kết ngày cập nhật.
  ② Tải lại trang khi đang tập trung → tiếp tục đúng phiên, thời gian còn lại đúng; không có phiên thứ hai.
  ③ Bấm kết thúc phiên hai lần → phút tập trung chỉ cộng một lần.
  ④ Mở lại việc đã xong → thống kê hôm nay giảm đúng.
  ⑤ Người dùng khác (nếu phát hành cho nhiều người) không thấy dữ liệu của tôi.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Độ dài phiên tập trung mặc định `{25}` phút; số lượng dữ liệu mẫu.

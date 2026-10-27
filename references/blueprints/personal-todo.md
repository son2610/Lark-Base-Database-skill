# Mẫu: Việc cần làm cá nhân

> Nhóm: Cá nhân · Preset: `paper-terracotta` (đổi màu nhấn sang xanh lá dịu nếu muốn) · Bố cục: ba vùng — điều hướng trái (Hôm nay, Hộp thu, Dự án), danh sách giữa, ngăn kéo sửa bên phải · Nguồn: prompt mẫu "个人待办工具" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: quản lý việc cá nhân theo kiểu Things/Todoist trên dữ liệu Lark Base. Có thể dùng Mutation cho mọi thao tác ghi (một người dùng, lọc đọc theo người tạo) — đơn giản, ít code.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng công cụ quản lý việc cần làm cá nhân dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho một người dùng. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: ghi nhanh, sắp xếp việc, theo dõi dự án, tổng kết hoàn thành.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: chỉ mình tôi.
- Một người dùng; dữ liệu chỉ người tạo truy cập — mọi Function đọc lọc theo người đang đăng nhập.

## 【3. Các bảng dữ liệu chính】
- Việc: tiêu đề, ghi chú, dự án (liên kết), ưu tiên (Cao / Trung bình / Thấp), hạn, nhắc lúc, nhãn (chọn nhiều), trạng thái (Hộp thu / Đã lên kế hoạch / Xong), làm hôm nay (ngày), việc cha (liên kết, cho việc con), hoàn thành lúc, đã xóa (cờ, để hoàn tác), người tạo.
- Dự án: tên, mục tiêu, ngày bắt đầu/kết thúc kế hoạch, trạng thái (Đang chạy / Lưu trữ), tỷ lệ hoàn thành (công thức), người tạo.
- Tổng kết tuần: tuần, tóm tắt, trọng tâm tuần sau, người tạo.

## 【4. Các trang và chức năng chính】
* Hôm nay: việc đến hạn hôm nay, quá hạn và việc chủ động đưa vào hôm nay; nổi bật việc quan trọng; thêm nhanh, hoàn thành, đổi ngày.
* Hộp thu: ghi nhanh việc và ý tưởng, bổ sung dự án/ưu tiên/hạn/nhãn sau; phân loại hàng loạt.
* Tất cả việc: tìm kiếm không dấu, lọc theo dự án, trạng thái, ưu tiên, nhãn; sắp xếp; hoàn thành và mở lại hàng loạt; chi tiết có ghi chú, việc con, thời gian nhắc.
* Dự án: mục tiêu và ngày kế hoạch, việc theo nhóm và tỷ lệ hoàn thành; lưu trữ và khôi phục (cảnh báo nếu còn việc chưa xong).
* Kế hoạch và tổng kết: lịch tuần các việc đến hạn; việc đã xong, quá hạn, tiến độ dự án; ghi tổng kết ngắn và trọng tâm tuần sau.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái việc: Hộp thu → Đã lên kế hoạch → Xong; hoàn thành ghi thời điểm, mở lại xóa thời điểm và cập nhật thống kê.
- Cách tính chỉ số: tỷ lệ hoàn thành dự án = việc xong / tổng việc (không tính việc đã xóa); quá hạn = hạn < hôm nay và chưa xong; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: xóa là đánh dấu "đã xóa" và cho hoàn tác trong {10} giây (không xóa vĩnh viễn ngay); lưu trữ dự án còn việc chưa xong phải xác nhận; việc con, tiến độ dự án và trang Hôm nay luôn nhất quán; thêm nhanh bấm Enter nhiều lần không tạo trùng.
- Lưu vết: không cần nhật ký thao tác.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Điều hướng trái (Hôm nay, Hộp thu, Dự án), danh sách việc nhẹ ở giữa, ngăn kéo sửa bên phải; thanh trên có tìm kiếm và thêm nhanh; ô đánh dấu và chọn ngày dễ thao tác. Trên điện thoại dùng điều hướng dưới đáy và nút thêm nổi.

## 【8. Phong cách giao diện】
Preset `paper-terracotta` với {màu nhấn xanh lá dịu}: nền giấy kem, đường phân cách mảnh, ít trang trí, tiêu đề việc là trọng tâm. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác (kèm "Hoàn tác" khi xóa); thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất việc đang sửa.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {3} dự án (1 lưu trữ), {35} việc công việc và đời sống đủ trạng thái, có việc con và nhãn, {2} bản tổng kết tuần.
- Kịch bản nghiệm thu:
  ① Ghi nhanh vào Hộp thu → gán dự án và hạn hôm nay → xuất hiện ở Hôm nay → hoàn thành → tỷ lệ dự án tăng.
  ② Xóa một việc → bấm Hoàn tác → việc trở lại; không hoàn tác → việc biến mất khỏi danh sách và thống kê.
  ③ Lưu trữ dự án còn việc chưa xong → phải xác nhận.
  ④ Mở lại việc đã xong → thống kê tuần cập nhật đúng.
  ⑤ Tải lại trang khi đang sửa ghi chú → nội dung còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Thời gian hoàn tác xóa `{10}` giây; màu nhấn `{màu nhấn xanh lá dịu}`.

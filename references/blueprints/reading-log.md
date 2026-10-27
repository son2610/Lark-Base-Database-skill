# Mẫu: Nhật ký đọc sách

> Nhóm: Cá nhân · Preset: `paper-terracotta` · Bố cục: thanh trên (Kệ sách, Ghi chú, Tổng kết) + lưới bìa sách; chi tiết sách hai cột · Nguồn: prompt mẫu "个人阅读记录工具" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: theo dõi sách muốn đọc/đang đọc/đã đọc, ghi trích dẫn và cảm nhận. Biến thể: câu lạc bộ sách nội bộ (thêm vai trò, mỗi người thấy kệ của mình và ghi chú chia sẻ).

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng nhật ký đọc sách cá nhân dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho một người dùng. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: kệ sách, tiến độ đọc, ghi chú trích dẫn, tổng kết đọc.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: chỉ mình tôi.
- Một người dùng; dữ liệu chỉ người tạo truy cập.

## 【3. Các bảng dữ liệu chính】
- Quan hệ: Sách 1–n Lượt đọc 1–n Buổi đọc; Sách 1–n Ghi chú (liên kết).
- Sách: tên, tác giả, ảnh bìa (đính kèm), thể loại, nhãn, tổng số trang, mục tiêu (ngày muốn đọc xong), trạng thái (Muốn đọc / Đang đọc / Đã đọc), trang hiện tại, điểm (1–5), cảm nhận ngắn, ngày hoàn thành, người tạo.
- Lượt đọc: sách, lần đọc thứ (đọc lại tạo lượt mới), bắt đầu, kết thúc, trạng thái.
- Buổi đọc: lượt đọc, ngày, trang từ – đến, số phút, cảm nghĩ.
- Ghi chú: sách, chương, trang, loại (trích dẫn / suy nghĩ), nội dung, nhãn.
- Tổng kết giai đoạn: kỳ (tháng/quý), tóm tắt, sách tiếp theo.

## 【4. Các trang và chức năng chính】
* Kệ sách: lưới bìa theo Muốn đọc / Đang đọc / Đã đọc; lọc theo tác giả, thể loại, nhãn; tìm kiếm; thêm sách.
* Chi tiết sách: trái là bìa và tiến độ, phải là các buổi đọc và ghi chú; cập nhật trang hiện tại; đọc xong thì chấm điểm và viết cảm nhận.
* Buổi đọc: ghi trang bắt đầu/kết thúc, thời gian, cảm nghĩ; bổ sung và sửa buổi cũ; tổng thời gian đọc mỗi cuốn.
* Ghi chú: theo sách và chương, trích dẫn và suy nghĩ kèm trang; nhãn, tìm toàn văn, sửa; từ ghi chú mở về đúng sách.
* Tổng kết: số sách đọc xong trong tháng, số trang, thời gian, phân bố thể loại, lịch đọc; ghi tổng kết giai đoạn và sách tiếp theo.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái sách: Muốn đọc → Đang đọc → Đã đọc; đọc lại tạo lượt đọc mới, giữ ghi chú và lịch sử của lượt cũ.
- Cách tính chỉ số: Tiến độ = Trang hiện tại / Tổng số trang (không hiển thị % khi thiếu tổng số trang); số trang đã đọc = tổng (trang đến − trang từ + 1) của các buổi; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: trang hiện tại trong khoảng 1 – tổng số trang; trang đến ≥ trang từ; cùng một ngày đọc nhiều lần lưu thành nhiều buổi; sửa buổi đọc thì tính lại thống kê; đọc xong tự ghi ngày hoàn thành.
- Lưu vết: không cần nhật ký thao tác.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Thanh trên (Kệ sách, Ghi chú, Tổng kết) và tìm kiếm toàn cục; vùng chính là lưới bìa sách; chi tiết hai cột; ghi nhanh buổi đọc và ghi chú bằng ngăn kéo. Trên điện thoại tối ưu ghi nhanh bằng một tay.

## 【8. Phong cách giao diện】
Preset `paper-terracotta`: nền giấy kem, chữ nâu đậm, màu đất nung dịu; tên sách dùng chữ có chân, số liệu rõ ràng; nhiều khoảng trắng. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất ghi chú đang viết.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {12} cuốn sách hư cấu (tên và tác giả tự đặt, bìa tự tạo), đủ ba trạng thái, {1} cuốn đọc lại, {25} buổi đọc, {30} ghi chú tự viết (không trích tác phẩm có bản quyền).
- Kịch bản nghiệm thu:
  ① Thêm sách → bắt đầu đọc → ghi 3 buổi đọc → tiến độ đúng → đọc xong, chấm điểm → tổng kết tháng tăng.
  ② Nhập trang hiện tại lớn hơn tổng số trang → bị chặn.
  ③ Đọc lại một cuốn → lượt đọc mới, ghi chú cũ vẫn còn.
  ④ Sách thiếu tổng số trang → không hiển thị %.
  ⑤ Tải lại trang khi đang viết ghi chú → nội dung còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Số lượng dữ liệu mẫu; có cần chế độ câu lạc bộ sách (nhiều người) hay không.

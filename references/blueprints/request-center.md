# Mẫu: Trung tâm yêu cầu của nhóm

> Nhóm: Quy trình nhóm · Preset: `slate-indigo` · Bố cục: Workbench, chuyển đổi bảng/Kanban, chi tiết bằng ngăn kéo rộng có dòng thời gian · Nguồn: prompt mẫu "团队需求中心" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: đội sản phẩm/IT/vận hành tiếp nhận yêu cầu từ nhiều bộ phận, đánh giá, xếp vào đợt (sprint), nghiệm thu. Biến thể: helpdesk nội bộ, đề xuất cải tiến, quản lý lỗi.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng trung tâm yêu cầu của nhóm dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho người gửi yêu cầu, người đánh giá và người phụ trách. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: thu thập yêu cầu, đánh giá, xếp vào đợt phát triển, nghiệm thu và phát hành.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức.
- Người gửi: tạo yêu cầu, lưu nháp, xem tiến độ yêu cầu của mình, bình luận.
- Người đánh giá (product owner): đánh giá, ước lượng, chọn người phụ trách, đưa vào đợt, đóng/trả lại (có lý do), gộp yêu cầu trùng.
- Người phụ trách: cập nhật trạng thái thực hiện, đánh dấu nghiệm thu từng tiêu chí.
- Quản trị viên: sản phẩm/mảng, thành viên, vai trò.
- Trường nhạy cảm: không có trường nhạy cảm về tiền; bình luận nội bộ (đánh dấu "nội bộ") chỉ người đánh giá và người phụ trách được xem.

## 【3. Các bảng dữ liệu chính】
- Thành viên: tài khoản Lark, vai trò, mảng phụ trách.
- Sản phẩm/Mảng: tên, người đánh giá.
- Yêu cầu: mã (YC-NNNN), tiêu đề, bối cảnh vấn đề, người dùng mục tiêu, giá trị kỳ vọng, tiêu chí nghiệm thu (danh sách), đính kèm, nguồn, mức ưu tiên (P0–P3), trạng thái, người gửi, người phụ trách, đợt, ước lượng (điểm/ngày công), yêu cầu liên quan, gộp vào (liên kết), lý do đóng/trả lại/hoãn.
- Bình luận: yêu cầu, người viết, nội dung, nội bộ (có/không), thời điểm.
- Đợt (sprint/iteration): tên, mục tiêu, ngày bắt đầu, ngày kết thúc, trạng thái.
- Kết quả nghiệm thu: yêu cầu, tiêu chí, đạt/không đạt, người xác nhận, thời điểm.
- Thông báo; Nhật ký thao tác (dòng thời gian của yêu cầu).

## 【4. Các trang và chức năng chính】
* Tổng quan công việc: chờ đánh giá, đang làm, chờ nghiệm thu, quá hạn; lọc theo mảng, người phụ trách, đợt; xu hướng hoàn thành theo đợt.
* Gửi yêu cầu: form có bối cảnh, người dùng mục tiêu, giá trị, đính kèm, tiêu chí nghiệm thu; lưu nháp; "Yêu cầu của tôi" xem tiến độ.
* Kho yêu cầu: chuyển giữa bảng và Kanban trạng thái; lọc theo ưu tiên, nguồn, người phụ trách; chi tiết có thảo luận, yêu cầu liên quan, lịch sử thay đổi; gộp yêu cầu trùng và giữ nguồn.
* Đánh giá và xếp đợt: ghi kết luận, ước lượng, phụ thuộc, người phụ trách; đưa vào đợt; hoãn/trả lại/đóng phải ghi lý do.
* Đợt và nghiệm thu: mục tiêu và thời gian đợt; theo dõi Đang làm → Kiểm thử → Chờ nghiệm thu → Đã phát hành; xác nhận từng tiêu chí; ghi kết quả phát hành.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái: Nháp → Chờ đánh giá → Đã duyệt → Trong đợt → Đang làm → Kiểm thử → Chờ nghiệm thu → Đã phát hành; hoặc Trả lại / Hoãn / Đóng / Đã gộp (bắt buộc lý do).
- Cách tính chỉ số: tiến độ đợt = số yêu cầu Đã phát hành / số yêu cầu hiệu lực trong đợt (không tính yêu cầu đã đóng hoặc chuyển khỏi đợt); quá hạn = chưa phát hành khi đợt đã kết thúc; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: chỉ chuyển "Đã phát hành" khi mọi tiêu chí nghiệm thu đạt; gộp yêu cầu giữ người gửi và bình luận của yêu cầu gốc; gửi form nhiều lần không tạo trùng; không đưa yêu cầu vào đợt đã kết thúc.
- Liên động: đóng hoặc chuyển yêu cầu khỏi đợt → tiến độ đợt tính lại; yêu cầu bị gộp → người gửi nhận thông báo kèm link yêu cầu đích.
- Lưu vết: mọi đổi trạng thái, ưu tiên, người phụ trách, đợt ghi người và thời điểm (hiển thị thành dòng thời gian).
- Thông báo: yêu cầu mới → người đánh giá của mảng; đổi trạng thái → người gửi; yêu cầu bị chặn hoặc quá hạn → người phụ trách.

## 【6. Năng lực AI】
Không dùng AI. (Tùy chọn: gợi ý yêu cầu có thể trùng khi người gửi nhập tiêu đề — chỉ gợi ý, người đánh giá quyết định gộp.)

## 【7. Bố cục】
Điều hướng trái theo nhóm; thanh trên có tìm kiếm toàn cục và nút "Gửi yêu cầu". Vùng chính chuyển giữa bảng và Kanban; chi tiết yêu cầu bằng ngăn kéo rộng (bối cảnh · thảo luận · dòng thời gian). Trên điện thoại ưu tiên gửi yêu cầu, tra cứu và bình luận.

## 【8. Phong cách giao diện】
Preset `slate-indigo`: nền xám nhạt, vùng nội dung trắng, màu chàm; màu trạng thái tiết chế, nổi bật ưu tiên cao và mục bị chặn. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất bản nháp yêu cầu.
- Từ thông báo mở đúng yêu cầu; liên kết yêu cầu liên quan hai chiều.
- Phân quyền được kiểm tra ở phía máy chủ; bình luận nội bộ không trả về trình duyệt người gửi.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {3} mảng, {10} thành viên, {2} đợt (1 đang chạy, 1 đã xong), {30} yêu cầu đủ mọi trạng thái, có 1 cặp trùng đã gộp, bình luận công khai và nội bộ.
- Tài khoản demo: chủ app; chuyển vai trò Người gửi / Người đánh giá / Người phụ trách.
- Kịch bản nghiệm thu:
  ① Gửi yêu cầu → đánh giá → đưa vào đợt → làm → nghiệm thu đủ tiêu chí → phát hành; tiến độ đợt tăng đúng.
  ② Chuyển "Đã phát hành" khi còn tiêu chí chưa đạt → bị chặn.
  ③ Gộp hai yêu cầu trùng → người gửi yêu cầu bị gộp nhận thông báo, bình luận còn đủ.
  ④ Người gửi không thấy bình luận nội bộ; không sửa được yêu cầu của người khác.
  ⑤ Đóng yêu cầu không ghi lý do → bị chặn.
  ⑥ Tải lại trang khi đang soạn yêu cầu → bản nháp còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Thang ưu tiên P0–P3; đơn vị ước lượng (điểm/ngày công); số lượng dữ liệu mẫu.

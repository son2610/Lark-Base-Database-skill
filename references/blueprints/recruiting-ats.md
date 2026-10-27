# Mẫu: Quản lý tuyển dụng (ATS)

> Nhóm: Quy trình nhóm · Preset: `slate-indigo` (xanh ngọc trầm) · Bố cục: Workbench + Kanban giai đoạn + chi tiết ứng viên chia cột · Nguồn: prompt mẫu "招聘管理工作台" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: HR + quản lý tuyển dụng nhiều vị trí, có phỏng vấn nhiều vòng. Không hợp khi: cần cổng ứng tuyển công khai cho ứng viên bên ngoài (app chỉ trong tổ chức) → dùng Form gốc của Base để thu hồ sơ, app xử lý phía sau.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng hệ thống quản lý tuyển dụng dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho nhân sự tuyển dụng, quản lý tuyển dụng và người phỏng vấn. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: nhu cầu tuyển dụng, theo dõi ứng viên, phỏng vấn và đánh giá, offer và nhận việc.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: người cụ thể (HR, quản lý tuyển dụng, người phỏng vấn).
- Nhân sự tuyển dụng (HR): quản lý vị trí được giao, ứng viên, hồ sơ ứng tuyển, lịch phỏng vấn, offer.
- Quản lý tuyển dụng (hiring manager): xem vị trí của bộ phận mình, đánh giá, quyết định đạt/loại ở vòng cuối, duyệt offer trong hạn mức.
- Người phỏng vấn: chỉ xem ứng viên và tài liệu của buổi phỏng vấn được phân công; nộp đánh giá của mình.
- Quản trị viên: thành viên, vai trò, bộ phận.
- Trường nhạy cảm: mức lương mong muốn, mức offer, số điện thoại, CMND/CCCD chỉ HR và quản lý tuyển dụng của vị trí đó được xem.

## 【3. Các bảng dữ liệu chính】
- Quan hệ: Vị trí 1–n Hồ sơ ứng tuyển n–1 Ứng viên; Hồ sơ ứng tuyển 1–n Buổi phỏng vấn 1–n Đánh giá; Hồ sơ ứng tuyển 1–1 Offer (liên kết hai chiều).
- Thành viên: tài khoản Lark, vai trò, bộ phận.
- Vị trí tuyển: tên, bộ phận, mô tả, yêu cầu, số lượng (headcount), nơi làm việc, HR phụ trách, quản lý tuyển dụng, trạng thái (Đang tuyển / Tạm dừng / Đã đóng), các vòng phỏng vấn.
- Ứng viên: họ tên, email, điện thoại, nguồn (giới thiệu / web / mạng xã hội / headhunter), CV (đính kèm), kỹ năng, khóa chống trùng (email/điện thoại chuẩn hóa).
- Hồ sơ ứng tuyển: ứng viên, vị trí, giai đoạn (Sàng lọc → Phỏng vấn vòng 1 → Phỏng vấn vòng 2 → Offer → Nhận việc / Loại / Rút), kết luận từng giai đoạn, bước tiếp theo, lý do loại/rút, mức lương mong muốn.
- Buổi phỏng vấn: hồ sơ ứng tuyển, vòng, thời gian, hình thức (trực tiếp / video), địa điểm/link, người phỏng vấn (nhiều người), trạng thái.
- Đánh giá phỏng vấn: buổi phỏng vấn, người đánh giá, điểm theo tiêu chí năng lực (JSON hoặc các trường điểm), kết luận (Đạt / Cân nhắc / Không đạt), nhận xét.
- Offer: hồ sơ ứng tuyển, mức lương, ngày bắt đầu dự kiến, trạng thái (Chờ duyệt → Đã gửi → Đã nhận / Từ chối / Hết hạn), người duyệt, ngày nhận việc thực tế.
- Thông báo; Nhật ký thao tác.
- Quy tắc lưu ảnh chụp (snapshot): offer lưu mức lương và chức danh tại thời điểm duyệt.

## 【4. Các trang và chức năng chính】
* Tổng quan tuyển dụng: vị trí đang tuyển, ứng viên chờ xử lý, phỏng vấn sắp tới, offer đang chờ; lọc theo bộ phận, vị trí, HR; tỷ lệ chuyển đổi theo nguồn và thời gian tuyển trung bình.
* Vị trí: mở, tạm dừng, đóng; chi tiết gồm ứng viên theo giai đoạn và tiến độ headcount.
* Kho ứng viên: nhập hồ sơ, tìm kiếm không dấu, lọc theo kỹ năng/nguồn; cảnh báo trùng khi nhập; dòng thời gian của ứng viên.
* Quy trình tuyển (Kanban): cột theo giai đoạn, kéo thả hoặc nút chuyển; chuyển giai đoạn ghi kết luận và bước tiếp theo; loại/rút phải ghi lý do.
* Phỏng vấn: lịch của tôi, đặt lịch (ngăn kéo), cảnh báo trùng lịch người phỏng vấn, form đánh giá theo năng lực.
* Offer và nhận việc: tạo offer, duyệt, đánh dấu gửi/nhận/từ chối, nhắc ngày nhận việc.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái hồ sơ ứng tuyển: Sàng lọc → Phỏng vấn vòng 1 → Phỏng vấn vòng 2 → Offer → Nhận việc, hoặc Loại / Rút ở bất kỳ bước nào (bắt buộc lý do); chỉ HR và quản lý tuyển dụng chuyển giai đoạn.
- Cách tính chỉ số: tỷ lệ chuyển đổi theo nguồn = số hồ sơ đạt Offer / số hồ sơ theo nguồn; thời gian tuyển = ngày nhận việc − ngày tạo hồ sơ; thống kê dựa trên bảng Hồ sơ ứng tuyển (không đếm ứng viên trùng); thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: ứng viên trùng email/điện thoại → cảnh báo và gợi ý gộp, không tạo trùng; một ứng viên chỉ có một hồ sơ hiệu lực cho mỗi vị trí; người phỏng vấn không bị xếp hai buổi trùng giờ; không mở offer khi vị trí đã đủ headcount; offer vượt khung lương cần quản lý duyệt.
- Liên động: offer được nhận → hồ sơ chuyển Nhận việc, headcount còn lại giảm; vị trí đóng → hồ sơ đang mở được nhắc xử lý.
- Lưu vết: chuyển giai đoạn, sửa đánh giá, sửa offer ghi nhật ký.
- Thông báo: được phân công phỏng vấn → người phỏng vấn (kèm link buổi); đánh giá chưa nộp sau {24} giờ → nhắc; offer chờ duyệt → quản lý.
- Quyết định đạt/loại luôn do người thực hiện, hệ thống không tự loại ứng viên.

## 【6. Năng lực AI】
Không dùng AI. (Tùy chọn mở rộng: tóm tắt CV thành bản nháp kỹ năng để HR xác nhận — không tự chấm điểm hay loại ứng viên.)

## 【7. Bố cục】
Điều hướng trái; thanh trên có bộ lọc vị trí và nút "Thêm ứng viên". Vùng chính: danh sách ứng viên hoặc Kanban; chi tiết ứng viên chia cột (CV · tiến trình ứng tuyển · đánh giá phỏng vấn); đặt lịch phỏng vấn bằng ngăn kéo. Trên điện thoại ưu tiên lịch phỏng vấn của tôi và nộp đánh giá.

## 【8. Phong cách giao diện】
Preset `slate-indigo` với màu nhấn {xanh ngọc trầm}; nhãn giai đoạn rõ ràng; bảng gọn. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ; tiền tệ VND.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất đánh giá đang viết.
- Từ thông báo mở đúng buổi phỏng vấn/hồ sơ.
- Phân quyền được kiểm tra ở phía máy chủ; người phỏng vấn chỉ nhận dữ liệu của buổi được phân công.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {4} vị trí (1 tạm dừng), {20} ứng viên hư cấu (2 cặp trùng email), {24} hồ sơ ứng tuyển đủ mọi giai đoạn, {10} buổi phỏng vấn, {12} đánh giá, {3} offer; CV là văn bản mẫu tự viết.
- Tài khoản demo: chủ app; chuyển vai trò HR / Quản lý tuyển dụng / Người phỏng vấn.
- Kịch bản nghiệm thu:
  ① Mở vị trí → thêm ứng viên → sàng lọc → đặt lịch phỏng vấn → người phỏng vấn nộp đánh giá → offer → nhận việc: headcount giảm đúng.
  ② Nhập ứng viên trùng email → cảnh báo trùng, không tạo bản ghi mới.
  ③ Đặt hai buổi trùng giờ cho cùng người phỏng vấn → bị cảnh báo/chặn.
  ④ Người phỏng vấn không xem được ứng viên không được phân công và không thấy mức lương; dữ liệu trả về trình duyệt không chứa lương.
  ⑤ Loại ứng viên không ghi lý do → bị chặn.
  ⑥ Tải lại trang khi đang viết đánh giá → nội dung còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Nhắc nộp đánh giá sau `{24}` giờ; màu nhấn `{xanh ngọc trầm}`; số lượng dữ liệu mẫu.

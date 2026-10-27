# Mẫu: Đăng ký sự kiện

> Nhóm: Quy trình nhóm · Preset: `soft-lavender` (hoặc nền trắng ấm + màu san hô) · Bố cục: Portal cho người tham gia (thẻ ảnh bìa, nút đăng ký cố định trên điện thoại) + Workbench cho ban tổ chức · Nguồn: prompt mẫu "活动报名工作台" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: sự kiện nội bộ, đào tạo, team building, hội thảo trong tổ chức. Không hợp khi: người tham gia là khách bên ngoài tổ chức (chưa hỗ trợ) → dùng Form công khai của Base để đăng ký, app cho ban tổ chức quản lý và check-in.
> Lưu ý nền tảng: chống vượt chỗ dựa trên kiểm tra trong FaaS + đọc lại; với sự kiện tranh suất rất gắt, báo trước khả năng hiếm vượt 1 chỗ và giải quyết bằng danh sách chờ.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng hệ thống đăng ký sự kiện dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho ban tổ chức, nhân sự hỗ trợ check-in và người tham gia trong tổ chức. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: phát hành sự kiện, người tham gia đăng ký, quản lý suất và danh sách chờ, check-in tại chỗ.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức.
- Ban tổ chức: tạo, sửa, phát hành, hủy sự kiện của mình; quản lý danh sách, xác nhận người từ danh sách chờ; xuất danh sách.
- Nhân sự check-in: chỉ check-in cho sự kiện được phân công.
- Người tham gia: xem sự kiện đã phát hành, đăng ký, xem và hủy đăng ký của mình.
- Quản trị viên: toàn bộ sự kiện, phân công vai trò.
- Trường nhạy cảm: số điện thoại và ghi chú đặc biệt (ăn kiêng, sức khỏe) chỉ ban tổ chức của sự kiện đó được xem.

## 【3. Các bảng dữ liệu chính】
- Quan hệ: Sự kiện 1–n Đăng ký n–1 Thành viên; Đăng ký 1–n Nhật ký check-in (liên kết hai chiều).
- Thành viên: tài khoản Lark, vai trò.
- Sự kiện: tên, ảnh bìa, loại, thời gian bắt đầu/kết thúc, địa điểm (hoặc link), giới thiệu, lịch trình, lưu ý, số chỗ tối đa, hạn đăng ký, câu hỏi đăng ký thêm (JSON đơn giản), trạng thái (Nháp → Đã phát hành → Đã kết thúc / Đã hủy), ban tổ chức, nhân sự check-in.
- Đăng ký: mã (DK-NNNN), sự kiện, người tham gia, câu trả lời thêm, số điện thoại, trạng thái (Đã xác nhận / Danh sách chờ / Đã hủy), thứ tự chờ, thời điểm đăng ký, check-in lúc, người check-in, khóa duy nhất (người:sự kiện).
- Nhật ký check-in: đăng ký, thao tác (check-in / hoàn tác), người, thời điểm, lý do hoàn tác.
- Thông báo; Nhật ký thao tác.

## 【4. Các trang và chức năng chính】
* Trang sự kiện: thẻ ảnh bìa với thời gian, địa điểm, trạng thái đăng ký (còn chỗ / sắp hết / danh sách chờ / đã đóng); lọc theo loại và ngày; chi tiết có giới thiệu, lịch trình, lưu ý, nút đăng ký.
* Đăng ký: form kiểm tra trường bắt buộc và số điện thoại; kết quả (đã xác nhận hay vào danh sách chờ, thứ tự); "Đăng ký của tôi" xem và hủy.
* Quản lý sự kiện (ban tổ chức): ảnh bìa, thời gian, địa điểm, số chỗ, hạn, câu hỏi thêm; nháp/phát hành/hủy; xem trước trang người tham gia.
* Danh sách: lọc theo sự kiện, trạng thái đăng ký, check-in; chi tiết và ghi chú; xuất CSV; xác nhận người từ danh sách chờ khi có chỗ trống.
* Check-in tại chỗ: tìm theo tên hoặc mã đăng ký, check-in một chạm, hiện thời điểm và người check-in; check-in lặp thì cảnh báo; hoàn tác có lý do.
* Tổng quan: số đăng ký hiệu lực, chỗ còn, danh sách chờ, tỷ lệ check-in, xu hướng đăng ký.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái sự kiện: Nháp → Đã phát hành → Đã kết thúc / Đã hủy (hủy phải ghi lý do và thông báo người đã đăng ký).
- Kiểm tra khi phát hành: thời gian kết thúc sau thời gian bắt đầu; hạn đăng ký trước thời gian bắt đầu; số chỗ > 0.
- Chống lỗi: một người chỉ có một đăng ký hiệu lực cho mỗi sự kiện (bấm nhiều lần không tạo trùng); hết chỗ thì vào danh sách chờ, không vượt số chỗ; không đăng ký sau hạn hoặc sự kiện đã hủy; check-in lặp không tạo bản ghi mới.
- Danh sách chờ: có người hủy → ban tổ chức xác nhận người tiếp theo theo thứ tự (không tự động chuyển nếu ban tổ chức chọn chế độ duyệt tay {mặc định: duyệt tay}).
- Cách tính chỉ số: Chỗ còn = Số chỗ tối đa − Số đăng ký đã xác nhận; Tỷ lệ check-in = Số đã check-in / Số đăng ký đã xác nhận; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Lưu vết: phát hành, hủy, xác nhận từ danh sách chờ, check-in và hoàn tác ghi nhật ký.
- Thông báo: đăng ký thành công/vào danh sách chờ → người tham gia; được xác nhận từ danh sách chờ → người tham gia; nhắc trước sự kiện {24} giờ; sự kiện bị hủy → mọi người đã đăng ký.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Người tham gia: thanh trên, ảnh bìa nổi bật, nút đăng ký rõ; trên điện thoại nút đăng ký cố định ở đáy. Ban tổ chức: điều hướng trái, thanh chỉ số, bảng danh sách, chi tiết bằng ngăn kéo; màn check-in tối giản, chữ lớn.

## 【8. Phong cách giao diện】
Preset `soft-lavender` hoặc {nền trắng ấm + màu nhấn san hô}; ảnh sự kiện là điểm nhấn; trạng thái và hạn đăng ký dễ nhận ra. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; đăng ký thất bại có thể thử lại mà không tạo trùng.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất form đang điền.
- Từ thông báo mở đúng sự kiện/đăng ký.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {5} sự kiện (1 nháp, 2 đang mở, 1 đầy chỗ có danh sách chờ, 1 đã kết thúc có check-in), {40} đăng ký đủ trạng thái.
- Tài khoản demo: chủ app; chuyển vai trò Ban tổ chức / Nhân sự check-in / Người tham gia.
- Kịch bản nghiệm thu:
  ① Tạo sự kiện → phát hành → người tham gia đăng ký → check-in tại chỗ → tỷ lệ check-in cập nhật.
  ② Sự kiện đầy chỗ → đăng ký mới vào danh sách chờ; một người hủy → ban tổ chức xác nhận người chờ đầu tiên.
  ③ Bấm đăng ký hai lần → chỉ một đăng ký; check-in hai lần → cảnh báo, không tạo bản ghi mới.
  ④ Người tham gia không xem được danh sách và số điện thoại người khác; nhân sự check-in không check-in được sự kiện không được phân công.
  ⑤ Phát hành sự kiện có hạn đăng ký sau giờ bắt đầu → bị chặn.
  ⑥ Tải lại trang khi đang điền form → nội dung còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Danh sách chờ duyệt tay `{mặc định: duyệt tay}` hay tự động; nhắc trước `{24}` giờ; phong cách `{nền trắng ấm + màu nhấn san hô}`.

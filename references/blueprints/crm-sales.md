# Mẫu: CRM bán hàng (Sales Workbench) ★

> Nhóm: Giao dịch / tài chính + Có AI · Preset: `warm-gray` · Bố cục: Workbench (điều hướng trái theo nhóm) + chia đôi danh sách/chi tiết + ngăn kéo chỉnh sửa · Nguồn: prompt mẫu CRM của Lark + app thật đã dựng (CLI 1.5.0, 14 bảng, 41 Database Function, 15 FaaS, 1 AI Function, 2026-10-22).
> Dùng khi: đội bán hàng B2B theo dõi khách → cơ hội → báo giá → đơn hàng. Không hợp khi: cần cổng cho khách hàng bên ngoài tự xem báo giá (chưa hỗ trợ người ngoài tổ chức) — dùng link chia sẻ báo giá cho người trong tổ chức hoặc in PDF.
> Bài học khi dựng: SQL không nhân/cộng cột → thành tiền dòng hàng lưu sẵn từ FaaS, giá trị có trọng số dùng trường công thức; tìm kiếm phân biệt hoa thường → trường "Từ khóa tìm kiếm" không dấu; chuyển báo giá thành đơn phải idempotent.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng CRM bán hàng dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho nhân viên kinh doanh, trưởng nhóm bán hàng và quản trị viên. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: chăm sóc khách hàng, cấu hình cơ hội, báo giá và chốt đơn hàng.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức hoặc nhóm bán hàng cụ thể (người cụ thể).
- Nhân viên kinh doanh: xem toàn bộ khách hàng của nhóm {hoặc chỉ khách mình phụ trách}; tạo/sửa khách hàng, liên hệ, cơ hội, báo giá của mình; gửi duyệt báo giá; không duyệt báo giá của chính mình.
- Trưởng nhóm bán hàng: xem toàn nhóm; duyệt báo giá trong hạn mức của mình; phân công lại khách hàng và việc; sửa danh mục sản phẩm.
- Quản trị viên: toàn quyền, quản lý thành viên, hạn mức duyệt, danh mục, gói sản phẩm.
- Người ngoài nhóm bán hàng (có quyền mở app): chỉ xem, không ghi được.
- Trường nhạy cảm: giá vốn, biên lợi nhuận chỉ trưởng nhóm và quản trị viên được xem; không trả về trình duyệt của nhân viên.

## 【3. Các bảng dữ liệu chính】
- Thành viên nhóm: tài khoản Lark, vai trò (Nhân viên / Trưởng nhóm / Quản trị viên), hạn mức duyệt (VND), trạng thái.
- Khách hàng: tên, hạng (A/B/C), giai đoạn vòng đời (Tiềm năng / Đang giao dịch / Khách quen / Ngừng), người phụ trách, ngành, địa chỉ, từ khóa tìm kiếm.
- Liên hệ: khách hàng, họ tên, chức vụ, điện thoại, email, liên hệ chính.
- Hoạt động chăm sóc: khách hàng, cơ hội (tùy chọn), loại (gọi / gặp / email / ghi chú), nội dung, thời điểm, người thực hiện.
- Sản phẩm: mã SKU, tên, danh mục, thông số, đơn giá niêm yết, giá vốn, trạng thái (đang bán / ngừng).
- Gói sản phẩm: tên, các sản phẩm thành phần và số lượng, chiết khấu mặc định.
- Cơ hội: khách hàng, tên, giai đoạn (Tiếp cận → Nhu cầu → Đề xuất → Đàm phán → Thắng / Thua), giá trị dự kiến, xác suất, giá trị có trọng số (công thức), ngày chốt dự kiến, bước tiếp theo + hạn, người phụ trách, lý do thua.
- Dòng sản phẩm của cơ hội: cơ hội, sản phẩm, số lượng, đơn giá, chiết khấu %, thành tiền (FaaS tính và lưu).
- Báo giá: mã (Q-YYYY-NNNN), cơ hội, khách hàng, trạng thái (Nháp → Chờ duyệt → Đã duyệt → Đã gửi → Khách chấp nhận / Từ chối / Hết hạn), hiệu lực đến, thuế %, điều khoản, tổng trước thuế, tổng sau thuế, người duyệt.
- Dòng báo giá: báo giá, sản phẩm, số lượng, đơn giá tại thời điểm báo giá, chiết khấu, thành tiền (snapshot).
- Đơn hàng: mã (SO-YYYY-NNNN), báo giá nguồn, khách hàng, PO khách, trạng thái (Đã xác nhận → Đang thực hiện → Đã giao → Đã xuất hóa đơn → Đã thanh toán / Hủy), tổng tiền (khóa theo báo giá), khóa duy nhất theo báo giá.
- Công việc: tiêu đề, loại (nhắc hết hạn báo giá / chốt đơn / xác nhận khách / tự tạo / AI), liên kết khách hàng–cơ hội–báo giá, người được giao, hạn, trạng thái, khóa chống trùng.
- Nhật ký thao tác: đối tượng, bản ghi, thao tác, người, thời điểm, trước/sau, nguồn (Ứng dụng / AI).
- Quy tắc lưu ảnh chụp (snapshot): khi tạo báo giá, chép đơn giá, chiết khấu, thuế vào dòng báo giá; đơn hàng giữ đúng tổng của báo giá được chấp nhận. Đổi giá sản phẩm về sau không làm đổi báo giá/đơn đã có.

## 【4. Các trang và chức năng chính】
* Tổng quan bán hàng: lọc theo khoảng thời gian (tháng này / quý này / 90 ngày / từ đầu năm / 12 tháng) và người phụ trách; thẻ chỉ số (pipeline đang mở + giá trị có trọng số, báo giá đã gửi/được chấp nhận, doanh thu thắng + tỷ lệ thắng, đơn hàng + tỷ lệ báo giá→đơn); phễu Mở → Báo giá → Thắng; xu hướng theo tháng; cơ hội rủi ro (quá ngày chốt, bước tiếp theo quá hạn hoặc trống, sắp chốt); việc của tôi; báo giá chờ duyệt (trưởng nhóm); nút "Quét cảnh báo".
* Khách hàng: tìm kiếm không dấu, lọc theo hạng, vòng đời, người phụ trách; chi tiết gồm hồ sơ, liên hệ (thêm/sửa/liên hệ chính), cơ hội, báo giá, đơn hàng, dòng thời gian chăm sóc; ghi hoạt động, tạo cơ hội.
* Cơ hội: thanh giai đoạn, giá trị, bước tiếp theo; ngăn kéo "Cấu hình sản phẩm" chọn từ danh mục, gói hoặc tổ hợp thường dùng, sửa số lượng/chiết khấu, tổng và cảnh báo cần duyệt cập nhật ngay; "Tạo báo giá" (hiệu lực, thuế, điều khoản).
* Báo giá: luồng gửi duyệt (tự duyệt nếu trong chính sách, ngoài chính sách chuyển người duyệt kèm công việc), duyệt/từ chối (lý do), đánh dấu đã gửi, ghi nhận khách chấp nhận/từ chối, chuyển thành đơn (kèm PO khách); xem trước toàn trang + in/lưu PDF; nhật ký.
* Đơn hàng: thanh tiến trình thực hiện, dòng hàng khóa giá, lịch sử.
* Sản phẩm và gói: danh mục theo nhóm, tìm theo tên/SKU/thông số, lọc đang bán/ngừng; chỉ trưởng nhóm và quản trị viên sửa.
* Công việc: lọc theo trạng thái, loại, người được giao (tôi / mọi người / chưa giao); bắt đầu, xong, bỏ qua (ghi chú), mở lại, giao lại.
* Trợ lý AI (thanh bên phải): hỏi đáp dữ liệu bán hàng, đề xuất hành động cần xác nhận.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái cơ hội: Tiếp cận → Nhu cầu → Đề xuất → Đàm phán → Thắng / Thua; chuyển sang Thua phải ghi lý do; Thắng chỉ khi có đơn hàng.
- Trạng thái báo giá: Nháp → Chờ duyệt → Đã duyệt → Đã gửi → Khách chấp nhận / Từ chối; quá ngày hiệu lực mà chưa chấp nhận → Hết hạn (khi quét cảnh báo).
- Duyệt theo ngưỡng: báo giá tổng > {50.000.000} VND hoặc có dòng chiết khấu > {15}% cần trưởng nhóm có hạn mức đủ duyệt; người tạo không tự duyệt.
- Cách tính chỉ số: Thành tiền dòng = Số lượng × Đơn giá × (1 − Chiết khấu); Giá trị có trọng số = Giá trị dự kiến × Xác suất; Tỷ lệ thắng = Số cơ hội thắng / (thắng + thua) trong kỳ; Tỷ lệ báo giá→đơn = Số đơn / Số báo giá đã gửi trong kỳ; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: chuyển báo giá thành đơn bấm nhiều lần chỉ tạo một đơn (khóa duy nhất theo báo giá); không sửa dòng hàng của báo giá đã gửi; không tạo báo giá từ sản phẩm ngừng bán; số lượng > 0, chiết khấu 0–{50}%.
- Liên động: báo giá được chấp nhận và chuyển đơn → cơ hội chuyển Thắng, tổng đơn khóa theo báo giá; gửi báo giá → tạo việc "xác nhận với khách" hạn {3} ngày.
- Lưu vết: mọi đổi trạng thái, đổi giá, duyệt/từ chối, chia sẻ link, in đều ghi nhật ký (người, thời điểm, trước/sau).
- Thông báo: báo giá cần duyệt → trưởng nhóm; được duyệt/từ chối → người tạo; báo giá sắp hết hạn trước {3} ngày → người phụ trách (trong ứng dụng; nếu môi trường hỗ trợ thì gửi thêm tin nhắn Lark qua workflow).
- Không giả lập: không gửi email báo giá cho khách tự động; "Đã gửi" do nhân viên đánh dấu.

## 【6. Năng lực AI】
- Đầu vào: câu hỏi tự nhiên về dữ liệu bán hàng ("cơ hội nào của tôi sắp quá hạn?"); hệ thống đưa cho AI một ảnh chụp gọn (pipeline, cơ hội rủi ro, báo giá đang mở, việc, chỉ số từ đầu năm) mà người hỏi được phép xem.
- Phân tích: chỉ trả lời từ dữ liệu được cung cấp; thiếu thông tin thì nói rõ và gợi ý xem trang nào.
- Đầu ra: câu trả lời dạng chữ chạy dần; đề xuất hành động ("tạo việc", "cập nhật bước tiếp theo") hiển thị thành thẻ chờ xác nhận, chỉ ghi vào Lark Base khi người dùng bấm Xác nhận; việc tạo bởi AI ghi nguồn "Trợ lý AI".
- Giới hạn: AI không được tự duyệt báo giá, đổi giá, chuyển đơn hay xóa dữ liệu; đề xuất tham chiếu bản ghi không có trong dữ liệu đã tải thì bỏ qua.
- Khi thất bại: giữ đoạn trả lời đã nhận, cho phép hỏi lại; không tự gửi lại đề xuất.

## 【7. Bố cục】
Điều hướng trái theo nhóm (Tổng quan / Bán hàng / Danh mục); thanh trên có tìm kiếm toàn cục (Ctrl K), nút "Tạo mới" (khách hàng, cơ hội, việc), nút trợ lý AI, chọn giao diện, menu tài khoản. Danh sách và chi tiết chia đôi; chỉnh sửa bằng ngăn kéo; báo giá có trang xem trước toàn màn hình để in. Trên điện thoại ưu tiên việc của tôi, khách hàng và ghi hoạt động nhanh.

## 【8. Phong cách giao diện】
Preset `warm-gray`: nền xám ấm, thẻ trắng viền mảnh, màu nhấn trầm; số tiền nổi bật và căn phải; trạng thái tô màu theo nghĩa; bảng gọn dễ đọc. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ; tiền tệ VND.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại; kết quả chưa rõ thì hướng dẫn kiểm tra trước khi làm lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất cấu hình sản phẩm đang làm dở.
- Các trang liên kết qua lại (khách hàng ↔ cơ hội ↔ báo giá ↔ đơn hàng ↔ công việc); từ thông báo mở đúng bản ghi.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {5} thành viên (chủ app là Quản trị viên), {8} khách hàng, {12} liên hệ, {12} sản phẩm, {3} gói, {14} cơ hội đủ mọi giai đoạn, {10} báo giá đủ mọi trạng thái, {4} đơn hàng ở các trạng thái khác nhau, {20} hoạt động, công việc và nhật ký; tên khách gắn "(Demo)".
- Tài khoản demo: chủ app; chuyển vai trò Nhân viên / Trưởng nhóm để trải nghiệm.
- Kịch bản nghiệm thu:
  ① Tạo cơ hội → cấu hình sản phẩm từ gói → tạo báo giá → gửi duyệt → trưởng nhóm duyệt → đánh dấu đã gửi → khách chấp nhận → chuyển đơn: tổng đơn đúng bằng tổng báo giá, cơ hội chuyển Thắng.
  ② Báo giá vượt ngưỡng chiết khấu → bắt buộc chờ duyệt; nhân viên tạo không tự duyệt được.
  ③ Bấm "Chuyển thành đơn" hai lần → chỉ có một đơn.
  ④ Đổi giá sản phẩm sau khi đã báo giá → dòng báo giá và đơn hàng giữ giá cũ.
  ⑤ Nhân viên không xem được giá vốn/biên lợi nhuận; người ngoài nhóm bán hàng không ghi được dữ liệu.
  ⑥ Quét cảnh báo hai lần → không tạo việc trùng; báo giá quá hiệu lực chuyển Hết hạn.
  ⑦ Hỏi AI "cơ hội nào sắp quá hạn" → trả lời đúng dữ liệu; đề xuất tạo việc chỉ ghi sau khi xác nhận.
  ⑧ Tải lại trang giữa lúc cấu hình sản phẩm → không mất dòng đã thêm.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Ngưỡng duyệt `{50.000.000}` VND và `{15}`% chiết khấu; chiết khấu tối đa `{50}`%.
- Hạn việc "xác nhận với khách" `{3}` ngày; nhắc báo giá sắp hết hạn trước `{3}` ngày.
- Nhân viên xem khách của cả nhóm hay `{hoặc chỉ khách mình phụ trách}`.
- Số lượng dữ liệu mẫu trong khối 10.

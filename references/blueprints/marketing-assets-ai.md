# Mẫu: Kho tài sản marketing bằng AI

> Nhóm: Có AI (+ quy trình nhóm nhẹ) · Preset: `warm-gray` hoặc preset theo màu thương hiệu · Bố cục: Portal ưu tiên hình ảnh — ô nhập sáng tạo ở đầu trang, lưới tài sản, chat AI ba cột · Nguồn: prompt mẫu "智能家居素材管理平台" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: đội marketing/thương mại điện tử tạo ảnh chính, ảnh bối cảnh, ảnh chi tiết và nội dung quảng cáo cho sản phẩm bằng AI, giữ phiên bản. Không hợp khi: tenant chưa bật AI Function (lỗi 800004011) hoặc cần mô hình riêng ngoài danh sách `ai-functions models`.
> Lưu ý nền tảng: tạo ảnh/video là tác vụ không đồng bộ (tạo task → hỏi trạng thái có giới hạn thời gian); ảnh tham chiếu từ đính kèm phải lấy URL tạm bằng `fetchAttachmentDownloadUrl`, không truyền file_token; chi phí AI tính cho chủ app.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng kho tài sản marketing bằng AI dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho nhân viên marketing, người duyệt thương hiệu và quản trị viên. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: nhập sản phẩm, AI sáng tạo, chỉnh sửa tài sản, quản lý phiên bản và tải xuống.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: người cụ thể (đội marketing).
- Nhân viên marketing: quản lý sản phẩm và SKU, tạo và chỉnh tài sản bằng AI, gửi duyệt, tải xuống tài sản đã duyệt.
- Người duyệt thương hiệu: duyệt hoặc trả lại tài sản (có lý do), quản lý cài đặt thương hiệu.
- Quản trị viên: thành viên, vai trò, hạn mức sử dụng AI theo người/tháng.
- Trường nhạy cảm: giá nhập/giá vốn sản phẩm (nếu có) không đưa vào AI và không hiển thị cho nhân viên.

## 【3. Các bảng dữ liệu chính】
- Thành viên: tài khoản Lark, vai trò, hạn mức AI tháng, đã dùng tháng này.
- Sản phẩm: tên, dòng sản phẩm, điểm bán hàng, kênh bán, ảnh gốc (đính kèm), trạng thái.
- SKU: sản phẩm, quy cách (màu, kích thước), mã, ảnh gốc riêng.
- Cài đặt thương hiệu: màu thương hiệu, giọng văn, đối tượng mục tiêu, kích thước tài sản theo kênh, yêu cầu phong cách.
- Phiên sáng tạo: người tạo, sản phẩm/SKU, yêu cầu gốc, yêu cầu đã phân tích, trạng thái (đang chạy / xong / thất bại một phần).
- Tài sản: phiên sáng tạo, sản phẩm, SKU, loại (ảnh chính / ảnh bối cảnh / ảnh chi tiết / nội dung quảng cáo), kênh, tệp (đính kèm) hoặc văn bản, phiên bản, tài sản gốc (liên kết bản trước), trạng thái (Nháp → Chờ duyệt → Đã duyệt / Bị trả lại / Lưu trữ), task AI (mã task, trạng thái), lý do trả lại.
- Nhật ký thao tác; Thông báo.
- Quy tắc lưu ảnh chụp (snapshot): mỗi lần sửa tạo phiên bản mới, giữ nguyên phiên bản cũ; tài sản lưu cài đặt thương hiệu đã dùng khi tạo.

## 【4. Các trang và chức năng chính】
* Trang chủ: ô nhập sáng tạo lớn và tác vụ nhanh ở đầu trang; bên dưới là thẻ ảnh "Gần đây" và "Tài sản tiêu biểu".
* Sản phẩm: tìm kiếm, lọc; thẻ hiển thị ảnh, tên, số SKU; chi tiết bên trái xem ảnh, bên phải sửa thông tin, bên dưới quản lý SKU.
* Chat AI: cột trái lịch sử phiên, giữa tin nhắn – tiến độ – thẻ kết quả, dưới cùng ô nhập chọn sản phẩm và thêm ảnh tham chiếu; thiếu thông tin thì hướng dẫn bổ sung.
* Kho tài sản: lọc theo sản phẩm, kênh, loại, trạng thái; lưới ảnh; chi tiết nhóm theo mục đích, chọn nhiều để sửa, phóng to, xem và khôi phục phiên bản cũ, tải nhiều tệp.
* Duyệt: hàng chờ duyệt cho người duyệt thương hiệu.
* Cài đặt: màu thương hiệu, giọng văn, đối tượng, kích thước theo kênh, yêu cầu phong cách.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái tài sản: Nháp → Chờ duyệt → Đã duyệt / Bị trả lại (bắt buộc lý do) → Lưu trữ; chỉ tài sản đã duyệt mới được tải xuống để dùng chính thức.
- Phiên bản: sửa một tài sản tạo phiên bản mới liên kết bản trước; khôi phục = tạo phiên bản mới từ bản cũ (không xóa lịch sử).
- Chống lỗi: không vượt hạn mức AI tháng của người dùng; bấm tạo nhiều lần không tạo nhiều task trùng cho cùng yêu cầu (khóa theo phiên + yêu cầu); dữ liệu sản phẩm thay đổi thì đánh dấu tài sản liên quan "cần cập nhật".
- Cách tính chỉ số: số tài sản theo trạng thái/kênh; tỷ lệ được duyệt = Đã duyệt / (Đã duyệt + Bị trả lại); lượt dùng AI theo người; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Lưu vết: tạo, sửa, duyệt, khôi phục, tải xuống ghi nhật ký.
- Thông báo: task AI xong → người tạo; tài sản chờ duyệt → người duyệt; bị trả lại → người tạo.

## 【6. Năng lực AI】
- Đầu vào: yêu cầu ngôn ngữ tự nhiên + sản phẩm/SKU đã chọn + ảnh tham chiếu (ảnh gốc từ Base qua URL tạm, hoặc ảnh tải lên) + cài đặt thương hiệu; không đưa giá vốn.
- Phân tích: chuyển yêu cầu thành danh sách tài sản cần tạo (loại, kênh, kích thước, nội dung chính) để người dùng xác nhận; thiếu sản phẩm/kênh thì hỏi lại.
- Đầu ra: ảnh (task tạo ảnh), video ngắn (tùy chọn), nội dung quảng cáo (text) — tất cả lưu thành tài sản trạng thái **Nháp**, người dùng xem và gửi duyệt.
- Giới hạn: AI không được tự duyệt, tự xóa hay ghi đè tài sản đã duyệt; giữ đúng hình dạng và đặc điểm sản phẩm theo ảnh gốc, giữ màu thương hiệu.
- Khi thất bại: giữ các tài sản đã tạo thành công, đánh dấu phần thất bại và cho tạo lại từng phần; hỏi trước khi tạo lại toàn bộ.

## 【7. Bố cục】
Thanh trên; trang chủ ô nhập sáng tạo nổi bật; lưới thẻ ảnh; chat AI ba cột; chi tiết tài sản bằng ngăn kéo rộng. Trên điện thoại ưu tiên xem, duyệt và tải tài sản.

## 【8. Phong cách giao diện】
Nền sáng, màu nhấn theo thương hiệu {mã màu thương hiệu}, thẻ bo góc, nhiều khoảng trắng; hình ảnh là trọng tâm, thao tác chính rõ ràng. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải (kèm tiến độ task AI), trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất phiên chat và task đang chạy (tiếp tục theo dõi theo mã task).
- Từ thông báo mở đúng tài sản.
- Phân quyền và hạn mức AI được kiểm tra ở phía máy chủ.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {6} sản phẩm hư cấu với ảnh gốc tự tạo, {14} SKU, cài đặt thương hiệu mẫu, {20} tài sản đủ trạng thái và có lịch sử phiên bản.
- Tài khoản demo: chủ app; chuyển vai trò Nhân viên / Người duyệt.
- Kịch bản nghiệm thu:
  ① Chọn sản phẩm → yêu cầu "3 ảnh bối cảnh phòng khách cho kênh TMĐT" → xác nhận danh sách → AI tạo → tài sản ở trạng thái Nháp → gửi duyệt → duyệt → tải xuống.
  ② Sửa một tài sản → có phiên bản mới; khôi phục phiên bản cũ → lịch sử còn đủ.
  ③ Vượt hạn mức AI tháng → bị chặn với thông báo rõ.
  ④ Yêu cầu thiếu sản phẩm → AI hỏi lại, không tự chọn.
  ⑤ Task tạo ảnh thất bại một phần → giữ ảnh đã tạo, tạo lại phần lỗi.
  ⑥ Nhân viên không duyệt được tài sản; tải lại trang khi task đang chạy → vẫn theo dõi được.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Mã màu thương hiệu `{mã màu thương hiệu}`; hạn mức AI tháng theo người; kích thước ảnh theo kênh (lấy từ `ai-functions models`).

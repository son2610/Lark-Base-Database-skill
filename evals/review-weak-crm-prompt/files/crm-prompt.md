Hãy giúp tôi dựng một CRM bán hàng dựa trên Lark Base /lark-base-database, lưu dữ liệu bằng Lark Base, kết nối chăm sóc khách hàng, cơ hội, báo giá và chốt đơn.

Các trang chính:
- Bảng điều khiển bán hàng: thẻ chỉ số, phễu bán hàng, biểu đồ xu hướng cho cơ hội, báo giá, đơn hàng và tỷ lệ chuyển đổi; lọc theo thời gian và người phụ trách; làm nổi bật cơ hội rủi ro và việc cần làm.
- Khách hàng: quản lý khách hàng, liên hệ, người phụ trách; chi tiết gom cơ hội, báo giá, đơn hàng.
- Cơ hội: giai đoạn, ngày chốt dự kiến, bước tiếp theo; chọn sản phẩm từ danh mục hoặc gói, chỉnh số lượng và giảm giá, tự tính tiền và tạo báo giá.
- Sản phẩm: tìm theo nhóm, thông số, giá, trạng thái, gói sản phẩm.
- Báo giá và đơn hàng: duyệt báo giá lớn, in, chia sẻ cho khách, xem lịch sử; khách xác nhận thì chuyển thành đơn chính thức, giữ giá lúc chốt.
- Việc tự động: nhắc báo giá hết hạn, ngày chốt dự kiến, xác nhận của khách.
- Trợ lý AI: chat ở thanh bên để hỏi dữ liệu, xác nhận rồi cập nhật kế hoạch hoặc tạo việc.

Bố cục điều hướng trái, tìm kiếm ở trên; danh sách và chi tiết chia đôi, sửa bằng ngăn kéo, báo giá xem trước toàn trang. Nền xám ấm, thẻ trắng, viền mảnh, màu nhấn nhạt; tiền nổi bật, trạng thái có màu, bảng gọn. Hỗ trợ sáng tối và màn hình hẹp, có trạng thái tải, trống, lỗi. Dữ liệu lưu thật, có dữ liệu mẫu đi hết luồng bán hàng.

Trước khi bắt đầu, nếu chưa cài thì cài:
npx @larksuite/cli@latest install
npx @lark-base-open/base-database-cli@latest skill install --target all --force

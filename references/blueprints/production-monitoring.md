# Mẫu: Giám sát sản xuất

> Nhóm: Quy trình nhóm · Preset: `slate-indigo` (bảng điều khiển dùng giao diện tối) · Bố cục: Workbench, bộ lọc xưởng/ca ở thanh trên; điện thoại ưu tiên báo công, chụp ảnh sự cố · Nguồn: prompt mẫu "生产监控工作台" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: xưởng sản xuất nhỏ/vừa theo dõi lệnh sản xuất, báo công theo ca, thiết bị, sự cố. Không hợp khi: cần dữ liệu máy móc thời gian thực (IoT) — app không giả lập kết nối thiết bị, chỉ nhận dữ liệu nhập tay và hiển thị "cập nhật lần cuối".

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng hệ thống giám sát sản xuất dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho quản đốc, tổ trưởng, công nhân vận hành và kỹ thuật bảo trì. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: kế hoạch sản xuất, báo công theo ca, trạng thái thiết bị, xử lý sự cố.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: người cụ thể (nhân sự xưởng).
- Quản đốc/Quản lý xưởng: tạo và phát lệnh sản xuất, xem toàn bộ, đóng sự cố sau khi kiểm tra lại.
- Tổ trưởng: duyệt hoặc trả lại báo công của tổ mình; phân công xử lý sự cố của dây chuyền mình.
- Công nhân vận hành: báo công của mình, ghi sự cố, xem lịch sử báo công của mình.
- Kỹ thuật bảo trì: xử lý sự cố được giao, cập nhật trạng thái thiết bị và nhật ký sửa chữa.
- Trường nhạy cảm: không có dữ liệu tiền; năng suất cá nhân chỉ tổ trưởng và quản đốc xem.

## 【3. Các bảng dữ liệu chính】
- Thành viên: tài khoản Lark, vai trò, xưởng, dây chuyền, tổ.
- Xưởng / Dây chuyền: tên, quản đốc, tổ trưởng.
- Ca làm việc: tên ca, giờ bắt đầu/kết thúc.
- Lệnh sản xuất: mã (LSX-NNNN), sản phẩm, số lượng kế hoạch, công đoạn, dây chuyền, thời gian bắt đầu/kết thúc kế hoạch, người phụ trách, trạng thái (Nháp → Đã phát → Đang chạy → Tạm dừng → Hoàn thành / Hủy).
- Báo công: lệnh sản xuất, ca, ngày, người báo, số đạt, số lỗi, giờ công, ghi chú, trạng thái (Đã gửi → Đã duyệt / Bị trả lại), lý do trả lại, bản sửa của (liên kết báo công gốc), khóa duy nhất (người:lệnh:ca:ngày).
- Thiết bị: mã, tên, dây chuyền, trạng thái (Chạy / Dừng / Bảo trì), lịch bảo trì, cập nhật lần cuối.
- Nhật ký thiết bị: thiết bị, bắt đầu dừng, kết thúc dừng, nguyên nhân, thời lượng (FaaS tính).
- Sự cố: mã, loại (chất lượng / thiếu vật tư / thiết bị / khác), dây chuyền, lệnh liên quan, mô tả, ảnh (đính kèm), người phụ trách, trạng thái (Mới → Đang xử lý → Chờ kiểm tra lại → Đã đóng), biện pháp, kết quả kiểm tra lại.
- Thông báo; Nhật ký thao tác.

## 【4. Các trang và chức năng chính】
* Bảng điều khiển sản xuất: theo xưởng, dây chuyền, ca, ngày: sản lượng kế hoạch, thực tế, tỷ lệ đạt kế hoạch, tỷ lệ hàng đạt; tiến độ lệnh; trạng thái thiết bị; sự cố chưa xử lý; thời điểm cập nhật cuối.
* Lệnh sản xuất: tạo, phát, bắt đầu, tạm dừng, hoàn thành; chi tiết gồm báo công và sự cố liên quan.
* Báo công theo ca: chọn lệnh, ca, nhập số đạt, số lỗi, giờ công; gửi, duyệt, trả lại để sửa; lịch sử của tôi.
* Sổ thiết bị: trạng thái, lịch bảo trì, nhật ký dừng máy và sửa chữa.
* Trung tâm sự cố: ghi sự cố kèm ảnh, giao người phụ trách, theo dõi trạng thái, ghi biện pháp và kết quả kiểm tra lại.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái lệnh: Nháp → Đã phát → Đang chạy ⇄ Tạm dừng → Hoàn thành, hoặc Hủy (bắt buộc lý do).
- Trạng thái sự cố: Mới → Đang xử lý → Chờ kiểm tra lại → Đã đóng; chỉ quản đốc/tổ trưởng đóng sau kiểm tra lại.
- Cách tính chỉ số: chỉ báo công **đã duyệt** được tính vào sản lượng; Tỷ lệ hàng đạt = Số đạt / (Số đạt + Số lỗi); Tỷ lệ đạt kế hoạch = Sản lượng đạt / Kế hoạch; Hiệu suất sử dụng thiết bị = Thời gian chạy đã ghi / Thời gian kế hoạch; thiếu dữ liệu hiển thị "Chờ bổ sung", không hiện 0%.
- Chống lỗi: một người chỉ có một báo công hiệu lực cho mỗi lệnh – ca – ngày; sửa báo công tạo bản sửa và giữ bản gốc (không ghi đè); số đạt, số lỗi ≥ 0; không báo công cho lệnh chưa phát hoặc đã hủy.
- Liên động: báo công được duyệt → tiến độ lệnh và bảng điều khiển cập nhật; sự cố thiết bị → thiết bị chuyển "Dừng" cho tới khi đóng.
- Lưu vết: duyệt/trả lại, sửa báo công, đổi trạng thái thiết bị và sự cố ghi nhật ký.
- Thông báo: sự cố mới → tổ trưởng và kỹ thuật; báo công bị trả lại → người báo; lệnh trễ kế hoạch → quản đốc.
- Không giả lập kết nối thiết bị; dữ liệu từ nhập tay, luôn hiện thời điểm cập nhật cuối.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Thanh trên có bộ lọc xưởng và ca; điều hướng trái theo nghiệp vụ. Bảng điều khiển: chỉ số trên cùng, giữa là dây chuyền và lệnh, dưới là hàng đợi sự cố. Trên điện thoại ưu tiên báo công, chụp ảnh ghi sự cố và cập nhật xử lý.

## 【8. Phong cách giao diện】
Bảng điều khiển dùng giao diện tối (xanh xám đậm, số lớn rõ, màu trạng thái hạn chế cho chạy / dừng / cảnh báo); trang thao tác dùng giao diện sáng — preset `slate-indigo` có cả hai. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất báo công đang nhập.
- Từ thông báo mở đúng sự cố/báo công.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {1} xưởng, {3} dây chuyền, {2} ca, {6} lệnh sản xuất đủ trạng thái, {30} báo công (có bản bị trả lại và bản sửa), {8} thiết bị, {6} sự cố đủ trạng thái.
- Tài khoản demo: chủ app; chuyển vai trò Quản đốc / Tổ trưởng / Công nhân / Kỹ thuật.
- Kịch bản nghiệm thu:
  ① Phát lệnh → công nhân báo công → tổ trưởng duyệt → sản lượng và tỷ lệ đạt cập nhật đúng; báo công chưa duyệt không được tính.
  ② Tổ trưởng trả lại báo công → công nhân sửa → bản gốc vẫn còn trong lịch sử.
  ③ Báo công lần hai cho cùng lệnh – ca – ngày → bị chặn/gợi ý sửa bản cũ.
  ④ Ghi sự cố thiết bị kèm ảnh → kỹ thuật xử lý → chờ kiểm tra lại → quản đốc đóng; thiết bị trở lại "Chạy".
  ⑤ Công nhân không duyệt được báo công; tổ trưởng tổ A không duyệt được báo công tổ B.
  ⑥ Tải lại trang khi đang nhập báo công → dữ liệu còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Số dây chuyền, ca, thiết bị mẫu; ngưỡng cảnh báo trễ kế hoạch.

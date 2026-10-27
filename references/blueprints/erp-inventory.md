# Mẫu: ERP mua – bán – kho (nhẹ)

> Nhóm: Giao dịch / tài chính · Preset: `warm-gray` (xanh lục trầm) · Bố cục: Workbench + bảng chứng từ gọn + thanh tổng tiền cố định · Nguồn: prompt mẫu "轻量 ERP 进销存" của Lark, bổ sung theo khung 10 khối.
> Dùng khi: cửa hàng/nhà phân phối nhỏ quản lý hàng hóa, nhập – xuất – tồn, công nợ đơn giản. Không hợp khi: tranh chấp tồn kho rất cao (nhiều người xuất cùng mặt hàng trong vài giây) — nền tảng không có giao dịch nguyên tử; khi đó giữ tồn kho ở hệ thống chuyên dụng.
> Lưu ý nền tảng: tồn kho tính trong FaaS từ sổ kho (không cộng cột trong SQL); chống trùng bằng khóa duy nhất theo chứng từ + kiểm tra trước khi ghi; báo người dùng rủi ro tranh chấp hiếm.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng hệ thống mua – bán – tồn kho gọn nhẹ dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho quản trị viên, nhân viên mua hàng, bán hàng và thủ kho. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: hàng hóa, mua hàng nhập kho, bán hàng xuất kho, theo dõi tồn kho.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: người cụ thể (bộ phận kinh doanh, kho, kế toán).
- Quản trị viên: danh mục hàng hóa, kho, đối tác, giá tham khảo; xem toàn bộ.
- Mua hàng: tạo và xác nhận đơn mua; xem tồn kho và giá vốn.
- Bán hàng: tạo và xác nhận đơn bán; xem tồn khả dụng; không xem giá vốn.
- Thủ kho: thực hiện nhập/xuất/chuyển kho/kiểm kê theo chứng từ đã xác nhận; ghi lý do chênh lệch.
- Trường nhạy cảm: giá vốn và lãi gộp chỉ quản trị viên và mua hàng được xem.

## 【3. Các bảng dữ liệu chính】
- Quan hệ: Đối tác 1–n Đơn mua/Đơn bán 1–n Dòng đơn n–1 Hàng hóa; Đơn 1–n Phiếu kho 1–n Sổ kho; Tồn kho = Hàng hóa × Kho (liên kết cả hai).
- Hàng hóa: mã, tên, quy cách, đơn vị, giá mua tham khảo, giá bán tham khảo, mức tồn tối thiểu, trạng thái.
- Kho: tên, địa chỉ, thủ kho.
- Đối tác: loại (nhà cung cấp / khách hàng), tên, liên hệ, mã số thuế.
- Đơn mua / Đơn bán: mã, đối tác, kho, trạng thái (Nháp → Đã xác nhận → Nhập/Xuất một phần → Hoàn tất / Hủy), tổng tiền (FaaS tính), người phụ trách.
- Dòng đơn: đơn, hàng hóa, số lượng, đơn giá tại thời điểm xác nhận, chiết khấu, thành tiền, số lượng đã nhập/xuất.
- Phiếu kho: loại (Nhập / Xuất / Chuyển / Kiểm kê), chứng từ nguồn, kho, thời điểm thực hiện, người thực hiện, khóa duy nhất.
- Sổ kho (dòng phiếu): phiếu, hàng hóa, kho, số lượng (+/−), giá vốn đơn vị, lý do (với điều chỉnh).
- Tồn kho (theo hàng × kho): tồn thực tế, đã giữ chỗ (theo đơn bán đã xác nhận chưa xuất), khả dụng (công thức), giá vốn bình quân — FaaS cập nhật khi phiếu kho hoàn tất.
- Nhật ký thao tác.
- Quy tắc lưu ảnh chụp (snapshot): đơn giá trên dòng đơn chốt tại thời điểm xác nhận; giá vốn xuất kho chốt theo bình quân tại thời điểm xuất.

## 【4. Các trang và chức năng chính】
* Tổng quan kinh doanh: doanh số, tiền mua, giá trị tồn, xu hướng lãi gộp; lọc theo thời gian, kho; hàng dưới mức tối thiểu và chứng từ chờ xử lý.
* Hàng hóa và đối tác: tra cứu, chi tiết gồm tồn theo kho và lịch sử giao dịch.
* Mua hàng / Bán hàng: tạo đơn, chọn hàng, sửa số lượng/chiết khấu, thanh tổng tiền cố định; Nháp → Xác nhận → theo dõi nhập/xuất một phần.
* Kho: tồn theo kho (thực tế / giữ chỗ / khả dụng), sổ kho; nhập/xuất theo chứng từ (cho phép nhiều lần), chuyển kho, kiểm kê với lý do chênh lệch.
* Trung tâm chứng từ: lọc theo loại, trạng thái, người phụ trách; xem chứng từ liên quan, nhật ký, bản in; chứng từ đã thực hiện chỉ sửa bằng phiếu trả hàng/điều chỉnh.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái đơn: Nháp → Đã xác nhận → Nhập/Xuất một phần → Hoàn tất, hoặc Hủy (chỉ khi chưa nhập/xuất, bắt buộc lý do).
- Chỉ phiếu kho đã thực hiện mới làm thay đổi tồn thực tế; xác nhận đơn bán chỉ giữ chỗ.
- Cách tính chỉ số: Khả dụng = Tồn thực tế − Đã giữ chỗ; Lãi gộp = Doanh thu − Giá vốn hàng xuất (theo giá vốn bình quân tại thời điểm xuất); thiếu giá vốn → hiển thị "Chưa có dữ liệu giá vốn", không tính là 0.
- Chống lỗi: bấm thực hiện phiếu nhiều lần không cộng/trừ kho hai lần (khóa duy nhất theo phiếu); không xuất quá tồn khả dụng; không nhập/xuất quá số lượng còn lại của dòng đơn; số lượng > 0; chứng từ đã thực hiện không sửa trực tiếp.
- Liên động: phiếu xuất hoàn tất → giảm tồn và giữ chỗ, cập nhật số đã xuất của dòng đơn; đủ số lượng → đơn Hoàn tất.
- Lưu vết: mọi phiếu kho, điều chỉnh, hủy ghi nhật ký với người và lý do.
- Thông báo: hàng dưới mức tối thiểu → mua hàng; đơn bán được xác nhận → thủ kho.

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Điều hướng trái theo nghiệp vụ (Tổng quan / Hàng hóa / Mua / Bán / Kho / Chứng từ); thanh trên có tìm kiếm và "Tạo mới". Vùng chính là bảng gọn; soạn chứng từ có bảng dòng hàng và thanh tổng tiền cố định; chi tiết mở bằng ngăn kéo. Trên điện thoại ưu tiên tra chứng từ và thao tác nhập/xuất.

## 【8. Phong cách giao diện】
Preset `warm-gray` với màu nhấn {xanh lục trầm}; số tiền căn phải; trạng thái tô màu theo nghĩa. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ; tiền tệ VND.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại; kết quả chưa rõ thì kiểm tra trước khi làm lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất chứng từ đang soạn.
- Các trang liên kết qua lại (hàng hóa ↔ chứng từ ↔ sổ kho).
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {2} kho, {20} mặt hàng, {5} nhà cung cấp, {8} khách hàng, {6} đơn mua và {10} đơn bán đủ mọi trạng thái (có nhập/xuất một phần), {3} mặt hàng dưới mức tối thiểu.
- Tài khoản demo: chủ app; chuyển vai trò Mua hàng / Bán hàng / Thủ kho.
- Kịch bản nghiệm thu:
  ① Đơn mua → xác nhận → nhập 2 lần một phần → đủ → đơn Hoàn tất, tồn tăng đúng, giá vốn bình quân đúng.
  ② Đơn bán → xác nhận (giữ chỗ) → xuất → tồn và giữ chỗ giảm đúng; lãi gộp đúng.
  ③ Xuất quá tồn khả dụng → bị chặn.
  ④ Bấm "Thực hiện phiếu" hai lần → kho chỉ thay đổi một lần.
  ⑤ Bán hàng không xem được giá vốn; dữ liệu trả về trình duyệt không chứa giá vốn.
  ⑥ Sửa chứng từ đã thực hiện → không cho, gợi ý phiếu điều chỉnh.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Màu nhấn `{xanh lục trầm}`; phương pháp giá vốn (bình quân gia quyền); số lượng dữ liệu mẫu.

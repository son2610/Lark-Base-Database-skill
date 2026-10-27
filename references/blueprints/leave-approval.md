# Mẫu: Quản lý nghỉ phép

> Nhóm: Quy trình nhóm · Preset: `slate-indigo` · Bố cục: Workbench gọn (nhân viên: thanh trên + "Đơn của tôi"; quản lý/HR: điều hướng trái) · Nguồn: thiết kế cho doanh nghiệp VN, theo khung 10 khối.
> Dùng khi: công ty 20–500 người muốn thay form/Excel nghỉ phép bằng app có duyệt nhiều cấp, theo dõi quỹ phép. Không hợp khi: cần tính lương/BHXH (để ở hệ thống lương) hoặc cần luồng duyệt phức tạp nhiều nhánh (cân nhắc Lark Approval gốc).
> Biến thể: thay "nghỉ phép" bằng "công tác", "làm thêm giờ", "đề nghị thanh toán" — cùng khung đơn + duyệt.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng ứng dụng quản lý nghỉ phép dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho nhân viên, trưởng nhóm và bộ phận nhân sự. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: tạo đơn nghỉ, trưởng nhóm duyệt, nhân sự xác nhận, cập nhật quỹ phép.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức.
- Nhân viên: tạo, sửa, hủy đơn của mình khi còn "Chờ duyệt"; xem quỹ phép và lịch sử của mình.
- Trưởng nhóm: xem và duyệt/từ chối đơn của thành viên nhóm mình; xem lịch nghỉ của nhóm.
- Nhân sự (HR): xem toàn công ty, xác nhận đơn đã được trưởng nhóm duyệt, điều chỉnh quỹ phép (bắt buộc lý do), quản lý loại nghỉ và ngày lễ.
- Quản trị viên: quản lý thành viên, nhóm, vai trò.
- Trường nhạy cảm: lý do nghỉ loại "Ốm/Việc riêng" chỉ người tạo, trưởng nhóm của họ và HR được xem; không trả về trình duyệt của người khác.

## 【3. Các bảng dữ liệu chính】
- Thành viên: họ tên, tài khoản Lark, nhóm, vai trò (Nhân viên / Trưởng nhóm / Nhân sự / Quản trị viên), ngày vào làm, trạng thái.
- Nhóm: tên, trưởng nhóm (liên kết Thành viên).
- Loại nghỉ: tên (Phép năm / Ốm / Không lương / Việc riêng có lương / …), trừ quỹ phép (có/không), cần chứng từ (có/không), số ngày tối đa mỗi lần.
- Quỹ phép: thành viên, năm, số ngày được hưởng, số ngày chuyển từ năm trước, số ngày đã dùng (FaaS cập nhật), số ngày còn lại (công thức).
- Đơn nghỉ: mã (NP-YYYY-NNNN), người tạo, loại nghỉ, từ ngày, đến ngày, nửa ngày (sáng/chiều/không), số ngày làm việc (FaaS tính, trừ cuối tuần và ngày lễ), lý do, chứng từ (đính kèm), trạng thái, người duyệt cấp 1, người xác nhận HR, lý do từ chối/hủy, khóa duy nhất.
- Ngày lễ: ngày, tên.
- Điều chỉnh quỹ phép: thành viên, năm, số ngày (+/−), lý do, người thực hiện.
- Thông báo; Nhật ký thao tác.
- Quy tắc lưu ảnh chụp (snapshot): khi HR xác nhận, lưu số ngày làm việc và loại nghỉ tại thời điểm đó vào đơn; đổi lịch ngày lễ sau đó không làm đổi đơn đã xác nhận.

## 【4. Các trang và chức năng chính】
* Đơn của tôi: quỹ phép còn lại theo loại, nút "Tạo đơn" (ngăn kéo: chọn loại, ngày, nửa ngày, lý do, chứng từ; hiển thị ngay số ngày sẽ trừ), danh sách đơn theo trạng thái, hủy đơn chờ duyệt.
* Duyệt đơn (trưởng nhóm): hàng chờ duyệt, xem trùng lịch với thành viên khác của nhóm, duyệt/từ chối (lý do).
* Lịch nghỉ nhóm: lịch tháng thể hiện ai nghỉ ngày nào, lọc theo nhóm.
* Nhân sự: hàng chờ xác nhận, toàn bộ đơn (lọc theo nhóm, loại, trạng thái, khoảng ngày), điều chỉnh quỹ phép, xuất CSV.
* Thiết lập (HR/Quản trị viên): loại nghỉ, ngày lễ, quỹ phép đầu năm, nhóm và thành viên.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái đơn: Chờ duyệt → Trưởng nhóm đã duyệt → Đã xác nhận / Bị từ chối / Đã hủy; từ chối và hủy (sau khi đã duyệt) phải ghi lý do; đơn đã xác nhận chỉ HR hủy được và hoàn lại quỹ phép.
- Cách tính chỉ số: Số ngày làm việc = số ngày trong khoảng − cuối tuần − ngày lễ (nửa ngày = 0,5); Còn lại = Được hưởng + Chuyển sang − Đã dùng ± Điều chỉnh; tỷ lệ nghỉ của nhóm = ngày nghỉ đã xác nhận / ngày làm việc của nhóm trong kỳ; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Chống lỗi: không tạo đơn trùng khoảng ngày với đơn đang hiệu lực của chính mình; không vượt quỹ phép với loại trừ phép; không vượt số ngày tối đa mỗi lần; loại cần chứng từ thì bắt buộc đính kèm trước khi HR xác nhận; người tạo không tự duyệt; bấm gửi nhiều lần không tạo đơn trùng (khóa duy nhất người + khoảng ngày).
- Liên động: HR xác nhận → cộng "đã dùng" vào quỹ phép; hủy đơn đã xác nhận → hoàn lại.
- Lưu vết: mọi đổi trạng thái và điều chỉnh quỹ phép ghi nhật ký (người, thời điểm, trước/sau, lý do).
- Thông báo: đơn mới → trưởng nhóm; trưởng nhóm duyệt → HR; kết quả cuối → người tạo (trong ứng dụng; nếu môi trường hỗ trợ thì gửi thêm tin nhắn Lark qua workflow).

## 【6. Năng lực AI】
Không dùng AI.

## 【7. Bố cục】
Nhân viên: thanh trên + trang "Đơn của tôi" làm trung tâm. Trưởng nhóm/HR: điều hướng trái (Đơn của tôi / Duyệt / Lịch nhóm / Nhân sự / Thiết lập) có số đơn chờ. Tạo đơn và chi tiết đơn mở bằng ngăn kéo. Trên điện thoại ưu tiên tạo đơn và duyệt nhanh.

## 【8. Phong cách giao diện】
Preset `slate-indigo`; trạng thái: chờ = cam, đã duyệt/xác nhận = xanh lá, từ chối = đỏ, hủy = xám. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải, trạng thái trống có gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác ghi thật vào Lark Base; tải lại trang không mất đơn đang soạn.
- Từ thông báo mở đúng đơn; từ lịch nhóm mở đúng đơn.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: {3} nhóm, {12} thành viên (mỗi nhóm 1 trưởng nhóm, 1 HR), {4} loại nghỉ, ngày lễ năm hiện tại, quỹ phép cho mọi thành viên, {15} đơn đủ mọi trạng thái.
- Tài khoản demo: chủ app; chuyển vai trò Nhân viên / Trưởng nhóm / Nhân sự.
- Kịch bản nghiệm thu:
  ① Nhân viên tạo đơn 2,5 ngày có cuối tuần xen giữa → số ngày tính đúng → trưởng nhóm duyệt → HR xác nhận → quỹ phép giảm đúng.
  ② Tạo đơn vượt quỹ phép → bị chặn với thông báo rõ.
  ③ Tạo đơn trùng khoảng ngày với đơn đang chờ → bị chặn; bấm gửi hai lần → chỉ một đơn.
  ④ Trưởng nhóm A không xem/duyệt được đơn nhóm B; nhân viên không xem được lý do ốm của người khác.
  ⑤ HR hủy đơn đã xác nhận (có lý do) → quỹ phép hoàn lại, nhật ký có trước/sau.
  ⑥ Tải lại trang khi đang soạn đơn → nội dung vẫn còn.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Số nhóm, thành viên, loại nghỉ, đơn mẫu trong khối 10; có duyệt hai cấp (trưởng nhóm → HR) hay một cấp.

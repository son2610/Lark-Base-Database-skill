# Mẫu: Xếp ca thông minh bằng AI cho chuỗi cửa hàng

> Nhóm: Quy trình nhóm + Có AI · Preset: `slate-indigo` (hoặc nền xanh da trời nhẹ theo yêu cầu thương hiệu) · Bố cục: Lịch làm trung tâm + ngăn kéo chi tiết ca · Nguồn: prompt mẫu "AI 智能排班" của Lark, viết lại theo khung 10 khối (Genspark, bản tiếng Việt).
> Dùng khi: chuỗi F&B/bán lẻ có nhiều cửa hàng, ca làm theo kỹ năng, nhân viên bán thời gian. Không hợp khi: cần chấm công bằng máy chấm công thật (chỉ nhập/nhận dữ liệu thủ công).
> Lưu ý nền tảng: SQL không cộng/trừ thời gian → giờ công, chi phí tính trong FaaS và lưu vào ca; kiểm tra xung đột chạy trong FaaS (đọc ca, nghỉ phép qua Database Function).

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng hệ thống xếp ca thông minh bằng AI cho chuỗi cửa hàng, dựa trên nền tảng dữ liệu Lark Base /lark-base-database. Người dùng là bộ phận vận hành trụ sở chính, cửa hàng trưởng và nhân viên tuyến đầu. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: nhu cầu xếp ca, AI tạo bản nháp, phê duyệt và phát hành, nhân viên phản hồi.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức.
- Quản trị viên trụ sở: quản lý tất cả cửa hàng, nhân viên và mẫu ca; xem giờ công và chi phí toàn hệ thống; được điều phối nhân sự giữa các cửa hàng.
- Cửa hàng trưởng: chỉ quản lý nhân viên, ca làm và phê duyệt của cửa hàng mình; được tạo, điều chỉnh và phát hành lịch ca của cửa hàng mình.
- Nhân viên: chỉ xem ca của bản thân; được xác nhận hoặc từ chối đi làm, xin nghỉ phép và đăng ký ca bù.
- Trường nhạy cảm: lương theo giờ và chi phí nhân công chỉ trụ sở và cửa hàng trưởng của cửa hàng đó được xem; nhân viên không được xem.

## 【3. Các bảng dữ liệu chính】
- Cửa hàng: tên, khu vực, cửa hàng trưởng, giờ mở cửa theo tuần, lịch ngày lễ.
- Nhân viên: họ tên, tài khoản Lark, cửa hàng trực thuộc, kỹ năng (chọn nhiều), loại hình lao động (toàn thời gian / bán thời gian / theo giờ), lương theo giờ, giới hạn giờ công mỗi tuần, khung giờ có thể đi làm, trạng thái (đang làm / ngừng sử dụng).
- Mẫu ca: cửa hàng, tên ca, giờ bắt đầu và kết thúc, thời gian nghỉ, vị trí, kỹ năng yêu cầu, số người.
- Đợt xếp ca: cửa hàng, chu kỳ, nội dung yêu cầu gốc, yêu cầu sau khi phân tích, trạng thái (nháp / đã phát hành / đã thu hồi), người tạo, người phát hành, thời điểm phát hành.
- Ca làm: đợt xếp ca, cửa hàng, ngày, giờ bắt đầu và kết thúc, vị trí, nhân viên, giờ công, chi phí, trạng thái (nháp / đã phát hành / đã xác nhận / đã từ chối / chờ ca bù / thiếu người).
- Đơn xin nghỉ phép, đơn thay đổi nhân sự: người gửi, loại, nội dung, lý do, trạng thái, người duyệt, thời điểm duyệt.
- Đăng ký ca bù: ca làm, nhân viên, thời điểm đăng ký, trạng thái.
- Thông báo: người nhận, loại, bản ghi liên quan, trạng thái đã đọc.
- Nhật ký thao tác: đối tượng, loại thao tác, người thao tác, thời gian, nội dung trước và sau khi thay đổi.
- Quy tắc lưu ảnh chụp (snapshot): khi phát hành ca, lưu lại mức lương theo giờ tại thời điểm đó. Điều chỉnh lương về sau không làm thay đổi chi phí của các ca đã phát hành.

## 【4. Các trang và chức năng chính】
* Lịch xếp ca: xem theo tháng và theo tuần; lọc theo cửa hàng, nhân viên, vị trí, trạng thái. Bấm vào một ca để mở ngăn kéo bên cạnh, xem chi tiết, giờ công, chi phí, trạng thái xác nhận và lịch sử thao tác. Ca thiếu người được đánh dấu nổi bật.
* AI xếp ca, gồm 3 bước: ① Nhu cầu: chọn cửa hàng và khoảng ngày, mô tả nhu cầu về số người và kỹ năng bằng ngôn ngữ tự nhiên. ② Bản nháp: hiển thị kết quả trên lịch; điều chỉnh, thay người và kiểm tra xung đột ngay. ③ Phát hành: tổng hợp giờ công, chi phí, số chỗ còn thiếu và các xung đột chưa xử lý; người dùng xác nhận rồi mới phát hành.
* Quản lý nhân viên: cửa hàng trực thuộc, kỹ năng, loại hình lao động, lương theo giờ, giới hạn giờ công và khung giờ có thể đi làm; thêm mới, chỉnh sửa và ngừng sử dụng.
* Quản lý cửa hàng: giờ mở cửa, ngày lễ và mẫu ca.
* Phê duyệt: đơn nghỉ phép, thay đổi nhân sự và đăng ký ca bù; xem lý do, tiến độ và ảnh hưởng tới các ca đã phát hành.
* Ca của tôi: ca sắp tới và giờ công của bản thân; xác nhận hoặc từ chối đi làm (từ chối phải ghi lý do); xin nghỉ phép; xem và đăng ký các ca đang cần người bù.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái ca: Nháp → Đã phát hành → Đã xác nhận / Đã từ chối. Ca bị từ chối chuyển sang "Chờ ca bù" và mở cho đăng ký; cửa hàng trưởng chọn người rồi phân công lại. Thu hồi một đợt đã phát hành phải ghi lý do và thông báo cho nhân viên liên quan.
- Xung đột cứng (chặn phát hành): một nhân viên bị trùng giờ giữa hai ca; nhân viên đang trong kỳ nghỉ phép đã duyệt; ca nằm ngoài giờ mở cửa; nhân viên đã ngừng sử dụng.
- Xung đột mềm (cảnh báo nhưng vẫn cho phát hành): ngoài khung giờ có thể đi làm; vượt giới hạn giờ công tuần; hai ca cách nhau dưới {10} giờ; kỹ năng không khớp hoàn toàn.
- Thiếu người: chưa đủ số người theo nhu cầu thì đánh dấu thiếu người; vẫn cho phát hành và giữ cảnh báo; đủ người thì cảnh báo tự biến mất.
- Cách tính chỉ số: Giờ công = Giờ kết thúc − Giờ bắt đầu − Thời gian nghỉ; Chi phí = Giờ công × Lương theo giờ đã lưu lúc phát hành; Số chỗ thiếu = Số lượt người cần − Số lượt người đã phân công; thẻ chỉ số thống kê theo bộ lọc hiện tại; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- Liên động: đơn nghỉ phép được duyệt hoặc nhân viên bị ngừng sử dụng → các ca đã phát hành bị xung đột tự chuyển sang "Chờ ca bù" và nhắc cửa hàng trưởng. Ca bù được xác nhận → lịch và chỉ số cập nhật ngay.
- Chống trùng lặp: bấm phát hành nhiều lần không được tạo trùng ca hoặc gửi trùng thông báo. Mỗi nhân viên chỉ đăng ký một ca bù một lần.
- Lưu vết: mọi thay đổi trạng thái đều ghi lại người thao tác và thời gian.
- Thông báo: khi phát hành, điều chỉnh, thu hồi, có kết quả phê duyệt hoặc kết quả ca bù, gửi thông báo cho nhân viên liên quan (trong ứng dụng; nếu môi trường hỗ trợ thì gửi thêm tin nhắn Lark).

## 【6. Năng lực AI】
- Đầu vào: cửa hàng, khoảng ngày và nhu cầu viết bằng ngôn ngữ tự nhiên, ví dụ: "Cuối tuần từ 11h đến 14h cần 3 thu ngân, 2 pha chế, mỗi ngày ít nhất 1 người biết mở cửa hàng". Hệ thống tự đọc giờ mở cửa, mẫu ca, kỹ năng nhân viên, khung giờ có thể đi làm, lịch nghỉ phép và giới hạn giờ công.
- Phân tích: trước tiên chuyển nhu cầu thành bảng có cấu trúc (ngày / khung giờ / vị trí / kỹ năng / số người) để người dùng xác nhận. Thiếu thông tin hoặc chưa rõ thì hỏi lại, không tự giả định.
- Thứ tự ưu tiên khi xếp: tuân thủ xung đột cứng > đáp ứng đủ nhu cầu > kiểm soát chi phí > cân bằng giờ công > tôn trọng mong muốn của nhân viên.
- Đầu ra: kết quả chỉ được ghi ở trạng thái nháp và không gửi thông báo cho nhân viên. Mỗi chỗ còn thiếu phải kèm lý do vì sao chưa xếp được.
- Giới hạn: AI không được tự phát hành và không được sửa các ca đã phát hành.
- Khi thất bại: tạo được một phần thì giữ phần đã tạo và đánh dấu các khung giờ chưa xong. Trước khi tạo lại phải hỏi người dùng có muốn ghi đè bản nháp hiện tại không.

## 【7. Bố cục】
Thanh trên cùng gồm thương hiệu, điều hướng và tài khoản (có chức năng chuyển vai trò). Phía trên vùng chính là các thẻ chỉ số: giờ công, chi phí, số chỗ thiếu, đơn chờ duyệt. Bên dưới là lịch lớn làm trung tâm; bộ lọc và nút "AI xếp ca" nằm trên thanh công cụ của lịch. Chi tiết ca mở bằng ngăn kéo bên cạnh. Trên điện thoại ưu tiên "Ca của tôi", nút xác nhận đi làm và đăng ký ca bù.

## 【8. Phong cách giao diện】
Nền {xanh da trời rất nhạt}, thẻ trắng bo góc, khoảng trắng thoáng. Mỗi trạng thái ca có một màu riêng (nháp / đã phát hành / đã xác nhận / đã từ chối / chờ ca bù / thiếu người). Xung đột dùng màu cảnh báo, kèm biểu tượng và chữ giải thích. Hỗ trợ giao diện sáng và tối. Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24 giờ; tiền tệ VND.

## 【9. Yêu cầu chất lượng】
Có đầy đủ trạng thái đang tải, trạng thái trống, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại. Mọi thao tác đều ghi thật vào Lark Base; tải lại trang không mất bản nháp và các điều chỉnh. Lịch, trang phê duyệt và "Ca của tôi" chuyển qua lại cho nhau, dữ liệu luôn đồng nhất. Phân quyền kiểm tra ở phía máy chủ.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu: 3 cửa hàng có giờ mở cửa khác nhau, trong đó 1 cửa hàng có lịch ngày lễ; mỗi cửa hàng {8–12} nhân viên với nhiều loại hình lao động và kỹ năng khác nhau; 2 bộ mẫu ca; 1 tuần đã phát hành và 1 tuần đang ở bản nháp; đơn nghỉ phép ở nhiều trạng thái; 1 ca bị từ chối kèm đăng ký ca bù; 1 ca thiếu người.
- Tài khoản demo: 1 quản trị viên trụ sở, mỗi cửa hàng 1 cửa hàng trưởng, cùng một số nhân viên; có thể chuyển vai trò để trải nghiệm.
- Kịch bản nghiệm thu:
  ① Cửa hàng trưởng mô tả nhu cầu bằng ngôn ngữ tự nhiên để tạo bản nháp tuần sau → điều chỉnh → kiểm tra xung đột → phát hành → nhân viên nhận được thông báo.
  ② Nhân viên từ chối ca → ca chuyển sang chờ ca bù → nhân viên khác đăng ký → cửa hàng trưởng xác nhận → lịch và chỉ số được cập nhật.
  ③ Nhân viên xin nghỉ phép → cửa hàng trưởng duyệt → các ca bị xung đột tự chuyển sang chờ ca bù.
  ④ Xếp một nhân viên vào ngày người đó đang nghỉ phép → bị chặn và hiển thị lý do.
  ⑤ Nhân viên vượt giới hạn giờ công → hiển thị cảnh báo nhưng vẫn cho phát hành.
  ⑥ Cửa hàng trưởng cửa hàng A không xem được dữ liệu cửa hàng B; nhân viên không xem được lương theo giờ và chi phí.
  ⑦ Bấm phát hành hai lần liên tiếp → không tạo trùng ca, không gửi trùng thông báo.
  ⑧ Tải lại trang → bản nháp và các điều chỉnh vẫn còn nguyên.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận
- Khoảng nghỉ tối thiểu giữa hai ca `{10}` giờ; số nhân viên mẫu mỗi cửa hàng `{8–12}`; màu nền `{xanh da trời rất nhạt}`.

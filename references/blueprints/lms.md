# Mẫu: Nền tảng học trực tuyến (LMS) ★

> Nhóm: Quy trình nhóm + Có AI · Preset: `ivory-blue` · Bố cục: Portal (học viên) + Workbench (giảng dạy/quản trị) · Nguồn: spec thật đã dựng và nghiệm thu ①–⑩ trên Preview (CLI 1.6.0, 21 bảng, 90 Database Function, 35 FaaS, 5 AI Function, 2026-10-26).
> Dùng khi: đào tạo nội bộ, học viện doanh nghiệp, khóa học có kiểm tra và chứng chỉ. Không hợp khi: cần bán khóa học cho người ngoài tổ chức (app chỉ dùng trong tổ chức), cần cổng thanh toán thật.
> Rút gọn giai đoạn 1: khóa học, ghi danh, trình học bài, tiến độ, bài kiểm tra trắc nghiệm. Giai đoạn 2: bài tập và chấm, chứng chỉ, hỏi đáp, đánh giá, AI.
> Bài học khi dựng: SQL không cho phép toán cột → tiến độ/điểm tính trong FaaS; một CTE phạm vi duy nhất (tránh lỗi runtime 800008904); đáp án đọc qua Function `srv*` khóa bằng serverKey (đặt khóa trong biến môi trường secret); chạy df-smoke sau mỗi đổi SQL.

## 【0. Chuẩn bị】
Trước khi bắt đầu, nếu chưa cài CLI và Skill của Lark Base Database, hãy cài đặt trước:
- Cài Lark CLI (bỏ qua nếu đã cài): npx @larksuite/cli@latest install
- Cài Lark Base Database Skill (bỏ qua nếu đã cài): npx @lark-base-open/base-database-cli@latest skill install --target all --force

## 【1. Mục tiêu】
Hãy giúp tôi xây dựng nền tảng học trực tuyến (LMS) dựa trên nền tảng dữ liệu Lark Base /lark-base-database. Người dùng gồm quản trị viên, giảng viên và học viên. Toàn bộ dữ liệu được quản lý bằng Lark Base, và hệ thống kết nối các bước: xây dựng khóa học, ghi danh, học bài và theo dõi tiến độ, kiểm tra và chấm điểm, cấp chứng chỉ.

## 【2. Vai trò và phân quyền】
- Phạm vi phát hành: cả tổ chức (người mới mở app được tạo hồ sơ học viên).
- Quản trị viên: quản lý tất cả khóa học, danh mục, người dùng và chứng chỉ; duyệt khóa học trước khi xuất bản; xem báo cáo toàn hệ thống.
- Giảng viên: chỉ quản lý khóa học mình phụ trách (nội dung, bài kiểm tra, bài tập, học viên); chấm bài, trả lời hỏi đáp; xem báo cáo của khóa học mình.
- Trợ giảng (tùy chọn): được giảng viên phân công vào khóa học cụ thể; được chấm bài và trả lời hỏi đáp, không được sửa nội dung khóa học.
- Học viên: xem danh mục khóa học công khai; chỉ truy cập nội dung của khóa học đã ghi danh (trừ bài học thử); chỉ xem tiến độ, điểm số, bài nộp và chứng chỉ của bản thân.
- Trường nhạy cảm: đáp án đúng của câu hỏi không bao giờ được trả về trình duyệt của học viên trước khi nộp bài; email và số điện thoại học viên chỉ quản trị viên và giảng viên của khóa đó được xem.

## 【3. Các bảng dữ liệu chính】
- Người dùng: họ tên, email, ảnh đại diện, vai trò, trạng thái (hoạt động / khóa).
- Danh mục: tên, danh mục cha, thứ tự.
- Khóa học: tên, ảnh bìa, mô tả ngắn, mô tả chi tiết, mục tiêu đầu ra, yêu cầu đầu vào, trình độ (cơ bản / trung cấp / nâng cao), danh mục, giảng viên, giá, hình thức ghi danh (miễn phí / trả phí / cần duyệt / mã kích hoạt), thời hạn truy cập, điều kiện cấp chứng chỉ, trạng thái (nháp / chờ duyệt / đã xuất bản / ngừng tuyển sinh / lưu trữ), phiên bản.
- Chương: khóa học, tên, thứ tự.
- Bài học: chương, tên, loại (video / tài liệu / bài đọc / bài kiểm tra / bài tập), nội dung hoặc liên kết, thời lượng, cho học thử (có / không), bài học điều kiện tiên quyết, thứ tự, trạng thái.
- Ngân hàng câu hỏi: khóa học, loại (một đáp án / nhiều đáp án / đúng-sai / điền từ / tự luận), nội dung, các lựa chọn, đáp án, giải thích, độ khó, thẻ.
- Bài kiểm tra: bài học, danh sách câu hỏi hoặc quy tắc rút ngẫu nhiên, thời gian làm bài, số lần làm tối đa, điểm đạt, cách tính điểm (lần cao nhất / lần gần nhất), xáo trộn câu hỏi, thời điểm hiện đáp án.
- Lượt làm bài: học viên, bài kiểm tra, lần thứ, thời điểm bắt đầu và nộp, câu trả lời, điểm, kết quả, trạng thái (đang làm / đã nộp / chờ chấm tự luận / đã chấm).
- Bài tập: bài học, đề bài, tệp đính kèm, hạn nộp, cho phép nộp muộn, thang điểm, tiêu chí chấm.
- Bài nộp: học viên, bài tập, lần nộp, tệp / nội dung, thời điểm nộp, nộp muộn, điểm, nhận xét, người chấm, trạng thái (đã nộp / đã chấm / yêu cầu nộp lại).
- Ghi danh: học viên, khóa học, hình thức, giá tại thời điểm ghi danh, thời điểm ghi danh, ngày hết hạn, phiên bản khóa học, trạng thái (chờ duyệt / đang học / hoàn thành / hết hạn / đã hủy).
- Tiến độ bài học: ghi danh, bài học, trạng thái (chưa học / đang học / hoàn thành), vị trí video gần nhất, tổng thời gian đã xem, thời điểm hoàn thành.
- Chứng chỉ: mã chứng chỉ duy nhất, học viên, khóa học, ngày cấp, điểm tổng kết, trạng thái (hợp lệ / đã thu hồi), lý do thu hồi.
- Hỏi đáp: khóa học, bài học, người hỏi, nội dung, câu trả lời, người trả lời, trạng thái (chưa trả lời / đã trả lời / đã giải quyết).
- Đánh giá khóa học: học viên, khóa học, số sao, nhận xét, trạng thái hiển thị.
- Ghi chú cá nhân: học viên, bài học, mốc thời gian video, nội dung.
- Mã kích hoạt: mã, khóa học, số lượt dùng tối đa, số lượt đã dùng, hạn dùng.
- Thông báo: người nhận, loại, bản ghi liên quan, trạng thái đã đọc.
- Nhật ký thao tác: đối tượng, loại thao tác, người thao tác, thời gian, nội dung trước và sau khi thay đổi.
- Quy tắc lưu ảnh chụp (snapshot): lưu giá và phiên bản khóa học tại thời điểm ghi danh; lưu điểm đạt và cấu hình bài kiểm tra tại thời điểm bắt đầu lượt làm. Giảng viên sửa cấu hình sau đó không làm thay đổi kết quả đã có.

## 【4. Các trang và chức năng chính】
Phía học viên:
* Trang chủ: banner nổi bật, ô tìm kiếm lớn, danh mục, khóa học nổi bật / mới / phổ biến. Nếu đã đăng nhập, hiển thị khu "Tiếp tục học" với khóa học đang dở và nút học tiếp.
* Danh mục khóa học: tìm kiếm; lọc theo danh mục, trình độ, giá (miễn phí / trả phí), thời lượng, điểm đánh giá; sắp xếp theo mới nhất, phổ biến, đánh giá cao. Khóa học hiển thị dạng thẻ có ảnh bìa, tên, giảng viên, số sao, số học viên, giá.
* Chi tiết khóa học: giới thiệu, mục tiêu đầu ra, yêu cầu đầu vào, đề cương có thể mở rộng/thu gọn (ghi rõ bài học thử), thông tin giảng viên, đánh giá. Nút ghi danh thay đổi theo trạng thái (Ghi danh / Nhập mã kích hoạt / Chờ duyệt / Học tiếp / Đã hết hạn).
* Trình học bài: cột trái là đề cương có dấu tích hoàn thành và biểu tượng khóa với bài chưa mở; vùng giữa hiển thị video / tài liệu / bài đọc; bên dưới có các tab Tổng quan, Ghi chú, Hỏi đáp, Tài liệu đính kèm. Có nút "Bài trước / Bài tiếp theo / Đánh dấu hoàn thành" và thanh tiến độ khóa học.
* Làm bài kiểm tra: đồng hồ đếm ngược, bảng điều hướng câu hỏi (đã làm / chưa làm / đánh dấu xem lại), tự động lưu câu trả lời. Sau khi nộp, hiển thị điểm, kết quả đạt/chưa đạt và phần giải thích theo cấu hình.
* Nộp bài tập: xem đề, hạn nộp, tải tệp lên hoặc nhập nội dung; xem lịch sử nộp, điểm và nhận xét.
* Học tập của tôi: các khóa đang học, đã hoàn thành, đã hết hạn, kèm phần trăm tiến độ; danh sách việc cần làm (bài tập sắp đến hạn, bài kiểm tra chưa làm); chứng chỉ đã nhận.
* Chứng chỉ: xem, tải xuống PDF, chia sẻ liên kết; có trang xác minh công khai nhập mã chứng chỉ để kiểm tra tính hợp lệ.

Phía giảng viên và quản trị:
* Tổng quan giảng dạy: thẻ chỉ số (học viên mới, đang học, tỷ lệ hoàn thành, điểm đánh giá trung bình, bài chờ chấm, câu hỏi chưa trả lời); biểu đồ ghi danh theo thời gian; các bài học có tỷ lệ bỏ dở cao.
* Xây dựng khóa học: dạng các bước (Thông tin cơ bản → Đề cương → Nội dung bài học → Cài đặt ghi danh và chứng chỉ → Xem trước → Gửi duyệt). Đề cương kéo thả để sắp xếp chương và bài; xem trước dưới góc nhìn học viên.
* Ngân hàng câu hỏi và bài kiểm tra: thêm, sửa, nhân bản câu hỏi; lọc theo thẻ và độ khó; nhập hàng loạt từ bảng tính; tạo bài kiểm tra cố định hoặc rút ngẫu nhiên theo quy tắc.
* Chấm bài: hàng đợi bài tập và câu tự luận chờ chấm, lọc theo khóa học, bài tập, trạng thái; chấm theo tiêu chí, viết nhận xét, yêu cầu nộp lại.
* Quản lý học viên: danh sách học viên của khóa với tiến độ, điểm, lần truy cập gần nhất; duyệt đơn ghi danh; ghi danh thủ công hoặc hàng loạt; gia hạn hoặc hủy quyền truy cập; xuất danh sách.
* Hỏi đáp: danh sách câu hỏi theo khóa học và bài học, lọc chưa trả lời; trả lời và đánh dấu đã giải quyết.
* Quản trị hệ thống (chỉ quản trị viên): duyệt khóa học, quản lý danh mục, người dùng, mã kích hoạt, mẫu chứng chỉ, kiểm duyệt đánh giá, báo cáo toàn hệ thống.

## 【5. Quy tắc nghiệp vụ】
- Trạng thái khóa học: Nháp → Chờ duyệt → Đã xuất bản → Ngừng tuyển sinh → Lưu trữ. Quản trị viên từ chối duyệt phải ghi lý do. Khóa ngừng tuyển sinh không nhận học viên mới nhưng học viên cũ vẫn học tiếp đến hết hạn.
- Phiên bản nội dung: sửa khóa học đã xuất bản sẽ tạo bản nháp mới, xuất bản lại mới có hiệu lực. Bài học bị xóa không làm mất tiến độ và điểm đã có của học viên.
- Ghi danh:
  Miễn phí → vào học ngay.
  Cần duyệt → chờ giảng viên hoặc quản trị viên duyệt.
  Mã kích hoạt → kiểm tra mã còn hạn và còn lượt.
  Trả phí → hệ thống không kết nối cổng thanh toán thật. Học viên gửi yêu cầu, quản trị viên xác nhận đã thanh toán rồi kích hoạt; hoặc dùng mã kích hoạt.
  Mỗi học viên chỉ có một bản ghi ghi danh đang hiệu lực cho mỗi khóa học. Bấm ghi danh nhiều lần không tạo bản ghi trùng; một mã kích hoạt không bị trừ lượt hai lần.
- Quyền truy cập: chỉ bài học thử được xem khi chưa ghi danh. Hết thời hạn truy cập thì khóa nội dung nhưng vẫn giữ tiến độ, điểm và chứng chỉ.
- Học theo thứ tự: bài học có điều kiện tiên quyết chỉ mở khi đã hoàn thành bài điều kiện; bài bị khóa hiển thị lý do.
- Hoàn thành bài học:
  Video → xem đạt tối thiểu {90}% thời lượng; tua nhanh không được tính.
  Tài liệu / bài đọc → học viên bấm "Đánh dấu hoàn thành".
  Bài kiểm tra → đạt điểm đạt.
  Bài tập → được chấm đạt.
- Cách tính chỉ số:
  Tiến độ khóa học = Số bài học bắt buộc đã hoàn thành / Tổng số bài học bắt buộc của phiên bản đã ghi danh.
  Điểm bài kiểm tra = Tổng điểm câu đúng / Tổng điểm tối đa × 100. Câu nhiều đáp án chỉ tính điểm khi chọn đúng toàn bộ (hoặc {tính điểm từng phần}).
  Điểm tổng kết = trung bình có trọng số các bài kiểm tra và bài tập theo cấu hình khóa học.
  Tỷ lệ hoàn thành = Số ghi danh đã hoàn thành / Số ghi danh đang hiệu lực.
  Điểm đánh giá trung bình chỉ tính các đánh giá đang hiển thị.
  Khi thiếu dữ liệu, hiển thị "Chưa có dữ liệu", không hiển thị 0%.
- Làm bài kiểm tra: không được vượt quá số lần làm tối đa. Hết giờ thì tự động nộp với các câu đã trả lời. Tải lại trang hoặc mất mạng giữa chừng phải tiếp tục đúng lượt đang làm với thời gian còn lại; không được tạo lượt mới. Câu trắc nghiệm chấm tự động; câu tự luận chuyển sang chờ chấm, điểm cuối cùng chỉ công bố khi chấm xong.
- Bài tập: nộp sau hạn bị đánh dấu nộp muộn, hoặc bị chặn nếu không cho phép nộp muộn. Mỗi lần nộp lại được lưu riêng, không ghi đè lần trước. Sửa điểm đã chấm phải ghi lý do.
- Chứng chỉ: tự động cấp khi đạt đủ điều kiện (ví dụ tiến độ 100% và điểm tổng kết ≥ {70}). Mỗi học viên chỉ có một chứng chỉ hợp lệ cho mỗi khóa học. Thu hồi phải ghi lý do; trang xác minh hiển thị trạng thái đã thu hồi.
- Đánh giá: chỉ học viên đã ghi danh và hoàn thành tối thiểu {20}% khóa học mới được đánh giá. Mỗi người một đánh giá cho mỗi khóa học và được phép sửa.
- Liên động: hoàn thành bài học thì cập nhật ngay tiến độ khóa, "Tiếp tục học" và chỉ số của giảng viên. Bài được chấm thì học viên nhận thông báo và tiến độ được tính lại. Đủ điều kiện thì chứng chỉ được cấp ngay.
- Lưu vết: các thay đổi trạng thái khóa học, ghi danh, điểm số và chứng chỉ đều ghi lại người thao tác và thời gian.
- Thông báo: ghi danh được duyệt, bài tập sắp đến hạn (trước {24} giờ), bài đã được chấm, câu hỏi có trả lời mới, nhận chứng chỉ, khóa học sắp hết hạn truy cập. Thông báo trong ứng dụng; nếu môi trường hỗ trợ thì gửi thêm tin nhắn Lark.

## 【6. Năng lực AI】
- Trợ lý học tập (phía học viên): ngăn kéo bên cạnh trình học bài. Trả lời câu hỏi chỉ dựa trên nội dung khóa học đã ghi danh, kèm trích dẫn bài học liên quan. Nếu không tìm thấy trong nội dung thì nói rõ và gợi ý đặt câu hỏi cho giảng viên. Không làm hộ và không tiết lộ đáp án bài kiểm tra đang làm; tắt trợ lý trong lúc làm bài kiểm tra.
- Trợ lý soạn bài (phía giảng viên):
  Tạo câu hỏi trắc nghiệm từ nội dung bài học, có đáp án và giải thích.
  Gợi ý đề cương từ mô tả khóa học.
  Tóm tắt bài học.
  Gợi ý nhận xét cho bài tự luận dựa trên tiêu chí chấm.
- Đầu ra: mọi kết quả AI chỉ là bản nháp, giảng viên xem, sửa và xác nhận rồi mới lưu. AI không được tự chấm điểm chính thức, không tự xuất bản nội dung và không sửa điểm đã chấm.
- Xử lý khi thất bại: nếu chỉ tạo được một phần thì giữ phần đã tạo và cho phép tạo tiếp. Thông tin không đủ thì hỏi lại, không tự giả định.

## 【7. Bố cục】
Phía học viên: thanh trên cùng gồm logo, danh mục, ô tìm kiếm, "Học tập của tôi", thông báo và tài khoản. Trang chủ và danh mục dùng lưới thẻ khóa học. Trình học bài dùng bố cục ba vùng (đề cương – nội dung – tab bên dưới) và có chế độ tập trung ẩn đề cương.
Phía giảng viên và quản trị: điều hướng bên trái theo nhóm, thanh trên cùng có tìm kiếm và nút "Tạo khóa học". Vùng chính gồm thẻ chỉ số và bảng dữ liệu gọn; chi tiết và chỉnh sửa nhanh mở bằng ngăn kéo bên cạnh.
Trên điện thoại: ưu tiên "Tiếp tục học", trình học bài toàn màn hình với đề cương dạng ngăn kéo, làm bài kiểm tra và nộp bài tập; điều hướng dưới đáy màn hình.

## 【8. Phong cách giao diện】
Nền trắng ngà, thẻ trắng bo góc, viền mảnh, màu nhấn {xanh dương đậm} cho nút chính và thanh tiến độ, khoảng trắng thoáng. Ảnh bìa khóa học là điểm nhấn thị giác. Màu trạng thái rõ ràng nhưng tiết chế: hoàn thành màu xanh lá, đang học màu xanh dương, bị khóa màu xám, quá hạn màu đỏ. Thanh tiến độ và phần trăm luôn hiển thị nổi bật. Hỗ trợ giao diện sáng và tối. Giao diện bằng tiếng Việt, ngày theo định dạng dd/mm/yyyy, giờ theo định dạng 24 giờ, tiền tệ VND. Đảm bảo độ tương phản và hỗ trợ điều hướng bằng bàn phím.

## 【9. Yêu cầu chất lượng】
- Có đầy đủ trạng thái đang tải (khung xương cho lưới khóa học), trạng thái trống có lời gợi ý hành động, thông báo lỗi và phản hồi sau thao tác; thao tác thất bại có thể thử lại.
- Mọi thao tác đều ghi thật vào Lark Base. Tải lại trang không mất vị trí video, câu trả lời bài kiểm tra đang làm hay nội dung bài nộp đang soạn.
- Các trang liên kết qua lại: từ khóa học sang bài học, từ hỏi đáp sang đúng bài học, từ thông báo sang đúng bản ghi.
- Video: hỗ trợ liên kết nhúng (YouTube / Vimeo / liên kết video) và tệp đính kèm trong Lark Base; có tùy chọn tốc độ phát và ghi nhớ vị trí xem.
- Phân quyền được kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện.

## 【10. Dữ liệu mẫu và nghiệm thu】
- Dữ liệu hư cấu:
  {4} danh mục.
  {6} khóa học ở các trạng thái khác nhau (miễn phí, trả phí, cần duyệt, mã kích hoạt, 1 khóa chờ duyệt, 1 khóa ngừng tuyển sinh), mỗi khóa có 3–5 chương và đủ các loại bài học, trong đó có bài học thử và bài có điều kiện tiên quyết.
  Ngân hàng khoảng {40} câu hỏi đủ các loại.
  Bài kiểm tra có giới hạn số lần làm và thời gian.
  Bài tập có cả bài đã chấm, chờ chấm và nộp muộn.
  Học viên có tiến độ khác nhau (mới bắt đầu, học dở, đã hoàn thành có chứng chỉ, đã hết hạn).
  Có hỏi đáp, đánh giá và mã kích hoạt mẫu.
  Toàn bộ nội dung bài học là văn bản tự viết và video mẫu công khai, không dùng tài liệu có bản quyền.
- Tài khoản demo: 1 quản trị viên, 2 giảng viên, 1 trợ giảng, 5 học viên; có thể chuyển vai trò để trải nghiệm.
- Kịch bản nghiệm thu:
  ① Giảng viên tạo khóa học → xây đề cương → thêm video và bài kiểm tra (dùng AI tạo câu hỏi rồi chỉnh sửa) → gửi duyệt → quản trị viên duyệt → khóa học hiển thị trong danh mục.
  ② Học viên tìm khóa học → xem bài học thử → ghi danh bằng mã kích hoạt → học bài → tiến độ tăng → thoát ra và quay lại "Tiếp tục học" đúng bài và đúng vị trí video.
  ③ Học viên mở bài có điều kiện tiên quyết chưa hoàn thành → bị chặn và hiển thị lý do.
  ④ Học viên làm bài kiểm tra → tải lại trang giữa chừng → tiếp tục đúng lượt và đúng thời gian còn lại → hết giờ tự nộp; dùng hết số lần làm thì không được làm thêm.
  ⑤ Học viên nộp bài tập → giảng viên chấm và yêu cầu nộp lại → học viên nộp lại → cả hai lần nộp đều còn trong lịch sử.
  ⑥ Học viên hoàn thành 100% và đạt điểm → chứng chỉ tự động được cấp → tra mã trên trang xác minh thấy hợp lệ → quản trị viên thu hồi → trang xác minh hiển thị đã thu hồi.
  ⑦ Bấm ghi danh hai lần liên tiếp → chỉ có một bản ghi ghi danh, mã kích hoạt chỉ bị trừ một lượt.
  ⑧ Học viên chưa ghi danh không mở được bài học không cho học thử (kể cả truy cập trực tiếp bằng đường dẫn); giảng viên A không sửa được khóa học của giảng viên B; dữ liệu trả về trình duyệt của học viên không chứa đáp án.
  ⑨ Giảng viên sửa khóa học đã xuất bản → học viên vẫn thấy bản cũ cho đến khi xuất bản lại; tiến độ và điểm cũ không bị mất.
  ⑩ Hỏi trợ lý AI một câu nằm ngoài nội dung khóa học → AI trả lời rằng không tìm thấy và gợi ý hỏi giảng viên.
Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản trên và báo cáo kết quả.

## Giá trị cần xác nhận

- `{90}`% thời lượng video để tính hoàn thành; `{tính điểm từng phần}` cho câu nhiều đáp án (hoặc chỉ tính khi đúng toàn bộ).

- Điểm tổng kết tối thiểu để cấp chứng chỉ `{70}`; tiến độ tối thiểu để đánh giá `{20}`%; nhắc hạn trước `{24}` giờ.

- Màu nhấn `{xanh dương đậm}`; dữ liệu mẫu `{4}` danh mục, `{6}` khóa học, `{40}` câu hỏi.

- Phạm vi phát hành: cả tổ chức (học viên mới tự tạo hồ sơ học viên khi mở app lần đầu).

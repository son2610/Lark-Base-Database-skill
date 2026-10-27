# 02 — Spec 10 khối

Spec là "hợp đồng" giữa người dùng và agent dựng app. Viết tốt thì lần dựng đầu đã gần đúng; viết mơ hồ thì AI tự
bịa schema, quyền và công thức. Khung này rút từ phân tích 11 prompt mẫu chính thức của Lark (7 khối ngầm định) và
bổ sung những phần các mẫu đó còn thiếu: vai trò tách riêng, bảng dữ liệu tường minh, AI có ranh giới, nghiệm thu.

## Mục lục
- [Cấu trúc và định dạng](#cau-truc)
- [Hướng dẫn từng khối](#tung-khoi)
- [Khối bắt buộc theo nhóm app](#bat-buoc)
- [Cụm từ mơ hồ cần thay](#mo-ho)
- [Checklist trước khi phát hành spec](#checklist)
- [Từ spec sang thiết kế kỹ thuật](#sang-ky-thuat)

<a id="cau-truc"></a>
## Cấu trúc và định dạng

- File `app-spec.md` ở thư mục dự án (chế độ B: giao cho người dùng). Mẫu trống: `assets/spec-template.md`.
- Mỗi khối là một tiêu đề `## 【N. Tên khối】`, đúng thứ tự 0 → 10 (agent đọc tuần tự, nên **khối 0 cài đặt phải ở đầu**).
- Giá trị tùy chỉnh đặt trong ngoặc nhọn: `{90}%`, `{24} giờ`, `{8–12} nhân viên`. Cuối spec có mục
  "Giá trị cần xác nhận" liệt kê tất cả. Ô chưa điền dạng chữ (`{Tên sản phẩm}`) là lỗi — `lint_spec` sẽ báo.
- Độ dài hợp lý: 900–2.000 từ tiếng Việt cho app nhóm/giao dịch; 400–900 từ cho app cá nhân. Giữ khối 5 (quy tắc)
  **không ngắn hơn** khối 7+8 (giao diện) — quy tắc mới quyết định app chạy đúng.
- Nếu người dùng muốn dùng spec cho agent khác (Genspark, Codex…), giữ nguyên dòng `/lark-base-database` ở khối 1 để
  agent đó gọi đúng Skill chính thức.

<a id="tung-khoi"></a>
## Hướng dẫn từng khối

### 【0. Chuẩn bị】
Lệnh cài đặt (bỏ qua nếu đã cài) — đặt đầu tiên để agent cài trước khi dựng:
```
- Cài Lark CLI: npx @larksuite/cli@latest install
- Cài Lark Base Database Skill: npx @lark-base-open/base-database-cli@latest skill install --target all --force
```
Thêm nếu cần: "Dựng bằng danh tính bot và trao quyền quản trị cho {người}" (xem catalog F03).

### 【1. Mục tiêu】
Một đoạn: nền tảng + tên sản phẩm + người dùng + **luồng chính 3–4 bước** ("kết nối các bước A, B, C, D").
Mẫu: *"Hãy giúp tôi xây dựng {tên app} dựa trên nền tảng dữ liệu Lark Base /lark-base-database, dành cho {người dùng}.
Toàn bộ dữ liệu quản lý bằng Lark Base; hệ thống kết nối các bước: {A}, {B}, {C} và {D}."*

### 【2. Vai trò và phân quyền】
- Mỗi vai trò một dòng: `- {Vai trò}: được xem …; được làm …; không được …`.
- Phạm vi phát hành (ai mở được app): chỉ mình tôi / cả tổ chức / người cụ thể.
- **Trường nhạy cảm**: liệt kê trường và vai trò được xem ("không bao giờ trả về trình duyệt của …").
- App cá nhân: một dòng "Một người dùng; dữ liệu chỉ người tạo truy cập."
- Nếu cần trải nghiệm nhiều vai trò: "Có tài khoản demo và chức năng chuyển vai trò chỉ cho chủ app."

### 【3. Các bảng dữ liệu chính】
- Mỗi bảng một dòng: `- {Bảng}: trường chính (kiểu nếu quan trọng), trạng thái (liệt kê giá trị); liên kết {Bảng khác}.`
- Bắt buộc với app giao dịch: **quy tắc snapshot** (lưu giá/cấu hình tại thời điểm chốt).
- Bắt buộc với app nhóm: **bảng nhật ký thao tác** (đối tượng, thao tác, người, thời gian, trước/sau).
- Nếu có thông báo: **bảng Thông báo** (người nhận, loại, bản ghi liên quan, đã đọc).
- Tách thực thể có vòng đời riêng (ví dụ *Ứng viên* và *Hồ sơ ứng tuyển* theo từng vị trí; *Đơn hàng* và *Phiếu xuất kho*).

### 【4. Các trang và chức năng chính】
5–8 trang (app lớn chia theo phía người dùng). Mỗi trang: **xem gì · lọc theo gì · quản lý gì · thao tác nào ·
trạng thái nào**. Ghi rõ trang nào chỉ vai trò nào thấy.

### 【5. Quy tắc nghiệp vụ】
Tách thành các gạch đầu dòng có nhãn (không gộp thành một đoạn dài):
- **Trạng thái**: `A → B → C`; bước nào bắt buộc lý do; ai được chuyển.
- **Cách tính chỉ số**: `Chỉ số = công thức`; phạm vi theo bộ lọc; thiếu dữ liệu hiển thị "Chưa có dữ liệu".
- **Chống lỗi** (≥ 3): bấm hai lần không tạo trùng; không vượt giới hạn; giá trị trong phạm vi; ngăn thao tác khi
  không đủ điều kiện.
- **Liên động**: thay đổi X thì Y cập nhật gì.
- **Lưu vết**: thay đổi nào ghi nhật ký; sửa số liệu đã chốt phải ghi lý do.
- **Thông báo**: sự kiện nào, gửi ai, kênh (trong app / tin nhắn Lark qua workflow).
- **Không giả lập**: những gì không kết nối thật (cổng thanh toán, thiết bị IoT…) và cách thay thế.

### 【6. Năng lực AI】
Nếu không dùng: "Không dùng AI." Nếu dùng, mỗi năng lực ghi đủ 5 ý:
- **Đầu vào** (ngôn ngữ tự nhiên + đối tượng chọn) và dữ liệu nào được đưa cho AI (tối thiểu cần thiết).
- **Phân tích**: hỏi lại khi thiếu thông tin, không tự giả định.
- **Đầu ra**: luôn là **bản nháp** chờ người xác nhận mới ghi vào Base.
- **Giới hạn**: AI không được tự phát hành, tự chấm điểm chính thức, sửa dữ liệu đã chốt, hoặc trả lời ngoài phạm vi.
- **Khi thất bại**: giữ phần đã tạo, cho tạo tiếp; hỏi trước khi ghi đè.

### 【7. Bố cục】
Điều hướng (trái theo nhóm / thanh trên / thanh dưới trên điện thoại) · vùng chính theo thứ tự ưu tiên
(chỉ số → thành phần trung tâm → danh sách) · chi tiết mở bằng ngăn kéo hay trang riêng · điện thoại ưu tiên gì.

### 【8. Phong cách giao diện】
Preset (`06-ui-design-system.md`) hoặc mô tả: nền, màu nhấn, thẻ, viền, mật độ, màu trạng thái (một màu một nghĩa),
sáng/tối. **Luôn ghi ngôn ngữ và định dạng**: "Giao diện tiếng Việt; ngày dd/mm/yyyy; giờ 24h; tiền VND" — viết prompt
bằng tiếng Việt chưa chắc agent làm giao diện tiếng Việt.

### 【9. Yêu cầu chất lượng】
Khối dùng chung cho mọi app (sửa khi cần):
- Có trạng thái đang tải (khung xương), trống (kèm gợi ý hành động), lỗi (kèm thử lại), phản hồi sau thao tác.
- Mọi thao tác ghi thật vào Lark Base qua Function; tải lại trang không mất dữ liệu đang làm.
- Trang liên kết qua lại (từ thông báo đến đúng bản ghi).
- Phân quyền kiểm tra ở máy chủ, không chỉ ẩn trên giao diện.
- Dùng được bằng bàn phím, độ tương phản đủ, không hiệu ứng nhấp nháy trang trí.

### 【10. Dữ liệu mẫu và nghiệm thu】
- **Dữ liệu hư cấu**: số lượng cụ thể theo bảng, phủ mọi trạng thái và vai trò, đi hết luồng chính. Không dùng nội dung
  có bản quyền, không dữ liệu thật của khách.
- **Tài khoản demo**: số người theo vai trò.
- **Kịch bản nghiệm thu** đánh số ①②③…: luồng chính · trường hợp biên · **cô lập quyền** · tải lại trang · (AI) câu hỏi
  ngoài phạm vi. Kết thúc bằng: "Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản và báo cáo kết quả."

### Giá trị cần xác nhận
Liệt kê mọi `{giá trị}` đã dùng, mỗi dòng: giá trị, ý nghĩa, vì sao chọn.

<a id="bat-buoc"></a>
## Khối bắt buộc theo nhóm app

| Nhóm | Trọng tâm bắt buộc |
|---|---|
| Cá nhân | Khối 2 rút gọn ("chỉ bản thân"); khối 5 tập trung giữ trạng thái khi tải lại, thống kê, sửa bản ghi |
| Quy trình nhóm | Khối 2 và 5 là cốt lõi: vai trò, trạng thái, nhật ký thao tác, thông báo |
| Giao dịch / tài chính | Snapshot giá, chống trùng (idempotency), công thức tiền, phê duyệt theo ngưỡng |
| Có AI | Khối 6 đủ 5 ý; kịch bản nghiệm thu có câu hỏi ngoài phạm vi và trường hợp thiếu thông tin |

<a id="mo-ho"></a>
## Cụm từ mơ hồ cần thay

| Đừng viết | Viết thay |
|---|---|
| "lưu thật", "đồng bộ" | "Mọi thao tác ghi vào Lark Base qua Function; tải lại trang không mất bản nháp/tiến độ" |
| "có tài khoản" | "Đăng nhập bằng tài khoản Lark; vai trò lấy từ bảng Người dùng/Thành viên" |
| "dữ liệu giả" | "Dữ liệu hư cấu: {8} khách hàng, {14} cơ hội đủ mọi giai đoạn…" |
| "phân quyền chặt" | Liệt kê ai xem/làm gì và trường nhạy cảm |
| "AI hỗ trợ" | 5 ý của khối 6 |
| "đẹp, hiện đại" | Preset + màu nhấn + mật độ + màu trạng thái |
| "thống kê" | Công thức + phạm vi + xử lý thiếu dữ liệu |

<a id="checklist"></a>
## Checklist trước khi phát hành spec

`node <skill>/scripts/lint_spec.mjs app-spec.md` kiểm tự động phần lớn mục dưới; phần còn lại tự rà:

- [ ] Khối 0 ở đầu, có hai lệnh cài.
- [ ] Luồng chính 3–4 bước ở khối 1.
- [ ] Có vai trò (hoặc ghi rõ app cá nhân) và trường nhạy cảm.
- [ ] Có danh sách bảng và quan hệ; snapshot/nhật ký nếu nhóm app cần.
- [ ] Có ít nhất 3 quy tắc chống lỗi; chỉ số có công thức.
- [ ] AI (nếu có) đủ 5 ý.
- [ ] Ngôn ngữ, định dạng ngày/giờ/tiền, sáng/tối.
- [ ] Loading/trống/lỗi/phản hồi.
- [ ] Dữ liệu mẫu có số lượng; ≥ 3 kịch bản nghiệm thu, có kịch bản cô lập quyền.
- [ ] Không còn ô chữ chưa điền; mọi `{giá trị}` đã liệt kê để xác nhận.

<a id="sang-ky-thuat"></a>
## Từ spec sang thiết kế kỹ thuật (chế độ A)

| Khối spec | Thành phần kỹ thuật |
|---|---|
| 2 Vai trò | Bảng Thành viên/Người dùng + Database Function `whoami` + kiểm tra trong FaaS; `agent-tools.json` |
| 3 Bảng | `base-schema.json` (init) hoặc bảng có sẵn (`--base-token --table-ids`), trường công thức cho số dẫn xuất |
| 4 Trang | Route trong `page/src`, mỗi trang map tới các Database Function đọc |
| 5 Quy tắc | FaaS (kiểm tra trạng thái, chống trùng, snapshot, nhật ký), workflow Base cho việc theo lịch/tin nhắn |
| 6 AI | `ai/<functionKey>/meta.json` + giao diện xác nhận bản nháp + FaaS ghi sau xác nhận |
| 7–8 | Preset token CSS, khung điều hướng, ngăn kéo |
| 9 | Thành phần trạng thái dùng chung, lớp gọi API có thử lại và "kết quả chưa rõ" |
| 10 | Script seed (ghi thật, chống chạy lại), `tools/acceptance.mjs`, df-smoke |

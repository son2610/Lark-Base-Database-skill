# 03 — Danh mục tính năng nền tảng

Một mục cho mỗi năng lực của Lark Base Database (và Base gốc dùng kèm). Dùng để: (1) biết có làm được không,
(2) biết cần hỏi người dùng gì, (3) biết đặt vào khối spec nào, (4) biết cách làm và bẫy đã gặp.

**Đây là điểm cập nhật chính khi Lark ra bản mới** — thêm/sửa mục theo [mẫu ở cuối file](#mau-moi) và ghi
"Từ phiên bản". Giao thức chi tiết luôn theo skill chính thức đúng phiên bản đang cài; mục ở đây chỉ trỏ tới.

Trạng thái: ✅ dùng được · ⚠️ dùng được nhưng có giới hạn quan trọng · ⛔ chưa hỗ trợ (đưa phương án thay thế).
Mốc kiểm chứng: `platform-baseline.json` (CLI 1.7.0, SDK 0.4.2, 2026-10-27).

## Mục lục
- [Khởi tạo và dữ liệu](#khoi-tao): F01–F05
- [Đọc và ghi](#doc-ghi): F06–F12
- [AI](#ai): F13
- [Giao diện và runtime](#giao-dien): F14–F19
- [Phát hành, chia sẻ, cộng tác](#phat-hanh): F20–F24
- [Base gốc dùng kèm](#base-goc): F25–F27
- [Agent ngoài](#agent): F28
- [Công cụ phát triển và chẩn đoán](#cong-cu): F29–F31
- [Chưa hỗ trợ / ngoài phạm vi](#chua-ho-tro)
- [Mẫu thêm tính năng mới](#mau-moi)

---

<a id="khoi-tao"></a>
## Khởi tạo và dữ liệu

### F01 · Tạo Base mới từ schema ✅
- **Dùng khi**: chưa có Base, hoặc muốn Base sạch cho app.
- **Hỏi**: tên app, mô tả một câu, múi giờ (VN → `Asia/Bangkok`).
- **Spec**: khối 3.
- **Cách làm**: viết `base-schema.json` (định nghĩa trường theo `lark-base` field JSON — đọc bằng
  `lark-cli skills list lark-base/references` rồi `skills read <path>`; không đoán thuộc tính), rồi
  `base-database-cli init <dir> --schema base-schema.json --name '…' --description '…' --time-zone Asia/Bangkok --env online`.
  Tùy chọn select có thể gán màu `hue` (Gray/Blue/Green/…) theo nghĩa. Có trường công thức/lookup thì đọc hướng dẫn
  lark-base tương ứng trước. Init lỗi giữa chừng → `--resume` với đúng tham số cũ, không init lại.
- **Bẫy**: datetime format chỉ cho kiểu `yyyy-MM-dd HH:mm`/`yyyy/MM/dd HH:mm`; đặt tên trường liên kết khác tên bảng
  (công thức `[X]` ưu tiên hiểu là bảng X); tên trường chứa `/` làm hỏng lệnh theo tên → dùng ID.
- **Tham chiếu**: skill chính thức `workspace.md#初始化`, `base-table-design.md`.

### F02 · Dùng Base có sẵn ✅
- **Dùng khi**: dữ liệu đã nằm trong Base đang dùng.
- **Hỏi**: link Base; chỉ gắn bảng nào (`--table-ids`); có được thêm trường không.
- **Spec**: khối 0/3 ("dùng Base có sẵn …, chỉ gắn bảng …").
- **Cách làm**: `init --base-token <bas…> --table-ids tblA,tblB …`. Không tự thêm dữ liệu mẫu vào Base có sẵn.
  Gắn thêm bảng sau: `base-database-cli tables add <tblId>` rồi deploy (từ 1.6.0).
- **Bẫy**: gỡ bảng ở máy **không** gỡ trên máy chủ; `bind_base` chỉ thêm. Base phải là FxDB 6.0 (lỗi `800004319`
  nghĩa là tenant/Base chưa hỗ trợ — Base do `init --schema` tạo từ 2026-10-22 đều đạt).
- **Từ phiên bản**: `--table-ids` 1.5.0, `tables add` 1.6.0.

### F03 · Dựng bằng bot và trao quyền quản trị ⚠️
- **Dùng khi**: agent dùng chung trong nhóm, hoặc không muốn tài nguyên thuộc tài khoản cá nhân.
- **Hỏi**: ai nhận quyền quản trị (open_id từ nguồn tin cậy, không đoán).
- **Cách làm**: `--as bot`, `init … --grant-admin <ou_…>`; báo kết quả `handoff` cho người dùng.
  Bot cần scope `base:app:create`, `base:appmode:*`, `base:table/field/record:*`, `base:site:create`, `bitable:app`
  (+ `docs:permission.member:create` để giao quyền Base).
- **Từ phiên bản**: 1.7.0. **Tham chiếu**: `collaborator-handoff.md`.

### F04 · Thiết kế bảng hai lớp ✅
- **Dùng khi**: luôn, nhất là khi người dùng còn mở Base trực tiếp.
- **Cách làm**: lớp lưu trữ đúng kiểu (số, ngày, người, liên kết, chọn); lớp trình bày (trường chính dễ nhận, thứ tự
  trường, màu tùy chọn theo nghĩa, view, công thức tổng hợp). Dữ liệu kỹ thuật (hàng đợi, cấu hình) để bảng riêng.
- **Từ phiên bản**: 1.7.0 (`base-table-design.md`). Chi tiết: `04-architecture-patterns.md#bang`.

### F05 · Dữ liệu mẫu thật ✅
- **Dùng khi**: tạo Base mới. Không dùng cho Base có sẵn trừ khi người dùng yêu cầu.
- **Cách làm**: script seed ghi qua `lark-cli base +record-batch-create` (≤ 200/lô, theo thứ tự quan hệ), đánh dấu
  "(Demo)"/"Mẫu", lưu ID vào `.base-database-cli/state/seed.json` để không chạy lại; đọc lại bằng Function của trang.
- **Bẫy**: định dạng giá trị của lark-cli khác FaaS (người dùng: lark-cli dùng `open_id`, FaaS/app dùng `user_id`);
  không ghi được `created_at` hệ thống → thêm trường ngày ghi được (mặc định `record_created_time`) nếu cần lịch sử.

---

<a id="doc-ghi"></a>
## Đọc và ghi

### F06 · Database Function (đọc bằng SQL) ⚠️
- **Dùng khi**: mọi lần đọc dữ liệu cho trang, cho FaaS, cho agent ngoài.
- **Cách làm**: `database-functions/<id>/main.sql` (một SELECT cố định) + `meta.json` (name, description, params
  `TEXT/INT/DOUBLE/BOOL/TIMESTAMP/INTERVAL` và mảng 1 chiều, có `enum`). "Của tôi" luôn dùng `CURRENT_USER_ID()`.
- **Giới hạn quan trọng**: tập SQL hẹp (không phép toán trên cột, không `TO_CHAR`, `LOWER LIKE`…); có câu qua
  kiểm tra nhưng lỗi khi chạy (`800008904`). Viết theo `05-sql-field-guide.md`, chạy df-smoke sau mỗi thay đổi.
- **Tham chiếu**: `database-function.md`, `database-function-limitations.md`, `base-sql-errors.generated.md`.

### F07 · Mutation (ghi khai báo) ⚠️
- **Dùng khi**: thêm/sửa/xóa đơn giản một bảng, không cần kiểm tra vai trò/chủ sở hữu/trạng thái
  (app cá nhân, nhập liệu nội bộ tin cậy).
- **Cách làm**: `mutations/<id>/spec.json` (create/update/delete/append_attachments/remove_attachments), lô ≤ 200,
  nguồn giá trị `param/const/current_user/now/clear`. Kiểm `record_not_found`, `ignored_fields` sau khi gọi.
- **Giới hạn**: điều kiện chỉ `rec_id = tham số`; **không kiểm tra quyền** — ai mở app cũng gọi được với mọi ID.
- **Tham chiếu**: `mutations.md`.

### F08 · FaaS (logic phía máy chủ) ✅
- **Dùng khi**: ghi cần kiểm tra vai trò/chủ sở hữu/trạng thái, ghi nhiều bảng, snapshot, chống trùng, gọi API ngoài,
  tính toán SQL không làm được, đọc dữ liệu người xem không được thấy rồi chỉ trả kết quả cho phép.
- **Cách làm**: `server/functions/<id>/{index.ts, contract.ts, meta.json}` với `defineFunction` + zod; ghi bằng
  `ctx.records.create/update/delete/appendAttachments/removeAttachments` (hỗ trợ brand feishu và lark), đọc bằng
  `ctx.invokeFunction` gọi Database Function. Mỗi thư mục build độc lập → thư viện dùng chung phải chép vào từng hàm
  (`tools/sync-faas-lib.mjs`). Lỗi nghiệp vụ dùng `SDKError` với `wireCode` ổn định.
- **Bẫy**: zod `.regex()` từng làm contract thành runtime-only (sửa ở 1.7.0 — vẫn ưu tiên kiểm định dạng trong handler);
  kết quả ghi `unknown` thì không tự thử lại.
- **Tham chiếu**: `faas.md`, SDK `docs/server.md`.

### F09 · Biến môi trường (config / secret) ✅
- **Dùng khi**: khóa API dịch vụ ngoài, khóa nội bộ cho Function chỉ FaaS gọi, cấu hình khác nhau Preview/Prod.
- **Hỏi**: giá trị thật (chỉ người dùng cung cấp; không tự bịa).
- **Cách làm**: `environment-variables declare NAME --target preview --type secret --description '…' --required`,
  `set NAME --target preview --value-stdin`; đọc `process.env.NAME` tĩnh trong FaaS; lưu xong phải deploy lại.
- **Tham chiếu**: `environment-variables.md`.

### F10 · Tệp đính kèm ✅
- **Dùng khi**: ảnh bìa, tài liệu, bài nộp, hóa đơn.
- **Cách làm**: tải lên bằng `siteRuntime.uploadAttachment` (≤ 2 GB/tệp, 100 tệp/ô), gắn vào ô bằng Mutation
  `append_attachments` hoặc FaaS `ctx.records.appendAttachments` (≤ 50 token/lần); hiển thị bằng `AttachmentImage`
  / `fetchAttachmentCover`; tải về bằng `openAttachmentDownload`. Ảnh cần đọc kích thước từ tệp gốc trước khi gắn.
- **Giới hạn**: chỉ kiểm được trong Lark (harness cục bộ không tải lên được). Video lớn nên dùng link nhúng.
- **Tham chiếu**: `file-transfer.md`.

### F11 · Ghi xong đọc thấy ngay ✅
- **Cách làm**: SDK ≥ 0.4.0 bật mặc định; khi dữ liệu chưa kịp đồng bộ sẽ ném `DataNotReadyError` → hiện
  "Đang đồng bộ" + nút tải lại. Đọc tần suất cao chấp nhận cũ dùng `{ readYourWrites: false }`.
  Trong FaaS (đọc sau ghi) vẫn cần thử lại có giới hạn (`readUntil`).
- **Từ phiên bản**: SDK 0.4.0 (dự án tạo trước đó giữ SDK cũ cho tới khi nâng cấp có đồng ý).

### F12 · Danh tính người xem ✅
- **Cách làm**: SQL `CURRENT_USER_ID()`; Mutation `current_user`; FaaS gọi Database Function `whoami`; trang lấy
  tên/ảnh bằng `siteRuntime.getCurrentUser()`; quyền sửa app dùng tín hiệu `allowEdit`/`isOwner` từ nền tảng.
  Không bao giờ nhận user id từ tham số làm bằng chứng danh tính.
- **Chi tiết**: `04-architecture-patterns.md#danh-tinh`.

---

<a id="ai"></a>
## AI

### F13 · AI Function ⚠️
- **Năng lực**: text/vision (stream hoặc gom), tạo ảnh, tạo video (theo task, cần polling có giới hạn thời gian).
- **Hỏi**: tác vụ AI nào; AI được ghi gì (mặc định: chỉ bản nháp, người xác nhận); dữ liệu nào đưa cho AI.
- **Spec**: khối 6 (đủ 5 ý: đầu vào, phân tích, đầu ra nháp, giới hạn, khi thất bại).
- **Cách làm**: `base-database-cli ai-functions models` để lấy `profile_id` thật; `ai/<key>/meta.json`
  (`capability_type`, `model_profile_id`, `system_prompt`, `input_schema`); trang gọi `invokeSiteAIFunctionStream`,
  `callSiteAIFunction`, `createSiteAIFunctionTask`. Đọc dữ liệu bằng Database Function, cắt gọn rồi mới đưa cho AI.
  Đề xuất hành động của AI phải được người dùng bấm xác nhận rồi mới gọi FaaS ghi.
- **Giới hạn**: chi phí tính cho chủ app; System Prompt không được bảo mật (không để bí mật trong đó); tenant có thể
  chưa bật (`800004011` + "ai function feature is not enabled"); không tạo FaaS làm proxy gọi mô hình.
- **Tham chiếu**: `ai-function.md`.

---

<a id="giao-dien"></a>
## Giao diện và runtime

### F14 · Trang React + SDK ✅
- **Cách làm**: workspace `page/` (React 19, Vite, TanStack Query), khởi động qua `startBaseApp`, gọi Function bằng
  `invokeDatabaseFunction` / `invokeDatabaseMutationBatch` với kiểu sinh từ `contracts generate`.
  Thiết kế: `06-ui-design-system.md`.

### F15 · Thành phần có sẵn của SDK ✅
`DatabaseUserMenu` (menu tài khoản), `UserSelectorEditor` / `UserSelectorPanel` (chọn người trong tổ chức),
`AttachmentImage` (ảnh đính kèm có lazy load), `FloatingButton` (nút "chỉnh sửa app" cho người có quyền, chỉ Prod).
Dùng thay vì tự làm: chúng xử lý quyền, ngôn ngữ, cache theo người dùng. CSS chỉnh qua biến `--base-app-*`.

### F16 · Chủ đề và ngôn ngữ từ Lark ✅
`siteRuntime.getRuntimeContext()` trả `colorScheme` (light/dark) và `locale`. Mặc định: theo Lark, cho người dùng chọn
lại, lưu lựa chọn trong `localStorage` (có try/catch).

### F17 · Mở link ngoài, proxy HTTP ⚠️
- Link ngoài: dùng `openLink` / `installLinkGuard()` của SDK; `window.open`/`target=_blank` thô bị chặn trong iframe.
- HTTP từ trang chỉ qua proxy của Lark tới tuyến được phép; gọi API bên thứ ba → đặt trong FaaS.

### F18 · Phát triển cục bộ (`dev`) ⚠️
`base-database-cli dev` chạy Vite trên máy và ghép với trang Lark (cổng 43100–43109, cần cho phép "truy cập mạng
cục bộ" trong trình duyệt). Hợp khi sửa giao diện nhiều; FaaS mặc định chỉ build cục bộ. Không thay được kiểm thử
Preview. Phương án không cần đăng nhập trình duyệt: harness cục bộ (`08-verify-deliver.md#harness`).

### F19 · Điện thoại ✅
App mở được trên Lark di động; giao diện tự đáp ứng (container query, điều hướng dưới đáy). Kiểm ở 390 px.

---

<a id="phat-hanh"></a>
## Phát hành, chia sẻ, cộng tác

### F20 · Preview và Prod ✅
`deploy` tạo Preview (chỉ chủ app và quản trị viên app mở được). Prod: người dùng thử Preview rồi đồng ý →
`deploy --production --yes` **hoặc** nút **Publish** góc trên phải trang Preview. Prod dùng đúng gói đã thử; sửa bất
cứ gì (code, README, cấu hình) phải deploy Preview mới.

### F21 · Phạm vi phát hành ⚠️
Khi Publish chọn: chỉ mình tôi / cả tổ chức / người cụ thể. **Người ngoài tổ chức chưa truy cập được.**
Code app không mở rộng hay thu hẹp phạm vi này.

### F22 · Nhà phát triển cùng làm ✅
Phát hành bản chính thức → thêm đồng nghiệp ở thanh điều hướng trên → họ cài Skill, đưa link app cho AI của họ
(`pull`). Mỗi lần cập nhật xong phát hành để người sau lấy bản mới; không nhiều người sửa cùng lúc (CLI dừng khi
phát hiện mã trên máy chủ đã đổi — `REMOTE_SOURCE_CHANGED` → pull vào thư mục tạm, gộp, `deploy --baseline-from`).

### F23 · Khôi phục dự án (`pull`) ✅
`base-database-cli pull <thư mục trống> --app-token <Prj…|token> --env online` lấy lại toàn bộ mã nguồn, Function,
AI, cấu hình. Sửa app cũ luôn bắt đầu bằng pull, không init lại.

### F24 · README trong gói mã nguồn ✅
Bắt buộc 4 mục (English/中文/日本語; prompt tiếng Việt → **README tiếng Anh**): Background, Requested features,
Implemented capabilities, Status and limitations. `check` chặn nếu thiếu. Mẫu: `assets/readme-template.md`.

---

<a id="base-goc"></a>
## Base gốc dùng kèm

### F25 · Workflow (tự động hóa, thông báo, việc theo lịch) ✅
- **Dùng khi**: gửi tin nhắn Lark, nhắc hạn hằng ngày, chạy theo lịch, phản ứng khi bản ghi thay đổi.
- **Cách làm**: app ghi vào bảng Thông báo/Sự kiện; workflow của Base lắng nghe bảng đó và gửi tin nhắn với nút mở
  đúng trang app (`baseAppUrl` + tham số định vị). Tạo workflow **ở trạng thái tắt**, bật khi người dùng đồng ý.
  Lên Prod phải đổi link trong workflow sang link Prod (không tự cập nhật).
- **Tham chiếu**: `notifications.md`, `lark-base` (`+workflow-*`).

### F26 · Dashboard, form, view gốc ✅
Dashboard cho người xem Base trực tiếp; form công khai để thu dữ liệu; view cho người làm việc trên bảng.
App thì làm dashboard tương tác trong trang. Dùng `lark-cli base +dashboard-*`, `+form-*`, `+view-*`.

### F27 · Vai trò và phân quyền nâng cao của Base ⚠️
Chỉ áp dụng khi người dùng **mở Base trực tiếp**; không áp dụng cho người dùng app. Vẫn nên cấu hình nếu người
dùng có quyền vào Base (`+role-*`, `+advperm-*`). Tên trường chứa `/` gây lỗi khi thao tác theo tên.

---

<a id="agent"></a>
## Agent ngoài

### F28 · Trợ lý AI của thành viên gọi chức năng app ✅
- Mọi Function của bản chính thức mặc định mở cho agent ngoài (qua `lark-cli api …/functions`); thành viên cài
  Skill của site: `base-database-cli agent-tools skill install --site <link>`.
- `agent-tools.json` `{ "exclude": [...] }` ẩn Function nội bộ (kiểm tra phụ, `srv*`, chẩn đoán). **Exclude không
  phải phân quyền** — dữ liệu nhạy cảm vẫn phải chặn trong Function.
- `description` mọi Function viết rõ: dùng khi nào, khi nào không, thay bằng hàm nào; tham số có `description` và
  `enum` cho lựa chọn cố định. Tham chiếu: `agent-tool-design.md`, `agent-tools.md`.

---

<a id="cong-cu"></a>
## Công cụ phát triển và chẩn đoán

### F29 · `context`, `doctor`, `diagnostics`, `deployments status` ✅
Ảnh chụp dự án không cần mạng (`context . --summary --json`), kiểm đăng nhập/scope (`doctor`), tổng hợp log cục bộ
(`diagnostics`), theo dõi lần phát hành bị gián đoạn (`deployments status <publishId> --wait` — không deploy lại mù).

### F30 · Kiểu sinh tự động ✅
`contracts generate` sinh kiểu cho trang từ mọi Function (`page/src/generated/`); chạy lại khi đổi `meta.json`,
`contract.ts`, SQL tham số. Từ 1.7.0 có `--no-install`.

### F31 · Kiểm thử ✅
SDK có `createMockHost` + MSW cho unit test; bộ công cụ của skill (`assets/project-tools/`) có invoke, df-smoke,
harness giao diện dùng dữ liệu Preview thật, chụp màn hình nhiều kích thước.

---

<a id="chua-ho-tro"></a>
## Chưa hỗ trợ / ngoài phạm vi (nói rõ với người dùng, đưa phương án)

| Nhu cầu | Trạng thái | Phương án |
|---|---|---|
| Người ngoài tổ chức (khách hàng, đối tác) truy cập app | ⛔ | Form công khai của Base để thu dữ liệu; cổng thông tin riêng ngoài Lark |
| Tên miền riêng | ⛔ | Dùng link Lark |
| Giao dịch nguyên tử, khóa duy nhất, compare-and-set (tồn kho, đặt chỗ tranh chấp cao) | ⛔ | Chống trùng bằng khóa nghiệp vụ + kiểm tra trước khi ghi (chấp nhận rủi ro hiếm), hoặc hệ thống chuyên dụng |
| Nhiều Base trong một app | ⛔ | Gom bảng về một Base |
| Xem lịch sử phiên bản app / quay lại bản cũ từ giao diện | ⛔ | Git cho mã nguồn; Preview mới cho mỗi thay đổi |
| Vai trò tùy chỉnh / phân quyền dòng-cột thống nhất trong app | ⛔ (đang phát triển) | Bảng thành viên + lọc trong SQL + kiểm tra trong FaaS |
| App tự chạy theo lịch | ⛔ | Workflow của Base, hoặc nút "Quét" trong app |
| Thanh toán trực tuyến thật | ⛔ (không có sẵn) | Người dùng gửi yêu cầu, quản trị xác nhận; hoặc mã kích hoạt |
| Kết nối thiết bị IoT thời gian thực | ⛔ | Nhập/ghi thủ công, hiển thị "cập nhật lần cuối" |
| Trường vị trí (location) trong SQL | ⛔ | Đọc qua FaaS/Base API hoặc lưu lat/lng dạng số |
| Phép toán trên cột trong SQL | ⛔ (FxDB 6.0, 2026-10) | Trường công thức hoặc lưu giá trị từ FaaS |
| Môi trường thử nghiệm riêng ngoài `online` | ⛔ | App + Base riêng để thử |

<a id="mau-moi"></a>
## Mẫu thêm tính năng mới

```markdown
### F<số> · <Tên tính năng> <✅|⚠️|⛔>
- **Dùng khi**: …
- **Hỏi**: … (câu hỏi thêm vào 01-discovery.md vòng nào)
- **Spec**: khối …
- **Cách làm**: … (lệnh/API; trỏ tới reference chính thức thay vì chép giao thức)
- **Giới hạn/Bẫy**: …
- **Từ phiên bản**: CLI x.y.z / SDK a.b.c (ngày)
- **Tham chiếu**: <file reference của skill chính thức>
```
Sau khi thêm: cập nhật `01-discovery.md` (câu hỏi), `02-spec-template.md` (nếu đổi khối), `platform-baseline.json`,
`CHANGELOG.md` của skill.

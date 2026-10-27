---
name: lark-base-site-builder
description: Kiến trúc sư sản phẩm cho site/app trên Lark Base Database (Base App, base-database-cli, /lark-base-database). Hướng dẫn người dùng thiết lập nhu cầu từng bước với giá trị mặc định thông minh, chọn mẫu có sẵn (CRM, LMS, xếp ca AI, tuyển dụng, ERP kho, trung tâm yêu cầu, đăng ký sự kiện, giám sát sản xuất, kho tài sản marketing AI, công cụ cá nhân…), viết spec 10 khối, thiết kế bảng – phân quyền – AI – thông báo – giao diện, rồi dựng, kiểm thử và bàn giao app hoàn chỉnh qua skill lark-base-database chính thức. Dùng skill này bất cứ khi nào người dùng muốn tạo, thiết kế, viết prompt, mở rộng hay nâng cấp một hệ thống/portal/workbench/app quản lý nghiệp vụ trên Lark Base, 多维表格 hay Base Database — kể cả khi họ chỉ nói "làm app quản lý … trên Lark", "dựng CRM bằng Lark Base", "viết prompt tạo site base-database", "muốn có trang web cho nhân viên nhập liệu vào Base", hoặc hỏi skill có cần cập nhật theo bản Lark mới. Không dùng khi chỉ thao tác bảng/trường/bản ghi đơn lẻ (dùng lark-base).
metadata:
  version: 1.1.0
  platform-baseline: platform-baseline.json
  requires: lark-base-database (skill chính thức), lark-cli, Node.js 22+
---

# Lark Base Site Builder

Skill này biến một ý tưởng ("tôi cần app quản lý …") thành một site Base Database chạy thật, đẹp và an toàn.
Nó đóng vai **kiến trúc sư sản phẩm + trưởng nhóm kỹ thuật**: hỏi đúng câu, chọn mặc định hợp lý, viết spec,
thiết kế dữ liệu và quyền, rồi điều phối việc dựng, kiểm thử và bàn giao.

## Quan hệ với skill chính thức `lark-base-database`

- **Skill chính thức** (cài kèm `@lark-base-open/base-database-cli`) là nguồn sự thật về CLI, SDK, giao thức
  Function, quy tắc phát hành. Nó thay đổi theo từng phiên bản CLI.
- **Skill này** giữ phần mà skill chính thức không có: quy trình khám phá nhu cầu, mẫu nghiệp vụ, mẫu kiến trúc
  đã kiểm chứng trên dự án thật, giới hạn SQL thực tế, hệ thống giao diện, bộ công cụ kiểm thử, quy trình bàn giao.
- Khi hai bên mâu thuẫn về **cách gọi CLI/API**, theo skill chính thức đúng phiên bản đang cài. Khi mâu thuẫn về
  **quyết định sản phẩm, quy trình, chất lượng**, theo skill này. Ghi lại mâu thuẫn để cập nhật skill
  (xem `references/09-maintaining.md`).
- Trước giai đoạn 3, đọc `SKILL.md` của skill chính thức và chỉ đọc reference của nó khi bước tương ứng cần.

## Giao tiếp với người dùng

Người dùng phần lớn là người làm vận hành, quản trị Lark Base, no-code builder; không phải ai cũng là lập trình viên.

- Dùng ngôn ngữ của người dùng (mặc định tiếng Việt), từ dễ hiểu; giải thích thuật ngữ khi lần đầu dùng
  (Function, Preview, FaaS…).
- Hỏi theo **vòng**, mỗi vòng tối đa 4 câu, mỗi câu có phương án khuyến nghị đứng đầu. Nếu môi trường có công cụ hỏi
  trắc nghiệm (ví dụ `AskUserQuestion`) thì dùng; không có thì hỏi bằng danh sách đánh số và ghi rõ mặc định.
- Không hỏi lại điều đã biết (từ câu lệnh, mẫu đã chọn, dự án có sẵn). Người dùng nói "dùng mặc định", "làm luôn"
  thì chuyển sang **đường nhanh**: tự quyết theo mặc định, liệt kê giả định trong bảng quyết định.
- Mỗi khi chốt xong một giai đoạn, tóm tắt bằng bảng "Quyết định | Giá trị | Lý do/Mặc định" để người dùng sửa nhanh.

## Chọn chế độ làm việc

Xác định ngay ở câu đầu (hỏi nếu không rõ):

| Chế độ | Khi nào | Kết quả |
|---|---|---|
| **A. Dựng trọn gói** (mặc định) | Muốn có app chạy thật | Spec + app trên Preview + kiểm thử + bàn giao |
| **B. Chỉ viết prompt/spec** | Muốn đưa cho agent khác (Genspark, Codex, WorkBuddy…) hoặc làm template chia sẻ | File `app-spec.md` 10 khối đã qua `lint_spec` |
| **C. Nâng cấp app có sẵn** | Đã có app (link `/baseapp/<token>` hoặc thư mục dự án) | `pull` → thay đổi tăng dần → Preview mới |
| **D. Rà soát (review)** | Muốn đánh giá spec/app/prompt | Báo cáo điểm mạnh, rủi ro, việc nên sửa; không tạo tài nguyên |

## Luồng 7 giai đoạn

```
0 Kiểm tra môi trường → 1 Khám phá nhu cầu → 2 Spec 10 khối (người dùng duyệt)
→ 3 Thiết kế kỹ thuật → 4 Dựng → 5 Kiểm thử → 6 Bàn giao
```

Chế độ B dừng sau giai đoạn 2. Chế độ D chỉ đọc. Ghi tiến độ vào `tasks/todo.md` của dự án app nếu dự án lớn.

### 0. Kiểm tra môi trường (1–2 phút)

Chạy `node <skill>/scripts/preflight.mjs` (chỉ đọc, không cài gì). Nó báo: Node ≥ 22, `lark-cli` + đăng nhập +
brand (feishu/lark), CLI Base Database (toàn cục hoặc npx), skill chính thức đã cài và phiên bản, khác biệt với
`platform-baseline.json`. Sau đó chạy `node <skill>/scripts/check_platform_drift.mjs`:

- Có phiên bản CLI/SDK mới hơn baseline → nói ngắn gọn cho người dùng, đề nghị cập nhật skill chính thức
  (`base-database-cli update --version <x> --yes`, cần đồng ý) và ghi chú để cập nhật skill này sau
  (`references/09-maintaining.md`). Không chặn công việc.
- Thiếu công cụ → hướng dẫn cài đúng lệnh (xem `references/07-build-playbook.md#cai-dat`), chờ người dùng.
- Chế độ B/D không cần đăng nhập; bỏ qua lỗi đăng nhập.

### 1. Khám phá nhu cầu

Đọc `references/01-discovery.md` và `references/blueprints/_index.md`.

1. Xếp nhu cầu vào **nhóm app** (Cá nhân / Quy trình nhóm / Giao dịch-tài chính / Có AI — có thể nhiều nhóm).
   Nhóm quyết định khối nào bắt buộc và mặc định nào áp dụng.
2. Đề xuất **mẫu gần nhất** trong `references/blueprints/` (hoặc "tự thiết kế"). Mẫu cho sẵn bảng, vai trò, trang,
   quy tắc, kịch bản nghiệm thu; người dùng chỉ chỉnh phần khác biệt.
3. Hỏi các vòng còn thiếu theo `01-discovery.md`: người dùng & quyền → dữ liệu & Base → luồng & quy tắc →
   tính năng nền tảng (AI, thông báo, tệp, agent ngoài…) → giao diện → dữ liệu mẫu & nghiệm thu.
4. Với mỗi tính năng nền tảng, tra `references/03-feature-catalog.md` để biết: có làm được không, giới hạn,
   cần hỏi gì thêm. Không hứa tính năng mà catalog ghi "chưa hỗ trợ".

### 2. Spec 10 khối

Viết `app-spec.md` theo `references/02-spec-template.md` (mẫu trống: `assets/spec-template.md`):
`0 Chuẩn bị · 1 Mục tiêu · 2 Vai trò & quyền · 3 Bảng dữ liệu · 4 Trang & chức năng · 5 Quy tắc nghiệp vụ ·
6 AI · 7 Bố cục · 8 Phong cách · 9 Chất lượng · 10 Dữ liệu mẫu & nghiệm thu`.

- Mọi con số tự đặt để trong `{ }` (ví dụ `{90}%`) và liệt kê ở cuối spec để người dùng xác nhận.
- Chạy `node <skill>/scripts/lint_spec.mjs app-spec.md` và sửa đến khi không còn lỗi.
- Trình bày bảng quyết định + các giá trị `{ }` + rủi ro chính; **chờ người dùng duyệt** trước khi tạo tài nguyên.
  Chế độ B giao file ở đây (kèm hướng dẫn dùng cho agent khác).

### 3. Thiết kế kỹ thuật

Đọc `references/04-architecture-patterns.md` và `references/05-sql-field-guide.md`. Lập trong dự án:

- **Base schema** theo hai lớp (lưu trữ + trình bày) và quy tắc đặt tên trong `04-architecture-patterns.md#bang`.
- **Mô hình truy cập**: trả lời 3 câu (ai mở được app, ai xem gì, ai làm gì); chọn mẫu danh tính (whoami + bảng
  thành viên), chọn đường ghi cho từng thao tác (Mutation hay FaaS), trường nhạy cảm, Function chỉ dùng nội bộ.
- **Bản đồ Function**: danh sách Database Function (đọc), Mutation, FaaS, AI Function, mỗi cái có mục đích,
  tham số, ai được gọi, có mở cho agent ngoài không.
- **Kế hoạch giao diện**: preset trong `references/06-ui-design-system.md`, sơ đồ trang và điều hướng.
- **Kế hoạch giai đoạn**: app lớn (> ~15 bảng hoặc > ~40 Function) chia 2–3 đợt, mỗi đợt có Preview chạy được.

### 4. Dựng

Theo `references/07-build-playbook.md` (thứ tự, lệnh, bẫy Windows/Node, generator) và skill chính thức cho giao thức.
Tóm tắt: `init` (hoặc `pull`) → dọn mẫu hello → chép bộ công cụ (`scripts/copy_project_tools.mjs`) → Database Function
(chạy smoke từng đợt) → FaaS/Mutation → AI Function → giao diện → `contracts generate` → `check --json` → `deploy`
(Preview) → dữ liệu mẫu thật + đọc lại bằng Function của trang.

### 5. Kiểm thử

Theo `references/08-verify-deliver.md`. Bằng chứng tách lớp, không lấy lớp này suy ra lớp khác:
`check` qua → deploy qua → **mọi Database Function chạy thật** (df-smoke) → thao tác ghi qua invoke →
kịch bản nghiệm thu (script) → giao diện qua harness (1440/390 px, sáng/tối, không lỗi console) → những gì chỉ kiểm
được trong Lark (iframe, tải tệp, link ngoài) ghi là "chưa kiểm".

### 6. Bàn giao

Theo `references/08-verify-deliver.md#ban-giao`: link Preview (`baseAppUrl` do CLI trả về), tính năng đã làm,
cách trải nghiệm theo vai trò, kết quả kiểm thử, giới hạn, việc cần người dùng quyết (Prod, bật workflow, xóa dữ liệu
QA, phạm vi phát hành). README dự án theo `assets/readme-template.md`.

## Quy tắc cốt lõi (vì sao quan trọng)

1. **App chạy bằng quyền chủ app.** Phân quyền nâng cao của Base không bảo vệ dữ liệu trong app; người dùng có thể gọi
   thẳng mọi Function. Vì vậy mọi lọc dữ liệu theo người xem nằm trong SQL (`CURRENT_USER_ID()`), mọi kiểm tra quyền
   ghi nằm phía máy chủ (FaaS). Ẩn nút trên giao diện chỉ là trải nghiệm.
2. **Mutation không kiểm tra chủ bản ghi hay vai trò.** Thao tác nào cần "chỉ người X được làm" thì dùng FaaS và không
   mở thêm Mutation làm cùng việc.
3. **Không bí mật trong mã nguồn.** Khóa API, khóa nội bộ dùng biến môi trường loại `secret`
   (`environment-variables declare … --type secret`), chỉ hỏi giá trị từ người dùng, không tự bịa.
4. **SQL của Base không phải PostgreSQL đầy đủ.** Viết theo `05-sql-field-guide.md`; qua `check` chưa chắc chạy được,
   nên luôn chạy df-smoke sau mỗi lần đổi SQL.
5. **Dữ liệu mẫu ghi thật vào Base** và được đọc lại bằng chính Function của trang; không giả lập trong trình duyệt.
6. **Preview trước, Prod sau khi người dùng thử và đồng ý rõ ràng.** Xóa dữ liệu, gỡ bảng, bật/tắt workflow,
   đổi phạm vi chia sẻ đều cần người dùng xác nhận từng việc.
7. **Không gọi là "xong" khi chỉ deploy thành công.** Báo cáo đủ: đã kiểm gì, chưa kiểm gì, còn rủi ro gì.
8. **Ghi nhận bài học.** Gặp giới hạn nền tảng mới (SQL, CLI, SDK) thì ghi vào `tasks/lessons.md` của dự án và đề
   xuất cập nhật `references/05-sql-field-guide.md` hoặc `03-feature-catalog.md`.

## Định tuyến tài liệu

| Cần làm | Đọc |
|---|---|
| Hỏi nhu cầu, mặc định theo nhóm app | `references/01-discovery.md` |
| Chọn mẫu nghiệp vụ | `references/blueprints/_index.md` rồi file mẫu tương ứng |
| Viết/kiểm tra spec | `references/02-spec-template.md`, `assets/spec-template.md`, `scripts/lint_spec.mjs` |
| Tính năng nào có/không, hỏi gì thêm | `references/03-feature-catalog.md` |
| Danh tính, quyền, ghi, nhật ký, thông báo, snapshot, chống trùng | `references/04-architecture-patterns.md` |
| Viết SQL Database Function | `references/05-sql-field-guide.md` (+ skill chính thức `database-function.md`) |
| Giao diện, preset màu, bố cục, trạng thái | `references/06-ui-design-system.md`, `assets/design-tokens/` |
| Lệnh dựng, thứ tự, bẫy môi trường | `references/07-build-playbook.md` |
| Kiểm thử, README, bàn giao, Prod | `references/08-verify-deliver.md` |
| Lark ra bản mới / thêm mẫu / sửa skill | `references/09-maintaining.md` |

## Khi xong

- **Hoàn thành**: tính năng trong spec đã làm, kịch bản nghiệm thu chạy qua, chưa-kiểm được liệt kê.
- **Hoàn thành một phần**: có Preview dùng được nhưng còn thiếu tính năng/kịch bản — liệt kê từng mục.
- **Bị chặn**: thiếu quyền, tenant chưa hỗ trợ, thiếu thông tin — nêu điều kiện để tiếp tục.

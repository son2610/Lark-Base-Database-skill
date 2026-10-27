# 09 — Bảo trì và mở rộng skill

Skill được tách để mỗi loại thay đổi chỉ chạm ít file. Khi người dùng nói "Lark vừa cập nhật, cập nhật lại skill",
"thêm mẫu app …", "thêm preset màu thương hiệu …", làm theo đúng quy trình tương ứng dưới đây.

## Mục lục
- [Bản đồ file](#ban-do)
- [Quy trình A — Lark phát hành bản mới](#a)
- [Quy trình B — Thêm mẫu nghiệp vụ](#b)
- [Quy trình C — Thêm preset giao diện](#c)
- [Quy trình D — Ghi bài học từ dự án thật](#d)
- [Quy trình E — Phát hành phiên bản skill](#e)

<a id="ban-do"></a>
## Bản đồ file — thay đổi gì sửa ở đâu

| Thay đổi | File |
|---|---|
| Phiên bản CLI/SDK đã đối chiếu | `platform-baseline.json` |
| Tính năng mới / giới hạn được gỡ / giới hạn mới | `references/03-feature-catalog.md` (+ câu hỏi ở `01-discovery.md`) |
| SQL chạy được / bị từ chối / lỗi runtime | `references/05-sql-field-guide.md` |
| Mẫu kiến trúc mới | `references/04-architecture-patterns.md` |
| Lệnh dựng, bẫy môi trường | `references/07-build-playbook.md` |
| Cách kiểm thử, bàn giao | `references/08-verify-deliver.md`, `assets/project-tools/` |
| Khung spec | `references/02-spec-template.md`, `assets/spec-template.md`, `scripts/lint_spec.mjs` |
| Mẫu nghiệp vụ | `references/blueprints/` (+ `_index.md`) |
| Giao diện | `references/06-ui-design-system.md`, `assets/design-tokens/`, `scripts/gen_presets.cjs` |
| Luồng chính, quy tắc cốt lõi | `SKILL.md` (giữ < 500 dòng) |
| Lịch sử | `CHANGELOG.md`, `metadata.version` trong `SKILL.md` |

Nguyên tắc: **không chép giao thức chính thức** (tham số API, cấu trúc JSON chi tiết) vào skill này — chỉ trỏ tới
reference của skill chính thức. Như vậy nâng CLI không làm skill này sai.

<a id="a"></a>
## Quy trình A — Lark phát hành bản mới

1. **Phát hiện**: `node scripts/check_platform_drift.mjs --fetch` — so phiên bản npm mới nhất với baseline; với
   `--fetch` tải CHANGELOG của gói mới vào thư mục tạm và in các mục từ baseline tới bản mới.
2. **Đọc thay đổi**:
   - CHANGELOG của CLI và SDK (mục Added/Changed/Fixed/Migration).
   - So sánh skill chính thức cũ/mới: `npm pack @lark-base-open/base-database-cli@<mới>` vào thư mục tạm, giải nén,
     `diff -r` thư mục `skills/lark-base-database` với bản đang cài (`~/.claude/skills/lark-base-database`). Chú ý
     reference mới (ví dụ 1.7.0 thêm `base-table-design.md`, `collaborator-handoff.md`).
   - SDK: `docs/` của gói SDK mới (component, API mới, `capabilities.json`).
3. **Phân loại mỗi thay đổi** → sửa file theo [bản đồ](#ban-do):
   - Tính năng mới → thêm mục `F<số>` vào catalog theo mẫu cuối file, ghi "Từ phiên bản"; nếu cần hỏi người dùng
     thì thêm câu vào vòng phù hợp của `01-discovery.md`; nếu ảnh hưởng spec thì sửa `02-spec-template.md`.
   - Giới hạn được gỡ (ví dụ SQL cho phép phép toán cột) → đổi ⛔/⚠️ thành ✅, chuyển dòng trong
     `05-sql-field-guide.md` sang "Chạy được" **chỉ sau khi đã thử thật** trên một app thử.
   - Thay đổi lệnh/cờ → `07-build-playbook.md`; bẫy đã được sửa → ghi "đã sửa ở x.y.z" thay vì xóa ngay (dự án cũ
     vẫn có thể dùng bản cũ).
4. **Kiểm thử lại**: `node scripts/preflight.mjs`, `node scripts/lint_spec.mjs evals/files/sample-spec.md`
   (nếu có), chạy các eval trong `evals/` khi thay đổi lớn.
5. **Cập nhật** `platform-baseline.json` (phiên bản, ngày, ghi chú), `CHANGELOG.md` của skill, tăng
   `metadata.version`, cài lại (`node scripts/install.mjs --force`).

<a id="b"></a>
## Quy trình B — Thêm mẫu nghiệp vụ

1. Chép cấu trúc của một mẫu gần nhất trong `references/blueprints/` (các mục: nhóm app, luồng, vai trò, bảng,
   trang, quy tắc, AI, giao diện, dữ liệu mẫu, kịch bản nghiệm thu, giá trị tùy chỉnh).
2. Nếu có prompt/spec thật đã dựng thành công (prompt đã dùng cho một app chạy thật), dùng nó làm khung — mẫu từ dự án thật
   tốt hơn mẫu nghĩ ra.
3. Chạy `node scripts/lint_spec.mjs --blueprint references/blueprints/<file>.md`.
4. Thêm dòng vào `references/blueprints/_index.md` (tên, nhóm, mô tả, từ khóa nhận diện).

<a id="c"></a>
## Quy trình C — Thêm preset giao diện (ví dụ màu thương hiệu)

1. Thêm mục vào `scripts/gen_presets.cjs` (đủ 29 biến sáng + 29 tối, bóng đổ, phần `extra` nếu cần font riêng).
2. `node scripts/gen_presets.cjs assets/design-tokens` → `node scripts/check_contrast.mjs assets/design-tokens`
   (phải "pass").
3. Thêm dòng vào bảng preset của `06-ui-design-system.md` và câu hỏi vòng 5 của `01-discovery.md`.

<a id="d"></a>
## Quy trình D — Ghi bài học từ dự án thật

Sau mỗi app dựng bằng skill, đọc `tasks/lessons.md` của dự án và đưa vào skill những gì **dùng lại được cho app khác**:
giới hạn SQL mới, bẫy CLI/Windows, mẫu kiến trúc, câu hỏi khám phá còn thiếu, kịch bản nghiệm thu hay. Ghi kèm
phiên bản CLI/SDK và ngày kiểm chứng. Không đưa token, ID tài nguyên hay dữ liệu khách vào skill.

<a id="e"></a>
## Quy trình E — Phát hành phiên bản skill

- Tăng `metadata.version` trong `SKILL.md` (semver: sửa nội dung = patch, thêm mẫu/tính năng = minor, đổi luồng = major).
- Ghi `CHANGELOG.md`.
- Commit git trong thư mục skill.
- Cài lại cho người dùng: `node scripts/install.mjs --force` (tự phát hiện agent) hoặc
  `--target <claude,codex,antigravity,…|all>`; danh sách đích ở `scripts/agent-targets.mjs` (`--list` để xem).
- Agent mới hoặc agent đổi thư mục skill: sửa bảng `AGENTS` trong `scripts/agent-targets.mjs` (install và preflight
  cùng đọc), cập nhật bảng "Cài thủ công" trong `README.md`.
- Chia sẻ cộng đồng: đẩy lên kho git (người dùng cài bằng `git clone` + `node scripts/install.mjs --with-official`,
  hoặc `npx skills add <owner>/<repo>`); `evals/` không được cài cho người dùng.

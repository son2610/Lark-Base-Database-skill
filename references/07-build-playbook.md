# 07 — Sổ tay dựng app

Thứ tự đã chạy qua hai app thật. Mỗi bước có **điểm kiểm** — chưa qua thì không sang bước sau. Giao thức chi tiết
(tham số CLI, cấu trúc file Function) theo skill chính thức đúng phiên bản; file này lo thứ tự, công cụ và bẫy.

## Mục lục
- [Cài đặt](#cai-dat)
- [Cấu trúc dự án](#cau-truc)
- [Thứ tự dựng](#thu-tu)
- [Bẫy môi trường](#bay)
- [Generator và tự động hóa](#generator)
- [Giới hạn kích thước](#gioi-han)

<a id="cai-dat"></a>
## Cài đặt

```bash
# Node.js 22+ (kiểm: node -v)
npx @larksuite/cli@latest install          # Lark CLI (bỏ qua nếu đã có: lark-cli --version)
lark-cli config init                        # lần đầu: chọn brand lark/feishu, quét QR
lark-cli auth login                         # đăng nhập tài khoản người dùng
npx @lark-base-open/base-database-cli@latest install --target claude   # CLI toàn cục + Skill chính thức
# hoặc chỉ Skill (dùng CLI qua npx): npx @lark-base-open/base-database-cli@latest skill install --target all --force
base-database-cli auth login                # xin scope Base Database (base:appmode:*)
base-database-cli doctor                    # cần ok: true
```
`--target`: `claude | codex | agents | workbuddy | all`. Không có CLI toàn cục thì dùng
`npx -y @lark-base-open/base-database-cli@<phiên bản cố định>` cho cả dự án (ghi phiên bản vào README dự án).

<a id="cau-truc"></a>
## Cấu trúc dự án (workspace, template v2)

```text
<app>/
├── base-database.jsonc       appToken, binding Base, larkProfile
├── base-schema.json          (nếu tạo Base mới) đầu vào init
├── catalog.json              cấu trúc bảng thật — nguồn tên bảng/trường/ID
├── page/                     React + Vite (page/src: App, pages, components, lib, styles, generated)
├── database-functions/<id>/  main.sql + meta.json
├── mutations/<id>/           spec.json + meta.json
├── server/functions/<id>/    index.ts + contract.ts + meta.json (+ bản chép lib)
├── server/lib/app.ts         thư viện FaaS nguồn (không build trực tiếp)
├── ai/<key>/meta.json        AI Function (thư mục ai/ rỗng = không có AI)
├── agent-tools.json          Function ẩn khỏi agent ngoài
├── tools/                    bộ công cụ (copy_project_tools.mjs)
├── tasks/todo.md, lessons.md tiến độ và bài học
└── README.md                 4 mục bắt buộc (tiếng Anh nếu prompt tiếng Việt)
```

<a id="thu-tu"></a>
## Thứ tự dựng

| # | Việc | Lệnh / ghi chú | Điểm kiểm |
|---|---|---|---|
| 1 | Chụp tình trạng | `base-database-cli context . --summary --json` | Biết đang mới hay đã có dự án |
| 2 | Thiết kế bảng | `base-schema.json` theo `04-architecture-patterns.md#bang` + định nghĩa trường của lark-base | Mọi bảng trong spec khối 3 có mặt; trường người `multiple:false` khi một người |
| 3 | Khởi tạo | `init` (`--schema` hoặc `--base-token [--table-ids]`), `--time-zone Asia/Bangkok`, `--env online` | `catalog.json` có đủ bảng; lỗi giữa chừng → `--resume` |
| 3' | (App có sẵn) | `pull <thư mục trống> --app-token …` | Có mã nguồn + catalog |
| 4 | Dọn mẫu | Xóa cả thư mục `server/functions/hello` và lời gọi mẫu trong trang | Không còn hello |
| 5 | Chép công cụ | `node <skill>/scripts/copy_project_tools.mjs <app> --preset <tên>` | `tools/`, `page/src/styles/`, `page/src/lib/` có file |
| 6 | Đọc SDK đúng bản | Đoạn `base-app` trong `AGENTS.md` dự án → `node_modules/@lark-base-open/base-database-app-sdk/docs/` | Biết API của bản SDK đã cài |
| 7 | Danh tính | Bảng Người dùng + DF `whoami` (+ `registerMe`, `switchPersona` nếu cần) | `whoami` chạy thật trả đúng người |
| 8 | Database Function | Viết theo `05-sql-field-guide.md` (sinh bằng generator nếu > 20) → `check --json` → `deploy` → `node tools/df-smoke.mjs` | **Mọi** DF trang dùng chạy thật OK |
| 9 | FaaS | `server/lib/app.ts` → `node tools/sync-faas-lib.mjs` → từng hàm → `contracts generate` → `check --json` | Contract không "runtime-only" ngoài ý muốn; tsc sạch |
| 10 | Mutation | Chỉ cho thao tác không cần kiểm quyền (`04-…#ghi`) | `check` qua |
| 11 | AI Function | `ai-functions models` → `ai/<key>/meta.json` → `check` | Validate AI qua (hoặc báo tenant chưa bật) |
| 12 | Biến môi trường | `environment-variables declare/set` (giá trị do người dùng cung cấp) | `list --target preview` đủ biến bắt buộc |
| 13 | agent-tools.json | Ẩn `srv*`, hàm phụ | `check` báo đúng danh sách |
| 14 | Giao diện | Khung (shell, router, theme, api) → từng trang theo spec khối 4; lặp nhanh bằng harness | tsc sạch; harness 1440/390 sáng/tối không lỗi console |
| 15 | README | `assets/readme-template.md` | `check` không báo README |
| 16 | Preview | `check --json` → `deploy` (chờ xong; bị ngắt thì `deployments status <id> --wait`) | Có `baseAppUrl` |
| 17 | Dữ liệu mẫu | (Base mới) script seed ghi thật, chống chạy lại → đọc lại bằng DF trang | Số bản ghi khớp; DF trang thấy dữ liệu |
| 18 | Nghiệm thu | `df-smoke` toàn bộ → thao tác ghi qua `invoke` → `tools/acceptance.mjs` | Kịch bản spec khối 10 qua (hoặc ghi rõ lý do) |
| 19 | Workflow | Tạo **tắt**, link `baseAppUrl&to=…`; bật khi người dùng đồng ý | Đọc lại cấu hình đúng |
| 20 | Bàn giao | `08-verify-deliver.md#ban-giao` | Người dùng có đủ thông tin để thử và quyết định |

Lưu tiến độ: commit git sau mỗi bước lớn (thư mục `.base-database-cli/state` đã bị ignore); cập nhật `tasks/todo.md`.

<a id="bay"></a>
## Bẫy môi trường (đã gặp)

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Lệnh `lark-cli api /open-apis/...` trong Git Bash trả 404, đường dẫn thành `C:/Program Files/Git/open-apis/...` | Git Bash đổi đối số bắt đầu bằng `/` | `export MSYS_NO_PATHCONV=1` (bộ công cụ tự đặt) |
| `contracts generate`/`check` lỗi `SDK_CODEGEN_FAILED … bad option: --experimental-permission` | CLI 1.6.0 + Node 24 (cờ đã đổi tên) | `NODE_OPTIONS="--require ./tools/node-compat.cjs"` hoặc dùng Node 22; kiểm lại với CLI mới |
| Build FaaS trên Windows lỗi `Invalid artifact path: functions\<id>\index.js.map` | CLI 1.5.0 dùng `\` trong đường dẫn | Nâng CLI (1.7.0 sửa build Windows) hoặc `node-compat.cjs` |
| `check`/`deploy` lỗi `EPERM`, `node_modules` bị xóa dở | Vite (harness/dev) đang khóa file trên Windows | Dừng harness/dev và mọi tiến trình `node … vite` còn sót trước khi check/deploy |
| zod `.regex()` làm contract thành `runtime-only` (agent mất schema) | CLI ≤ 1.6.0 | Dùng `.min/.max/.length`, kiểm định dạng trong handler (1.7.0 đã sửa — vẫn nên giữ thói quen) |
| `init` lỗi `800004319 only FxDB 6.0 Base is supported` | Base/tenant chưa có FxDB 6.0 | Tạo Base mới bằng `init --schema`; Base cũ làm trên UI có thể chưa đạt |
| `+base-create` từ chối `Asia/Ho_Chi_Minh` | Danh sách múi giờ | Dùng `Asia/Bangkok` (cùng UTC+7) |
| AI validate lỗi `800004011 … ai function feature is not enabled` | Tenant chưa bật AI Function | Báo người dùng; chỉ dùng `--skip-ai-functions` khi họ đồng ý |
| Thiếu scope (`missing_scopes`) | Chưa cấp quyền cho CLI | `base-database-cli auth login` một lần rồi chạy lại đúng lệnh cũ |
| `app has not applied for the required scope` | Ứng dụng lark-cli chưa xin scope | Không phải lỗi đăng nhập — báo quản trị viên |

<a id="generator"></a>
## Generator và tự động hóa

- **Sinh Database Function** khi nhiều: `tools/gen-database-functions.mjs` đọc mảnh dùng chung (`ME`, phạm vi, cột) và
  khai báo từng hàm (id, name, description, params, sql) → ghi `database-functions/<id>/{main.sql,meta.json}`.
  Sửa SQL ở generator, không sửa tay file sinh ra.
- **Thư viện FaaS**: `tools/sync-faas-lib.mjs` (chép `server/lib/app.ts` vào hàm có import `./app.js`).
- **Mô tả Function**: viết `name`/`description` tiếng Việt rõ "dùng khi nào / không dùng khi nào / thay bằng gì";
  có thể gom vào một file (`tools/faas-meta.mjs` kiểu LMS) để sửa hàng loạt.
- **Seed**: `tools/seed-sample-data.mjs` ghi theo thứ tự quan hệ, lưu ID vào `.base-database-cli/state/seed.json`,
  từ chối chạy lần hai (tránh dữ liệu trùng).

<a id="gioi-han"></a>
## Giới hạn kích thước

- Tối đa 200 Function (DF + Mutation + FaaS + AI) mỗi app.
- Gói mã nguồn: ≤ 50 MiB nén, ≤ 200 MiB giải nén (không tính `node_modules`, `dist`). Ảnh/video lớn để ngoài.
- Ghi theo lô ≤ 200 bản ghi; đính kèm ≤ 50 token mỗi lần; tệp ≤ 2 GB; 100 tệp mỗi ô.
- Số dòng/bảng theo gói Lark của tổ chức (tham khảo 2026-10: Starter/Basic 2.000, Pro 20.000).

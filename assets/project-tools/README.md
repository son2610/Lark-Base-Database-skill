# tools/ — bộ công cụ phát triển (không đi kèm app khi phát hành)

Chép bởi `lark-base-site-builder/scripts/copy_project_tools.mjs`. Chạy từ thư mục gốc dự án app.

| Lệnh | Việc |
|---|---|
| `node tools/invoke.mjs <fn> '<json>' [--rows\|--raw]` | Gọi một Function trên Preview như trang gọi |
| `node tools/df-smoke.mjs [fn …]` | Chạy thật mọi Database Function (tham số trong `tools/smoke-cases.json`) |
| `node tools/acceptance.mjs [số kịch bản …]` | Kịch bản nghiệm thu (sửa phần scenarios theo spec) |
| `node tools/sync-faas-lib.mjs` | Chép `server/lib/*.ts` vào các FaaS có import tương ứng |
| `npx vite --config tools/harness/vite.config.mjs` | Chạy giao diện cục bộ với dữ liệu Preview thật (cổng 5299) |
| `node tools/harness/shots.cjs .shots "/" 1440 light` | Chụp màn hình + lỗi console + chữ hiển thị |
| `NODE_OPTIONS="--require ./tools/node-compat.cjs" base-database-cli check --json` | Shim cho CLI cũ trên Node 24/Windows |

Biến môi trường: `LARK_CLI` (đường dẫn lark-cli), `LARK_PROFILE`, `FUNCTION_ENV` (preview|prod), `HARNESS_PORT`,
`PW_PATH`/`PW_EXE` (Playwright). Mọi lệnh gọi Preview với `includeInternal=true` — cần là chủ app hoặc quản trị viên app.
Dừng harness trước khi `check`/`deploy` trên Windows.

# Changelog

## [1.1.0] - 2026-10-27

### Added
- `scripts/agent-targets.mjs`: một bảng thư mục skill cho 12 agent (Claude Code, Codex, Antigravity, Gemini CLI,
  Cursor, GitHub Copilot, OpenCode, WorkBuddy/CodeBuddy, Trae, Windsurf, Kiro, Qwen Code); install và preflight cùng đọc.
- `install.mjs`: tự phát hiện agent trên máy khi không có `--target`; nhiều đích (`--target claude,codex`);
  `--project`, `--list`, `--uninstall`, `--with-official` (chép skill chính thức `lark-base-database` vào agent còn
  thiếu, ví dụ Antigravity), `--help`.

### Changed
- Codex cài vào `~/.agents/skills` theo tài liệu Codex hiện hành (bản cũ `~/.codex/skills`: dùng `--dir`).
- `preflight` tìm skill chính thức ở mọi thư mục agent và cả `~/.codex/skills`.
- README viết lại cho người mới: chuẩn bị, 3 cách cài, cách gọi skill trên từng agent, cập nhật/gỡ, câu hỏi thường gặp.
- Bỏ thông tin nội bộ (tên tenant, tên app, đường dẫn máy) khỏi `platform-baseline.json` và references.

## [1.0.0] - 2026-10-27

Phiên bản đầu. Mốc nền tảng: base-database-cli 1.7.0, base-database-app-sdk 0.4.2, lark-cli 1.0.98.

### Added
- Luồng 7 giai đoạn (môi trường → khám phá → spec → thiết kế → dựng → kiểm thử → bàn giao) và 4 chế độ làm việc.
- Bộ câu hỏi khám phá theo vòng với mặc định theo nhóm app.
- Khung spec 10 khối + `lint_spec.mjs` (kiểm 10 khối, vai trò, bảng, chống lỗi, AI, chất lượng, nghiệm thu, ô chưa điền).
- Danh mục 31 tính năng nền tảng có trạng thái, giới hạn và phiên bản; danh sách chưa hỗ trợ kèm phương án.
- Mẫu kiến trúc và hướng dẫn SQL rút từ hai app thật (CRM 1.5.0, LMS 1.6.0).
- Hệ thống giao diện: 5 preset sáng/tối đạt WCAG AA (11 cặp màu), `base.css`, mã khởi đầu trang.
- 13 mẫu nghiệp vụ (2 từ app thật).
- Bộ công cụ dự án đã chạy trên Preview thật: `invoke`, `df-smoke` (53/53 Function LMS), `acceptance`, harness giao diện
  + chụp màn hình (kiểm với LMS 390 px giao diện tối), `sync-faas-lib`, shim Node 24/Windows.
- Script: `preflight`, `check_platform_drift` (kèm `--fetch` đọc CHANGELOG và reference chính thức mới), `install`,
  `copy_project_tools`, `check_contrast`, `gen_presets`.

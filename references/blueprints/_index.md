# Thư viện mẫu nghiệp vụ

Mỗi mẫu là một **spec 10 khối có sẵn mặc định** — người dùng chỉ sửa phần khác biệt. Giá trị trong `{ }` là chỗ nên
xác nhận lại. Mẫu từ dự án thật (đánh dấu ★) đã dựng và nghiệm thu trên Preview; mẫu còn lại dựng từ bộ prompt mẫu chính
thức của Lark, đã bổ sung vai trò, bảng dữ liệu, AI có ranh giới và kịch bản nghiệm thu theo phân tích Genspark.

## Chọn mẫu

| Mẫu | File | Nhóm | Preset | Từ khóa nhận diện |
|---|---|---|---|---|
| CRM bán hàng ★ | `crm-sales.md` | Giao dịch + AI | `warm-gray` | khách hàng, cơ hội, báo giá, đơn hàng, pipeline, sales |
| Nền tảng học trực tuyến (LMS) ★ | `lms.md` | Quy trình nhóm + AI | `ivory-blue` | khóa học, học viên, bài kiểm tra, chứng chỉ, đào tạo |
| Xếp ca thông minh bằng AI | `shift-scheduling-ai.md` | Quy trình nhóm + AI | `slate-indigo` (nền sáng) | ca làm, chuỗi cửa hàng, lịch làm việc, chấm công |
| Quản lý nghỉ phép | `leave-approval.md` | Quy trình nhóm | `slate-indigo` | nghỉ phép, đơn từ, phê duyệt, HR nội bộ |
| Quản lý tuyển dụng (ATS) | `recruiting-ats.md` | Quy trình nhóm | `slate-indigo` | ứng viên, phỏng vấn, offer, vị trí tuyển |
| ERP mua – bán – kho | `erp-inventory.md` | Giao dịch | `warm-gray` | tồn kho, nhập xuất, mua hàng, bán hàng, kho |
| Trung tâm yêu cầu | `request-center.md` | Quy trình nhóm | `slate-indigo` | yêu cầu, ticket, sprint, nghiệm thu, backlog |
| Đăng ký sự kiện | `event-registration.md` | Quy trình nhóm | `soft-lavender` | sự kiện, đăng ký, check-in, suất, chờ |
| Giám sát sản xuất | `production-monitoring.md` | Quy trình nhóm | `slate-indigo` (bảng tối) | lệnh sản xuất, ca, báo công, thiết bị, sự cố |
| Kho tài sản marketing bằng AI | `marketing-assets-ai.md` | Có AI | `warm-gray` / thương hiệu | ảnh sản phẩm, nội dung, SKU, AI tạo ảnh |
| Không gian hiệu suất cá nhân | `personal-productivity.md` | Cá nhân | `soft-lavender` | tập trung, pomodoro, mục tiêu, tổng kết ngày |
| Việc cần làm cá nhân | `personal-todo.md` | Cá nhân | `paper-terracotta` (xanh lá nhẹ) | todo, dự án cá nhân, hộp thu |
| Nhật ký đọc sách | `reading-log.md` | Cá nhân | `paper-terracotta` | sách, ghi chú, tiến độ đọc |

Không có mẫu khớp → bắt đầu từ `assets/spec-template.md`, dùng mẫu gần nhất làm nguồn ý tưởng cho bảng/quy tắc.

## Cách dùng một mẫu

1. Đọc mẫu, đối chiếu với câu trả lời vòng 0–1 (`01-discovery.md`).
2. Hỏi người dùng những gì **khác** mẫu: vai trò, bảng thêm/bớt, quy tắc riêng, giá trị `{ }`, preset.
3. Sao chép thành `app-spec.md`, sửa, chạy `lint_spec`.
4. Mẫu lớn (LMS, CRM, ERP) → đề xuất chia giai đoạn (`04-architecture-patterns.md#giai-doan`).

## Ghi chú chung cho mọi mẫu

- Đăng nhập: tài khoản Lark sẵn có; vai trò lấy từ bảng Người dùng/Thành viên (`whoami`).
- Mọi thao tác ghi theo vai trò đi qua FaaS; dữ liệu mẫu đánh dấu "(Demo)".
- Giao diện tiếng Việt, `dd/mm/yyyy`, 24 giờ, VND, múi giờ Base `Asia/Bangkok`.
- Không giả lập thứ không kết nối thật (thanh toán, thiết bị) — mẫu ghi rõ phương án thay thế.

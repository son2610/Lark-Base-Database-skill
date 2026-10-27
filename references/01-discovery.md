# 01 — Khám phá nhu cầu (bộ câu hỏi theo vòng)

Mục tiêu: trong 3–6 lượt hỏi, có đủ thông tin để viết spec 10 khối mà không bắt người dùng nghĩ như lập trình viên.
Mỗi câu hỏi đều có **mặc định khuyến nghị**; người dùng chỉ cần sửa chỗ khác biệt.

## Mục lục
- [Nguyên tắc hỏi](#nguyen-tac-hoi)
- [Vòng 0 — Bối cảnh, nhóm app, mẫu](#vong-0)
- [Vòng 1 — Người dùng, vai trò, quyền](#vong-1)
- [Vòng 2 — Dữ liệu và Base](#vong-2)
- [Vòng 3 — Luồng nghiệp vụ và quy tắc](#vong-3)
- [Vòng 4 — Tính năng nền tảng](#vong-4)
- [Vòng 5 — Giao diện](#vong-5)
- [Vòng 6 — Dữ liệu mẫu và nghiệm thu](#vong-6)
- [Bảng mặc định theo nhóm app](#mac-dinh)
- [Mẫu tóm tắt quyết định](#tom-tat)

<a id="nguyen-tac-hoi"></a>
## Nguyên tắc hỏi

- **Suy luận trước, hỏi sau.** Đọc kỹ yêu cầu ban đầu, mẫu đã chọn, dự án có sẵn (`base-database.jsonc`,
  `catalog.json`, README). Chỉ hỏi điều thật sự quyết định thiết kế.
- **Tối đa 4 câu mỗi vòng**, phương án khuyến nghị đứng đầu và ghi "(Khuyến nghị)". Câu nhiều lựa chọn được phép
  chọn nhiều thì nói rõ.
- **Ưu tiên câu hỏi có hậu quả lớn**: quyền và dữ liệu nhạy cảm > nguồn dữ liệu > quy tắc nghiệp vụ > giao diện.
  Giao diện sửa sau rẻ, quyền sai thì lộ dữ liệu.
- **Đường nhanh**: người dùng nói "dùng mặc định / làm luôn / tùy bạn" → bỏ các vòng còn lại, áp dụng
  [mặc định theo nhóm app](#mac-dinh), ghi giả định vào bảng quyết định.
- **Không hỏi những gì nền tảng đã quyết định**: đăng nhập (dùng tài khoản Lark sẵn có), máy chủ (Lark lưu trữ),
  công nghệ giao diện (React + SDK). Nếu người dùng hỏi, giải thích ngắn.
- **Nói rõ khi không làm được** (tra `03-feature-catalog.md`): ví dụ người ngoài tổ chức chưa truy cập được app,
  chưa gắn tên miền riêng, không có giao dịch nguyên tử cho tồn kho/đặt chỗ.

<a id="vong-0"></a>
## Vòng 0 — Bối cảnh, nhóm app, mẫu

Thường suy ra được từ câu đầu; chỉ hỏi phần thiếu.

1. **Bạn muốn làm app gì, cho ai, giải quyết việc gì?** (một câu là đủ)
2. **Chế độ làm việc**: Dựng trọn gói (Khuyến nghị) / Chỉ viết prompt-spec / Nâng cấp app có sẵn / Rà soát.
3. **Nhóm app** (suy ra, xác nhận lại nếu mơ hồ — có thể nhiều nhóm):
   - *Cá nhân*: một người dùng, dữ liệu riêng (todo, đọc sách, hiệu suất).
   - *Quy trình nhóm*: nhiều vai trò, trạng thái, phê duyệt (yêu cầu, tuyển dụng, sản xuất, sự kiện, LMS).
   - *Giao dịch / tài chính*: tiền, giá, tồn kho, đơn hàng (CRM, ERP).
   - *Có AI*: AI sinh nội dung, phân tích, xếp lịch.
4. **Mẫu gần nhất** trong `blueprints/_index.md` — đề xuất 1–2 mẫu, hoặc "tự thiết kế".

<a id="vong-1"></a>
## Vòng 1 — Người dùng, vai trò, quyền

1. **Ai mở được app?** (đây chính là *phạm vi phát hành* khi Publish)
   - Cả tổ chức (Khuyến nghị cho app nhóm) / Chỉ một số người cụ thể / Chỉ mình tôi (app cá nhân).
   - Lưu ý cho người dùng: người ngoài tổ chức hiện chưa truy cập được.
2. **Có những vai trò nào và mỗi vai trò làm gì?** Đề xuất sẵn từ mẫu, dạng:
   `Quản trị viên: …; Quản lý: …; Nhân viên: …`. Hỏi thêm: có vai trò "chỉ xem" không?
3. **Ai được xem dữ liệu của ai?** Chọn mô hình:
   - Mọi người trong app thấy hết (đơn giản, hợp nhóm nhỏ tin cậy).
   - "Của tôi" + quản lý thấy cả nhóm (Khuyến nghị cho quy trình nhóm).
   - Theo đơn vị (cửa hàng/phòng ban/khóa học) — người phụ trách chỉ thấy đơn vị mình.
4. **Trường nhạy cảm**: lương, giá vốn, SĐT, email, đáp án, điểm… chỉ vai trò nào được thấy?
   (Mặc định: không trả trường nhạy cảm về trình duyệt của người không được xem.)

Câu phụ (chỉ hỏi khi liên quan):
- Có cần **tài khoản demo / chuyển vai trò** để trải nghiệm không? (Khuyến nghị: có, chỉ cho chủ app.)
- Có ai **chỉ dùng qua trợ lý AI** (agent ngoài) mà không mở app không?

<a id="vong-2"></a>
## Vòng 2 — Dữ liệu và Base

1. **Nguồn dữ liệu**: Tạo Base mới (Khuyến nghị nếu chưa có) / Dùng Base có sẵn (xin link) / Base có sẵn nhưng chỉ
   gắn vài bảng. Nhắc: bảng nào gắn vào app thì người dùng app có thể chạm tới qua Function — không gắn bảng nhạy cảm
   không cần thiết.
2. **Đối tượng chính và quan hệ** (đề xuất từ mẫu): ví dụ "Khách hàng 1–n Cơ hội 1–n Báo giá 1–1 Đơn hàng".
   Người dùng chỉ cần thêm/bớt.
3. **Quy mô dự kiến**: bao nhiêu bản ghi/bảng sau 1 năm, bao nhiêu người dùng đồng thời? Đối chiếu gói Lark
   (tham khảo 2026-10-15: gói Starter/Basic 2.000 dòng/bảng, Pro 20.000 dòng/bảng — kiểm lại trang giá khi cần).
4. **Múi giờ & tiền tệ**: Việt Nam → múi giờ Base `Asia/Bangkok` (UTC+7; `Asia/Ho_Chi_Minh` từng bị từ chối),
   tiền VND; hỏi nếu có chi nhánh nước ngoài.

Câu phụ:
- Người dùng có **mở Base trực tiếp** để xem/lọc/làm báo cáo không? (Có → thiết kế lớp trình bày: tên hiển thị,
  thứ tự trường, màu tùy chọn, view, công thức tổng hợp — xem `04-architecture-patterns.md#bang`.)
- Có cần **nhập dữ liệu cũ** (Excel/CSV) không?

<a id="vong-3"></a>
## Vòng 3 — Luồng nghiệp vụ và quy tắc

Đây là phần quyết định app chạy đúng hay sai; đừng để mỏng hơn phần giao diện.

1. **Luồng chính 3–4 bước** ("xâu chuỗi"): ví dụ *Tiếp nhận → Duyệt → Thực hiện → Nghiệm thu*. Dữ liệu mẫu và kịch bản
   nghiệm thu sẽ đi hết luồng này.
2. **Trạng thái** của đối tượng chính và đường chuyển; bước nào **bắt buộc ghi lý do** (từ chối, hủy, hoàn tác).
3. **Chỉ số và cách tính**: mỗi KPI ghi công thức, phạm vi (theo bộ lọc nào), xử lý khi thiếu dữ liệu
   ("Chưa có dữ liệu", không hiện 0%).
4. **Chống lỗi** (ít nhất 3): bấm hai lần không tạo trùng; không vượt giới hạn (tồn kho, chỗ, lượt); không cho giá trị
   ngoài phạm vi; khóa giá/cấu hình tại thời điểm chốt (snapshot); sửa điểm/tiền phải ghi lý do; xóa có hoàn tác hoặc lưu vết.

Câu phụ theo nhóm:
- *Giao dịch*: snapshot giá khi chốt? phê duyệt theo ngưỡng (số tiền, % chiết khấu)? làm tròn? thuế?
- *Quy trình nhóm*: SLA/hạn xử lý? nhắc hạn trước bao lâu? ai được mở lại?
- *Cá nhân*: thống kê theo ngày/tuần? giữ trạng thái khi tải lại trang (bộ đếm giờ, bản nháp)?

<a id="vong-4"></a>
## Vòng 4 — Tính năng nền tảng

Hỏi gộp dạng chọn nhiều, mỗi mục có mô tả một dòng. Chi tiết và giới hạn: `03-feature-catalog.md`.

1. **AI** (chọn nhiều): trợ lý hỏi đáp dữ liệu · tạo nội dung/bản nháp · tóm tắt · phân loại · tạo ảnh · tạo video ·
   không dùng AI. Nếu có: AI chỉ tạo **bản nháp** chờ người xác nhận (Khuyến nghị); chi phí AI tính cho chủ app.
2. **Thông báo**: trong app (bảng Thông báo) · thêm tin nhắn Lark qua workflow của Base · không cần.
3. **Tệp đính kèm**: ảnh/tài liệu (≤ 2 GB/tệp, 100 tệp/ô) · video lớn nên dùng link nhúng (YouTube/Vimeo/Drive).
4. **Mở rộng**: trợ lý AI của thành viên gọi chức năng app (agent tools) · dashboard/biểu mẫu gốc của Base ·
   nhập/xuất CSV · in/xuất PDF · tích hợp API ngoài (cần khóa → biến môi trường secret).

Câu phụ:
- Việc theo lịch (nhắc hạn hằng ngày, quét quá hạn)? → workflow của Base, hoặc nút "Quét" trong app nếu chưa cấu hình
  workflow. App không tự chạy theo lịch.

<a id="vong-5"></a>
## Vòng 5 — Giao diện

1. **Phong cách** — đề xuất 1 preset theo nhóm app (chi tiết `06-ui-design-system.md`), cho xem 3 lựa chọn:
   - `ivory-blue` — ngà + xanh đậm, học thuật/đào tạo, đáng tin.
   - `warm-gray` — xám ấm + màu nhấn trầm, CRM/ERP/công cụ văn phòng (Khuyến nghị cho app nghiệp vụ).
   - `slate-indigo` — xám lạnh + chàm, quy trình/kỹ thuật/tuyển dụng.
   - `paper-terracotta` — giấy + nâu đất, cá nhân/đọc sách/nhật ký.
   - `soft-lavender` — gradient tím-xanh nhẹ, hiệu suất cá nhân, sự kiện.
   - Hoặc theo **màu thương hiệu** (xin mã màu/logo).
2. **Bố cục chính**: điều hướng trái theo nhóm (app nghiệp vụ) · thanh trên + lưới thẻ (portal, danh mục) ·
   lịch làm trung tâm · bảng Kanban · tối giản (cá nhân). Chi tiết mở bằng **ngăn kéo bên** (Khuyến nghị) hay trang riêng.
3. **Thiết bị**: trên điện thoại ưu tiên làm gì? (Mặc định: xem việc của tôi + thao tác nhanh.)
4. **Ngôn ngữ & định dạng**: tiếng Việt, ngày `dd/mm/yyyy`, giờ 24h, tiền VND (Khuyến nghị) · song ngữ Việt–Anh.
   Sáng/tối: theo Lark (Khuyến nghị) / luôn sáng.

<a id="vong-6"></a>
## Vòng 6 — Dữ liệu mẫu và nghiệm thu

1. **Dữ liệu mẫu**: Có, hư cấu, đủ mọi trạng thái và vai trò (Khuyến nghị; chỉ khi tạo Base mới) / Không.
   Gợi ý số lượng theo mẫu (ví dụ 8 khách hàng, 14 cơ hội đủ mọi giai đoạn). Base có sẵn → không tự thêm dữ liệu mẫu.
2. **Tài khoản demo**: số người theo vai trò; cơ chế chuyển vai trò cho chủ app.
3. **Kịch bản nghiệm thu** (đề xuất từ mẫu, tối thiểu): ① luồng chính trọn vẹn ② trường hợp biên (vượt giới hạn,
   bấm hai lần) ③ cô lập quyền (A không xem/sửa được của B; trường nhạy cảm không lộ) ④ tải lại trang không mất dữ liệu.
4. **Đích đến**: chỉ Preview (Khuyến nghị lần đầu) / lên Prod sau khi bạn duyệt.

<a id="mac-dinh"></a>
## Bảng mặc định theo nhóm app

| Hạng mục | Cá nhân | Quy trình nhóm | Giao dịch / tài chính | Có AI (cộng thêm) |
|---|---|---|---|---|
| Phạm vi phát hành | Chỉ mình tôi | Cả tổ chức | Cả tổ chức hoặc người cụ thể | — |
| Mô hình xem | Chỉ dữ liệu của tôi | Của tôi + quản lý thấy nhóm | Theo người phụ trách + quản lý | — |
| Ghi dữ liệu | Mutation (lọc theo người tạo khi đọc) | FaaS cho thao tác theo vai trò/trạng thái | FaaS cho mọi thao tác tiền/giá/tồn | AI chỉ ghi bản nháp qua FaaS |
| Nhật ký thao tác | Không | Có (đổi trạng thái) | Có (mọi thay đổi tiền/giá) | Ghi nguồn "AI" |
| Snapshot | — | Cấu hình tại thời điểm chốt | Giá, thuế, chiết khấu khi chốt | — |
| Chống trùng | Khóa nút + idempotent | Khóa unique theo nghiệp vụ | Khóa unique + kiểm tra trước khi ghi | Hỏi trước khi ghi đè bản nháp |
| Thông báo | Không | Trong app + workflow (tùy) | Trong app + workflow phê duyệt | Báo khi AI xong |
| Preset giao diện | `paper-terracotta` / `soft-lavender` | `slate-indigo` / `ivory-blue` | `warm-gray` | theo nhóm chính |
| Bố cục | Tối giản, thanh trên | Điều hướng trái + bảng + ngăn kéo | Điều hướng trái + chia đôi danh sách/chi tiết | Thanh bên trợ lý AI |
| Dữ liệu mẫu | 20–40 bản ghi | Đủ trạng thái × vai trò | Đi hết chu trình tiền | Có ví dụ đầu vào AI |
| Kịch bản tối thiểu | 4 | 6–8 | 8–10 | +2 (thiếu thông tin, ngoài phạm vi) |

<a id="tom-tat"></a>
## Mẫu tóm tắt quyết định

Sau mỗi vòng (hoặc một lần ở đường nhanh), trình bày:

```markdown
**Đã chốt**
| Quyết định | Giá trị | Nguồn |
|---|---|---|
| Nhóm app | Quy trình nhóm + Có AI | Suy ra từ yêu cầu |
| Phạm vi phát hành | Cả tổ chức | Mặc định |
| Mô hình xem | Của tôi + quản lý thấy cả nhóm | Bạn chọn |
| … | … | … |

**Giá trị tôi tự đặt (sửa nếu cần):** ngưỡng duyệt `{50.000.000} VND`, nhắc hạn trước `{24}` giờ, …
**Chưa làm được trên nền tảng hiện tại:** … (kèm phương án thay thế)
```

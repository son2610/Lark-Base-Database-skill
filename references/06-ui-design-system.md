# 06 — Hệ thống giao diện

Mục tiêu: lần dựng đầu đã ra giao diện "dùng được ngay và đẹp" — bố cục theo công việc, màu có nghĩa, đủ trạng thái,
tiếng Việt chuẩn, chạy tốt trên điện thoại và giao diện tối. Nguyên tắc chi tiết của Lark: skill chính thức
`frontend-design-guide.md`; file này cụ thể hóa thành preset, khung bố cục và mã khởi đầu đã kiểm thử (LMS, CRM).

## Mục lục
- [Nguyên tắc](#nguyen-tac)
- [Preset màu](#preset)
- [Khung bố cục](#bo-cuc)
- [Thành phần](#thanh-phan)
- [Trạng thái bắt buộc](#trang-thai)
- [Tiếng Việt và định dạng](#viet)
- [Điều hướng trong iframe](#dieu-huong)
- [Đáp ứng và trợ năng](#dap-ung)
- [Checklist trước khi bàn giao](#checklist)

<a id="nguyen-tac"></a>
## Nguyên tắc

1. **Bố cục theo công việc, không theo bảng.** Mỗi trang trả lời "người dùng đến đây để làm gì": vùng làm việc (danh
   sách, lịch, bảng, form) chiếm phần lớn; chỉ số gọn ở trên; không "4 thẻ KPI + 2 biểu đồ" cho có.
2. **Màu theo nghĩa, cố định toàn app**: thành công = xanh lá, đang làm = xanh dương, cảnh báo = cam, lỗi/rủi ro = đỏ,
   chưa bắt đầu/lưu trữ = xám. Màu nhấn (accent) chỉ cho hành động chính và phần tử đang chọn.
3. **Một hệ điều khiển**: cùng chiều cao (`--control-h`), bo góc, viền; không dùng `<select>`/`<input type=date>`
   gốc làm giao diện chọn — dùng Radix Select và react-day-picker (đã có kiểu trong `base.css`).
4. **Không trang trí thừa**: không hiệu ứng nhấp nháy/bay/nảy, không thẻ bọc chỉ để "có khung", không logo tự chế,
   không băng rôn "Demo". Chuyển động chỉ để phản hồi thao tác (100–180 ms) và tôn trọng `prefers-reduced-motion`.
5. **Chữ ít mà đủ**: tiêu đề + phạm vi + hành động; giải thích đặt cạnh chỗ dễ sai. Nút ghi kết quả thật
   ("Gửi duyệt", "Lưu nháp"), không ghi chung chung.
6. **Dữ liệu là trọng tâm thị giác**: tiền căn phải, chữ số `tabular-nums`; ảnh bìa/ảnh sản phẩm là điểm nhấn khi có.

<a id="preset"></a>
## Preset màu

File trong `assets/design-tokens/`: một preset (biến màu sáng + tối) + `base.css` (thành phần dùng chung, chỉ đọc
biến). Mọi preset có cùng tên biến → đổi giao diện = đổi một dòng import. Cả 5 preset đã kiểm tương phản WCAG AA
cho 11 cặp màu ở cả sáng và tối (`scripts/check_contrast.mjs`).

| Preset | Cảm giác | Hợp với |
|---|---|---|
| `warm-gray` | Xám ấm, xanh rêu trầm, gọn, nghiêm túc | CRM, ERP, tài chính, văn phòng |
| `ivory-blue` | Ngà, xanh dương đậm, thoáng, đáng tin | LMS, đào tạo, cổng nội bộ |
| `slate-indigo` | Xám lạnh, chàm, rõ ràng | Quy trình, tuyển dụng, yêu cầu, sản xuất |
| `paper-terracotta` | Giấy kem, nâu đất, tiêu đề có chân | Cá nhân, đọc sách, nhật ký, nội dung |
| `soft-lavender` | Gradient tím–xanh nhẹ, bo lớn, thân thiện | Hiệu suất cá nhân, sự kiện, cộng đồng |

**Cách dùng** (trong `page/src/main.tsx` hoặc `index.css`):
```css
@import './styles/warm-gray.css';   /* preset */
@import './styles/base.css';        /* thành phần */
/* CSS riêng của app ở dưới */
```
`scripts/copy_project_tools.mjs --preset warm-gray` chép sẵn hai file vào `page/src/styles/`.

**Màu thương hiệu**: thêm preset mới bằng `scripts/gen_presets.cjs` (thêm một mục, giữ đủ 29 biến), chạy
`node scripts/check_contrast.mjs assets/design-tokens` — đạt mới dùng. Thương hiệu quá sáng (vàng, xanh nhạt) thì giữ
màu thương hiệu cho logo/điểm nhấn, còn `--accent` dùng sắc đậm hơn để nút đủ tương phản.

**Sáng/tối**: lấy `colorScheme` từ `siteRuntime.getRuntimeContext()`, cho người dùng chọn lại, đặt
`document.documentElement.dataset.theme` (hook mẫu: `assets/page-lib/theme.ts`).

<a id="bo-cuc"></a>
## Khung bố cục

| Khung | Dùng khi | Cấu trúc (lớp trong `base.css`) |
|---|---|---|
| **A. Workbench** | App nghiệp vụ nhiều trang (CRM, ERP, yêu cầu, quản trị) | `.staff` = `.sidenav` (nhóm điều hướng, đếm việc chờ) + `.staff-main` (`.staff-top` tìm kiếm + nút "Tạo mới" + menu tài khoản; `.staff-content` → `.page-head`, `.kpis`, `.toolbar`, `.table-wrap`) |
| **B. Portal** | Người dùng cuối duyệt nội dung (LMS học viên, sự kiện, danh mục) | `.app` = `.topbar` (`.brand`, `.topnav`, `.top-search`, `.top-actions`) + `.main`; lưới thẻ; `.bottom-nav` trên điện thoại |
| **C. Danh sách – chi tiết** | Xử lý từng bản ghi (hồ sơ, đơn, ứng viên) | Bảng/danh sách bên trái, chi tiết bên phải (≥ 1080 px) hoặc `.drawer-right` (hẹp); chỉnh sửa trong ngăn kéo |
| **D. Lịch làm trung tâm** | Xếp ca, lịch hẹn, sự kiện | Thẻ chỉ số gọn → thanh công cụ lịch (lọc, nút chính) → lịch tuần/tháng; chi tiết ca trong ngăn kéo |
| **E. Kanban** | Luồng giai đoạn (tuyển dụng, yêu cầu, cơ hội) | Cột theo trạng thái, kéo thả **kèm nút chuyển** (bàn phím); chuyển cột hỏi lý do khi cần |
| **F. Ba vùng** | Trình học bài, soạn thảo, xem tài liệu | Mục lục trái + nội dung giữa + tab dưới/bên; chế độ tập trung ẩn mục lục |
| **G. Cá nhân tối giản** | Todo, đọc sách, hiệu suất | Thanh trên dạng viên thuốc, lời chào/ngày, khối "việc quan trọng nhất", ghi nhanh |

Mặc định chi tiết/chỉnh sửa mở bằng **ngăn kéo bên phải**; trang riêng chỉ cho nội dung dài (bản xem trước báo giá,
trình học bài). Trên điện thoại ngăn kéo thành toàn màn hình.

<a id="thanh-phan"></a>
## Thành phần

- **Của SDK** (ưu tiên, đã xử lý quyền/ngôn ngữ/cache): `DatabaseUserMenu` (menu tài khoản), `UserSelectorEditor` /
  `UserSelectorPanel` (chọn người), `AttachmentImage` (ảnh đính kèm), `FloatingButton` (nút chỉnh sửa app, chỉ Prod
  với người có quyền). Tùy biến qua biến `--base-app-*` và `slots`.
- **Thư viện đã dùng trong LMS/CRM** (phiên bản cụ thể theo `package.json` của template, kiểm chính sách phụ thuộc
  trước khi thêm): `@radix-ui/react-dialog|dropdown-menu|popover|select`, `react-day-picker`, `lucide-react` (biểu tượng).
- **Lớp có sẵn trong `base.css`**: `.btn` (`-primary|-secondary|-ghost|-danger|-sm|-lg`), `.icon-btn`, `.input`,
  `.textarea`, `.select-trigger`, `.field` (+ `-label|-hint|-error`), `.form-grid`, `.checkbox`, `.switch`,
  `.segmented`, `.tabs`, `.badge-*`, `.avatar`, `.progress`, `.skeleton`, `.empty`, `.notice-*`, `.modal`, `.drawer`,
  `.menu`, `.toast`, `.kpis/.kpi`, `.table-wrap/.table`, `.toolbar`, `.chart`.
- **Biểu đồ**: SVG tự vẽ nhẹ (cột, đường, phễu) như LMS/CRM — đủ cho dashboard nghiệp vụ, không thêm thư viện nặng.
  Trục và lưới dùng `.chart-axis`, `.chart-grid`; giá trị thiếu không vẽ thành 0.

<a id="trang-thai"></a>
## Trạng thái bắt buộc

| Trạng thái | Cách thể hiện |
|---|---|
| Đang tải | Khung xương (`.skeleton`) đúng hình dạng nội dung; giữ bố cục khi tải lại |
| Trống | `.empty` + câu giải thích + nút hành động ("Tạo khách hàng đầu tiên") |
| Lỗi đọc | `.empty-error` + thông điệp an toàn + nút "Thử lại" |
| Đang ghi | Khóa nút, spinner trong nút; không khóa cả trang |
| Ghi xong | Toast ngắn; cập nhật danh sách ngay (làm mới truy vấn) |
| Ghi lỗi | Toast lỗi + giữ nguyên dữ liệu người dùng đã nhập |
| Kết quả chưa rõ (`50202`) | Thông báo "Chưa rõ đã lưu hay chưa — tải lại để kiểm tra" + nút tải lại; **không** tự gửi lại |
| Đang đồng bộ (`DataNotReadyError`) | "Dữ liệu đang đồng bộ" + nút tải lại phần đó |
| Không có quyền | Ẩn hành động; nếu vào thẳng bằng link thì hiện trang "Bạn không có quyền xem" |
| Chỉ số thiếu dữ liệu | "Chưa có dữ liệu", không hiện 0% |

Lớp gọi API mẫu `assets/page-lib/api.ts` đã chuẩn hóa: `ApiError` (cắt phần "Business code/LogID" khỏi thông điệp,
cờ `unknownOutcome`), `useRows` (TanStack Query), `useRefresh` (làm mới lại sau 1,2 s và 3,5 s vì bản sao trễ).

<a id="viet"></a>
## Tiếng Việt và định dạng

- Toàn bộ chữ giao diện tiếng Việt có dấu, xưng hô trung tính ("bạn"); thuật ngữ nghiệp vụ theo người dùng.
- Ngày `dd/mm/yyyy`, giờ 24h `HH:mm`, tiền `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`,
  số `vi-VN` (dấu chấm phân cách nghìn), thời gian tương đối "5 phút trước".
- TIMESTAMP từ Database Function là chuỗi theo múi giờ Base → định dạng bằng cắt chuỗi, không qua `new Date()` của
  trình duyệt (tránh lệch múi giờ). Hàm mẫu: `assets/page-lib/format.ts` (`fmtDate`, `fmtDateTime`, `fmtMoney`,
  `relativeTime`, `pct` với quy tắc "Chưa có dữ liệu", `searchText` bỏ dấu).
- `index.html`: `<html lang="vi">`, `<title>` = tên app.

<a id="dieu-huong"></a>
## Điều hướng trong iframe

App chạy trong iframe của Lark → dùng **hash route** (`#/orders/rec…?tab=history`) để link sâu và nút "Quay lại" hoạt
động. Link từ tin nhắn Lark mở `baseAppUrl&to=/orders/rec…`; router đọc tham số `to` ở lần tải đầu
(`assets/page-lib/router.tsx`). Link ngoài mở bằng `openLink`/`installLinkGuard()` của SDK.

<a id="dap-ung"></a>
## Đáp ứng và trợ năng

- Điểm gãy: 1080 (hai cột → một cột), 900 (ẩn điều hướng trái, hiện nút menu), 720 (thanh dưới đáy, padding nhỏ).
  Vùng đặt cạnh panel tùy chọn dùng **container query** (`container-type: inline-size`) thay vì media query.
- Kiểm ở 1440 px và 390 px, sáng và tối (harness: `08-verify-deliver.md#harness`).
- `:focus-visible` rõ ràng; kéo thả luôn có nút lên/xuống thay thế; mọi biểu tượng-nút có `aria-label`;
  tương phản đã đạt AA trong preset — màu tự thêm phải kiểm lại.

<a id="checklist"></a>
## Checklist trước khi bàn giao

1. Vùng làm việc chiếm chỗ chính; chỉ số gọn; không thẻ/khung thừa.
2. Một preset, màu trạng thái đúng nghĩa và nhất quán mọi trang.
3. Không còn `select`/`input[type=date]` gốc làm giao diện chọn; không chữ mẫu của starter.
4. Đủ các trạng thái ở bảng trên cho mọi trang đọc/ghi.
5. Tiếng Việt, định dạng ngày/giờ/tiền đúng; không lệch múi giờ.
6. 390 px không tràn ngang, thao tác chính luôn với tới; tối không mất chữ.
7. Không hiệu ứng lặp/nhấp nháy; không lỗi console.

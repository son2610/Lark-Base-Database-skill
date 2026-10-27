# 08 — Kiểm thử và bàn giao

"Deploy thành công" chỉ chứng minh mã đã lên Preview. Người dùng cần biết app **chạy đúng** với từng vai trò. File này
mô tả các lớp bằng chứng, công cụ đi kèm skill và mẫu bàn giao.

## Mục lục
- [Các lớp bằng chứng](#lop)
- [Công cụ trong dự án](#cong-cu)
- [Harness giao diện](#harness)
- [Kịch bản nghiệm thu tự động](#nghiem-thu)
- [Những gì chỉ kiểm được trong Lark](#chi-trong-lark)
- [README dự án](#readme)
- [Bàn giao](#ban-giao)
- [Lên Prod](#prod)

<a id="lop"></a>
## Các lớp bằng chứng (không lấy lớp này suy ra lớp khác)

| Lớp | Công cụ | Chứng minh |
|---|---|---|
| 1. Cấu trúc + build + validate máy chủ | `base-database-cli check --json` | Khai báo hợp lệ, SQL qua bộ kiểm, giao diện build được |
| 2. Phát hành | `deploy` → `baseAppUrl` | Gói đã lên Preview |
| 3. Đọc chạy thật | `node tools/df-smoke.mjs` | Mọi Database Function trang dùng chạy được trên dữ liệu thật |
| 4. Ghi chạy thật | `node tools/invoke.mjs <fn> '<json>'` | FaaS/Mutation ghi đúng, từ chối đúng |
| 5. Nghiệp vụ | `node tools/acceptance.mjs` | Kịch bản khối 10 của spec, với từng vai trò |
| 6. Giao diện | harness + `shots.cjs` | Trang hiển thị dữ liệu thật, đủ trạng thái, 1440/390, sáng/tối, không lỗi console |
| 7. Trong Lark | Người dùng mở Preview | Tải tệp, link ngoài, in, link từ tin nhắn, cảm nhận thật |

Báo cáo theo bảng này, ghi rõ lớp nào **chưa** làm.

<a id="cong-cu"></a>
## Công cụ trong dự án

`node <skill>/scripts/copy_project_tools.mjs <app>` chép vào `<app>/tools/` (không ghi đè file đã có):

| File | Việc |
|---|---|
| `lark.mjs` | Tìm `lark-cli` (biến `LARK_CLI` → bản cài npm toàn cục → PATH), đọc `appToken`/`larkProfile` từ `base-database.jsonc`, gọi Function Preview |
| `invoke.mjs` | `node tools/invoke.mjs whoami` · `node tools/invoke.mjs listOrders '{"status":"all"}' --rows` |
| `df-smoke.mjs` | Chạy mọi Database Function trong `tools/smoke-cases.json` (tham số mẫu cho từng hàm; hàm không có trong file chạy với `{}`), 5 luồng song song, in `ok rows=` hoặc `FAIL mã thông điệp` |
| `acceptance.mjs` | Khung kịch bản nghiệm thu: `step()`, `expect()`, `skip()`, ghi log `tools/.acceptance-*.log` |
| `sync-faas-lib.mjs` | Chép `server/lib/app.ts` vào từng FaaS |
| `node-compat.cjs` | Shim Node 24 / Windows cho CLI cũ (nạp qua `NODE_OPTIONS`) |
| `harness/` | Chạy giao diện cục bộ với dữ liệu Preview thật |

Mọi công cụ dùng **Preview** với `includeInternal=true` (cần là chủ app/quản trị viên app) và đặt sẵn
`MSYS_NO_PATHCONV=1`.

<a id="harness"></a>
## Harness giao diện

Khi chưa đăng nhập Lark trong trình duyệt tự động, vẫn kiểm được giao diện thật:
`tools/harness/vite.config.mjs` phục vụ chính mã `page/`, thay module cầu nối của SDK (`/page`) bằng
`sdk-page-stub.ts`; mọi lời gọi Function được proxy tới Preview qua `lark-cli` → dữ liệu thật, ghi thật.

```bash
npx vite --config tools/harness/vite.config.mjs            # http://127.0.0.1:5299
node tools/harness/shots.cjs .shots "/" 1440 light          # chụp + lỗi console + chữ hiển thị
node tools/harness/shots.cjs .shots "/orders" 390 dark '[{"click":"Tạo đơn"},{"wait":800}]'
```
- `shots.cjs` cần Playwright: `PW_PATH` trỏ tới module `playwright` (hoặc cài `npm i -D playwright` trong dự án +
  `npx playwright install chromium`). In JSON `{file, errors, text}` để đọc mà không cần mở ảnh.
- Giới hạn: tải tệp lên/tải xuống, mở link ngoài, `FloatingButton` không hoạt động trong harness (cần Lark).
- Chạy harness bằng tác vụ nền; **dừng hẳn trước khi `check`/`deploy`** (Windows khóa `node_modules`).

<a id="nghiem-thu"></a>
## Kịch bản nghiệm thu tự động

`tools/acceptance.mjs` gọi Function như người dùng thật (đổi vai trò bằng `switchPersona` nếu app có), theo kịch bản
đánh số của spec. Quy ước đã chứng minh hữu ích:
- Dữ liệu tạo trong kịch bản mang nhãn **"QA nghiệm thu"** để dễ tìm và dọn.
- **Chạy lại được**: phát hiện trạng thái có sẵn (đã ghi danh, đã nộp) và báo `SKIP` kèm lý do thay vì `FAIL` giả.
- Mỗi lỗi kèm bằng chứng (mã, thông điệp, LogID) trong log.
- Kiểm cả **phủ định**: người không có quyền gọi Function phải bị từ chối; dữ liệu trả về trình duyệt không chứa
  trường nhạy cảm.
- Kết quả: bảng `kịch bản | kết quả | bằng chứng`, ghi vào README mục "Status and limitations".

<a id="chi-trong-lark"></a>
## Những gì chỉ kiểm được trong Lark

Tải tệp (`uploadAttachment`), tải xuống/ảnh bìa đính kèm, mở link ngoài, in/xuất PDF trong iframe, link sâu từ tin
nhắn (`&to=`), `FloatingButton`, giao diện người dùng thường (Preview chỉ chủ app/quản trị viên mở được — kiểm vai trò
thường bằng chuyển vai trò hoặc sau khi lên Prod). Ghi những mục này là **chưa kiểm** trừ khi đã thật sự thử.

<a id="readme"></a>
## README dự án

Bắt buộc 4 mục; ngôn ngữ README chỉ nhận Anh/Trung/Nhật → prompt tiếng Việt thì viết **tiếng Anh**
(giao diện app vẫn tiếng Việt). Mẫu: `assets/readme-template.md`. Cập nhật README **trước mỗi lần deploy** nếu tính
năng đổi. Không đưa token, dữ liệu thật, log nội bộ vào README.

<a id="ban-giao"></a>
## Bàn giao

Viết cho người dùng nghiệp vụ, bằng ngôn ngữ của họ, theo thứ tự:

```markdown
## {Tên app} — {Preview | Prod} · {Hoàn thành | Hoàn thành một phần | Bị chặn}

**Mở app:** {baseAppUrl do CLI trả về — không tự ghép link}

**Đã làm**
- {Theo vai trò: Quản lý làm được …; Nhân viên làm được …}

**Thử ngay (5 phút)**
1. {Bước theo luồng chính, có dữ liệu mẫu nào để bấm}
2. Đổi vai trò: menu tài khoản → "Chuyển vai trò" (chỉ chủ app).

**Đã kiểm**
| Lớp | Kết quả |
|---|---|
| Database Function chạy thật | 41/41 OK |
| Kịch bản nghiệm thu | ①–⑧ qua; ⑤ SKIP (lý do) |
| Giao diện | 1440/390, sáng/tối, không lỗi console |

**Chưa kiểm:** {tải tệp trong Lark, link từ tin nhắn, …}
**Giới hạn:** {điều nền tảng chưa hỗ trợ và phương án}

**Cần bạn quyết định**
- Lên bản chính thức (Prod) sau khi thử? Phạm vi phát hành: {chỉ tôi / tổ chức / người cụ thể}
- Bật workflow tin nhắn Lark "{tên}" (đang tắt)?
- Xóa dữ liệu QA: {liệt kê}?

**Làm tiếp:** sửa app sau này bằng `pull`; mời đồng nghiệp cùng phát triển sau khi phát hành chính thức.
```

Sau Prod: giới thiệu dùng bằng trợ lý AI — `base-database-cli agent-tools skill install --site <link app>` — kèm khối
hướng dẫn `nextAction.externalAgent.handoff` mà CLI trả về (giữ nguyên văn).

<a id="prod"></a>
## Lên Prod

Chỉ khi người dùng **đã thử Preview và nói rõ** muốn phát hành bản này (câu chung chung từ đầu dự án không tính).
1. Kiểm README, `agent-tools.json`, biến môi trường bản Prod (`--target prod`) đủ giá trị bắt buộc.
2. `deploy --production --yes` **hoặc** người dùng bấm Publish trên trang Preview và chọn phạm vi.
3. Đổi link trong workflow sang link Prod (không tự cập nhật); tắt/bật theo quyết định người dùng.
4. Tắt "Cho phép chuyển vai trò" của tài khoản demo nếu không cần; xóa dữ liệu QA nếu người dùng đồng ý.
5. Báo kết quả từng việc riêng (Prod đã lên nhưng workflow chưa đổi link thì nói rõ).

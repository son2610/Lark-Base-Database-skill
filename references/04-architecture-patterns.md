# 04 — Mẫu kiến trúc đã kiểm chứng

Rút từ hai app thật (Sales CRM: 14 bảng, 41 Database Function, 15 FaaS; LMS: 21 bảng, 90 Database Function, 35 FaaS,
5 AI Function) và skill chính thức. Mỗi mẫu có: **vấn đề → cách làm → vì sao**. Mã ví dụ dùng tên tiếng Việt; thay bằng
tên thật trong `catalog.json`.

## Mục lục
- [Bảng dữ liệu](#bang)
- [Danh tính và vai trò](#danh-tinh)
- [Chọn đường ghi](#ghi)
- [Thư viện FaaS dùng chung](#faas-lib)
- [Lỗi nghiệp vụ và "kết quả chưa rõ"](#loi)
- [Nhật ký thao tác](#nhat-ky)
- [Thông báo](#thong-bao)
- [Snapshot](#snapshot)
- [Chống trùng](#chong-trung)
- [Phiên bản nội dung](#phien-ban)
- [Đọc nội bộ chỉ cho FaaS](#doc-noi-bo)
- [Số dẫn xuất](#so-dan-xuat)
- [Tìm kiếm không dấu](#tim-kiem)
- [Ngày giờ](#thoi-gian)
- [Trường nhiều giá trị](#tap-hop)
- [Sinh Database Function từ mảnh SQL](#sinh-ma)
- [AI trong app](#ai)
- [Agent ngoài](#agent-tools)
- [Chia giai đoạn app lớn](#giai-doan)

<a id="bang"></a>
## Bảng dữ liệu

**Vấn đề**: bảng vừa phục vụ chương trình đọc/ghi, vừa được người mở Base trực tiếp xem và lọc.

**Cách làm**
- *Lớp lưu trữ*: mỗi sự thật lưu một nơi, đúng kiểu — tiền/số lượng là số, thời điểm là ngày, người là trường người
  (`multiple: false` nếu một người — truy vấn mới so sánh trực tiếp được), tham chiếu là liên kết, giá trị hữu hạn là
  chọn một/chọn nhiều. Không lưu JSON, chuỗi ghép, số kèm đơn vị.
- *Lớp trình bày*: trường chính là tên/tiêu đề dễ nhận (không phải mã máy); trường quan trọng (trạng thái, phụ trách,
  hạn, tiền) xếp trước; màu tùy chọn theo nghĩa (xong = Green, đang làm = Blue, rủi ro = Orange/Red, chưa bắt đầu/
  lưu trữ = Gray); view cho việc hằng ngày; công thức kéo tổng hợp từ bảng con về bảng cha.
- Trường kỹ thuật dùng chung cho app nghiệp vụ:
  - `Mã` (văn bản, ổn định) cho đối tượng cần tham chiếu ngoài/đường dẫn;
  - `Khóa duy nhất` (văn bản) cho [chống trùng](#chong-trung);
  - `Từ khóa tìm kiếm` (văn bản, không dấu, chữ thường) cho [tìm kiếm](#tim-kiem);
  - `Ngày tạo` ghi được (mặc định `record_created_time`) nếu cần dữ liệu mẫu có lịch sử;
  - `Cập nhật bởi`, `Cập nhật lúc` khi cần.
- Dữ liệu kỹ thuật (cấu hình, hàng đợi) để **bảng riêng** tách khỏi bảng nghiệp vụ, hoặc biến môi trường.

**Tránh**: tên trường liên kết trùng tên bảng (công thức `[X]` hiểu nhầm là bảng); ký tự `/` trong tên trường;
xóa/đổi tên trường mà app đang dùng (Function liên quan báo lỗi — sửa SQL và deploy lại).

<a id="danh-tinh"></a>
## Danh tính và vai trò

**Vấn đề**: app chạy bằng quyền chủ app; người dùng có thể gọi thẳng mọi Function với tham số tùy ý.

**Cách làm**
1. Bảng **Người dùng/Thành viên**: `Họ tên`, `Tài khoản Lark` (người, một người), `Vai trò` (chọn một), `Trạng thái`
   (Hoạt động/Khóa), trường đơn vị (cửa hàng/phòng ban) nếu quyền theo đơn vị.
2. Database Function **`whoami`** (không tham số) trả hồ sơ người đang xem; mọi Function khác lấy danh tính bằng CTE
   `me` thay vì nhận user id từ tham số:

```sql
WITH me AS (
  SELECT u.rec_id AS uid, (u."Vai trò").name AS role
  FROM "Người dùng" AS u
  WHERE (u."Tài khoản Lark").id = CURRENT_USER_ID() AND (u."Trạng thái").name = 'Hoạt động'
)
SELECT d.rec_id AS id, d."Tiêu đề" AS title, (d."Trạng thái").name AS status
FROM "Đơn" AS d
JOIN "Người dùng" AS owner ON d."Người tạo" @> ARRAY[owner.rec_id]
CROSS JOIN me
WHERE owner.rec_id = me.uid OR me.role = 'Quản lý'
ORDER BY d.rec_id DESC
LIMIT 200
```

3. FaaS bắt đầu bằng `requireActor(ctx)` (gọi `whoami` qua `ctx.invokeFunction`), rồi kiểm vai trò/chủ sở hữu/trạng
   thái trước khi ghi. Không có hồ sơ → từ chối (hoặc FaaS `registerMe` tạo hồ sơ vai trò thấp nhất cho người mới).
4. Trang dùng `whoami` để ẩn/hiện menu — chỉ là trải nghiệm.
5. **Tài khoản demo / chuyển vai trò** (khi cần trải nghiệm nhiều vai trò bằng một tài khoản): trường `Đang đóng vai`
   (liên kết tới hồ sơ được đóng vai; mặc định trỏ về chính mình) + `Cho phép chuyển vai trò` (chỉ chủ app). FaaS
   `switchPersona` kiểm cờ cho phép. Tắt cờ trước khi lên Prod nếu không cần. CTE `me` dạng có đóng vai (chạy thật
   trong LMS):

```sql
me AS (
  SELECT x.uid AS uid, x.role AS role
  FROM (
    SELECT act.rec_id AS uid, (act."Vai trò").name AS role,
      ROW_NUMBER() OVER (ORDER BY real.rec_id, act.rec_id) AS rn
    FROM "Người dùng" AS real
    JOIN "Người dùng" AS act ON real."Đang đóng vai" @> ARRAY[act.rec_id]
    WHERE (real."Tài khoản Lark").id = CURRENT_USER_ID()
      AND (real."Trạng thái").name = 'Hoạt động'
      AND (act."Trạng thái").name = 'Hoạt động'
  ) AS x
  WHERE x.rn = 1
)
```

**Vì sao**: CTE `me` + `CURRENT_USER_ID()` là cách duy nhất ngăn đổi tham số để xem dữ liệu người khác. Mẫu
`JOIN … @> ARRAY[x.rec_id]` + `CROSS JOIN me` đã qua kiểm tra và chạy thật trên FxDB 6.0.

<a id="ghi"></a>
## Chọn đường ghi

| Thao tác | Đường ghi | Lý do |
|---|---|---|
| App cá nhân, nhập liệu nội bộ tin cậy, sửa trường của bản ghi theo ID | Mutation | Nhanh, khai báo, không cần code |
| Cần "chỉ người X / vai trò Y / ở trạng thái Z" | FaaS | Mutation không kiểm được |
| Ghi nhiều bảng, snapshot, chống trùng, nhật ký, thông báo | FaaS | Cần điều phối |
| Gắn tệp sau khi tải lên | Mutation `append_attachments` hoặc FaaS (nếu cần kiểm quyền) | |
| AI đề xuất hành động | FaaS sau khi người dùng bấm xác nhận | AI không ghi trực tiếp |

Đã có FaaS kiểm quyền cho một thao tác thì **không** mở thêm Mutation làm cùng việc (người dùng sẽ gọi Mutation để
vượt kiểm tra). LMS và CRM chọn "mọi thao tác ghi qua FaaS" — an toàn nhất cho app nhóm/giao dịch.

<a id="faas-lib"></a>
## Thư viện FaaS dùng chung

**Vấn đề**: mỗi `server/functions/<id>/` build độc lập, không import chéo thư mục.

**Cách làm**: viết một file nguồn `server/lib/app.ts` (hằng số, đọc/ghi, danh tính, lỗi, nhật ký, thông báo, thời gian),
chép vào từng hàm bằng `node tools/sync-faas-lib.mjs` (có trong `assets/project-tools/`), import `./app.js`.
Bản chép có dòng đầu "GENERATED COPY — sửa file nguồn". Nội dung nên có:

```ts
export const PROJECT_ID = '<appToken>';          // từ base-database.jsonc
const BASE_TOKEN = '<baseToken>';                // từ catalog.json
export const TABLES = { users: 'tbl…', orders: 'tbl…' } as const;   // từ catalog.json
export const target = (t: keyof typeof TABLES) => ({ baseToken: BASE_TOKEN, tableId: TABLES[t] });

export async function query<T>(ctx: ServerContext, functionId: string, params: unknown[] = []): Promise<T[]> { … } // ctx.invokeFunction, kiểm code===0 và data.rows
export async function requireActor(ctx: ServerContext): Promise<Actor> { … }   // whoami
export function fail(kind: ErrorKind, message: string): never { … }           // SDKError + wireCode
export async function audit(ctx, actor, entries): Promise<void> { … }
export async function notify(ctx, items): Promise<void> { … }
export async function readUntil<T>(read, accept, tries = 4): Promise<T[]> { … } // chờ bản sao bắt kịp
```

Ghi bằng `ctx.records.create/update/delete` (SDK ≥ 0.2) — trả `WriteResult` có `status: success|partial|failed|unknown`.
Không tự `fetch` API Base trực tiếp.

<a id="loi"></a>
## Lỗi nghiệp vụ và "kết quả chưa rõ"

| Loại | wireCode | Thông điệp (hiển thị được cho người dùng) |
|---|---|---|
| invalidInput | 40001 | "Tên không được để trống." |
| notMember | 40101 | "Bạn chưa có hồ sơ trong hệ thống. Liên hệ quản trị viên." |
| forbidden | 40301 | "Bạn không có quyền …" |
| notFound | 40401 | "Không tìm thấy …" |
| invalidState | 40901 | "Đơn đã được duyệt, không thể sửa." |
| limitReached | 40902 | "Đã hết số lần làm bài." |
| writeFailed | 50201 | "Chưa lưu được. Vui lòng thử lại." |
| writeUnknown | 50202 | "Chưa rõ đã lưu hay chưa. Vui lòng tải lại để kiểm tra trước khi làm lại." |
| readFailed | 50301 | "Không đọc được dữ liệu. Chưa có thay đổi nào được lưu." |

- Thông điệp không chứa SQL, stack, ID nội bộ. Nền tảng tự thêm `Business code: … LogID: …` vào cuối — trang cắt phần
  này trước khi hiển thị.
- `writeUnknown`: trang **không** tự thử lại; hiện hướng dẫn kiểm tra. Thao tác tạo không lặp lại mù.

<a id="nhat-ky"></a>
## Nhật ký thao tác

Bảng `Nhật ký thao tác`: `Đối tượng` (văn bản: loại bảng), `Bản ghi` (văn bản: rec id), `Thao tác`, `Người thao tác`
(liên kết Người dùng), `Thời điểm`, `Trước` / `Sau` (văn bản JSON rút gọn, chỉ trường thay đổi), `Lý do`, `Nguồn`
(Ứng dụng/AI/Workflow). Ghi trong cùng FaaS sau khi ghi nghiệp vụ thành công; lỗi ghi nhật ký không làm hỏng thao tác
chính nhưng phải trả cảnh báo.

<a id="thong-bao"></a>
## Thông báo

1. Bảng `Thông báo`: `Người nhận` (liên kết), `Tài khoản Lark nhận` (người — để workflow gửi tin nhắn), `Loại`,
   `Tiêu đề`, `Nội dung`, `Mã đường dẫn` (route trong app, ví dụ `orders/rec…`), `Đã đọc`, `Khóa chống trùng`.
2. FaaS `notify()` tạo bản ghi (bỏ qua nếu `Khóa chống trùng` đã có). Trang có chuông + trang danh sách thông báo.
3. Tin nhắn Lark: workflow của Base, trigger "bản ghi mới ở bảng Thông báo có Tài khoản Lark nhận", nút mở
   `baseAppUrl` + `&to=<Mã đường dẫn>` (trang đọc tham số `to` để điều hướng). Tạo **tắt**, bật khi người dùng đồng ý.
4. Nhắc hạn theo lịch: FaaS `scanReminders` (idempotent theo khóa) gọi từ nút "Quét" hoặc khi người dùng mở trang;
   chạy hằng ngày thật sự cần workflow có lịch.

<a id="snapshot"></a>
## Snapshot

Khi chốt (gửi báo giá, ghi danh, phát hành ca, bắt đầu bài kiểm tra), FaaS chép giá/cấu hình hiện hành vào bản ghi chốt:
`Đơn giá tại thời điểm chốt`, `Chiết khấu`, `Thuế`, `Phiên bản`, `Cấu hình (JSON)`. Sửa bảng gốc về sau không đổi kết
quả đã chốt. Số tiền tổng tính và lưu trong FaaS (SQL không nhân/cộng cột được).

<a id="chong-trung"></a>
## Chống trùng

Nền tảng không có khóa duy nhất hay giao dịch. Cách làm đã chạy tốt:
1. Trang khóa nút khi đang gửi.
2. FaaS dựng `Khóa duy nhất` theo nghiệp vụ (ví dụ `hocvien:khoahoc`), đọc qua Database Function xem đã có bản ghi
   hiệu lực chưa → có thì trả lại bản ghi đó (idempotent), không tạo mới.
3. Sau khi tạo, đọc lại (`readUntil`); nếu thấy hai bản ghi cùng khóa (hai yêu cầu chạy song song), giữ bản cũ nhất,
   chuyển bản còn lại sang "Đã hủy (trùng)" và hoàn lại tác động phụ (ví dụ lượt dùng mã kích hoạt).
4. Kịch bản nghiệm thu "bấm hai lần" bắt buộc cho thao tác tạo quan trọng.

Báo trước cho người dùng: với tranh chấp rất cao (bán vé giây cuối), cơ chế này không đảm bảo tuyệt đối.

<a id="phien-ban"></a>
## Phiên bản nội dung

Khi người dùng sửa nội dung đã xuất bản mà người khác đang dùng (khóa học, quy trình, biểu mẫu): mỗi dòng con có
`Từ phiên bản` / `Đến phiên bản` và `Mã` ổn định; đối tượng cha có `Phiên bản` (đang xuất bản) và `Phiên bản nháp`.
Sửa dòng đã xuất bản → nhân bản sang phiên bản nháp; xuất bản lại → tăng phiên bản. Người đang dùng giữ phiên bản đã
ghi danh cho tới khi tự nâng cấp. Tiến độ/điểm gắn theo `Mã`, không mất khi xóa dòng.

<a id="doc-noi-bo"></a>
## Đọc nội bộ chỉ cho FaaS

**Vấn đề**: FaaS cần đọc dữ liệu người gọi không được thấy (đáp án, liên hệ người khác), nhưng mọi Database Function
đều gọi được từ trình duyệt.

**Cách làm** (Function `srv*`):
1. Database Function tên `srv…` nhận thêm tham số cuối `serverKey` và chỉ trả dữ liệu khi khóa khớp (dạng đã chạy
   thật trong LMS):
   ```sql
   SELECT u.rec_id AS user_id, u."Email" AS email
   FROM "Người dùng" AS u
   JOIN "Cấu hình hệ thống" AS sk ON sk."Khóa" = 'server_key'
   WHERE u.rec_id = $1 AND sk."Giá trị" = $2
   ```
2. Giá trị khóa: chuỗi ngẫu nhiên dài; lưu ở bảng cấu hình (chỉ chủ app có quyền vào Base) **và** biến môi trường
   secret `SERVER_KEY` của FaaS — không viết thẳng trong mã nguồn (gói mã nguồn tải lên Lark và pull về được).
3. Thêm mọi `srv*` vào `agent-tools.json` exclude; mô tả rõ "chỉ dùng nội bộ".
4. Đổi khóa: cập nhật cả hai nơi rồi deploy.

<a id="so-dan-xuat"></a>
## Số dẫn xuất

SQL hiện không làm phép toán trên cột. Chọn một:
- **Trường công thức** trong Base (thành tiền = số lượng × đơn giá, điểm có trọng số). Trong SQL, trường công thức số
  trả về mảng → cộng bằng `CROSS JOIN UNNEST(f) AS w`.
- **FaaS tính và lưu** khi ghi (tổng báo giá, tiến độ %, điểm tổng kết) — kèm nhật ký nếu là số liệu tiền/điểm.
- **Trang tính** từ các con số người xem vốn được thấy (tỷ lệ = a/b hiển thị).

<a id="tim-kiem"></a>
## Tìm kiếm không dấu

`LOWER()`/`ILIKE` không dùng được. FaaS ghi trường `Từ khóa tìm kiếm` = bỏ dấu + chữ thường của các trường cần tìm
(`normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').toLowerCase()`); trang chuẩn hóa từ khóa người
dùng nhập rồi gửi `%từ khóa%` vào `LIKE $1`. Danh sách nhỏ (< 300 dòng đã tải) có thể lọc ngay trên trang.

<a id="thoi-gian"></a>
## Ngày giờ

- Base VN dùng `Asia/Bangkok` (UTC+7, không đổi giờ mùa hè). Hằng số `BASE_TIME_ZONE` trong FaaS và trang.
- SQL trả TIMESTAMP dạng `YYYY-MM-DD HH:mm:ss.SSS` theo múi giờ Base. `DATE_TRUNC` tính theo UTC → ngày 1 lúc 00:00
  giờ VN rơi về tháng trước; nhóm theo tháng bằng cách trả từng dòng và cắt chuỗi `slice(0,7)` trên trang.
- `GROUP BY` cột timestamp và phép cộng interval lỗi → tính trong FaaS/trang.
- Ngày thuần (hạn, sinh nhật) giữ dạng `YYYY-MM-DD` khi sửa; sự kiện (nộp bài, tạo đơn) giữ epoch ms. Không cộng/trừ
  giờ cố định. Helper: `page/src/lib/date-time.ts` của template.

<a id="tap-hop"></a>
## Trường nhiều giá trị

Chọn nhiều, nhiều người, liên kết nhiều bản ghi bị **ghi đè cả ô**. Thêm/bớt một phần tử: đọc danh sách đầy đủ mới
nhất → gộp → ghi lại; không đọc được bản mới nhất thì chặn thao tác. Tệp đính kèm dùng thao tác thêm/bớt riêng.

<a id="sinh-ma"></a>
## Sinh Database Function từ mảnh SQL

Khi > ~20 Database Function, viết `tools/gen-database-functions.mjs` sinh `main.sql` + `meta.json` từ mảnh dùng chung
(CTE `me`, phạm vi theo vai trò, cột chuẩn). Lợi ích: sửa một mẫu sai thì sửa mọi nơi; tránh lỗi runtime do mỗi file một
kiểu. Giữ `name`/`description` tiếng Việt rõ nghĩa (agent ngoài đọc). Sau khi sinh: `check` → deploy → df-smoke.

<a id="ai"></a>
## AI trong app

- **Ngữ cảnh**: một Database Function "ngữ cảnh trợ lý" trả bản tóm tắt gọn (đếm, danh sách ngắn) mà người xem được
  phép thấy; trang ghép vào `params`. Không đưa cả bảng, không đưa trường nhạy cảm.
- **Trợ lý hỏi đáp**: stream (`invokeSiteAIFunctionStream`), hiển thị riêng phần suy luận và câu trả lời; một luồng
  hoạt động cho mỗi khung chat; hủy khi rời trang.
- **Đề xuất hành động**: AI trả JSON đề xuất (`{action, recordId, fields}`) theo định dạng trong System Prompt; trang
  kiểm ID có trong dữ liệu đã tải, hiện thẻ "Xác nhận", bấm mới gọi FaaS; ghi `Nguồn = AI`.
- **Sinh nội dung**: luôn vào trạng thái nháp; người dùng sửa/xác nhận từng mục.
- **Phạm vi**: System Prompt nói rõ chỉ trả lời từ dữ liệu được cung cấp; không tìm thấy thì nói không biết và gợi ý
  hỏi người phụ trách. Tắt trợ lý trong ngữ cảnh nhạy cảm (đang làm bài kiểm tra).

<a id="agent-tools"></a>
## Agent ngoài

Mở: những Function mà một thành viên hiểu và dùng trực tiếp (xem danh sách, tạo đơn, cập nhật trạng thái).
Ẩn (`agent-tools.json` exclude): `srv*`, kiểm tra phụ, ghi tiến độ tự động, chuyển vai trò, chẩn đoán. Đừng quên rằng
exclude chỉ ẩn khỏi agent — kiểm tra quyền vẫn phải nằm trong Function.

<a id="giai-doan"></a>
## Chia giai đoạn app lớn

Dấu hiệu: > 15 bảng, > 40 Function, > 8 trang, nhiều vai trò + AI. Chia:
1. **Lõi**: danh tính, đối tượng chính, luồng chính, trang chính, dữ liệu mẫu → Preview.
2. **Mở rộng**: quy tắc phụ, thông báo, nhập/xuất, báo cáo → Preview.
3. **AI và tinh chỉnh**: AI Function, agent tools, workflow, tối ưu giao diện → Preview → Prod.
Mỗi giai đoạn chạy được và kiểm thử được; người dùng có thể dừng ở bất kỳ đâu.

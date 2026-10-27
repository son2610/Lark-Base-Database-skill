# 05 — SQL thực chiến cho Database Function

Database Function chạy một tập SQL **hẹp hơn PostgreSQL** (engine FxDB 6.0 cho Base tạo bằng `init` từ 2026-10-22).
Danh sách chính thức các cú pháp bị từ chối và cách thay: skill chính thức `base-sql-errors.generated.md`.
File này bổ sung những gì **đã thử trên tenant thật** — kể cả loại nguy hiểm nhất: qua kiểm tra nhưng lỗi khi chạy.

Mốc kiểm chứng: CLI 1.5.0 (2026-10-22, CRM) và 1.6.0 (2026-10-26, LMS), tenant Lark quốc tế (brand lark).
Phiên bản mới có thể nới/siết — khi gặp kết quả khác, cập nhật file này (xem `09-maintaining.md`).

## Mục lục
- [Quy trình an toàn](#quy-trinh)
- [Chạy được](#pass)
- [Bị từ chối khi kiểm tra](#fail)
- [Qua kiểm tra nhưng lỗi khi chạy](#runtime)
- [Kiểu dữ liệu trả về](#kieu)
- [Mẫu câu truy vấn hay dùng](#mau)
- [Dò lỗi](#do-loi)

<a id="quy-trinh"></a>
## Quy trình an toàn

1. Viết theo [mẫu](#mau); tên bảng/trường lấy đúng từ `catalog.json`, đặt trong ngoặc kép.
2. `base-database-cli check --json` — từ 1.6.0 lỗi chỉ rõ cấu trúc và vị trí (`BASE_SQL_TARGET_CAPABILITY_UNAVAILABLE`).
3. `deploy` (Preview) rồi **chạy thật từng Function** bằng `node tools/df-smoke.mjs` (bộ công cụ của skill). Đây là
   bước bắt buộc: LMS có 3 Function qua deploy nhưng lỗi `800008904` khi chạy — trang tổng quan sẽ trống nếu bỏ qua.
4. Chỉ dựng giao diện trên Function đã qua smoke.

<a id="pass"></a>
## Chạy được (đã kiểm chứng)

- CTE `WITH me AS (… CURRENT_USER_ID() …)` + `CROSS JOIN me` hoặc `JOIN me ON …`.
- Liên kết qua JOIN: `JOIN "Bảng" AS x ON a."Liên kết" @> ARRAY[x.rec_id]` (cả LEFT JOIN, nhiều JOIN).
- Lọc theo bản ghi liên kết qua JOIN: `($1 = 'all' OR x.rec_id = $1)`.
- Đơn vị chọn: `(t."Trạng thái").name = 'Đã duyệt'`, `(t."Trạng thái").name = $1`.
- Người: `(t."Người phụ trách").id = CURRENT_USER_ID()` (trường một người).
- `UNION ALL`; CROSS JOIN các bảng dẫn xuất đã gom nhóm; `CROSS JOIN UNNEST(x."Liên kết") AS id … GROUP BY id` (ở cấp
  truy vấn ngoài cùng).
- LEFT JOIN bảng dẫn xuất gom nhóm (UNNEST/GROUP BY).
- `ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)`; `CASE` để che/ánh xạ; `COALESCE` sau LEFT JOIN.
- `SUM/COUNT/COUNT(DISTINCT)/MIN/MAX/AVG` trên cột; `MAX/MIN` timestamp.
- So sánh số giữa các bảng; `ts < CURRENT_TIMESTAMP`; tham số `TIMESTAMP`.
- `DATE_TRUNC('month', ts)`, `EXTRACT(YEAR|MONTH FROM ts)`, `EXTRACT(EPOCH FROM ts)` (xem lưu ý múi giờ).
- `CAST(NULL AS TEXT)`, `ORDER BY CASE …`, `LIMIT/OFFSET` với tham số INT.

<a id="fail"></a>
## Bị từ chối khi kiểm tra

| Cú pháp | Cách thay |
|---|---|
| Phép toán trên cột `a*b`, `a+b`, `a/2`, `SUM(a*2)` (kể cả CAST) | Trường công thức, hoặc FaaS tính và lưu, hoặc trang tính |
| `link @> ARRAY[$1]`, `link && $1`, `@> ARRAY[cte.col]` trong WHERE | `JOIN "Bảng" AS x ON link @> ARRAY[x.rec_id]` rồi `x.rec_id = $1` |
| `rec_id = ANY($1)` với `TEXT[]`; so sánh mảng = mảng | Gọi theo từng ID, hoặc lọc trên trang các dòng đã được phép xem |
| `TO_CHAR(ts, …)`; `ts + INTERVAL '7 days'`; `CURRENT_TIMESTAMP + $interval` | Trả timestamp thô, định dạng trên trang; tính mốc thời gian trong FaaS rồi truyền tham số TIMESTAMP |
| `LOWER(x) LIKE`, `ILIKE` | Trường `Từ khóa tìm kiếm` chuẩn hóa sẵn (`04-architecture-patterns.md#tim-kiem`) |
| `(url_field).link` / `.text` (trên tenant đã thử) | Chọn cả đối tượng URL, đọc thuộc tính trên trang |
| `STRING_AGG` + LEFT JOIN + GROUP BY | Trả nhiều dòng, ghép trên trang |
| `GROUP BY <cột timestamp>`; `ORDER BY timestamp` trên UNION | Trả từng dòng, nhóm trên trang (`value.slice(0,7)`) |
| IN-subquery có UNNEST; EXISTS tương quan có `@>` | JOIN tường minh |
| So sánh timestamp với timestamp khác bảng | Lấy cả hai ra, so trên trang/FaaS |
| `PERCENTILE_CONT`, `CURRENT_DATE` | Tính ngoài SQL; dùng `CURRENT_TIMESTAMP` |
| UNNEST dẫn xuất lồng trong CROSS JOIN của bảng dẫn xuất khác | Đưa lên cấp ngoài cùng hoặc dùng JOIN liên kết |

<a id="runtime"></a>
## Qua kiểm tra nhưng lỗi khi chạy (`800008904 … could not execute`)

| Hiện tượng (LMS, CLI 1.6.0) | Sửa |
|---|---|
| Hai CTE phạm vi gần giống nhau (`mscope` + `tscope`, mỗi cái UNION ALL qua `me`) dùng chung với `LEFT JOIN mscope` | Gộp thành **một** CTE phạm vi mang cờ `MAX(manage)` |
| Năm CTE gom nhóm `CROSS JOIN UNNEST(link)` trong một truy vấn (ba cái thì chạy) | `JOIN "T" AS k ON x."Link" @> ARRAY[k.rec_id]` + một CTE đếm gộp bằng UNION ALL |

Nguyên tắc rút ra: giữ truy vấn **nông** (CTE ít, mỗi CTE làm một việc), ưu tiên JOIN liên kết hơn UNNEST lồng nhau,
và luôn smoke sau deploy.

<a id="kieu"></a>
## Kiểu dữ liệu trả về

- Trường liên kết luôn trả `ARRAY<TEXT>` (danh sách rec id) với Base từ init — kể cả liên kết một bản ghi; kiểm
  `sqlType` trong `catalog.json`.
- Trường công thức số trả `ARRAY<DOUBLE>` → `CROSS JOIN UNNEST(f) AS w` để cộng.
- Chọn một: đối tượng `{id, name}` — so sánh bằng `.name`/`.id`. Người: `{id, name}`.
- TIMESTAMP: chuỗi `YYYY-MM-DD HH:mm:ss.SSS` theo múi giờ Base. `DATE_TRUNC` tính theo UTC (mốc tháng của
  `Asia/Bangkok` trả về `…-01 07:00` của tháng trước) → nhóm theo tháng trên trang.
- Văn bản rỗng đọc ra `null` (lọc bằng `IS NULL`, không `= ''`). So sánh văn bản phân biệt hoa thường.
- Kết quả là `{ rows, columns, row_count }`, không phải mảng trực tiếp.

<a id="mau"></a>
## Mẫu câu truy vấn hay dùng

**Danh sách "của tôi" + quản lý thấy hết** — xem `04-architecture-patterns.md#danh-tinh`.

**Chi tiết một bản ghi có kiểm quyền**
```sql
WITH me AS (SELECT u.rec_id AS uid, (u."Vai trò").name AS role FROM "Người dùng" AS u
            WHERE (u."Tài khoản Lark").id = CURRENT_USER_ID())
SELECT d.rec_id AS id, d."Tiêu đề" AS title, d."Số tiền" AS amount, (d."Trạng thái").name AS status
FROM "Đơn" AS d
JOIN "Người dùng" AS o ON d."Người tạo" @> ARRAY[o.rec_id]
CROSS JOIN me
WHERE d.rec_id = $1 AND (o.rec_id = me.uid OR me.role IN ('Quản lý', 'Quản trị viên'))
LIMIT 1
```

**Đếm theo trạng thái cho thẻ chỉ số**
```sql
SELECT x.status AS status, COUNT(x.id) AS total
FROM (SELECT d.rec_id AS id, (d."Trạng thái").name AS status FROM "Đơn" AS d) AS x
GROUP BY x.status
```

Các mẫu ở mục này viết theo dạng đã kiểm chứng nhưng vẫn phải qua df-smoke trên Base của bạn.

**Tổng tiền theo liên kết (dùng trường công thức hoặc số đã lưu)**
```sql
SELECT k.rec_id AS customer_id, k."Tên khách hàng" AS name, COALESCE(SUM(o."Tổng tiền"), 0) AS revenue
FROM "Khách hàng" AS k
LEFT JOIN "Đơn hàng" AS o ON o."Khách hàng" @> ARRAY[k.rec_id]
GROUP BY k.rec_id, k."Tên khách hàng"
ORDER BY revenue DESC, k.rec_id
LIMIT 50
```

**Bộ lọc tùy chọn** — dùng giá trị "all" thay vì NULL cho tham số tùy chọn để dễ đọc:
`WHERE ($1 = 'all' OR (d."Trạng thái").name = $1) AND d."Từ khóa tìm kiếm" LIKE $2`.

**Phạm vi theo vai trò (một CTE duy nhất)**
```sql
scope AS (
  SELECT y.unit_id AS unit_id, MAX(y.manage) AS manage
  FROM (
    SELECT c.rec_id AS unit_id, 1 AS manage FROM "Cửa hàng" AS c CROSS JOIN me WHERE me.role = 'Quản trị viên'
    UNION ALL
    SELECT c.rec_id AS unit_id, 1 AS manage FROM "Cửa hàng" AS c
      JOIN "Người dùng" AS u ON c."Cửa hàng trưởng" @> ARRAY[u.rec_id] JOIN me ON me.uid = u.rec_id
    UNION ALL
    SELECT c.rec_id AS unit_id, 0 AS manage FROM "Cửa hàng" AS c
      JOIN "Người dùng" AS u ON c."Nhân viên" @> ARRAY[u.rec_id] JOIN me ON me.uid = u.rec_id
  ) AS y
  GROUP BY y.unit_id
)
```

Danh sách luôn có `LIMIT` cố định (≤ 300) và thứ tự ổn định (cuối cùng theo `rec_id`). Không phân trang giả bằng
cách tải 300 dòng rồi chia trên trang mà gọi là "đủ dữ liệu".

<a id="do-loi"></a>
## Dò lỗi

- `check` báo lỗi → đọc vị trí và cấu trúc bị từ chối, tra bảng trên và `base-sql-errors.generated.md`.
- Thông báo chung `800008902` (bản cũ) → kiểm từng Function: dựng payload bằng chính CLI và gọi
  `POST /open-apis/base/v3/sites/<app>/functions/validate` lọc một functionId (Git Bash cần `MSYS_NO_PATHCONV=1`).
- `800008904` khi chạy → đơn giản hóa: bớt CTE, gộp phạm vi, thay UNNEST bằng JOIN liên kết; smoke lại.
- Gặp giới hạn mới → ghi `tasks/lessons.md` của dự án và đề xuất thêm vào file này.

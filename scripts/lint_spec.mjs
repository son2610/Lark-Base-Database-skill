#!/usr/bin/env node
// Lints a 10-block app spec (references/02-spec-template.md).
//   node scripts/lint_spec.mjs app-spec.md [--json]
//   node scripts/lint_spec.mjs --blueprint references/blueprints/crm-sales.md   # template mode: text slots are warnings
// Exit code 1 when there are errors. Heuristics are deliberately simple and explain themselves in the messages.
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const blueprint = args.includes('--blueprint');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('usage: node scripts/lint_spec.mjs <spec.md> [--blueprint] [--json]');
  process.exit(2);
}
const text = readFileSync(file, 'utf8');
const issues = [];
const err = (block, message) => issues.push({ level: 'error', block, message });
const warn = (block, message) => issues.push({ level: 'warn', block, message });
const info = (block, message) => issues.push({ level: 'info', block, message });

// ---------------------------------------------------------------- split into blocks 0..10
const headingRe = /^(?:#{1,4}\s*)?【\s*(\d{1,2})\s*[.．]\s*([^】]*)】\s*$/gm;
const marks = [...text.matchAll(headingRe)].map((m) => ({ no: Number(m[1]), title: m[2].trim(), index: m.index, end: m.index + m[0].length }));
const blocks = new Map();
marks.forEach((m, i) => {
  const body = text.slice(m.end, i + 1 < marks.length ? marks[i + 1].index : text.length);
  if (blocks.has(m.no)) warn(m.no, `Khối ${m.no} xuất hiện nhiều lần`);
  blocks.set(m.no, { title: m.title, body: body.split(/\n#{1,2}\s+(?!【)/)[0] });
});
const names = ['Chuẩn bị', 'Mục tiêu', 'Vai trò và phân quyền', 'Các bảng dữ liệu chính', 'Các trang và chức năng chính', 'Quy tắc nghiệp vụ', 'Năng lực AI', 'Bố cục', 'Phong cách giao diện', 'Yêu cầu chất lượng', 'Dữ liệu mẫu và nghiệm thu'];
for (let n = 0; n <= 10; n += 1) if (!blocks.has(n)) err(n, `Thiếu khối 【${n}. ${names[n]}】`);
const order = marks.map((m) => m.no);
if (order.join(',') !== [...order].sort((a, b) => a - b).join(',')) warn('-', `Các khối không theo thứ tự 0→10 (đang là ${order.join(', ')}); agent đọc tuần tự nên khối 0 phải ở đầu`);

const body = (n) => blocks.get(n)?.body ?? '';
const bullets = (s) => s.split('\n').filter((l) => /^\s*([-*•]|\d+[.)]|[①-⑳])\s+\S/.test(l));
const has = (s, re) => re.test(s.normalize('NFC'));
const personal = has(body(2) + body(1), /một người dùng|phạm vi phát hành:\s*chỉ mình tôi|chỉ bản thân truy cập/i);

// 0 — preparation
if (blocks.has(0)) {
  if (!has(body(0), /@larksuite\/cli/)) warn(0, 'Khối 0 nên có lệnh cài Lark CLI (npx @larksuite/cli@latest install)');
  if (!has(body(0), /base-database-cli/)) warn(0, 'Khối 0 nên có lệnh cài Skill (npx @lark-base-open/base-database-cli@latest skill install …)');
}
// 1 — goal
if (blocks.has(1)) {
  if (!has(body(1), /\/lark-base-database/)) warn(1, 'Khối 1 nên nhắc /lark-base-database để agent gọi đúng Skill chính thức');
  if (!has(body(1), /(kết nối|xâu chuỗi|các bước|luồng)/i)) warn(1, 'Khối 1 nên nêu luồng chính 3–4 bước ("kết nối các bước A, B, C và D")');
}
// 2 — roles
if (blocks.has(2)) {
  const roleLines = bullets(body(2)).filter((l) => /:/.test(l) && !/nhạy cảm|phạm vi phát hành/i.test(l));
  if (!personal && roleLines.length < 2) err(2, `Khối 2 cần ít nhất 2 vai trò dạng "- Vai trò: được xem/làm …" (đang có ${roleLines.length}); app cá nhân thì ghi rõ "chỉ bản thân"`);
  if (!personal && !has(body(2), /nhạy cảm/i)) warn(2, 'Khối 2 chưa nêu trường nhạy cảm (ai được xem lương, giá vốn, liên hệ, đáp án…)');
  if (!has(body(2) + body(0) + body(1), /phạm vi phát hành|cả tổ chức|người cụ thể|chỉ mình tôi|chỉ bản thân/i)) warn(2, 'Chưa nêu phạm vi phát hành (chỉ mình tôi / cả tổ chức / người cụ thể)');
}
// 3 — tables
if (blocks.has(3)) {
  const tableLines = bullets(body(3)).filter((l) => /:/.test(l));
  if (tableLines.length < (personal ? 2 : 3)) err(3, `Khối 3 cần liệt kê các bảng dạng "- Bảng: trường…" (đang có ${tableLines.length})`);
  if (!has(body(3), /(liên kết|quan hệ|thuộc|của)/i)) warn(3, 'Khối 3 chưa nêu quan hệ giữa các bảng');
  if (!personal && !has(body(3), /nhật ký|lịch sử|audit/i)) warn(3, 'App nhóm/giao dịch nên có bảng nhật ký thao tác');
  const money = /(?<!đánh\s)(?<!\p{L})(giá(?!\s*trị)|tiền|đơn giá|báo giá|thanh toán|tồn kho|lương)(?!\p{L})|VND/iu;
  if (has(body(1) + body(4) + body(5), money) && !has(body(3) + body(5), /snapshot|ảnh chụp|tại thời điểm/i)) warn(3, 'Có tiền/giá nhưng chưa có quy tắc snapshot (lưu giá/cấu hình tại thời điểm chốt)');
}
// 4 — pages
if (blocks.has(4)) {
  const pages = bullets(body(4));
  if (pages.length < 2) err(4, `Khối 4 cần liệt kê các trang (đang có ${pages.length})`);
}
// 5 — rules
if (blocks.has(5)) {
  const b5 = body(5);
  if (!has(b5, /→|->/)) warn(5, 'Khối 5 chưa có trạng thái dạng "A → B → C"');
  const guards = (b5.match(/trùng|hai lần|nhiều lần|vượt|giới hạn|không được|không cho|không (tạo|sửa|xuất|nhập|báo|đăng ký|xóa|đưa|cộng|trừ|mở)|chặn|ngăn|snapshot|lý do|tối đa|tối thiểu|phạm vi|trong khoảng|khóa duy nhất|chỉ (một|1) |hoàn tác|≥|<=|>=/gi) ?? []).length;
  if (guards < 3) err(5, `Khối 5 cần ít nhất 3 quy tắc chống lỗi (chống trùng, giới hạn, chặn, lý do…) — tìm thấy ${guards}`);
  if (!has(b5, /=/)) warn(5, 'Khối 5 chưa có công thức chỉ số ("Chỉ số = …")');
  if (!has(b5, /chưa có dữ liệu|thiếu dữ liệu|chờ bổ sung|không hiển thị 0/i)) warn(5, 'Khối 5 chưa nói cách hiển thị khi thiếu dữ liệu ("Chưa có dữ liệu", không hiện 0%)');
  const ui = body(7).length + body(8).length;
  if (b5.length < ui * 0.8) warn(5, 'Khối 5 (quy tắc) ngắn hơn đáng kể so với khối 7+8 (giao diện) — quy tắc mới quyết định app chạy đúng');
}
// 6 — AI
if (blocks.has(6)) {
  const b6 = body(6);
  const noAi = has(b6, /không dùng ai|không có ai|không sử dụng ai/i);
  if (!noAi) {
    if (!has(b6, /nháp|xác nhận/i)) err(6, 'Khối 6: kết quả AI phải là bản nháp chờ người xác nhận');
    if (!has(b6, /thất bại|lỗi|một phần/i)) warn(6, 'Khối 6 chưa nêu xử lý khi AI thất bại / chỉ tạo được một phần');
    if (!has(b6, /hỏi lại|thiếu thông tin|không tự giả định/i)) warn(6, 'Khối 6 chưa nêu: thiếu thông tin thì hỏi lại');
    if (!has(b6, /không được|giới hạn/i)) warn(6, 'Khối 6 chưa nêu giới hạn của AI (không tự phát hành, không sửa dữ liệu đã chốt…)');
  }
}
// 8 — style
if (blocks.has(8)) {
  if (!has(body(8), /tiếng việt|ngôn ngữ|tiếng anh/i)) warn(8, 'Khối 8 chưa nêu ngôn ngữ giao diện (viết prompt tiếng Việt chưa chắc ra giao diện tiếng Việt)');
  if (!has(body(8), /dd\/mm\/yyyy|định dạng ngày/i)) warn(8, 'Khối 8 chưa nêu định dạng ngày/giờ/tiền');
  if (!has(body(8), /sáng|tối|dark|light/i)) warn(8, 'Khối 8 chưa nêu giao diện sáng/tối');
}
// 9 — quality
if (blocks.has(9)) {
  const b9 = body(9);
  for (const [re, label] of [[/đang tải|loading|khung xương/i, 'trạng thái đang tải'], [/trống/i, 'trạng thái trống'], [/lỗi/i, 'thông báo lỗi'], [/tải lại|refresh|không mất/i, 'giữ dữ liệu khi tải lại trang']]) {
    if (!has(b9, re)) err(9, `Khối 9 thiếu ${label}`);
  }
  if (!personal && !has(b9 + body(2) + body(5), /máy chủ|server|phía máy chủ/i)) warn(9, 'Nên ghi rõ "phân quyền kiểm tra ở phía máy chủ, không chỉ ẩn trên giao diện"');
}
// 10 — sample data & acceptance
if (blocks.has(10)) {
  const b10 = body(10);
  const scenarios = (b10.match(/[①-⑳]/g) ?? []).length || b10.split('\n').filter((l) => /^\s*\d+[.)]\s+\S/.test(l)).length;
  if (scenarios < 3) err(10, `Khối 10 cần ít nhất 3 kịch bản nghiệm thu đánh số (đang có ${scenarios})`);
  if (!personal && !has(b10, /không [\p{L}\s/]{1,20} được|cô lập|quyền|không chứa|không lộ/iu)) err(10, 'Khối 10 thiếu kịch bản cô lập quyền (A không xem/sửa được dữ liệu của B; trường nhạy cảm không lộ)');
  if (!has(b10, /\d+\s*(bản ghi|khách|đơn|khóa|nhân viên|học viên|sản phẩm|người|cửa hàng|công việc|việc|cuốn|sách|sự kiện|vị trí|ứng viên|yêu cầu|danh mục|câu hỏi|tài khoản)|\{\s*\d/i)) warn(10, 'Khối 10 nên ghi số lượng dữ liệu mẫu cụ thể');
  if (!has(b10, /tự kiểm tra|báo cáo kết quả/i)) warn(10, 'Nên kết thúc bằng "Sau khi hoàn thành, hãy tự kiểm tra lần lượt từng kịch bản và báo cáo kết quả."');
}

// ---------------------------------------------------------------- placeholders, vague phrases, length
const slots = [...text.matchAll(/\{([^{}\n]{1,60})\}/g)].map((m) => m[1].trim());
// Template slots ({Tên app}, {bước A}, {a / b / c}, {…}) must be filled; other braces are customisable values
// ({90}, {24} giờ, {xanh dương đậm}) that stay but must be listed for the user to confirm.
const templateSlot = /^(tên|bước|vai trò|trường|người dùng|bảng|trang|chỉ số|công thức|giá trị|preset|điều hướng|thành phần|danh sách|số lượng|luồng|sự kiện|khi x|lưu gì|không vượt|chặn thao tác|mô tả|đối tượng|người|nhóm|hành động|loại)\b|\s\/\s|…|\.\.\./i;
const textSlots = [...new Set(slots.filter((s) => templateSlot.test(s)))];
const valueSlots = [...new Set(slots.filter((s) => !textSlots.includes(s)))];
if (textSlots.length) (blueprint ? info : err)('-', `Còn ô chưa điền: ${textSlots.slice(0, 12).map((s) => `{${s}}`).join(', ')}${textSlots.length > 12 ? ' …' : ''}`);
if (valueSlots.length) {
  info('-', `Giá trị tùy chỉnh cần người dùng xác nhận: ${valueSlots.map((s) => `{${s}}`).join(', ')}`);
  if (!blueprint && !/giá trị cần xác nhận/i.test(text)) warn('-', 'Thêm mục "Giá trị cần xác nhận" liệt kê các {giá trị} ở cuối spec');
}
for (const [re, hint] of [[/lưu thật(?! vào)/i, '"lưu thật" → "mọi thao tác ghi vào Lark Base qua Function; tải lại không mất"'], [/dữ liệu giả(?!.*\d)/i, '"dữ liệu giả" → số lượng cụ thể theo bảng'], [/phân quyền chặt/i, '"phân quyền chặt" → liệt kê ai xem/làm gì']]) {
  if (re.test(text)) warn('-', `Cụm mơ hồ: ${hint}`);
}
const words = text.split(/\s+/).filter(Boolean).length;
if (!blueprint && words < 250) warn('-', `Spec khá ngắn (${words} từ) — dễ để agent tự đoán`);
if (words > 3500) warn('-', `Spec dài (${words} từ) — cân nhắc chia giai đoạn`);

const errors = issues.filter((i) => i.level === 'error').length;
const warnings = issues.filter((i) => i.level === 'warn').length;
if (asJson) {
  console.log(JSON.stringify({ file, blueprint, personal, words, blocks: [...blocks.keys()].sort((a, b) => a - b), errors, warnings, issues }, null, 2));
} else {
  const icon = { error: '✘', warn: '!', info: '·' };
  for (const i of issues) console.log(`${icon[i.level]} [${i.block}] ${i.message}`);
  console.log(`\n${file}: ${errors} lỗi, ${warnings} cảnh báo · ${words} từ · ${personal ? 'app cá nhân' : 'app nhóm/giao dịch'}${blueprint ? ' · chế độ mẫu' : ''}`);
}
process.exit(errors ? 1 : 0);

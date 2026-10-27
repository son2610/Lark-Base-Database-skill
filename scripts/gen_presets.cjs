// Generates assets/design-tokens/<preset>.css with an identical variable set for every preset.
const fs = require('fs');
const path = require('path');
const outDir = process.argv[2];
const keys = ['bg','surface','surface-2','surface-3','border','border-strong','text','text-2','text-3','accent','accent-hover','accent-soft','accent-text','success','success-soft','info','info-soft','warning','warning-soft','danger','danger-soft','neutral','neutral-soft','purple','purple-soft','teal','teal-soft','locked','focus'];
const common = [
  '  --radius: 12px;',
  '  --radius-sm: 8px;',
  '  --control-h: 38px;',
  "  --font: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif;",
  "  --mono: ui-monospace, 'Cascadia Code', Consolas, 'Liberation Mono', monospace;",
  '  --font-display: var(--font);',
];
const presets = {
  'ivory-blue': {
    desc: 'Ngà + xanh dương đậm. Đào tạo, LMS, cổng thông tin nội bộ — đáng tin, thoáng. (Đã kiểm thử trong app LMS.)',
    light: ['#f8f6f1','#ffffff','#f3f1ea','#ebe8df','#e5e1d6','#d4cfc1','#1c2230','#4a5263','#6b7383','#1d3f8f','#17337a','#e8eefb','#ffffff','#1c7a4b','#e3f3ea','#2457c5','#e7eefc','#9a5a00','#fbf0db','#b4322a','#fbe7e5','#5f6776','#eeece6','#6941b8','#efe9fb','#0f6f68','#e0f3f1','#9aa0a9','#3d6be0'],
    dark:  ['#111318','#181b22','#1f232c','#272c37','#2b313c','#3a4250','#e8eaef','#b8bfcc','#8f98a8','#7ea6ff','#9bbaff','#1f2b47','#0d1426','#5fc88f','#16301f','#7ea6ff','#1d2a45','#e6b45c','#33280f','#f08a80','#3a1c1a','#9aa3b2','#262b34','#b9a0f5','#2a2140','#5cd0c3','#13302d','#6b7383','#9bbaff'],
    extra: [], shadow: ['0 10px 30px rgba(20, 24, 36, 0.14), 0 2px 6px rgba(20, 24, 36, 0.08)', '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.35)'],
  },
  'warm-gray': {
    desc: 'Xám ấm + xanh rêu trầm, thẻ trắng viền mảnh, bảng gọn. CRM, ERP, công cụ văn phòng — tiền nổi bật, trạng thái tiết chế.',
    light: ['#f5f3ef','#ffffff','#f0ede7','#e7e3db','#e4dfd6','#d2ccc0','#22201c','#4d4943','#75706a','#2f5d50','#264c42','#e4efeb','#ffffff','#286e45','#e3f2e8','#2f62b8','#e6eefb','#9a5b00','#fbefd9','#b3362d','#fbe6e4','#625e57','#edeae4','#6a45b0','#efe9f9','#12706a','#dff2ef','#a19c94','#3b6fd8'],
    dark:  ['#141311','#1c1b18','#24221f','#2d2b27','#312e2a','#403c36','#ece9e4','#c3beb6','#9a948b','#7cc4ae','#95d3bf','#1d332c','#0e1a16','#63c48d','#15301f','#86aaf5','#1d2a45','#e6b55e','#33280f','#f08d82','#3a1c1a','#a29c92','#2a2824','#b9a0f5','#2a2140','#5cd0c3','#13302d','#6e6962','#9bbaff'],
    extra: [], shadow: ['0 10px 30px rgba(28, 24, 18, 0.12), 0 2px 6px rgba(28, 24, 18, 0.08)', '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.35)'],
  },
  'slate-indigo': {
    desc: 'Xám lạnh + chàm. Quy trình, tuyển dụng, trung tâm yêu cầu, sản xuất — rõ ràng, kỹ thuật, trạng thái dễ phân biệt.',
    light: ['#f4f6f9','#ffffff','#eef1f5','#e3e8ef','#dfe4eb','#cbd3de','#1b2230','#445066','#6b778c','#3f46b8','#343aa0','#e9eafb','#ffffff','#1f7a4d','#e2f3e9','#2860c4','#e6eefc','#975a00','#fbf0da','#b3322c','#fbe6e4','#5b6578','#eceff3','#6a42b6','#efe9fb','#0d6f73','#ddf2f2','#9aa3b1','#4a63e0'],
    dark:  ['#10131a','#171b24','#1e2330','#262c3b','#2a3142','#39425a','#e6e9f0','#b6bdcc','#8a93a6','#9ea3ff','#b6baff','#23264a','#0f1130','#5fc88f','#16301f','#7ea6ff','#1d2a45','#e6b45c','#33280f','#f08a80','#3a1c1a','#98a2b3','#252b37','#b9a0f5','#2a2140','#5ccfd3','#123033','#6b7486','#a3b4ff'],
    extra: [], shadow: ['0 10px 30px rgba(18, 24, 40, 0.14), 0 2px 6px rgba(18, 24, 40, 0.08)', '0 12px 32px rgba(0, 0, 0, 0.48), 0 2px 8px rgba(0, 0, 0, 0.35)'],
  },
  'paper-terracotta': {
    desc: 'Giấy kem + nâu đất, tiêu đề chữ có chân. Công cụ cá nhân, đọc sách, nhật ký, nội dung — ấm, dễ đọc.',
    light: ['#f7f2ea','#fffdf9','#f2ebe0','#e9e0d2','#e6dccd','#d4c7b4','#2b231c','#574a3e','#7d6f62','#a4512f','#8c4427','#f6e7df','#ffffff','#356b3c','#e5f1e3','#3a64a8','#e7edf8','#946000','#f8edd6','#ad3a2b','#f9e4df','#665b4f','#efe8dd','#7a4fa3','#f1e9f6','#2c6f66','#e1f0ec','#a99d8f','#3d6be0'],
    dark:  ['#17130f','#201b16','#29231d','#332c25','#3a3129','#4a3f35','#efe7dc','#cbbfb0','#a09383','#e99a74','#f2b090','#3a2419','#1d120c','#7cc88a','#18301b','#8eaee6','#1f2a40','#e3b45f','#33280f','#ef917f','#3b1d17','#a99c8c','#2c2620','#c7a6e6','#2c2138','#6cc9bb','#15302b','#706457','#9bbaff'],
    extra: ["  --font-display: 'Noto Serif', 'Source Serif 4', Georgia, 'Times New Roman', serif;"],
    shadow: ['0 10px 30px rgba(43, 35, 28, 0.12), 0 2px 6px rgba(43, 35, 28, 0.08)', '0 12px 32px rgba(0, 0, 0, 0.48), 0 2px 8px rgba(0, 0, 0, 0.35)'],
  },
  'soft-lavender': {
    desc: 'Nền gradient tím–xanh nhẹ, thẻ trắng bo lớn, nút tím. Hiệu suất cá nhân, sự kiện, cộng đồng — thân thiện, khích lệ.',
    light: ['linear-gradient(160deg, #f3efff 0%, #eaf3ff 100%) fixed','#ffffff','#f4f1fd','#ebe6fa','#e6e1f5','#d3cbea','#221d33','#4c4565','#726b8c','#6b4fd8','#5a40c0','#efeafd','#ffffff','#1d7045','#e2f4e9','#2f66d0','#e6eefc','#9a5b00','#fbefd9','#b8352f','#fbe6e4','#625d77','#efedf5','#6b4fd8','#efeafd','#0f7672','#dff3f1','#a39db6','#6b4fd8'],
    dark:  ['linear-gradient(160deg, #16121f 0%, #101622 100%) fixed','#1b1726','#231e31','#2c263c','#302a42','#433b5a','#ece9f5','#c2bdd3','#9690ab','#b4a2ff','#c6b8ff','#2b2448','#150f2b','#63c48d','#15301f','#86aaf5','#1d2a45','#e6b55e','#33280f','#f08d82','#3a1c1a','#a39fb4','#29253a','#b4a2ff','#2b2448','#5cd0c3','#13302d','#6d6782','#c6b8ff'],
    extra: ['  --radius: 16px;'], shadow: ['0 12px 32px rgba(60, 40, 120, 0.12), 0 2px 6px rgba(60, 40, 120, 0.08)', '0 12px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.35)'],
  },
};
for (const [name, p] of Object.entries(presets)) {
  if (p.light.length !== keys.length || p.dark.length !== keys.length) throw new Error(`${name}: key count mismatch`);
  const block = (vals, shadow) => [...keys.map((k, i) => `  --${k}: ${vals[i]};`), `  --shadow-pop: ${shadow};`];
  const lines = [
    `/* Preset "${name}" — ${p.desc}`,
    ' * Nạp TRƯỚC base.css. Đổi preset = đổi một dòng import. Sáng/tối: <html data-theme="light|dark">. */',
    ':root {', ...block(p.light, p.shadow[0]), ...common, ...p.extra, '  color-scheme: light;', '}',
    ":root[data-theme='dark'] {", ...block(p.dark, p.shadow[1]), '  color-scheme: dark;', '}', '',
  ];
  fs.writeFileSync(path.join(outDir, `${name}.css`), lines.join('\n'));
}
console.log('generated', Object.keys(presets).join(', '));

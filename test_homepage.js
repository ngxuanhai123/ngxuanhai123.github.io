/**
 * TEST SUITE: Trang Chủ HiHi Study (ngxuanhai123.github.io)
 * Kiểm thử toàn diện liên kết, chức năng & bảo mật
 */

const fs = require('fs');
const path = require('path');

const results = [];
function recordResult(name, passed, details) {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TRANG CHỦ: ngxuanhai123.github.io');
  console.log('====================================================\n');

  const dir = __dirname;
  const indexPath = path.join(dir, 'index.html');
  const swPath = path.join(dir, 'sw.js');

  // TEST 1: Cấu trúc file
  try {
    const hasIndex = fs.existsSync(indexPath);
    const hasSw = fs.existsSync(swPath);
    recordResult('1. Cấu trúc file cơ bản', hasIndex && hasSw, `index.html: ${hasIndex}, sw.js: ${hasSw}`);
  } catch (e) {
    recordResult('1. Cấu trúc file cơ bản', false, e.message);
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  // TEST 2: Kiểm tra lỗi escape literal \n trong HTML
  try {
    const hasLiteralSlashN = html.includes('</a>\\n');
    const passed = !hasLiteralSlashN;
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', passed, passed ? 'HTML sạch sẽ, không có lỗi chuỗi escape' : 'Phát hiện literal "\\n" trong mã HTML');
  } catch (e) {
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', false, e.message);
  }

  // TEST 3: Kiểm tra link bamhuyet có dấu gạch chéo chuẩn (tránh redirect 301)
  try {
    const hasBadBamhuyet = html.includes('href="https://ngxuanhai123.github.io/bamhuyet"');
    const passed = !hasBadBamhuyet;
    recordResult('3. Chuẩn hóa đường dẫn bamhuyet/ (tránh redirect)', passed, passed ? 'Đã chuẩn hóa trailing slash' : 'Còn link thiếu dấu gạch chéo cuối');
  } catch (e) {
    recordResult('3. Chuẩn hóa đường dẫn bamhuyet/', false, e.message);
  }

  // TEST 4: Đầy đủ các link dự án hoạt động trên trang chủ
  const requiredApps = [
    { name: 'Từ Vựng', url: 'https://ngxuanhai123.github.io/tuvung/' },
    { name: 'Chính Tả', url: 'https://ngxuanhai123.github.io/chinhta/' },
    { name: 'Luyện Dịch', url: 'https://ngxuanhai123.github.io/dich/' },
    { name: 'Ghi Chú', url: 'https://ngxuanhai123.github.io/note/' },
    { name: 'Bấm Huyệt', url: 'https://ngxuanhai123.github.io/bamhuyet/' },
    { name: 'Mân Côi', url: 'https://ngxuanhai123.github.io/rosa/' },
    { name: 'Dịch iOS', url: 'https://ngxuanhai123.github.io/dich-ios/' },
    { name: 'Tiếng Indo', url: 'https://ngxuanhai123.github.io/indo/' },
    { name: 'Nhắc Học Bài', url: 'https://ngxuanhai123.github.io/nhachocbai/' },
    { name: 'HiHi Analytics', url: 'https://ngxuanhai123.github.io/HiHi-Analytics/' },
    { name: 'MemAIHelper', url: 'https://github.com/ngxuanhai123/MemAIHelper' },
    { name: 'Porn Blocker', url: 'https://github.com/ngxuanhai123/tampermonkey-porn-blocker' }
  ];

  try {
    const missing = requiredApps.filter(app => !html.includes(app.url));
    const passed = missing.length === 0;
    recordResult('4. Cập nhật đầy đủ liên kết tất cả dự án đang hoạt động', passed, passed ? `Đã có đầy đủ ${requiredApps.length} ứng dụng` : `Thiếu ${missing.length} ứng dụng: ${missing.map(m => m.name).join(', ')}`);
  } catch (e) {
    recordResult('4. Cập nhật đầy đủ liên kết', false, e.message);
  }

  // TEST 5: Bảo mật liên kết ngoài target="_blank" có rel="noopener noreferrer"
  try {
    const lines = html.split('\n');
    const violations = [];
    lines.forEach((l, idx) => {
      if (l.includes('target="_blank"') && !l.includes('noopener')) {
        violations.push(`Dòng ${idx+1}: ${l.trim()}`);
      }
    });
    const passed = violations.length === 0;
    recordResult('5. Bảo mật thẻ liên kết ngoài (target="_blank" rel="noopener noreferrer")', passed, passed ? 'Tất cả liên kết ngoài an toàn' : `Phát hiện ${violations.length} liên kết thiếu rel="noopener"`);
  } catch (e) {
    recordResult('5. Bảo mật thẻ liên kết ngoài', false, e.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${results.length} bài test vượt qua`);
  console.log('====================================================\n');
}

runTests();

/**
 * TEST SUITE: Trang Chủ HiHi Portal (ngxuanhai123.github.io)
 * Kiểm thử tính toàn vẹn liên kết, routing và an toàn PWA
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
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', !hasLiteralSlashN, !hasLiteralSlashN ? 'HTML sạch sẽ, không có lỗi chuỗi escape' : 'Phát hiện literal "\\n" trong mã HTML');
  } catch (e) {
    recordResult('2. Kiểm tra lỗi escape literal \\n trong HTML', false, e.message);
  }

  // TEST 3: Đảm bảo đường dẫn bamhuyet/ chuẩn hóa (không thiếu dấu gạch chéo cuối để tránh 301 redirect)
  try {
    const hasCorrectBamHuyet = html.includes('href="https://ngxuanhai123.github.io/bamhuyet/"');
    recordResult('3. Chuẩn hóa đường dẫn bamhuyet/ (tránh redirect)', hasCorrectBamHuyet, hasCorrectBamHuyet ? 'Đã chuẩn hóa trailing slash' : 'Thiếu trailing slash bamhuyet/');
  } catch (e) {
    recordResult('3. Chuẩn hóa đường dẫn bamhuyet/', false, e.message);
  }

  // TEST 4: Đầy đủ các ứng dụng cốt lõi của hệ sinh thái
  const requiredApps = [
    { name: 'Luyện Từ Vựng', url: 'https://ngxuanhai123.github.io/tuvung/' },
    { name: 'Luyện Chính Tả', url: 'https://ngxuanhai123.github.io/chinhta/' },
    { name: 'Luyện Dịch', url: 'https://ngxuanhai123.github.io/dich/' },
    { name: 'Kho Lưu', url: 'https://ngxuanhai123.github.io/note/' },
    { name: 'Bấm Huyệt', url: 'https://ngxuanhai123.github.io/bamhuyet/' },
    { name: 'Lần Hạt Mân Côi', url: 'https://ngxuanhai123.github.io/rosa/' },
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

  // TEST 7: Đảm bảo dự án HiHi Analytics đã được xóa vĩnh viễn
  try {
    const hasAnalytics = html.includes('HiHi-Analytics');
    recordResult('7. Đảm bảo xóa vĩnh viễn HiHi-Analytics khỏi hệ thống', !hasAnalytics, !hasAnalytics ? 'Không còn dấu vết của HiHi-Analytics' : 'Vẫn còn sót liên kết HiHi-Analytics');
  } catch (e) {
    recordResult('7. Đảm bảo xóa vĩnh viễn HiHi-Analytics', false, e.message);
  }

  // TEST 8: Đảm bảo đã loại bỏ thẻ Dịch iOS, Tiếng Indo, Nhắc Học Bài khỏi lưới trang chủ & modal
  try {
    const mainStart = html.indexOf('<main class="container">');
    const mainEnd = html.indexOf('</main>', mainStart);
    const mainHtml = html.substring(mainStart, mainEnd);
    const inMain = mainHtml.includes('/dich-ios/') || mainHtml.includes('/indo/') || mainHtml.includes('ngxuanhai123.github.io/nhachocbai/');
    
    const mStart = html.indexOf('id="hihiSysModalOverlay"');
    const mEnd = html.indexOf('</div>\n  </div>\n</div>', mStart) !== -1
      ? html.indexOf('</div>\n  </div>\n</div>', mStart)
      : html.indexOf('</div>\r\n  </div>\r\n</div>', mStart);
    const mHtml = html.substring(mStart, mEnd !== -1 ? mEnd : mStart + 4000);
    const inModal = mHtml.includes('/dich-ios/') || mHtml.includes('/indo/') || mHtml.includes('ngxuanhai123.github.io/nhachocbai/');

    const clean = !inMain && !inModal;
    recordResult('8. Đảm bảo loại bỏ thẻ Dịch iOS, Tiếng Indo, Nhắc Học Bài', clean, clean ? 'Lưới chính và modal đã sạch sẽ, đồng bộ 100%' : 'Vẫn còn sót thẻ trên lưới chính hoặc modal');
  } catch(e) {
    recordResult('8. Đảm bảo loại bỏ thẻ', false, e.message);
  }

  // TEST 6: Đồng bộ Bảng Xếp Hạng toàn hệ sinh thái & Single Sign-On (SSO)
  try {
    const hasSharedConfig = html.includes('tuvung-88e8d');
    const hasHihiLbSync = html.includes('hihi_leaderboard') && html.includes('hihiLeaderboardModal');
    const hasAuth = html.includes('window.hihiAuth');
    const passed = hasSharedConfig && hasHihiLbSync && hasAuth;
    recordResult('6. Đồng bộ Bảng Xếp Hạng toàn hệ sinh thái & Single Sign-On (SSO)', passed, passed ? 'Đã liên kết hihi_leaderboard & SSO tuvung-88e8d' : 'Chưa đồng bộ BXH chung');
  } catch (e) {
    recordResult('6. Đồng bộ Bảng Xếp Hạng toàn hệ sinh thái & Single Sign-On (SSO)', false, e.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${results.length} bài test vượt qua`);
  console.log('====================================================\n');
}

runTests();

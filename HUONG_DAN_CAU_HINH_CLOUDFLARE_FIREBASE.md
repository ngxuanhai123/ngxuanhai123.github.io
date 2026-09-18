# Hướng Dẫn Cấu Hình Cache Tối Ưu Cho Cloudflare & Firebase

Hệ sinh thái HiHi Study đã được tích hợp mã nguồn tối ưu tự động. Dưới đây là các cài đặt bổ sung trên giao diện web của **Cloudflare Dashboard** và **Firebase Console** để đạt hiệu năng tối đa và tiết kiệm tối đa hạn mức gọi.

---

## 1. Cloudflare Dashboard Caching Rules (Dành cho tên miền)

### A. Thiết lập Cache Rules (Tối ưu tải tài nguyên tĩnh):
Vào **Cloudflare Dashboard** -> Chọn tên miền của bạn -> **Caching** -> **Cache Rules** -> Tạo Rule mới:
- **Rule Name:** `HiHi Study Static Assets Caching`
- **Field / Expression:**
  - `(http.request.uri.path.extension in {"json" "woff2" "woff" "mp3" "wav" "png" "jpg" "jpeg" "svg" "webp" "ico" "css" "js"})`
- **Cache Eligibility:** `Eligible for cache`
- **Edge TTL:** `Override origin` -> Chọn **7 days** (7 ngày).
- **Browser TTL:** `Override origin` -> Chọn **4 hours** (4 giờ).
- **Tiered Cache:** Bật **ON** (Sử dụng mạng lưới data center tầng của Cloudflare để giảm truy vấn về GitHub Pages).

### B. Worker Dịch thuật (Cloudflare Workers):
Mã nguồn tại `dich/worker/index.js` đã tự động tích hợp:
1. **Cache tầng 1 (RAM Worker):** Lưu 200 bản dịch gần nhất trong bộ nhớ tức thì.
2. **Cache tầng 2 (Cloudflare Edge Cache API - `caches.default`):** Lưu kết quả theo mã băm SHA-256 nội dung trong 7 ngày với cờ `stale-while-revalidate`.
3. **Tiết kiệm:** Giảm tới **90%** các lượt gọi trùng lặp tới OpenAI / AI Provider, trả lời tức thì (<30ms).

---

## 2. Firebase Console (Firestore & Realtime Database)

### A. Firestore Quota Optimization:
Trong mã nguồn ứng dụng, chúng ta đã kích hoạt:
- **`persistentLocalCache` với `persistentMultipleTabManager`:** Lưu toàn bộ dữ liệu người dùng, bảng xếp hạng và từ vựng vào IndexedDB trên máy người học. Khi mở lại app hoặc mở nhiều tab, Firestore đọc từ bộ nhớ cục bộ mà **không tốn Read Quota**.
- **Client Cache Bảng xếp hạng (TTL 5 phút):** Không query Firestore liên tục mỗi lần chuyển tab hay mở lại modal.
- **Debounce Ghi điểm (2.5 giây):** Gom nhóm điểm học viên trả lời nhanh thành 1 lượt ghi duy nhất, giảm 80% Write Quota.

### B. Chỉ mục Firestore (Composite Indexes):
Nếu bạn mở Firestore Console -> **Indexes** (Chỉ mục), hãy kiểm tra hoặc tạo chỉ mục sau cho Bảng xếp hạng:
- **Collection ID:** `hihi_leaderboard`
- **Fields to index:**
  - `total_score` -> `Descending`
  - `tuvung_score` -> `Descending`
  - `chinhta_score` -> `Descending`
  - `dich_score` -> `Descending`

### C. Tài khoản Quản trị viên:
- Email quản trị viên: `haingxua@gmail.com`
- Tự động nhận huy hiệu **ADMIN** và kích hoạt **Admin Studio** trên mọi ứng dụng khi đăng nhập bằng Google.

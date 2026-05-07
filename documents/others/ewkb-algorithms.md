# Khám Phá Các Thuật Toán Xử Lý Dữ Liệu Bản Đồ (Spatial Data)

Trong quá trình phát triển các tính năng bản đồ cho ứng dụng, việc xử lý dữ liệu địa lý là vô cùng quan trọng. Dưới đây là giải thích chi tiết và dễ hiểu nhất về các thuật toán cốt lõi được sử dụng trong file `ewkb-parser.ts` để bạn có thể dễ dàng trình bày trên website hoặc tài liệu dự án.

---

## 1. Thuật toán Giải mã EWKB (Extended Well-Known Binary Parsing)

### Vấn đề:
Cơ sở dữ liệu (như PostGIS) thường lưu trữ hình học của các khu vực (điểm, đường, đa giác) dưới dạng một chuỗi nhị phân siêu nén gọi là **EWKB** (được biểu diễn dưới dạng chuỗi Hexadecimal) để tiết kiệm dung lượng. Tuy nhiên, ứng dụng (React Native/Web) lại cần dữ liệu dạng tọa độ (Kinh độ/Vĩ độ) để vẽ lên bản đồ.

### Cách hoạt động:
Thuật toán này đóng vai trò như một "phiên dịch viên", đọc chuỗi hex khó hiểu và dịch nó thành mảng tọa độ quen thuộc.
    
1.  **Đọc cấu trúc (BinaryReader):** Thuật toán đọc từng byte của chuỗi hex để biết:
    *   **Byte Order (Endianness):** Cách đọc dữ liệu từ trái sang phải hay phải sang trái.
    *   **Geometry Type:** Loại hình học này là gì (Point - Điểm, Polygon - Đa giác, hay MultiPolygon - Nhiều đa giác kết hợp).
2.  **Trích xuất Tọa độ:** Tùy thuộc vào loại hình học, thuật toán sẽ đọc lần lượt các con số (kiểu Float64) tương ứng với Kinh độ (Longitude) và Vĩ độ (Latitude) và gom chúng lại thành các mảng tọa độ có cấu trúc (GeoJSON-like).

> 💡 **Ví dụ dễ hiểu:** Giống như bạn nhận được một bức thư viết bằng mã Morse. Thuật toán này sẽ tra bảng mã Morse để dịch từng tín hiệu thành các từ ngữ tiếng Việt có ý nghĩa.

---

## 2. Thuật toán Ray-casting (Kiểm tra Điểm nằm trong Đa giác - Point in Polygon)

Đây là một trong những thuật toán kinh điển và thú vị nhất trong hình học tính toán!

### Vấn đề:
Làm sao để hệ thống biết được tọa độ hiện tại của người dùng (một Điểm) có đang nằm trong ranh giới của một phường/xã (một Đa giác - Polygon) hay không?

### Cách hoạt động (Ray-casting Algorithm):
1.  **Phóng tia:** Từ vị trí của người dùng (Điểm), thuật toán tưởng tượng việc "bắn" ra một tia sáng thẳng về một hướng bất kỳ (thường là dọc theo trục ngang X).
2.  **Đếm số giao điểm:** Nó sẽ đếm xem tia sáng này cắt ngang qua bao nhiêu cạnh của khu vực (Đa giác).
3.  **Quy tắc Chẵn/Lẻ:**
    *   Nếu số lần cắt là **Lẻ** (1, 3, 5...): Điểm đó nằm **BÊN TRONG** khu vực.
    *   Nếu số lần cắt là **Chẵn** (0, 2, 4...): Điểm đó nằm **BÊN NGOÀI** khu vực.

> 💡 **Ví dụ dễ hiểu:** Tưởng tượng bạn đang đứng ở đâu đó và đi thẳng về một hướng cho đến khi ra khỏi thành phố. Mỗi lần bạn bước qua bức tường thành (cạnh của đa giác), bạn đếm lên 1. Nếu bạn đếm được số lẻ (ví dụ 1 lần: từ trong đi ra ngoài), tức là ban đầu bạn ở trong thành. Nếu bạn đếm số chẵn (ví dụ 2 lần: đi từ ngoài vào rồi lại đi ra), tức là ban đầu bạn ở ngoài thành!

---

## 3. Thuật toán Tìm Hộp Giới Hạn (Bounding Box)

### Vấn đề:
Khi ứng dụng cần hiển thị trọn vẹn một khu vực (ví dụ: Quận 1) lên màn hình điện thoại, làm sao để tính toán được mức độ "Zoom" và vị trí trung tâm chuẩn xác nhất của bản đồ?

### Cách hoạt động (`getBoundsFromCoords`):
1.  **Duyệt qua tất cả tọa độ:** Thuật toán đi qua mọi điểm ranh giới của khu vực đó.
2.  **Tìm Cực trị:** Nó tìm ra 4 giá trị:
    *   Vĩ độ xa nhất về phía Bắc (Max Latitude)
    *   Vĩ độ xa nhất về phía Nam (Min Latitude)
    *   Kinh độ xa nhất về phía Đông (Max Longitude)
    *   Kinh độ xa nhất về phía Tây (Min Longitude)
3.  **Tạo khung hình chữ nhật:** Từ 4 điểm cực trị này, hệ thống vẽ ra một "hộp giới hạn" (Bounding Box) ôm trọn lấy toàn bộ khu vực.
4.  **Tính toán cho Bản đồ:** Lấy trung bình cộng để tìm điểm Trung tâm (Center) và khoảng cách giữa các cực để tính độ Zoom (Delta), có cộng thêm một chút "padding" (khoảng lề) để khu vực không bị sát mép màn hình.

---

## 4. Tối ưu hóa Luồng Kiểm tra (Early Exit trong `isPointInAdminArea`)

### Vấn đề:
Việc chạy thuật toán Ray-casting cho một tỉnh thành lớn (gồm hàng ngàn tọa độ và rất nhiều đa giác nhỏ - MultiPolygon) có thể làm đơ ứng dụng nếu không xử lý khéo.

### Cách hoạt động:
Thuật toán `isPointInAdminArea` kết hợp cả giải mã và Ray-casting một cách thông minh:
1.  **Kiểm tra nhanh:** Nó kiểm tra xem chuỗi dữ liệu có rỗng không, tránh việc xử lý thừa.
2.  **Tách Đa giác:** Thay vì gộp chung, nó tách MultiPolygon thành danh sách các Đa giác đơn lẻ.
3.  **Early Exit (Thoát Sớm):** Nó lần lượt dùng thuật toán Ray-casting (số 2) để kiểm tra từng đa giác. **Ngay khi** phát hiện điểm nằm trong đa giác đầu tiên, thuật toán lập tức trả về `true` (Đúng) và **dừng lại ngay lập tức**, bỏ qua việc kiểm tra các đa giác còn lại. Điều này giúp tăng tốc độ xử lý lên rất nhiều lần trong thực tế!

---
*Tài liệu này được biên soạn để giúp các nhà phát triển và người dùng dễ dàng hiểu được logic không gian (spatial logic) đằng sau ứng dụng.*

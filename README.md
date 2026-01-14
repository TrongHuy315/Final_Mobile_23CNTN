## Setup & Run Project (React Native + Expo Go)

Yêu cầu môi trường:
- Node.js phiên bản LTS (khuyến nghị 18.x hoặc 20.x)
- npm hoặc yarn
- Điện thoại cài sẵn **Expo Go** (Android/iOS)

Kiểm tra Node:
```bash
node -v
```

### 1. Clone project và cài dependency
#### 1.1 Clone repo
```
git clone https://github.com/TrongHuy315/Final_Mobile_23CNTN.git
```

#### 1.2 Di chuyển vào thư mục dự án
```
cd Final_Mobile_23CNTN/alarmy
```

#### 1.3 Cài đặt packages trong dự án
```
npm install
```

hoặc nếu dùng yarn:

```
yarn install
```

### 2. Chạy ứng dụng
```
npx expo start
```

Sau khi chạy, terminal sẽ hiện QR code.

### 3. Mở app bằng Expo Go

Android:

```
Mở Expo Go → Scan QR code
```

iOS:

```
Mở Camera → Quét QR code → Open bằng Expo Go
```

Ứng dụng sẽ chạy trực tiếp trên điện thoại mà không cần build APK/IPA.

### 4. Đăng nhập Expo
Chạy lệnh sau ở terminal (chỉ cần làm lần đầu)
```
npx expo login
```

Nếu chưa có tài khoản expo cần thực hiện tạo tài khoản tại `https://expo.dev`

### 5. Chạy chương trình
Sử dụng lệnh sau để xem ứng dụng chạy
```
npx expo start
```

Khi đã chạy, sử dụng QR camera (IOS) hoặc camera trong ứng dụng Expo Go (Android) để quét mã QR ở terminal đang chạy.  

#### Lưu ý:
- Mỗi khi code trong thư mục dự án được cập nhật, thay đổi sẽ được cập nhật trực tiếp lên giao diện Expo Go đang chạy ứng dụng.  
- Xóa file hoặc thay đổi cấu hình ứng dụng cần xóa cache với lệnh `npx expo clean` và chạy lại chương trình.  


# API Count Document Pages

API đơn giản để đếm số trang của file DOCX và PPTX từ URL sử dụng ExpressJS và thư viện `page-count`.

## Cài đặt

```bash
npm install
```

## Chạy server

```bash
# Chạy production
npm start

# Chạy development với nodemon (tự động restart khi có thay đổi)
npm run dev
```

Server sẽ chạy tại `http://localhost:3000` (hoặc port được chỉ định trong biến môi trường `PORT`).

## API Endpoint

### POST /api/count-pages

Đếm số trang của file DOCX từ URL.

**Request Body:**
```json
{
  "fileUrl": "https://example.com/document.docx"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "pageCount": 10,
  "fileType": "docx",
  "fileUrl": "https://example.com/document.docx"
}
```

**Response Error (400/404/500):**
```json
{
  "success": false,
  "error": "Thông báo lỗi"
}
```

## Ví dụ sử dụng

### Sử dụng cURL

```bash
curl -X POST http://localhost:3000/api/count-pages \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "https://example.com/document.docx"}'
```

### Sử dụng JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/count-pages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileUrl: 'https://example.com/document.docx'
  })
});

const data = await response.json();
console.log(data);
```

### Sử dụng Axios

```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/count-pages', {
  fileUrl: 'https://example.com/document.docx'
});

console.log(response.data);
```

## Các định dạng được hỗ trợ

API hỗ trợ các định dạng file sau:

| Định dạng | Mô tả | Ví dụ |
|-----------|-------|-------|
| **DOCX** | Microsoft Word 2007+ | `document.docx` |
| **PPTX** | Microsoft PowerPoint | `presentation.pptx` |

## Các endpoint khác

### GET /health
Kiểm tra trạng thái server.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /
Thông tin về API và cách sử dụng.

## Lưu ý

- API hỗ trợ file có kích thước tối đa 50MB
- Timeout mặc định là 30 giây
- File phải có thể truy cập công khai hoặc server phải có quyền truy cập
- **Các định dạng được hỗ trợ**: DOCX, PPTX
- API tự động phát hiện loại file từ magic numbers và extension

## Xử lý lỗi

API sẽ trả về các mã lỗi phù hợp:

- **400**: URL không hợp lệ, thiếu tham số, hoặc file không phải DOCX/DOC
- **403**: Không có quyền truy cập file
- **404**: File không tồn tại hoặc không thể kết nối đến URL
- **408**: Request timeout
- **500**: Lỗi khi xử lý file (file hỏng, không tương thích, v.v.)

## Deploy lên Vercel

Dự án đã được cấu hình sẵn để deploy lên Vercel. Xem file [DEPLOY.md](./DEPLOY.md) để biết hướng dẫn chi tiết.

### Quick Deploy

1. Push code lên GitHub
2. Vào [Vercel Dashboard](https://vercel.com/dashboard)
3. Import repository
4. Click Deploy

Vercel sẽ tự động detect cấu hình từ `vercel.json` và deploy.

## Dependencies

- `express`: Web framework cho Node.js
- `axios`: HTTP client để fetch file từ URL
- `page-count`: Thư viện đếm số trang của file DOCX và PPTX


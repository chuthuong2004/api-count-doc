# Hướng dẫn Deploy lên Vercel

Hướng dẫn chi tiết để deploy API đếm số trang DOCX/PPTX lên Vercel.

## Yêu cầu

- Tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))
- Tài khoản GitHub (để kết nối repository)
- Dự án đã được push lên GitHub

## Các bước deploy

### 1. Chuẩn bị dự án

Đảm bảo các file sau đã có trong dự án:
- `package.json` - với các dependencies cần thiết
- `server.js` - file chính của Express app
- `vercel.json` - file cấu hình Vercel (đã được tạo)

### 2. Push code lên GitHub

Nếu chưa có repository trên GitHub:

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: API count document pages"

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push lên GitHub
git push -u origin main
```

### 3. Deploy lên Vercel

#### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import repository từ GitHub:
   - Chọn repository của bạn
   - Click **"Import"**
4. Cấu hình project:
   - **Framework Preset**: Không cần chọn (hoặc chọn "Other")
   - **Root Directory**: `./` (mặc định)
   - **Build Command**: Để trống (không cần build)
   - **Output Directory**: Để trống
   - **Install Command**: `npm install` (mặc định)
5. Click **"Deploy"**
6. Chờ quá trình deploy hoàn tất (thường mất 1-2 phút)

#### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
```bash
npm install -g vercel
```

2. Đăng nhập:
```bash
vercel login
```

3. Deploy:
```bash
# Deploy lần đầu (sẽ hỏi một số câu hỏi)
vercel

# Deploy production
vercel --prod
```

### 4. Kiểm tra deployment

Sau khi deploy thành công, bạn sẽ nhận được:
- **Production URL**: `https://your-project-name.vercel.app`
- **Preview URL**: `https://your-project-name-xxx.vercel.app`

Test API:
```bash
curl -X POST https://your-project-name.vercel.app/api/count-pages \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "https://example.com/document.docx"}'
```

## Cấu hình Vercel

### File `vercel.json`

File `vercel.json` đã được tạo với cấu hình cơ bản:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Environment Variables (Nếu cần)

Nếu bạn cần cấu hình environment variables:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm các biến môi trường cần thiết
3. Redeploy project để áp dụng thay đổi

## Giới hạn và lưu ý

### Timeout
- **Hobby plan**: 10 giây timeout cho serverless functions
- **Pro plan**: 60 giây timeout
- Nếu cần xử lý file lớn, có thể cần nâng cấp plan

### Memory
- Mặc định: 1024 MB
- Có thể tăng trong `vercel.json` nếu cần

### File Size
- API hiện tại giới hạn file 50MB
- Vercel có giới hạn request body size

### Cold Start
- Serverless functions có thể có cold start lần đầu
- Thời gian cold start thường < 1 giây

## Troubleshooting

### Lỗi: "Module not found"
- Đảm bảo tất cả dependencies đã được khai báo trong `package.json`
- Kiểm tra `node_modules` đã được commit (không nên commit)

### Lỗi: "Function timeout"
- Tăng `maxDuration` trong `vercel.json`:
```json
{
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

### Lỗi: "Memory limit exceeded"
- Tăng memory trong `vercel.json`:
```json
{
  "functions": {
    "server.js": {
      "memory": 2048
    }
  }
}
```

## Cập nhật deployment

Mỗi khi push code mới lên GitHub:
- Vercel sẽ tự động tạo preview deployment
- Để deploy lên production, vào Dashboard và click "Promote to Production"
- Hoặc sử dụng Vercel CLI: `vercel --prod`

## Tài liệu tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Deploy Express.js to Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Serverless Functions](https://vercel.com/docs/functions)


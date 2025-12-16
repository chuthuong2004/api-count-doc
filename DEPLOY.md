# Hướng dẫn Deploy lên Vercel

Hướng dẫn chi tiết để deploy API đếm số trang DOCX/PPTX lên Vercel.

> 💡 **Tham khảo**: Hướng dẫn này được viết dựa trên best practices từ các dự án thành công như [selfhost-deeplink-demo](https://github.com/chuthuong2004/selfhost-deeplink-demo)

## Yêu cầu

- Tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))
- Tài khoản GitHub (để kết nối repository)
- Dự án đã được push lên GitHub
- Node.js >= 16.x (Vercel hỗ trợ Node.js 18.x và 20.x)

## Các bước deploy

### 1. Chuẩn bị dự án

Đảm bảo các file sau đã có trong dự án:
- `package.json` - với các dependencies cần thiết
- `server.js` - file chính của Express app (đã export app cho Vercel)
- `vercel.json` - file cấu hình Vercel (đã được tạo)
- `.vercelignore` - file để ignore các file không cần thiết khi deploy
- `.gitignore` - file để ignore các file không cần commit

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
   - **Build Command**: Để trống (không cần build cho Express)
   - **Output Directory**: Để trống
   - **Install Command**: `npm install` (mặc định)
   - **Environment Variables**: Thêm nếu cần (ví dụ: `NODE_ENV=production`)
5. Click **"Deploy"**
6. Chờ quá trình deploy hoàn tất (thường mất 1-2 phút)
7. Vercel sẽ tự động detect `vercel.json` và cấu hình đúng

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

File `vercel.json` đã được tạo với cấu hình tối ưu:

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

**Giải thích:**
- `version: 2`: Sử dụng Build Output API v2
- `builds`: Chỉ định file `server.js` sử dụng `@vercel/node` builder
- `routes`: Route tất cả requests đến `server.js`

**Lưu ý**: Không thể sử dụng `builds` và `functions` cùng lúc trong `vercel.json`. Để cấu hình timeout, xem phần "Cấu hình Timeout" bên dưới.

### File `.vercelignore`

File `.vercelignore` đã được tạo để loại bỏ các file không cần thiết khi deploy:
- `node_modules` (sẽ được install trên Vercel)
- `.env` files (sử dụng Environment Variables trong Vercel Dashboard)
- Log files và cache

### Environment Variables (Nếu cần)

Nếu bạn cần cấu hình environment variables:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm các biến môi trường cần thiết:
   - `NODE_ENV=production` (khuyến nghị)
   - Các API keys hoặc secrets khác nếu có
3. Chọn môi trường: Production, Preview, hoặc Development
4. Click **"Save"**
5. Redeploy project để áp dụng thay đổi

**Lưu ý**: Không commit file `.env` vào Git. Sử dụng Environment Variables trong Vercel Dashboard.

### Cấu hình Timeout

Vì không thể dùng `functions` cùng với `builds`, để cấu hình timeout:

**Cách 1: Qua Vercel Dashboard (Khuyến nghị)**
1. Vào Vercel Dashboard → Project → Settings → Functions
2. Tìm function `server.js`
3. Cấu hình `maxDuration` (giây)
   - Hobby plan: tối đa 10 giây
   - Pro plan: tối đa 60 giây

**Cách 2: Sử dụng Build Output API v3**
Nếu cần cấu hình chi tiết hơn, có thể chuyển sang Build Output API v3 (không dùng `builds`). Xem [Vercel Documentation](https://vercel.com/docs/build-output-api) để biết thêm.

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
- Cấu hình `maxDuration` trong Vercel Dashboard:
  1. Vào Project → Settings → Functions
  2. Tìm function `server.js`
  3. Tăng `maxDuration` (Hobby: 10s, Pro: 60s)
- Hoặc nâng cấp lên Pro plan để có timeout lâu hơn

### Lỗi: "Memory limit exceeded"
- Cấu hình memory trong Vercel Dashboard:
  1. Vào Project → Settings → Functions
  2. Tìm function `server.js`
  3. Tăng memory allocation
- Hoặc optimize code để giảm memory usage

### Lỗi: "The `functions` property cannot be used in conjunction with the `builds` property"
- **Nguyên nhân**: Không thể dùng `builds` và `functions` cùng lúc trong `vercel.json`
- **Giải pháp**: Xóa phần `functions` khỏi `vercel.json`, chỉ giữ `builds` và `routes`
- Cấu hình timeout/memory qua Vercel Dashboard thay vì trong `vercel.json`

## Cập nhật deployment

### Auto-deploy từ GitHub

Mỗi khi push code mới lên GitHub:
- Vercel sẽ tự động tạo **preview deployment** cho mỗi commit
- Preview URL: `https://your-project-name-git-branch.vercel.app`
- Production URL: `https://your-project-name.vercel.app`

### Deploy Production

Có 2 cách:

1. **Từ Dashboard**:
   - Vào Vercel Dashboard → Project → Deployments
   - Chọn preview deployment muốn promote
   - Click **"Promote to Production"**

2. **Từ CLI**:
   ```bash
   vercel --prod
   ```

3. **Từ GitHub** (khuyến nghị):
   - Push code lên branch `main` hoặc `master`
   - Vercel tự động deploy lên production (nếu đã cấu hình)

### Custom Domain

1. Vào Vercel Dashboard → Project → Settings → Domains
2. Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn của Vercel
4. Chờ DNS propagate (thường 5-10 phút)

## Best Practices (Tham khảo từ các dự án thành công)

### 1. Cấu trúc Project
- Giữ code gọn gàng, dễ maintain
- Tách biệt logic thành modules nếu cần
- Sử dụng `.vercelignore` để optimize build size

### 2. Error Handling
- Luôn có error handling cho tất cả routes
- Log errors để debug dễ dàng
- Trả về error messages rõ ràng cho client

### 3. Performance
- Sử dụng caching khi có thể
- Optimize dependencies (chỉ install những gì cần)
- Monitor function execution time

### 4. Security
- Không commit secrets vào Git
- Sử dụng Environment Variables cho sensitive data
- Implement rate limiting nếu cần

### 5. Monitoring
- Sử dụng Vercel Analytics để track performance
- Monitor function logs trong Vercel Dashboard
- Set up alerts cho errors

## Tài liệu tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Deploy Express.js to Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Build Output API](https://vercel.com/docs/build-output-api)
- [Example: selfhost-deeplink-demo](https://github.com/chuthuong2004/selfhost-deeplink-demo) - Tham khảo cách deploy thành công


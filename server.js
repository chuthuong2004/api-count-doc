const express = require('express');
const axios = require('axios');
const pageCount = require('page-count').default;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

/**
 * API endpoint để đếm số trang của file từ URL
 * POST /api/count-pages
 * Body: { "fileUrl": "https://example.com/document.docx" }
 * 
 * Hỗ trợ các định dạng:
 * - DOCX (Word documents)
 * - PPTX (PowerPoint presentations)
 */
app.post('/api/count-pages', async (req, res) => {
  try {
    const { fileUrl } = req.body;

    // Validate input
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu tham số fileUrl. Vui lòng cung cấp URL của file.'
      });
    }

    // Validate URL format
    try {
      new URL(fileUrl);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'URL không hợp lệ.'
      });
    }

    // Fetch file từ URL
    console.log(`Đang tải file từ: ${fileUrl}`);
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
      maxContentLength: 50 * 1024 * 1024, // 50MB max file size
    });

    // Convert response data to Buffer
    const fileBuffer = Buffer.from(response.data);

    // Detect file type từ magic numbers và extension
    const fileType = detectFileType(fileBuffer, fileUrl);
    
    if (!fileType) {
      return res.status(400).json({
        success: false,
        error: 'Định dạng file không được hỗ trợ. Hỗ trợ: DOCX, PPTX.'
      });
    }

    console.log(`Đã phát hiện file type: ${fileType.format}`);
    console.log('Đang đếm số trang...');

    let count;
    try {
      // Sử dụng page-count để đếm số trang
      count = await pageCount(fileBuffer, fileType.format);
    } catch (processingError) {
      console.error('Lỗi khi xử lý file:', processingError);
      return res.status(500).json({
        success: false,
        error: `Không thể đếm số trang cho file ${fileType.format.toUpperCase()}. File có thể bị hỏng hoặc không tương thích. Chi tiết: ${processingError.message}`
      });
    }

    // Trả về kết quả
    res.json({
      success: true,
      pageCount: count,
      fileType: fileType.format,
      fileUrl: fileUrl
    });

  } catch (error) {
    console.error('Lỗi khi xử lý:', error.message);
    console.error('Stack trace:', error.stack);

    // Xử lý các loại lỗi khác nhau
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(404).json({
        success: false,
        error: 'Không thể kết nối đến URL được cung cấp. Vui lòng kiểm tra lại URL.'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout. File quá lớn hoặc server phản hồi chậm. Vui lòng thử lại sau.'
      });
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: 'File không tồn tại tại URL được cung cấp.'
        });
      }
      if (status === 403) {
        return res.status(403).json({
          success: false,
          error: 'Không có quyền truy cập file. File có thể yêu cầu xác thực.'
        });
      }
      if (status >= 500) {
        return res.status(502).json({
          success: false,
          error: 'Server lưu trữ file đang gặp sự cố. Vui lòng thử lại sau.'
        });
      }
    }

    // Nếu đã có response được gửi (từ các catch block bên trong)
    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Lỗi khi xử lý file: ' + error.message
    });
  }
});

/**
 * Phát hiện loại file từ magic numbers và extension
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} fileUrl - URL của file để lấy extension
 * @returns {Object|null} - Object chứa format, hoặc null nếu không hỗ trợ
 */
function detectFileType(fileBuffer, fileUrl) {
  const fileHeader = fileBuffer.slice(0, 4);
  const extension = fileUrl.split('.').pop().toLowerCase();

  // Magic number cho ZIP files (DOCX và PPTX đều là ZIP files)
  const zipMagicNumber = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
  const isZip = fileHeader.equals(zipMagicNumber);

  // Chỉ hỗ trợ DOCX và PPTX
  if (isZip) {
    if (extension === 'docx') {
      return { format: 'docx' };
    }
    if (extension === 'pptx') {
      return { format: 'pptx' };
    }
  }

  // Fallback: dựa vào extension nếu magic number không khớp
  if (extension === 'docx' || extension === 'pptx') {
    return { format: extension };
  }

  return null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API đếm số trang cho file Word và PowerPoint',
    supportedFormats: ['DOCX', 'PPTX'],
    endpoint: 'POST /api/count-pages',
    examples: [
      {
        method: 'POST',
        url: '/api/count-pages',
        body: {
          fileUrl: 'https://example.com/document.docx'
        }
      },
      {
        method: 'POST',
        url: '/api/count-pages',
        body: {
          fileUrl: 'https://example.com/presentation.pptx'
        }
      }
    ]
  });
});

// Export app cho Vercel serverless functions
module.exports = app;

// Start server chỉ khi chạy local (không phải trên Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`API endpoint: POST http://localhost:${PORT}/api/count-pages`);
  });
}


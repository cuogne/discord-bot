import { GeminiConfigError } from '../../../core/gemini/config.ts';
import { isTimeoutError } from '../../../core/gemini/errors.ts';
import { GeminiAttachmentError } from '../utils/attachment.ts';

export function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof GeminiConfigError) {
    return 'Chưa cấu hình GEMINI_MODELS, không thể sử dụng lệnh này.';
  }

  if (error instanceof GeminiAttachmentError) {
    return 'Không thể xử lý ảnh hoặc file PDF. Vui lòng kiểm tra định dạng và kích thước file.';
  }

  if (isTimeoutError(error)) {
    return 'AI dỏm nên phản hồi hơi lâu, hãy donate cho chủ bot để nâng cấp model.';
  }

  return 'Đã xảy ra lỗi khi gọi Gemini. Vui lòng thử lại.';
}

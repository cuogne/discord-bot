import { GoogleGenAI } from '@google/genai';
import { getContentFromURL } from './getContent.js';
import 'dotenv/config';

export async function summarizeNewsWithGemini(content){
  if (!process.env.GEMINI_API_KEY) {
    console.log("ko co api key")
    return "";
  }

  if (!content || content.trim() === "") {
    return "";
  }

  const prompt = `
		Bạn là một biên tập viên tóm tắt tin tức chuyên nghiệp. Nhiệm vụ của bạn là:
		- Tóm tắt nội dung tin tức sau không vượt quá 3 dòng -> người dùng sẽ cảm thấy quá dài và không đọc (Bắt buộc - Key).
		- Văn phong tóm tắt phải tự nhiên, không quá máy móc, bám sát nội dung bài viết.
		- Phải đi qua đủ hết nội dung của trang web, tóm tắt lại đầy đủ -> người dùng chưa cần ấn vào link vẫn có thể nắm được sơ qua nội dung chính của bài viết.
		- Chọn những dòng quan trọng/hấp dẫn để tóm tắt -> người dùng hứng thú -> vào link đọc tiếp.
		- Không cần chào hỏi, vô thẳng nội dung chính, không cần nói thêm gì khác.
		- Nếu tóm tắt xong, nội dung có câu: Trang web này sử dụng cookie, thì không ghi đoạn này, nếu không đủ nội dung thì để rỗng.
		Nội dung bài viết như sau: ${content}`;

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const rawText = typeof response.text === 'function' ? await response.text() : response.text;
    const result = (rawText ?? '').toString();

    return result
  } catch (err) {
    console.error('Gemini command error:', err);
    return "";
  }
}
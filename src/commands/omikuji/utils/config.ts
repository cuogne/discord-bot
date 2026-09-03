export const OMIKUJI_RESULTS = [
  'Đại cát',
  'Trung cát',
  'Tiểu cát',
  'Cát',
  'Bán cát',
  'Mạt cát',
  'Mạt tiểu cát',
  'Bán hung',
  'Tiểu hung',
  'Hung',
  'Mạt hung',
  'Đại hung',
];

export const TOPICS = [
  'nhân duyên',
  'học hành',
  'công việc',
  'tài vận',
  'sức khỏe',
  'viễn hành',
  'gia đạo',
  'tâm nguyện',
  'giao tế',
  'quyết định',
  'kinh doanh',
  'sự nghiệp',
  'thời vận',
  'tin tức',
  'thất lạc',
  'di cư',
  'sáng tạo',
  'tĩnh tâm',
  'tranh chấp',
  'danh tiếng',
  'quý nhân',
  'ngôn từ',
  'đầu tư',
  'trực giác',
  'thử thách',
];

export const OMIKUJI_EMBED_COLOR = 0xffd700;

export function buildOmikujiPrompt(omikujiName: string, topic: string): string {
  return `Hãy đóng vai một thầy bói Nhật Bản uyên thâm, viết một lời tiên tri Omikuji cho quẻ "${omikujiName}", tập trung vào chủ đề: ${topic}. Viết hoàn toàn bằng tiếng Việt.

ĐỘNG CƠ CẢM XÚC CỦA QUẺ:
- Đại cát: thuận lợi, hanh thông. Nếu có trở ngại chỉ là chi tiết nhỏ, thoáng qua.
- Trung cát / Tiểu cát: pha trộn thuận lợi và thử thách nhẹ, cần kiên nhẫn.
- Bán cát / Mạt cát: nghiêng về bất lợi, cảnh báo nhẹ nhàng.
- Hung / Đại hung: khó khăn là trung tâm, giọng cảnh báo rõ, nhưng vẫn để lại tia hy vọng cuối.
- Bán hung / Mạt hung: tương tự hung nhưng nhẹ hơn, phần cảnh báo chi phối hơn phần thuận lợi.
- Đại hung / Mạt tiểu cát: nếu có, xử lý tương tự các cấp độ tương ứng.

Nội dung phải xoay quanh "${topic}", không lan man.

CẤU TRÚC:
- Chỉ chọn MỘT hình ảnh/ẩn dụ thiên nhiên chủ đạo, phát triển xuyên suốt cả đoạn.
- Mạch: hình ảnh/điềm báo → hé lộ điều sắp xảy ra đúng cảm xúc quẻ → lời khuyên ngắn chiêm nghiệm.

GIỌNG VĂN:
- Nhẹ nhàng, huyền bí, cổ điển, giống lời tiên tri của thầy bói lớn tuổi, không phải giọng AI hay coach.
- Lời khuyên lồng trong ẩn dụ như câu sấm, KHÔNG liệt kê phương pháp hay hướng dẫn hành động.
- Phong vị Nhật Bản, tự nhiên, không gượng ép, không sáo rỗng, không hình ảnh bạo lực/ghê rợn/quá trừu tượng.

ĐỘ DÀI: 6-8 câu, tối đa 500 từ.

TUYỆT ĐỐI KHÔNG:
- Nhắc lại tên quẻ "${omikujiName}" trong nội dung.
- Dùng "theo quẻ bói Omikuji", "theo truyền thống/phong tục Nhật Bản", hay câu dẫn nhập nói về loại quẻ/chủ đề.
- Câu kết chúc tụng sáo mòn kiểu "chúc bạn...", "hãy tin tưởng...", "mong rằng...".
- Chỉ viết thẳng nội dung lời tiên tri, không tiêu đề, không lời dẫn, không lời kết.`;
}

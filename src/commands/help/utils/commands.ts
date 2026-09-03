export const COMMAND_LIST: Record<string, string> = {
  '/action <action> <user>':
    'Tương tác hành động (ôm, hôn, tát, đấm, đá, xoa đầu, chọc, cắn) với người dùng được chọn.',
  '/avatar <user | banner | server>':
    'Xem avatar của người dùng, banner của người dùng, hoặc avatar của server.',
  '/ban usebot <user> <time> [reason]':
    'Cấm người dùng sử dụng bot trong khoảng thời gian nhất định hoặc vĩnh viễn.',
  '/calendar <month> <year>':
    'Hiển thị lịch của một tháng bất kỳ theo dương lịch.',
  '/cinestar today [cinema]':
    'Xem lịch chiếu phim hôm nay tại các cụm rạp Cinestar trên toàn quốc.',
  '/cinestar upcoming':
    'Xem danh sách các bộ phim sắp chiếu tại cụm rạp Cinestar.',
  '/dictionary <text>':
    'Tra cứu từ điển tiếng Anh (định nghĩa, phiên âm, từ đồng nghĩa/trái nghĩa).',
  '/football club <club>':
    'Xem lịch thi đấu bóng đá của một câu lạc bộ cụ thể.',
  '/football score':
    'Xem tỉ số các trận đấu bóng đá gần đây.',
  '/football today':
    'Xem lịch các trận đấu bóng đá diễn ra hôm nay và ngày mai.',
  '/football tournament <tournament>':
    'Xem lịch thi đấu bóng đá của các giải đấu hàng đầu châu Âu.',
  '/gemini <prompt> [model] [attachment]':
    'Chat với Google Gemini AI (hỗ trợ phân tích ảnh, tài liệu PDF, code/text).',
  '/giaxang':
    'Xem bảng giá xăng dầu hôm nay tại Việt Nam.',
  '/hcmus-news latest <category> [number]':
    'Xem tin tức mới nhất từ các website chính thức của HCMUS.',
  '/hcmus-news <setup | status | remove>':
    'Cấu hình kênh nhận thông báo tự động tin tức mới nhất từ HCMUS.',
  '/help':
    'Hiển thị thông tin cơ bản về bot và danh sách câu lệnh.',
  '/image <cat | dog>':
    'Gửi hình ảnh ngẫu nhiên về mèo hoặc chó đáng yêu.',
  '/omikuji':
    'Rút quẻ bói Omikuji Nhật Bản kèm lời khuyên theo chủ đề từ Gemini AI.',
  '/ping':
    'Kiểm tra độ trễ phản hồi (latency) và kết nối WebSocket của bot.',
  '/pokemon [id | name]':
    'Tra cứu thông tin Pokémon theo ID, tên hoặc bắt Pokémon ngẫu nhiên.',
  '/random <text>':
    'Chọn ngẫu nhiên một mục từ danh sách các lựa chọn (cách nhau bởi dấu phẩy).',
  '/send <message>':
    'Gửi tin nhắn vào channel hiện tại thông qua bot.',
  '/today':
    'Hiển thị ngày giờ hiện tại theo dương lịch, âm lịch, can chi và giờ hoàng đạo.',
  '/unban usebot <user>':
    'Gỡ cấm người dùng sử dụng bot.',
};

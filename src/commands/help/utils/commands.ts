import type { HelpPage } from '../types/types.ts';

export const HELP_PAGES: HelpPage[] = [
  {
    id: 'utilities',
    title: 'Tiện ích hàng ngày',
    description: 'Công cụ nhanh, xem ảnh, lịch, từ điển, giá xăng, qr, avatar, action.',
    emoji: '🧰',
    color: 0x3498db,
    commands: [
      { name: '/help', description: 'Mở danh mục trợ giúp và chọn nhóm lệnh.' },
      { name: '/ping', description: 'Kiểm tra độ trễ của bot.' },
      { name: '/today', description: 'Xem ngày dương, ngày âm và giờ hoàng đạo.' },
      { name: '/calendar <month> <year>', description: 'Xem lịch của một tháng trong năm.' },
      {
        name: '/currency <from> <to> <amount>',
        description: 'Quy đổi tiền tệ theo tỷ giá tham khảo gần nhất.',
      },
      {
        name: '/translate <to> <text>',
        description: 'Dịch văn bản, tự nhận biết ngôn ngữ gốc.',
      },
      { name: '/dictionary <text>', description: 'Tra nghĩa và phiên âm từ tiếng Anh.' },
      {
        name: '/random <text>',
        description: 'Chọn ngẫu nhiên từ danh sách cách nhau bằng dấu phẩy.',
      },
      { name: '/giaxang', description: 'Xem giá xăng dầu hiện tại.' },
      {
        name: '/qr <bank> <account> [amount] [description] [accountname]',
        description: 'Tạo mã QR chuyển khoản VietQR.',
      },
      { name: '/send <message>', description: 'Gửi nội dung vào kênh hiện tại qua bot.' },
      {
        name: '/action <hành động> <user>',
        description: 'Tương tác với một người dùng bằng ảnh động.',
      },
      { name: '/avatar user [user]', description: 'Xem ảnh đại diện người dùng.' },
      { name: '/avatar banner [user]', description: 'Xem ảnh bìa người dùng nếu có.' },
      { name: '/avatar server', description: 'Xem ảnh đại diện máy chủ.' },
      { name: '/image <cat | dog>', description: 'Xem ảnh mèo hoặc chó ngẫu nhiên.' },
      { name: '/pokemon [id] [name]', description: 'Tra cứu hoặc bắt Pokémon ngẫu nhiên.' },
      { name: '/omikuji', description: 'Rút quẻ Omikuji và nhận lời nhắn từ AI.' },
    ],
  },
  {
    id: 'hcmus',
    title: 'Tin tức HCMUS',
    description: 'Nhận tin mới và thông báo tin tức tự động từ HCMUS',
    emoji: '📰',
    color: 0x1abc9c,
    commands: [
      {
        name: '/hcmus-news latest <category> [number]',
        description: 'Xem các tin HCMUS mới nhất theo danh mục',
        subcommand: 'latest',
        usageHint: '<category> [number]',
      },
      {
        name: '/hcmus-news setup <channel>',
        description: 'Thiết lập kênh nhận tin HCMUS. Bot sẽ gửi tin vào kênh này.',
        subcommand: 'setup',
        usageHint: '<channel>',
      },
      {
        name: '/hcmus-news status',
        description: 'Kiểm tra thông tin và trang trái nhận tin.',
        subcommand: 'status',
      },
      {
        name: '/hcmus-news remove',
        description: 'Ngừng gửi tin vào kênh đã thiết lập. Bot sẽ không gửi tin nữa.',
        subcommand: 'remove',
      },
    ],
  },
  {
    id: 'football',
    title: 'Lịch thi đấu bóng đá',
    description: 'Lịch đấu và tỉ số các trận bóng đá của các giải đấu và CLB ở châu Âu.',
    emoji: '⚽',
    color: 0x2ecc71,
    commands: [
      { name: '/football today', description: 'Xem các trận đấu tối nay và rạng sáng mai.' },
      { name: '/football score', description: 'Xem tỉ số các trận gần đây.' },
      { name: '/football club <club>', description: 'Xem lịch thi đấu của câu lạc bộ.' },
      { name: '/football tournament <tournament>', description: 'Xem lịch thi đấu của giải đấu.' },
    ],
  },
  {
    id: 'gemini',
    title: 'AI Gemini',
    description: 'Chat với Gemini',
    emoji: '✨',
    color: 0x9b59b6,
    commands: [
      {
        name: '/gemini <prompt> [attachment]',
        description: 'Trò chuyện với Gemini, có thể đính kèm tệp.',
      },
    ],
  },
  {
    id: 'cinestar',
    title: 'Lịch chiếu phim Cinestar',
    description: 'Xem lịch chiếu phim trong ngày tại Cinestar.',
    emoji: '🎬',
    color: 0xe67e22,
    commands: [
      { name: '/cinestar today [cinema]', description: 'Xem suất chiếu hôm nay tại Cinestar.' },
      { name: '/cinestar upcoming', description: 'Xem phim sắp chiếu tại Cinestar.' },
    ],
  },
  {
    id: 'coin',
    title: 'Trò chơi Coin',
    description: 'Điểm danh, xem số dư và đặt cược coin',
    emoji: '🪙',
    color: 0xf1c40f,
    commands: [
      { name: '/coin daily', description: 'Điểm danh nhận coin mỗi ngày.' },
      { name: '/coin cash', description: 'Xem số coin đang có.' },
      { name: '/coin info', description: 'Xem số dư và thống kê coin.' },
      { name: '/coin flip <amount>', description: 'Cược tung đồng xu.' },
      { name: '/coin dice <guess> <amount>', description: 'Đoán mặt xúc xắc và đặt cược.' },
      { name: '/coin jackpot <amount>', description: 'Quay jackpot bằng coin.' },
      { name: '/coin baucua <symbol> <amount>', description: 'Đặt cược bầu cua.' },
    ],
  },
  {
    id: 'admin',
    title: 'Quản trị',
    description: 'Quản lý quyền sử dụng bot (Admin only).',
    emoji: '🛡️',
    color: 0xe74c3c,
    commands: [
      {
        name: '/ban usebot <user> <time> [reason]',
        description: 'Cấm người dùng sử dụng bot (admin only).',
      },
      { name: '/unban usebot <user>', description: 'Gỡ cấm người dùng (admin only).' },
    ],
  },
];

import { EmbedBuilder } from 'discord.js';

export async function helpCommand(interaction) {
    const listCommand = {
        '/ai `[prompt]`': 'Chat với AI Groq',
        '/avatar <user @user| server>': 'Lấy avatar của user hoặc server (riêng server phải mời bot vào mới lấy được)',
        '~~/cgv `[province]` `[cinema]`~~': '~~Xem lịch chiếu phim hôm nay tại CGV~~ (không hoạt động)',
        '/cinestar today `[cinema]`': 'Xem lịch chiếu phim trong ngày tại các rạp Cinestar trên toàn quốc',
        '/cinestar upcoming': 'Xem lịch chiếu phim sắp tới tại các rạp Cinestar trên toàn quốc',
        '/date': 'Xem ngày giờ hiện tại (dương lịch và âm lịch)',
        '/dictionary `[text]`': 'Tra cứu từ vựng tiếng Anh',
        '/fit-hcmus-news `[setup | latest | status | remove]`': 'Nhận thông báo tin tức mới nhất từ FIT-HCMUS',
        '/football club `[club]`': 'Xem lịch thi đấu bóng đá của một số câu lạc bộ châu Âu',
        '/football rank `[league]` `[season]`': 'Xem bảng xếp hạng của các giải đấu châu Âu',
        '/football score': 'Xem tỉ số của các trận đấu bóng đá đêm qua và rạng sáng nay',
        '/football tournament `[tournament]`': 'Xem lịch thi đấu bóng đá của các giải đấu châu Âu',
        '/gemini `[prompt]`': 'Chat với Google Gemini AI',
        '/giaxang': 'Xem giá xăng dầu hôm nay',
        '/help': 'Hiển thị các thông tin cơ bản về bot cũng như command',
        '/image `[dog | cat]`': 'Gửi hình ảnh ngẫu nhiên về chó hoặc mèo',
        '/omikuji': 'Xem quẻ bói omikuji Nhật Bản',
        '/pokemon `[id | name]`': 'Tra cứu thông tin Pokémon theo ID, tên hoặc random',
        '/random `[one, two, three, ...]`': 'Trả về một kết quả ngẫu nhiên từ danh sách được nhập vào ngăn cách nhau bởi dấu phẩy',
        '/sbd `[sbd]`': 'Tra cứu điểm thi THPTQG 2025 thông qua số báo danh',
        '/translate `[to country]` `[text]`': 'Dịch một từ hoặc một đoạn văn ngắn sang một ngôn ngữ khác',
    }

    const embed = new EmbedBuilder()
        .setTitle(`HELP COMMANDS`)
        .setColor('#00a2ff')
        .setTimestamp();

    embed.addFields(
        Object.entries(listCommand).map(([name, value]) => ({
            name,
            value,
            inline: false
        }))
    );

    await interaction.reply({
        embeds: [embed]
    });
}
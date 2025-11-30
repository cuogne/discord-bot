import { SlashCommandBuilder, ChannelType } from "discord.js";

// commands
import { dateCommand } from '../commands/date/date.js';
import { getAvatarCommand } from '../commands/avatar/chooseAvatar.js';
import { lookUpSBDCommand } from '../commands/diemthptqg2025/crawlScore.js'
import { cinestarCommand } from "../commands/cinestar/cinestarCommand.js";
import { translateCommand } from "../commands/translate/translate.js";
import { randomCommand } from "../commands/random/random.js";
import { dictionaryCommand } from "../commands/dictionary/dictionary.js";
import { helpCommand } from "./helpCommand.js";
import { cgvCommand } from "../commands/cgv/cgv.js";
import { fitNewsCommand } from '../commands/fit-hcmus-news/fitNewsCommand.js';
import { getImageCommand } from "../commands/getImage/getImageCommand.js";
import { groqCommand } from "../commands/groqAI/groqCommand.js";
import { footballCommand } from "../commands/football/footballCommand.js";
import { pokemonCommand } from "../commands/pokemon/pokemonCommand.js";
import { omikujiCommand } from "../commands/omikuji/omikujiCommand.js";

// handle selection
import { handleMovieTodaySelection } from "../commands/cinestar/handler/handleMovieTodaySelection.js";
import { handleUpcomingMovieSelection } from "../commands/cinestar/handler/handleUpcomingMovieSelection.js";
import { handleSelectionMovieCGV } from "../commands/cgv/handleSelectionMovieCGV.js";

 /* Syntax for adding command
    new SlashCommandBuilder()
        .setName('command_name')
        .setDescription('command_description')
*/
export const commands = [
    new SlashCommandBuilder()
        .setName('date')
        .setDescription('Hiển thị ngày giờ hiện tại'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Xem avatar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Xem avatar của user được chọn')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Chọn user để xem avatar (để trống thì xem ảnh của bạn)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Xem avatar của server')
        ),

    new SlashCommandBuilder()
        .setName('sbd')
        .setDescription('Tra cứu điểm thi THPTQG 2025 thông qua số báo danh')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Nhập SBD (Phải có 8 chữ số)')
                .setRequired(true)
                .setMaxLength(8)
                .setMinLength(8)
        ),

    new SlashCommandBuilder()
        .setName('cinestar')
        .setDescription('Xem lịch chiếu phim tại rạp Cinestar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('today')
                .setDescription('Xem lịch chiếu phim tại Cinestar hôm nay')
                .addStringOption(option =>
                    option.setName('cinema')
                        .setDescription('Chọn rạp chiếu phim')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎬 Cinestar Sinh Viên - TP.HCM', value: 'Cinestar Sinh Viên - TP.HCM' },
                            { name: '🎬 Cinestar Quốc Thanh - TP.HCM', value: 'Cinestar Quốc Thanh - TP.HCM' },
                            { name: '🎬 Cinestar Hai Bà Trưng - TP.HCM', value: 'Cinestar Hai Bà Trưng - TP.HCM' },
                            { name: '🎬 Cinestar Satra - TP.HCM', value: 'Cinestar Satra - TP.HCM' },
                            { name: '🎬 Cinestar Đà Lạt - Lâm Đồng', value: 'Cinestar Đà Lạt - Lâm Đồng' },
                            { name: '🎬 Cinestar Lâm Đồng - Lâm Đồng', value: 'Cinestar Lâm Đồng - Lâm Đồng' },
                            { name: '🎬 Cinestar Huế - TP.Huế', value: 'Cinestar Huế - TP.Huế' },
                            { name: '🎬 Cinestar Mỹ Tho - Đồng Tháp', value: 'Cinestar Mỹ Tho - Đồng Tháp' },
                            { name: '🎬 Cinestar Kiên Giang - An Giang', value: 'Cinestar Kiên Giang - An Giang' },
                        )
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('upcoming')
                .setDescription('Hiển thị danh sách các phim sắp chiếu tại Cinestar')
        ),

    new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Dịch từ vựng và các câu nhỏ')
        .addStringOption(option =>
            option.setName('to')
                .setDescription('Chọn ngôn ngữ đích muốn dịch sang')
                .setRequired(true)
                .addChoices(
                    { name: '🇻🇳 Tiếng Việt', value: 'vi' },
                    { name: '🇬🇧 Tiếng Anh', value: 'en' },
                    { name: '🇯🇵 Tiếng Nhật', value: 'ja' },
                    { name: '🇰🇷 Tiếng Hàn', value: 'ko' },
                    { name: '🇨🇳 Tiếng Trung', value: 'zh' },
                    { name: '🇫🇷 Tiếng Pháp', value: 'fr' },
                    { name: '🇩🇪 Tiếng Đức', value: 'de' },
                )
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Nhập từ hoặc câu cần dịch (giới hạn 1000 ký tự)')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('random')
        .setDescription('Chọn ngẫu nhiên một mục từ danh sách bạn nhập')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Nhập các lựa chọn, cách nhau bằng dấu phẩy')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('football')
        .setDescription('Xem thông tin bóng đá (lịch thi đấu, tỉ số, ...)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tournament')
                .setDescription('Xem lịch thi đấu bóng đá Châu Âu hôm nay và các ngày lân cận')
                .addStringOption(option =>
                    option.setName('tournament')
                        .setDescription('Chọn giải đấu bóng đá bạn muốn xem lịch thi đấu')
                        .setRequired(true)
                        .addChoices(
                            { name: '🇬🇧 Premier League', value: 'eng.1' },
                            { name: '🇪🇸 La Liga', value: 'esp.1' },
                            { name: '🇩🇪 Bundesliga', value: 'ger.1' },
                            { name: '🇮🇹 Serie A', value: 'ita.1' },
                            { name: '🇫🇷 Ligue 1', value: 'fra.1' },
                            { name: '🇪🇺 UEFA Champions League', value: 'uefa.champions' },
                            { name: '🇪🇺 UEFA Europa League', value: 'uefa.europa' },
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('club')
                .setDescription('Xem lịch thi đấu bóng đá của 1 câu lạc bộ')
                .addStringOption(option =>
                    option.setName('club')
                        .setDescription('Chọn câu lạc bộ')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Manchester United', value: '360' },
                            { name: 'Manchester City', value: '382' },
                            { name: 'Chelsea', value: '363' },
                            { name: 'Liverpool', value: '364' },
                            { name: 'Arsenal', value: '359' },
                            { name: 'Tottenham Hotspur', value: '367' },
                            { name: 'Real Madrid', value: '86' },
                            { name: 'Barcelona', value: '83' },
                            { name: 'Atletico Madrid', value: '1068' },
                            { name: 'Bayern Munich', value: '132' },
                            { name: 'Borussia Dortmund', value: '124' },
                            { name: 'Bayer Leverkusen', value: '131' },
                            { name: 'Paris Saint Germain (PSG)', value: '160' },
                            { name: 'Inter Milan', value: '110' },
                            { name: 'AC Milan', value: '103' },
                            { name: 'AS Roma', value: '104' },
                            { name: 'Napoli', value: '114' },
                            { name: 'Juventus', value: '111' }
                )
            )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('score')
                .setDescription('Xem tỉ số của các trận đấu bóng đá đêm qua và rạng sáng nay')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rank')
                .setDescription('Xem bảng xếp hạng bóng đá của các giải đấu Châu Âu theo mùa giải')
                .addStringOption(option =>
                    option.setName('league')
                        .setDescription('Chọn giải đấu bạn muốn xem bảng xếp hạng') 
                        .setRequired(true)
                        .addChoices(
                            { name: '🇬🇧 Premier League', value: 'eng.1' },
                            { name: '🇪🇸 La Liga', value: 'esp.1' },
                            { name: '🇩🇪 Bundesliga', value: 'ger.1' },
                            { name: '🇮🇹 Serie A', value: 'ita.1' },
                            { name: '🇫🇷 Ligue 1', value: 'fra.1' },
                        )
                )
                .addStringOption(option =>
                    option.setName('season')
                        .setDescription('Chọn mùa giải')
                        .setRequired(true)
                        .setMinLength(4)
                        .setMaxLength(4)
                )
        ),

    new SlashCommandBuilder()
        .setName('dictionary')
        .setDescription('Tra từ điển tiếng Anh (định nghĩa, phiên âm, từ đồng nghĩa/trái nghĩa, ...)')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Nhập từ tiếng Anh cần tra')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị các command hiện có của bot'),

    new SlashCommandBuilder()
        .setName('cgv')
        .setDescription('Hiển thị lịch chiếu phim tại CGV (Không hoạt động)')
        .addStringOption(option =>
            option.setName('province')
                .setDescription('Chọn tỉnh/thành phố (chỉ hỗ trợ một số tỉnh/thành phố và dữ liệu hiện tại là trước khi sáp nhập)')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('cinema')
                .setDescription('Chọn rạp chiếu phim')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    new SlashCommandBuilder()
        .setName('fit-hcmus-news')
        .setDescription('Xem tin tức mới nhất từ FIT HCMUS')
        .addSubcommand(subcommand =>
            subcommand
                .setName('latest')
                .setDescription('Lấy tin gần nhất')
                .addStringOption(option => 
                    option.setName('category')
                        .setDescription('Chọn danh mục tin tức bạn muốn lấy')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Khoa CNTT - HCMUS', value: 'fithcmus' },
                            { name: 'Lịch thi - KTĐBCL', value: 'lichthi' },
                            { name: 'Thông báo - KTĐBCL', value: 'thongbao' },
                            { name: 'Thông tin dành cho sinh viên - HCMUS', value: 'hcmus' },
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Cấu hình channel để lấy tin tức')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Chọn channel để gửi tin mới nhất')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Hiển thị channel đã chọn để gửi tin tức')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Xóa channel đã cấu hình')
        ),

    new SlashCommandBuilder()
        .setName('image')
        .setDescription("Trả về ảnh ngẫu nhiên")
        .addSubcommand(subcommand =>
            subcommand
                .setName('cat')
                .setDescription('Xem ảnh mèo ngẫu nhiên')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('dog')
                .setDescription('Xem ảnh chó ngẫu nhiên')
        ),

    new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Chat với AI (Groq)')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Nhập câu hỏi hoặc yêu cầu của bạn')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Who\'s that Pokémon?')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nhập tên Pokémon bạn muốn tìm (ex: pikachu)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Nhập ID Pokémon bạn muốn tìm (giá trị trong khoảng 1-1025 hoặc 10001-10277)')
                .setRequired(false)
        ),
    
    new SlashCommandBuilder()
        .setName('omikuji')
        .setDescription('Xem quẻ bói omikuji Nhật Bản')
];

// syntax: { command_name: command_function }
export const commandHandlers = {
    date: dateCommand,
    avatar: getAvatarCommand,
    sbd: lookUpSBDCommand,
    cinestar: cinestarCommand,
    translate: translateCommand,
    random: randomCommand,
    dictionary: dictionaryCommand,
    help: helpCommand,
    cgv: cgvCommand,
    'fit-hcmus-news': fitNewsCommand,
    image: getImageCommand,
    ai: groqCommand,
    football: footballCommand,
    pokemon: pokemonCommand,
    omikuji: omikujiCommand,
};

// export handle selection
export const handleSelection = {
    select_movie: handleMovieTodaySelection,
    select_upcoming_movie: handleUpcomingMovieSelection,
    select_movie_cgv: handleSelectionMovieCGV
}
# cừn-bot

Một con bot discord sieu cap ngu xi dan don duoc viet bang javascript.

Thêm bot vào server của bạn: [Invite bot](https://discord.com/oauth2/authorize?client_id=1395723998821879849&permissions=0&integration_type=0&scope=bot+applications.commands)

## Commands

| Command | Parameter | Description | Usage |
|------|---------|-------|-----------|
| `/ai` | `<prompt>` | Chat với AI Groq | `/ai Xin chào bạn` |
| `/avatar` | `<user @user> / <server>`| Lấy avatar của user (riêng server phải mời bot vào mới lấy dc) | `/avatar @cừn` |
| ~~`/cgv`~~ | ~~`<province>` `<cinema>`~~ | ~~Xem lịch chiếu phim tại CGV~~ | ~~`/cgv TP.HCM CGV Vincom Đồng Khởi`~~|
| `/cinestar today` | `<cinema>` | Xem lịch chiếu phim hôm nay tại Cinestar | `/cinestar today Cinestar Sinh Viên - TP.HCM` |
| `/cinestar upcoming` | *(không có)* | Xem lịch chiếu phim sắp tới tại Cinestar | `/cinestar upcoming` |
| `/date` | *(không có)* | Hiển thị ngày giờ hiện tại (âm và dương lịch) | `/date` |
| `/dictionary` | `<word>` | Tra cứu từ vụng tiếng Anh trong từ điển | `/dictionary care` |
| `/fit-hcmus-news` | `setup\|latest\|status\|remove` | Nhận thông báo tin tức FIT-HCMUS | [Hướng dẫn chi tiết tại đây](commands/fit-hcmus-news/INSTRUCTION.md) |
| `/football club` | `<club>` | Xem lịch thi đấu cụ thể của các câu lạc bộ bóng đá | `/football club Manchester United` |
| `/football rank` | `<league> <season>` | Xem bảng xếp hạng bóng đá của các giải đấu Châu Âu theo mùa giải | `/football rank Premier League 2025` |
| `/football score` | *(không có)* | Xem tỷ số bóng đá của các trận đấu đêm qua và rạng sáng nay | `/football score` |
| `/football tournament` | `<tournament>` | Xem lịch thi đấu bóng đá của các giải đấu lớn (EPL, La Liga, ...) | `/football tournament Premier League` |
| `/help` | *(không có)* | Hiển thị danh sách các lệnh có sẵn và còn hoạt động | `/help` |
| `/image` | `<dog \| cat>` | Gửi hình ảnh ngẫu nhiên về chó hoặc mèo | `/image dog` |
| `/omikuji` | *(không có)* | Xem quẻ bói omikuji Nhật Bản | `/omikuji` |
| `/pokemon` | `<id \| name>` | Tra cứu thông tin Pokémon theo ID, tên hoặc random | `/pokemon pikachu` |
| `/random` | `<ele1, ele2, ele3, ...>` | Trả về các từ ngẫu nhiên do user nhập vào được phân cách bởi dấu phẩy | `/random táo,cam,chuối` |
| `/sbd` | `<text>` | Tra cứu điểm thi THPTQG 2025 | `/sbd 123456` |
| `/translate` | `<to> <text>` | Dịch văn bản sang tiếng được chọn | `/translate English Xin chào` |

> `/cgv` không còn hoạt động vì không chạy được trên cloud host

> ...
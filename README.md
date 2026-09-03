# Bot Discord

mot con bot discord ngu xi dan don duoc viet bang ~~javascript~~ Typescript va bun.

Thêm bot vào server của bạn: [Invite bot](https://discord.com/oauth2/authorize?client_id=1395723998821879849&permissions=0&integration_type=0&scope=bot+applications.commands)

## Commands

| Command | Options | Mô tả | Ví dụ |
|---|---|---|---|
| `/action` | `action`, `user` | Thực hiện hành động như hôn, ôm, tát, đấm, đá với user được chọn. | `/action hug user:@cừn` |
| `/avatar user` | `user` | Xem avatar của user. | `/avatar user user:@cừn` |
| `/avatar banner` | `user` | Xem banner của user nếu có. | `/avatar banner user:@cừn` |
| `/avatar server` | — | Xem avatar của server. | `/avatar server` |
| `/ban usebot` | `user`, `time`, `reason` | Cấm người dùng sử dụng bot. | `/ban usebot user:@cừn time:1 ngày reason:spam bot` |
| `/calendar` | `month`, `year` | Hiển thị lịch của một tháng bất kỳ. | `/calendar month:8 year:2026` |
| `/cinestar today` | `cinema` | Xem lịch chiếu phim hôm nay tại Cinestar. | `/cinestar today cinema:Cinestar Sinh Viên - TP.HCM` |
| `/cinestar upcoming` | — | Xem danh sách phim sắp chiếu tại Cinestar. | `/cinestar upcoming` |
| `/dictionary` | `text` | Tra từ điển tiếng Anh. | `/dictionary text:care` |
| `/football club` | `club` | Xem lịch thi đấu của một câu lạc bộ. | `/football club club:Manchester United` |
| `/football score` | — | Xem tỉ số các trận đấu gần đây. | `/football score` |
| `/football today` | — | Xem các trận đấu hôm nay và ngày mai. | `/football today` |
| `/football tournament` | `tournament` | Xem lịch thi đấu của một giải bóng đá. | `/football tournament tournament:Premier League` |
| `/gemini` | `prompt`, `attachment` | Chat với AI Gemini, tự phân loại và phân tích ảnh hoặc file PDF. | `/gemini prompt:Phân tích file này attachment:tài liệu.pdf` |
| `/giaxang` | — | Xem giá xăng dầu hôm nay. | `/giaxang` |
| `/hcmus-news` | `setup\|latest\|status\|remove` | Nhận thông báo tin tức HCMUS | [Hướng dẫn chi tiết tại đây](src/commands/hcmus-news/INSTRUCTION.md) |
| `/help` | — | Hiển thị danh sách câu lệnh và hướng dẫn sử dụng bot. | `/help` |
| `/image` | `cat` hoặc `dog` | Xem ảnh ngẫu nhiên về mèo hoặc chó. | `/image dog` |
| `/omikuji` | — | Xem quẻ bói Omikuji Nhật Bản. | `/omikuji` |
| `/ping` | — | Pong! | `/ping` |
| `/pokemon` | `id` hoặc `name` | Tra cứu Pokémon theo ID, tên hoặc nhận một Pokémon ngẫu nhiên. | `/pokemon name:pikachu` |
| `/random` | `text` | Chọn ngẫu nhiên một mục trong danh sách phân cách bằng dấu phẩy. | `/random text:táo,cam,chuối` |
| `/send` | `message` | Reply một tin nhắn bằng bot. | `/send message:Xin chào mọi người` |
| `/today` | — | Hiển thị ngày giờ hiện tại theo dương lịch và âm lịch. | `/today` |
| `/unban usebot` | `user` | Gỡ cấm người dùng sử dụng bot. | `/unban usebot user:@cừn` |

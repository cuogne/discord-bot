## FIT-HCMUS News Bot
- Một tính năng của bot cho phép bạn nhận các tin tức mới nhất từ các web của HCMUS.

## Mục đích
- Dành cho những sinh viên đang theo học tại HCMUS (ưu tiên sinh viên khoa CNTT vì có thông báo từ khoa FIT nữa) có thể cập nhật tin tức nhanh chóng từ web của trường (có nhiều tin tức và thông báo quan trọng mà các bạn thường lười lên web để check, trong đó có cả thằng chủ repo cũng lười vl). 
- Bot sẽ tự động gửi vào server discord của bạn khi có tin mới từ các web của HCMUS.
## Demo

| PC/Laptop| Mobile| Thông báo |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------- |
| <img src="./demo/demo_laptop.png" height="220" /> | <img src="./demo/demo_mobile.png" height="250" /> | <img src="./demo/demo_notice.png" height="200" /> |


## Yêu cầu
- Hiện tại chỉ hỗ trợ nhận thông báo qua server trong ứng dụng Discord, vậy nên nếu bạn muốn sử dụng các tính năng này, [Discord](https://discord.com/) là thứ bắt buộc phải cài đặt trên máy của bạn.

## Command
- `/fit-hcmus-news latest <category>`: trả về tin gần nhất dựa theo danh mục bạn chọn.
- `/fit-hcmus-news setup`: thiết lập kênh sẽ nhận thông báo
- `/fit-hcmus-news status`: hiển thị trạng thái và thông tin của kênh nhận thông báo.
- `/fit-hcmus-news remove`: hủy thiết lập của kênh nhận thông báo.

## Hướng dẫn

1. Cài đặt ứng dụng [Discord](https://discord.com/) trên máy của bạn (Laptop, Android hay Ios đều được).

2. Login hoặc đăng ký tài khoản Discord nếu bạn chưa có.

3. Tạo một server mới (nên tạo server riêng để nhận tin cho dễ quản lý và lấy quyền admin) 

<img src="./demo/create_account_discord.png" alt="Create Discord account" height="300" />

4. Thêm bot vào server của bạn bằng cách ấn vào link sau: [Discord Bot](https://discord.com/oauth2/authorize?client_id=1395723998821879849&permissions=0&integration_type=0&scope=bot+applications.commands) 

- Chọn `Add to Server`

<img src="./demo/add_to_server.png" alt="Invite bot to server" height="200" />

- Chọn server bạn vừa tạo ở bước 3 rồi ấn `Authorize`.

<img src="./demo/select_a_server.png" alt="select a server" height="200" />

5. Vào lại server, click vào dấu cộng như hình để tạo một kênh mới, đặt tên tùy thích nhma nhớ chọn loại kênh là `Text` sau đó ấn `Create Channel`.

<img src="./demo/create_channel.png" alt="Create text channel" height="300" />

6. Vào kênh vừa tạo, dưới thanh chat, gõ lệnh `/fit`, bạn sẽ thấy có 4 lệnh hiện ra như hình.
> Nếu chưa thấy thì bạn nên quay lại bước 4 và mời lại bot vào server.

<img src="./demo/command.png" alt="Fit HCMUS News commands" height="200" />

7. Chọn lệnh `/fit-hcmus-news setup`, bạn sẽ thấy hiện ra 1 loạt channel như hình, bạn tìm tên của channel bạn đã tạo ở bước 5, chọn nó và nhấn Enter. Phần còn lại bạn cứ nhấn `Yes` để cho phép thiết lập là xong.

<img src="./demo/setup_channel.png" alt="Fit HCMUS News setup channel" height="200" />

8. Bạn sẽ nhận 2 thông báo, 1 thông báo báo rằng bạn đã setup thành công và 1 thông báo nằm trong kênh bạn đã chọn báo rằng kênh này đã được thiết lập để nhận thông báo từ bot.

<img src="./demo/success_setup.png" alt="Fit HCMUS News success setup" height="100" />

<img src="./demo/notice.png" alt="Fit HCMUS News notification channel" height="150" />

- Vậy là thành công, mỗi khi có tin mới từ các web của HCMUS, bot sẽ tự động gửi tin vào kênh bạn đã chọn như phần Demo ở trên, thời gian quét thông báo để gửi là 10 phút / lần.

- Nếu bạn không muốn nhận tin nữa, bạn chỉ cần vào kênh đó gõ lệnh `/fit-hcmus-news remove`, xác nhận là xong, sẽ không còn thông báo nào gửi đến nữa.

### <samp> Setup thành công rồi thì xin một star cho repo này nhé :3</samp>

## Resource:

Các web của HCMUS mà bot sẽ theo dõi để gửi thông báo (nguồn chính thống):

+ FIT@HCMUS: https://www.fit.hcmus.edu.vn/vn/Default.aspx?tabid=53
+ Lịch thi - Phòng khảo thí: http://ktdbcl.hcmus.edu.vn/
+ Thông báo - Phòng khảo thí: http://ktdbcl.hcmus.edu.vn/
+ Thông tin dành cho sinh viên - HCMUS: https://hcmus.edu.vn/category/dao-tao/dai-hoc/thong-tin-danh-cho-sinh-vien/page/1

------------------

> ~~Lưu ý: Bot có thể sập vào một ngày nào đó tại toi host free~~
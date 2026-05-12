import { AttachmentBuilder } from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const omikuji = ["Đại cát", "Trung cát", "Tiểu cát", "Cát", "Bán cát", "Mạt cát", "Mạt tiểu cát", "Bán hung", "Tiểu hung", "Hung", "Mạt hung", "Đại hung"];

const topic = [
  "nhân duyên", "học hành", "công việc", "tài vận", "sức khỏe", 
  "viễn hành", "gia đạo", "tâm nguyện", "giao tế", "quyết định",
  "kinh doanh", "sự nghiệp", "thời vận", "tin tức", "thất lạc",
  "di cư", "sáng tạo", "tĩnh tâm", "tranh chấp", "danh tiếng",
  "quý nhân", "ngôn từ", "đầu tư", "trực giác", "thử thách"
];

async function responseOmikujiMessage(omikujiName, topic) {
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY 
    });

    try {
        const prompt = `
Bạn là một Âm Dương Sư ẩn mình sau rèm giấy cũ, đang đọc lời sấm truyền từ quẻ xưa cho người hữu duyên xin quẻ. Hãy viết một lời tiên tri hoàn chỉnh bằng tiếng Việt.

Nhiệm vụ:
Viết lời tiên tri ứng với quẻ "${omikujiName}" và tập trung hoàn toàn vào chủ đề "${topic}".

Phong cách & Cốt cách:

- Văn phong phải mang sắc thái cổ kính, huyền bí, tinh tế và giàu chất thơ, như tiếng gió lướt qua rừng trúc lúc nửa đêm.
- Giọng văn tự nhiên, mềm và sâu, tuyệt đối không mang cảm giác của AI, chatbot hay văn mẫu hiện đại.
- Viết như một lời sấm truyền cổ được lưu lại trên mảnh giấy bạc màu, nơi ý nghĩa nằm nhiều trong khoảng lặng hơn là câu chữ.
- Ưu tiên diễn tả bằng hình ảnh, cảnh sắc, chuyển động và ẩn dụ thay vì giải thích trực tiếp.
- Không viết theo kiểu triết lý hiện đại, chữa lành, động viên bản thân hay văn phong self-help.
- Lời tiên tri phải tạo cảm giác “đọc được điềm”, không phải “được khuyên bảo”.

Giọng văn phải phù hợp theo cấp độ quẻ:

Nếu là quẻ Cát:
- Giọng văn ấm, sâu và sáng như nắng sớm xuyên màn sương.
- Điềm lành xuất hiện nhẹ nhàng, không phô bày trực diện.
- Cảm giác hy vọng nên đến như nước đầy dần dưới ánh trăng.

Nếu là quẻ Hung:
- Giọng văn trầm, tĩnh và tiết chế như tiếng chuông xa trong đêm.
- Mang sắc thái cảnh tỉnh nhưng không hù dọa hay tuyệt vọng.
- Nỗi bất an nên được gợi ra bằng cảnh vật và dấu hiệu hơn là lời nói thẳng.

Quy tắc nội dung:

- Độ dài từ 6–8 câu, tối đa 500 từ.
- Mỗi câu không quá 30 từ.
- Không xuống dòng, viết liên tục, ngắt câu bằng dấu chấm.
- Xen kẽ câu ngắn và câu dài để tạo nhịp như thơ văn cổ.
- Mọi câu đều phải xoay quanh chủ đề "${topic}", không lan sang chủ đề khác.
- Ý nghĩa nên mang tính gợi mở, không giải thích toàn bộ.
- Không nói thẳng kết quả tốt hay xấu; hãy để điềm tượng và hình ảnh tự hé lộ vận thế.
- Có thể sử dụng hình ảnh sau để tham khảo 
    (không giới hạn hình ảnh, có thể thêm bớt vào list bên dưới để hợp với topic: ${topic} và ${omikujiName}).:
  - rừng trúc
  - mái chùa
  - chuông xa
  - vách giấy
  - tro tàn
  - dòng nước
  - ánh nguyệt
  - đồi thông
  - giấy đèn
  - mực tàu
  - cánh hạc
  - sương sớm

Quy tắc cấm:

- KHÔNG có câu dẫn nhập.
- KHÔNG có câu kết luận hay lời chúc.
- KHÔNG nhắc tên quẻ trong nội dung.
- KHÔNG dùng tiếng Nhật, Trung hoặc Anh.
- KHÔNG dùng văn phong giải thích tâm lý hiện đại.
- KHÔNG dùng các cụm:
  - "hãy tin vào bản thân"
  - "mọi chuyện rồi sẽ ổn"
  - "vũ trụ"
  - "năng lượng"
  - "chữa lành"
  - "phiên bản tốt hơn"
  - "bước ra khỏi vùng an toàn"

- Tuyệt đối cấm các từ:
  - "Omikuji"
  - "theo truyền thống"
  - "theo phong tục"
  - "như người xưa nói"

Định dạng đầu ra:

- Chỉ xuất ra phần lời tiên tri.
- Không thêm tiêu đề, ghi chú, giải thích hay markdown.
        `

        const result = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
        });
        
        const text = typeof result.text === 'function' ? await result.text() : result.text;
        const safeText = (text ?? "Chúc bạn một ngày tốt lành!").toString();
        return safeText.trim();
    }
    catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error);
        return "";
    }
}

function getImagePathForOmikuji(resultOmikujiIdx) {
    const assetsDir = path.join(path.resolve(), 'commands', 'omikuji', 'assets');
    const imageOmikuji = fs.readdirSync(assetsDir);
    const randomImage = imageOmikuji[resultOmikujiIdx];
    const imagePath = path.join(assetsDir, randomImage);

    return { imagePath, randomImage };
}

export async function omikujiCommand(interaction) {
    await interaction.deferReply();

    const resultOmikujiIdx = Math.floor(Math.random() * omikuji.length);
    const topicIdx = Math.floor(Math.random() * topic.length);

    const { imagePath, randomImage } = getImagePathForOmikuji(resultOmikujiIdx);
    const attachment = new AttachmentBuilder(imagePath, { name: randomImage });

    if (!process.env.GEMINI_API_KEY) {
        await interaction.editReply("Vui lòng cung cấp API_KEY của Gemini trong .env để sử dụng lệnh này");
        return;
    }

    const res = await responseOmikujiMessage(omikuji[resultOmikujiIdx], topic[topicIdx]);

    await interaction.editReply({
        files: [attachment],
        embeds: [
            {
                color: 0xFFD700,
                title: `🃏 Quẻ ${omikuji[resultOmikujiIdx]}`,
                author: {
                    name: `${interaction.user.username} ơi, quẻ Omikuji của bạn hôm nay là:`,
                    iconURL: interaction.user.displayAvatarURL()
                },
                description: "**Lời nhắn nhủ: **\n" +res,
                image: { url: `attachment://${randomImage}` },
                footer: {
                    text: 'おみくじ • Omikuji'
                },
            }
        ]
    });
}
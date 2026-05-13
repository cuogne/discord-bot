import { AttachmentBuilder } from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';

const omikuji = ["Đại cát", "Trung cát", "Tiểu cát", "Cát", "Bán cát", "Mạt cát", "Mạt tiểu cát", "Bán hung", "Tiểu hung", "Hung", "Mạt hung", "Đại hung"];

const topic = [
  "nhân duyên", "học hành", "công việc", "tài vận", "sức khỏe", 
  "viễn hành", "gia đạo", "tâm nguyện", "giao tế", "quyết định",
  "kinh doanh", "sự nghiệp", "thời vận", "tin tức", "thất lạc",
  "di cư", "sáng tạo", "tĩnh tâm", "tranh chấp", "danh tiếng",
  "quý nhân", "ngôn từ", "đầu tư", "trực giác", "thử thách"
];

async function responseOmikujiMessage(omikujiName, topic) {
    const client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1"
    });

    try {
        // const prompt = `
        // Bạn là một thầy bói giỏi trong lĩnh vực đưa ra các lời chúc của quẻ bói Omikuji. 
        // Hãy đưa ra lời dự đoán ý nghĩa của quẻ omikuji "${omikujiName}" bằng tiếng Việt.
        // Câu chúc chỉ cần nội dung chính cho quẻ omikuji đó, không cần ghi các câu dẫn ở đầu hoặc kết thúc
        // `;

        const prompt = `
Hãy viết một lời chúc theo phong cách của quẻ bói Omikuji Nhật Bản, tương ứng với quẻ "${omikujiName}" với trọng tâm chủ đề là ${topic}, bằng tiếng Việt.  
Yêu cầu:
- Giọng văn nhẹ nhàng, mang cảm giác huyền bí và cổ điển kiểu Nhật (như lời tiên tri hoặc khuyên nhủ).  
- Văn phong kiểu Nhật và theo hướng tự nhiên, không gượng ép.
- Độ dài dài dài một tí 6 tới 8 câu. Tối đa 500 từ.
- Nội dung phải phù hợp với ý nghĩa may rủi của quẻ: nếu là "Đại cát" thì rất may mắn, còn "Đại hung" thì nên cảnh báo nhẹ nhàng, khuyên cẩn trọng. Các quẻ khác cũng tương tư như vậy theo ý nghĩa của chúng.  
- Phải thể hiện rõ trọng tâm đó trong lời tiên tri và tập trung vào chủ đề đó.
- Không cần lời mở đầu là trọng tâm gì, quẻ bói này là gì hoặc kết thúc (như “chúc bạn...” hay “hãy tin tưởng...”), chỉ cần nội dung chính của lời tiên tri.  
- Không lặp lại tên quẻ trong nội dung. Không sử dụng các cụm từ như "theo quẻ bói Omikuji", "theo truyền thống Nhật Bản" hoặc "theo phong tục Nhật Bản". Dịch toàn bộ phần chúc ra tiếng Việt, không để từ tiếng Nhật nào trong lời chúc.
- Viết cho người đọc cảm thấy như đang nhận được lời khuyên quý giá từ một thầy bói uyên thâm chứ không phải từ một chatbot AI hoặc LLM nào đó.`;

        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || "";
    }
    catch (error) {
        console.error("Lỗi khi gọi API Groq:", error);
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

    if (!process.env.GROQ_API_KEY) {
        await interaction.editReply("Vui lòng cung cấp API_KEY của Groq trong .env để sử dụng lệnh này");
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
import { feedLinks } from "../resource/link.js"
import { schema, newsSchema } from "../db/newSchema.js";

export async function latestSubCommand(interaction) {
    try {
        await interaction.deferReply();

        const categoryOption = interaction.options.getString('category');

        const newsData = await newsSchema.findOne({ category: categoryOption }).lean();

        if (!newsData) {
            await interaction.editReply({
                content: 'Chưa có tin tức nào được lưu cho category này.',
            });
            return;
        }

        await interaction.editReply(
            `📰 | **${newsData.title}**\n\n` +
            `${newsData.summary.trim()}\n\n` +
            `🔗 **Chi tiết xem tại: **${newsData.url}`
        );

    } catch (error) {
        await interaction.editReply({
            content: 'Failed to fetch the latest news.',
        });
        console.error(error);
    }
}
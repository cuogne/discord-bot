import { EmbedBuilder } from "discord.js";
import { actions } from "./config.js";

export async function actionCommand(interaction) {
    const action = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const actionText = actions[action];

    if (!actionText) {
        await interaction.reply({
            content: 'Hành động này chưa được hỗ trợ.',
            ephemeral: true
        });
        return;
    }

    try {
        const response = await fetch(`https://nekos.best/api/v2/${action}?amount=1`, {
            headers: {
                'User-Agent': 'bot-discord/1.0 (Discord bot)'
            }
        });

        if (!response.ok) {
            throw new Error(`Nekos.best responded with status ${response.status}`);
        }

        const data = await response.json();
        const actionImage = data.results?.[0]?.url;

        if (!actionImage) {
            throw new Error(`No ${action} image returned from Nekos.best`);
        }

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.user} muốn ${actionText} ${targetUser}`)
            .setImage(actionImage)
            .setColor(0xff6b6b)

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error(`Error fetching ${action} image:`, error);
        await interaction.reply(`Không lấy được gif ${actionText} rồi, thử lại sau nha.`);
    }
}

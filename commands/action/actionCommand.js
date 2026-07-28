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
        const url = `https://nekos.best/api/v2/${action}?amount=1`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "hihi"
            }
        });

        if (!response.ok) {
            const body = await response.text();

            console.error("[Nekos.best] Request failed", {
                url,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get("content-type"),
                body
            });

            throw new Error(`Nekos.best responded with status ${response.status}`);
        }

        const data = await response.json();

        const actionImage = data.results?.[0]?.url;

        if (!actionImage) {
            console.error("[Nekos.best] Invalid response", {
                url,
                data
            });

            throw new Error(`No ${action} image returned from Nekos.best`);
        }

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.user} muốn ${actionText} ${targetUser}`)
            .setImage(actionImage)
            .setColor(0xff6b6b);

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error("[Action Command Error]", {
            action,
            user: interaction.user.tag,
            target: targetUser?.tag,
            error: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : error,
        });

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: `Không lấy được gif ${actionText} rồi, thử lại sau nha.`,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: `Không lấy được gif ${actionText} rồi, thử lại sau nha.`,
                ephemeral: true,
            });
        }
    }
}
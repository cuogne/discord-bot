import { loadConfig } from './utils/loadConfig.js';
import { saveConfig } from './utils/saveConfig.js';
import { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export async function setupChannelSubCommand(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const selectedChannel = interaction.options.getChannel('channel');  // lay kenh tu option
    const targetChannel = selectedChannel || interaction.channel;       // lay kenh hien tai

    if (!interaction.guild) {
        await interaction.editReply({
            embeds: [{
                title: "Lỗi",
                description: "Lệnh này chỉ có thể sử dụng trong server. Bạn hãy mời bot vào server của bạn để dùng nhé!",
                color: 0xff0000
            }],
            ephemeral: true
        });
        return;
    }

    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await interaction.editReply({
            embeds: [{
                title: "❌ Không có quyền",
                description: "Bạn cần quyền **Manage Channels** để thiết lập kênh tin tức.",
                color: 0xff0000
            }],
            ephemeral: true
        });
        return;
    }

    // Kiểm tra loại kênh
    if (targetChannel.type !== ChannelType.GuildText) {
        await interaction.editReply({
            embeds: [{
                title: "❌ Loại kênh không hợp lệ",
                description: "Chỉ có thể thiết lập tin tức cho **text channel**.",
                color: 0xff0000
            }],
            ephemeral: true
        });
        return;
    }

    // Kiểm tra quyền bot trong kênh
    const botPermissions = targetChannel.permissionsFor(interaction.client.user.id);

    if (!botPermissions || !botPermissions.has([
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks
    ])) {
        await interaction.editReply({
            embeds: [{
                title: "❌ Bot không có quyền",
                description: `Bot cần quyền **Send Messages** và **Embed Links** trong kênh ${targetChannel}.`,
                color: 0xff0000
            }],
            ephemeral: true
        });
        return;
    }

    const guildId = interaction.guildId;
    const existing = await loadConfig(guildId);

    if (existing && existing.channelId === targetChannel.id) {
        await interaction.editReply({
            embeds: [{
                title: "⚠️ Kênh đã được Setup",
                description: `Kênh ${targetChannel} đã được setup để nhận tin tức từ trước.`,
                color: 0xffaa00,
                fields: [
                    {
                        name: "📅 Setup lúc",
                        value: `<t:${Math.floor(new Date(existing.setupAt).getTime() / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: "👤 Setup bởi",
                        value: `<@${existing.setupBy}>`,
                        inline: true
                    }
                ]
            }],
            ephemeral: true
        });
        return;
    }

    // tao embed xac nhan
    const confirmEmbed = new EmbedBuilder()
        .setTitle("📢 Xác nhận thiết lập kênh")
        .setDescription(`Bạn có chắc chắn muốn thiết lập kênh ${targetChannel} để nhận tin tức từ **FIT-HCMUS** không?`)
        .addFields(
            { name: "📍 Kênh được chọn", value: `<#${targetChannel.id}> (#${targetChannel.name})`, inline: false },
            { name: "Kênh đã được thiết lập", value: existing && existing.channelId && existing.channelName ? `<#${existing.channelId}> (${existing.channelName})` : "Không có", inline: false },
            { name: "🏠 Server", value: interaction.guild.name, inline: false }
        )
        .setColor(0x0099ff)
        .setFooter({ text: "Hết hạn sau 30 giây" });

    // button yes/no
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_yes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('confirm_no')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)
        );

    const confirmMessage = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [row],
        ephemeral: true
    });

    const collector = confirmMessage.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id && ['confirm_yes', 'confirm_no'].includes(i.customId),
        time: 30000 // 30 giây
    });

    collector.on('collect', async i => {
        await i.deferUpdate();

        if (i.customId === 'confirm_no') {
            await interaction.editReply({
                embeds: [{
                    title: "❌ Đã hủy",
                    description: "Thao tác thiết lập kênh đã bị hủy.",
                    color: 0xff0000
                }],
                components: [],
                ephemeral: true
            });
            collector.stop('cancelled');
            return;
        }

        // yes
        const data = {
            channelId: targetChannel.id,
            channelName: targetChannel.name,
            guildName: interaction.guild.name,
            setupBy: interaction.user.id,
            setupAt: new Date().toISOString(),
            isActive: true
        };

        const saved = await saveConfig(guildId, data);
        if (!saved) {
            await interaction.editReply({
                embeds: [{
                    title: "❌ Lỗi hệ thống",
                    description: "Không thể lưu cấu hình. Vui lòng thử lại sau.",
                    color: 0xff0000
                }],
                components: [],
                ephemeral: true
            });
            collector.stop('error');
            return;
        }

        // Thông báo thành công
        await interaction.editReply({
            embeds: [{
                title: "✅ Thiết lập thành công!",
                description: `Kênh ${targetChannel} đã được thiết lập để nhận tin tức tự động từ **FIT-HCMUS**.`,
                color: 0x00ff00,
                fields: [
                    {
                        name: "📍 Kênh được chọn",
                        value: `${targetChannel} (#${targetChannel.name})`,
                        inline: true
                    },
                    {
                        name: "🏠 Server",
                        value: interaction.guild.name,
                        inline: true
                    },
                    {
                        name: "👤 Setup bởi",
                        value: `${interaction.user}`,
                        inline: true
                    }
                ]
            }],
            components: [],
            ephemeral: true
        });

        // Gửi thông báo đến kênh đích
        try {
            await targetChannel.send({
                embeds: [{
                    title: "🎉 FIT-HCMUS News!",
                    description: "Kênh này đã được thiết lập để nhận tin tức tự động từ **Khoa Công nghệ Thông tin - FIT@HCMUS**.\n\n Nếu bạn không muốn nhận thông báo nữa, vui lòng dùng lệnh: \n`/fit-hcmus-news remove`.",
                    color: 0x0099ff,
                    timestamp: new Date().toISOString()
                }]
            });
        } catch (error) {
            console.error('❌ Không thể gửi tin thử:', error);
        }

        collector.stop('success');
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            await interaction.editReply({
                embeds: [{
                    title: "⏰ Hết thời gian xác nhận",
                    description: "Thao tác thiết lập kênh đã bị hủy do không nhận được phản hồi.",
                    color: 0xffaa00
                }],
                components: [],
                ephemeral: true
            });
        }
    });
}
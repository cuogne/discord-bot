import { getToday } from './utils/getToday.js';
import { getData } from './utils/getData.js';
import { EmbedBuilder } from 'discord.js';


export async function giaxangCommand(interaction) {
  await interaction.deferReply();

  const today = getToday();
  const data = await getData(today);

  if (!data) {
    await interaction.editReply('Không có dữ liệu giá xăng cho ngày hôm nay.');
    return;
  }

  /*
  [
    {
      "title": "Xăng RON 95-V",
      "date": "2026-03-21 00:00:00",
      "zone1_price": 31090
    },
  ]
  */

  
  const embed = new EmbedBuilder()
    .setTitle(`Giá xăng dầu ngày ${today.split('-').reverse().join('/')}`)
    .setColor(0x0099ff)

  data.forEach(({ title, zone1_price }) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(zone1_price);

    embed.addFields({
      name: `**⛽️ ${title}**`,
      value: `${formattedPrice} VND/lít`,
      inline: false
    });
  });

  // embed.setFooter({ text: 'Data from giaxanghomnay.com' });

  await interaction.editReply({ 
    embeds: [embed]
  });

}
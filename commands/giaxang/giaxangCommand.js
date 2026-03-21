import fs from 'fs';
import path from 'path';
import { getToday } from './utils/getToday.js';
import { getPath } from './utils/getPath.js';
import { getData } from './utils/getData.js';
import { EmbedBuilder } from 'discord.js';


export async function giaxangCommand(interaction) {
  await interaction.deferReply();

  // flow: 
  // check file path -> if exist -> read file -> send data
  // if not exist -> fetch data -> write file -> send data

  const today = getToday();
  const filePath = `${today}.json`;
  const dir = getPath();
  const fileStore = fs.readdirSync(dir)

  if (!fileStore.includes(filePath)) {
    // clear old files, fetch data, write file and send data
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file !== '.gitkeep' && !file.startsWith(today)) {
        fs.unlinkSync(path.join(dir, file));
      }
    });

    try {
      const data = await getData(today);
      if (data) {
        const dataToWrite = JSON.stringify(data, null, 2);
        fs.writeFileSync(path.join(dir, filePath), dataToWrite, 'utf-8');
      }
    }
    catch (error) {
      console.error('Error fetching or writing gas price data:', error);
      await interaction.editReply('Có lỗi xảy ra khi lấy dữ liệu giá xăng hôm nay.');
      return;
    }
  }

  // read file
  const data = JSON.parse(fs.readFileSync(path.join(dir, filePath), 'utf-8'));

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
import { club } from "../data/club.js";
import { separateDate } from "../utils/separateDate.js";
import { ESPN_HEADERS, logEspnError } from "../utils/espnFetch.js";

export async function footballClubCommand(interaction) {
    await interaction.deferReply();

    const id_club = interaction.options.getString('club');
    const club_info = club[id_club];
    const link = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/teams/${id_club}/schedule?fixture=true`

    try {
        const response = await fetch(link, { headers: ESPN_HEADERS });
        const data = await response.json();

        const fields = []

        for (const event of data.events) {
            // console.log(event.date)
            // const date = separateDate((event.date).split('T')[0]);
            // const hour = (event.date).split('T')[1].split('Z')[0];

            const matchDateUTC = new Date(event.date);
            const dayVN = matchDateUTC.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
            const hourVN = matchDateUTC.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Ho_Chi_Minh'
            });

            const tournament = event.seasonType.name;

            const homeTeam = (event.competitions[0].competitors).find(c => c.homeAway === 'home').team.displayName;
            const awayTeam = (event.competitions[0].competitors).find(c => c.homeAway === 'away').team.displayName;

            fields.push({
                name: `📆 **Ngày: ${separateDate(dayVN)} ** \n**${hourVN}** | ${homeTeam} vs ${awayTeam}`,
                value: `🏆 ${tournament}`,
                inline: false
            })

            if (fields.length === 5) {
                break;
            }
        };

        await interaction.editReply({
            embeds: [
                {
                    title: `⚽ Lịch thi đấu của ${club_info.name} ⚽`,
                    color: 0x0099ff,
                    fields,
                    thumbnail: {
                        url: club_info.linkImg,
                    },
                    footer: {
                        text: 'Giờ hiển thị theo giờ Việt Nam'
                    }
                }
            ]
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy lịch đá banh:', error);
        logEspnError('footballClubCommand', error, link);
        await interaction.editReply('Có lỗi xảy ra khi lấy lịch đá banh.');
    }
}
import { tournaments } from "../data/tournament.js";
import { separateDate } from "../utils/separateDate.js";
import { getTodayAndTwoWeeksLater } from "../utils/getTodayAndTwoWeeksLater.js";
import { ESPN_HEADERS, logEspnError } from "../utils/espnFetch.js";

export async function footballTournamentCommand(interaction) {
    await interaction.deferReply();

    const tournament = interaction.options.getString('tournament'); // get option from user
    const linkImg = tournaments[tournament].img; // get link image

    try {
        let listMatchDay = getTodayAndTwoWeeksLater();
        
        const fetchMatchesForDate = async () => {
            const api = `http://site.api.espn.com/apis/site/v2/sports/soccer/${tournament}/scoreboard?dates=${listMatchDay[0]}-${listMatchDay[1]}`;
            const res = await fetch(api, { headers: ESPN_HEADERS });

            const bodyText = await res.text();

            if (!res.ok) {
                console.error('=== CHI TIET LOI API ===');
                console.error('Status:', res.status, `(${res.statusText})`);
                console.error('Request URL:', api);
                console.error('Request User-Agent:', res.headers.get('user-agent') || 'undefined');
                console.error('Response Body:', bodyText.slice(0, 2000));
                console.error('========================');

                const err = new Error(`API lỗi với status ${res.status}`);
                err.status = res.status;
                err.statusText = res.statusText;
                err.body = bodyText;
                throw err;
            }

            return JSON.parse(bodyText);
        };

        const data = await fetchMatchesForDate();
        const matchDataArray = [ data];

        const listMatch = [];

        matchDataArray.forEach(data => {
            if (!data || !data.events || data.events.length === 0) {
                // listMatch.push({ date, match: "Không có trận đấu." });
                return;
            }

            data.events.forEach(event => {
                const matchDateUTC = new Date(event.date);

                // format ngay thanh yyyy-mm-dd theo gio VN
                const yearVN = matchDateUTC.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

                // format gio thanh => hh:mm
                const matchTimeVN = matchDateUTC.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Ho_Chi_Minh'
                });

                const competitors = event.competitions[0].competitors;
                const homeTeam = competitors.find(c => c.homeAway === 'home').team.displayName; // san nha
                const awayTeam = competitors.find(c => c.homeAway === 'away').team.displayName; // san khach

                listMatch.push({
                    date: separateDate(yearVN),
                    match: `**${matchTimeVN}** | ${homeTeam} vs ${awayTeam}`
                });
            });
        });

        // luu cac tran dau theo ngay
        const matchesByDate = {};
        for (let i = 0; i < listMatch.length; i++) {
            const { date, match } = listMatch[i];
            if (!matchesByDate[date]) {
                matchesByDate[date] = [];
            }
            matchesByDate[date].push(match);
        }

        let fields = [];
        // tao thanh cac fields de bot reply
        if (Object.keys(matchesByDate).length === 0) {
            fields = [{
                name: `**📅 Ngày: Chưa xác định**`,
                value: `Không có trận đấu nào trong vòng 2 tuần tới.`,
                inline: false
            }]
        }
        else {
            for (const date in matchesByDate) {
                if (matchesByDate.hasOwnProperty(date)) {
                    fields.push({
                        name: `**📅 Ngày: ${date}**`,
                        value: matchesByDate[date].join('\n'),
                        inline: false
                    });
                }
            }
        }

        await interaction.editReply({
            embeds: [
                {
                    title: `⚽ Lịch thi đấu ${tournaments[tournament].name} ⚽`,
                    color: 0x0099ff,
                    fields,
                    thumbnail: {
                        url: linkImg,
                    },
                    footer: {
                        text: 'Giờ hiển thị theo giờ Việt Nam'
                    }
                }
            ]
        });

    } catch (error) {
        console.error('Lỗi khi lấy lịch đá banh:', error);
        logEspnError('footballTournamentCommand', error);
        await interaction.editReply('Có lỗi xảy ra khi lấy lịch đá banh.');
    }
}
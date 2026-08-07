import { ESPN_HEADERS, logEspnError } from "../utils/espnFetch.js";

function pad(str, len) {
    return str.length < len ? str + ' '.repeat(len - str.length) : str
}

function getData(team, statName) {
    const stat = team.stats.find(s => s.name === statName);
    return stat ? stat.value : 'N/A'
}

const LEAGUE = {
    'eng.1': { name: 'Premier League'},
    'esp.1': { name: 'La Liga'},
    'ger.1': { name: 'Bundesliga'},
    'ita.1': { name: 'Serie A'},
    'fra.1': { name: 'Ligue 1'},
}

const maxWidth = {
    pos: 2,
    name: 20,
    mp: 2,
    pts: 3,
    w: 2,
    d: 2,
    l: 2,
    gf: 3,
    ga: 3,
    gd: 3
};

export async function footballRankCommand(interaction) {
    await interaction.deferReply();
    try {
        const league = interaction.options.getString('league')
        const season = interaction.options.getString('season')

        if (season > new Date().getFullYear() || season < 2000) {
            return await interaction.editReply({
                content: 'Mùa giải không hợp lệ. Vui lòng chọn mùa giải từ 2001 đến hiện tại.',
            });
        }

        const link = `https://site.web.api.espn.com/apis/v2/sports/soccer/${league}/standings?season=${season}`;
        const res = await fetch(link, { headers: ESPN_HEADERS });
        const data = await res.json();

        if (!data || !data.children || data.children.length === 0) {
            return await interaction.editReply({
                content: 'Không tìm thấy dữ liệu bảng xếp hạng cho giải đấu và mùa giải đã chọn.',
            });
        }

        const standings = data.children[0].standings.entries;

        let rankMessage = `🏆 **Bảng xếp hạng ${LEAGUE[league].name} ${season}/${parseInt(season) + 1}** 🏆\n`;

        rankMessage += "```\n"; 
        rankMessage += `${pad("#", maxWidth.pos)} | ${pad("Tên đội bóng", maxWidth.name)} | MP | Pts | W  | D  | L  | GF  | GA  | GD \n`;
        rankMessage += "-".repeat(69) + "\n";

        standings.forEach((team, index) => {
            const rank = pad((index + 1).toString(), maxWidth.pos)

            let clubName = pad(team.team.displayName, maxWidth.name)

            if (clubName.length > maxWidth.name) {
                clubName = clubName.slice(0, maxWidth.name - 3) + '...'
            }

            const points = pad(getData(team, 'points').toString(), maxWidth.pts)
            const matchesPlayed = pad(getData(team, 'gamesPlayed').toString(), maxWidth.mp)
            const wins = pad(getData(team, 'wins').toString(), maxWidth.w)
            const draws = pad(getData(team, 'ties').toString(), maxWidth.d)
            const losses = pad(getData(team, 'losses').toString(), maxWidth.l)
            const goalsFor = pad(getData(team, 'pointsFor').toString(), maxWidth.gf)
            const goalsAgainst = pad(getData(team, 'pointsAgainst').toString(), maxWidth.ga)
            
            let goalDifference = parseInt(goalsFor) - parseInt(goalsAgainst)
            if (goalDifference > 0) goalDifference = '+' + goalDifference
            goalDifference = pad(goalDifference.toString(), maxWidth.gd)

            rankMessage += `${rank} | ${clubName} | ${matchesPlayed} | ${points} | ${wins} | ${draws} | ${losses} | ${goalsFor} | ${goalsAgainst} | ${goalDifference}\n`;
        });

        rankMessage += "```";

        await interaction.editReply({
            content: rankMessage
        });
    }
    catch (error) {
        console.error('Error fetching football rank data:', error);
        logEspnError('footballRankCommand', error, link);
        await interaction.editReply({
            content: '❌ Đã xảy ra lỗi khi lấy dữ liệu bảng xếp hạng.',
        });
    }
}

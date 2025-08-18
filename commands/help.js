const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { managers } = require('../utils/managers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all available commands and their descriptions'),

  async execute(interaction) {
    const user = interaction.user.id;
    const isManager = managers[user] ? true : false;

    const embed = new EmbedBuilder()
      .setTitle('📋 PSL Command Help')
      .setDescription('Here are all the available commands in the Pure Soccer League bot:')
      .setColor(0x2f3136)
      .setThumbnail('https://media.discordapp.net/attachments/1406063047197327513/1406828600073785425/PSL_LOGO_WHITE.png?ex=68a3e2bb&is=68a2913b&hm=747f3479aa0c7b4ae40bd5f14378d0f78c93132eb39a909ae3ef912b7f232311&=&format=webp&quality=lossless&width=650&height=650')
      .setFooter({
          text: '[PSL] Pure Soccer League - ' + new Date().toLocaleString(),
          iconURL: 'https://media.discordapp.net/attachments/1406063047197327513/1406828600073785425/PSL_LOGO_WHITE.png?ex=68a3e2bb&is=68a2913b&hm=747f3479aa0c7b4ae40bd5f14378d0f78c93132eb39a909ae3ef912b7f232311&=&format=webp&quality=lossless&width=650&height=650'
      })
      .setTimestamp();

    // plr
    embed.addFields({
      name: '👥 Player Commands',
      value: 
        '`/freeagent` - Register yourself as a free agent\n' +
        '• Select your position and region\n' +
        '• 24-hour cooldown between uses\n' +
        '• Cannot be used if already contracted\n\n' +

        '`/friendly` - Look for friendly matches\n' +
        '• Choose region and match type\n' +
        '• 10-minute cooldown between uses\n' +
        '• Upload image if "IN GAME ALREADY"\n\n' +

        '`/help` - Display this help menu\n' +
        '• Shows all available commands\n' +
        '• Displays different info for managers vs players',
      inline: false
    });

    // manager
    if (isManager) {
      const teamData = managers[user];
      embed.addFields({
        name: '👔 Manager Commands',
        value: 
          '`/contract @user` - Send a contract to a player\n' +
          '• Send contracts to free agents\n' +
          '• Players can accept or decline\n' +
          '• Cannot contract other managers or bots\n\n' +

          '`/scout [position] [message]` - Scout for players\n' +
          '• Post scouting messages for specific positions\n' +
          '• Include custom message describing what you need\n' +
          '• Shows your team info in the post\n' +
          '• 24-hour cooldown between uses\n\n' +

          '`/release @user` - Release a player from your team\n' +
          '• Release players contracted to your team\n' +
          '• Cannot release managers or uncontracted players\n' +
          '• Announces release in dedicated channel\n\n' +

          '`/forcerelease @user` - Force release a player *(Director+ Only)*\n' +
          '• Force releases a player from their team\n' +
          '• Bypasses manager restrictions\n' +
          '• Director command only\n\n' +

          '`/friendly` - Look for friendly matches\n' +
          '• Enhanced display with team info\n' +
          '• Pings additional manager roles\n' +
          '• Same functionality as player version',
        inline: false
      });

      embed.addFields({
        name: '🏆 Your Team',
        value: `${teamData.emoji} \`${teamData.team}\``,
        inline: true
      });
    } else {
      embed.addFields({
        name: '👔 Manager Commands',
        value: 
          '`/contract @user` - Send contracts to players *(Managers Only)*\n' +
          '`/scout [position] [message]` - Scout for players *(Managers Only)*\n' +
          '`/release @user` - Release players from team *(Managers Only)*\n' +
          '`/forcerelease @user` - Force release players *(Director+)*',
        inline: false
      });
    }

    // gen
    embed.addFields({
      name: '📍 Available Positions',
      value: 'GK, CB, CDM, CM, CAM, CF, ST',
      inline: true
    });

    embed.addFields({
      name: '🤝 Friendly Match Options',
      value: 'DM TO PLAY, IN GAME ALREADY',
      inline: true
    });

    embed.addFields({
      name: '🌍 Available Regions',
      value: 'GMT, BST, EST, CST, PST, UTC, WEST, EET, EEST, MSK, OTHER',
      inline: true
    });

    embed.addFields({
      name: '❓ Need Help?',
      value: 
        '• Free agents are posted in the transfer channel\n' +
        '• Managers can scout, contract, and release players\n' +
        '• Players must be released before joining new teams\n' +
        '• Transfer window must be open for most actions\n' +
        '• Friendly matches help teams practice and stay active\n' +
        '• Use image uploads to show your server when "IN GAME ALREADY"',
      inline: false
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
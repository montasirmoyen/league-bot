const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { managers } = require('../utils/managers');

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scout')
    .setDescription('Scout for players in a specific position')
    .addStringOption(option => 
      option.setName('position')
        .setDescription('Position you are scouting for')
        .setRequired(true)
        .addChoices(
          {name : 'ALL', value: 'ALL'},
          { name: 'GK', value: 'GK' },
          { name: 'CB', value: 'CB' },
          { name: 'CDM', value: 'CDM' },
          { name: 'CM', value: 'CM' },
          { name: 'CAM', value: 'CAM' },
          { name: 'CF', value: 'CF' },
          { name: 'ST', value: 'ST' }
        )
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your scouting message')
        .setRequired(true)
        .setMaxLength(1000)
    ),

  async execute(interaction) {
    const user = interaction.user.id;
    const position = interaction.options.getString('position');
    const message = interaction.options.getString('message');

    if (!managers[user]) {
      return interaction.reply({ content: '❌ Only authorized managers can use this command.', ephemeral: true });
    }

  
    const cooldownAmount = 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (cooldowns.has(user)) {
      const expirationTime = cooldowns.get(user) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);

        return interaction.reply({ 
          content: `⏰ You're on cooldown! You can scout again in ${hours}h ${minutes}m.`, 
          ephemeral: true 
        });
      }
    }


    cooldowns.set(user, now);


    setTimeout(() => {
      cooldowns.delete(user);
    }, cooldownAmount);

    const teamData = managers[user];

    const embed = new EmbedBuilder()
      .setTitle('🔍 Player Scout')
      .setDescription(
        `${teamData.emoji} \`${teamData.team}\` is scouting for players!\n\n` +
        `📌 **Position**: ${position}\n\n` +
        `💬 **Message**:\n${message}\n\n` +
        `*If you're interested and available, feel free to DM the manager!*`
      )
      .setAuthor({
        name: interaction.user.displayName,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setFooter({
          text: '[PSL] Pure Soccer League - ' + new Date().toLocaleString(),
          iconURL: 'https://media.discordapp.net/attachments/1406063047197327513/1406828600073785425/PSL_LOGO_WHITE.png?ex=68a3e2bb&is=68a2913b&hm=747f3479aa0c7b4ae40bd5f14378d0f78c93132eb39a909ae3ef912b7f232311&=&format=webp&quality=lossless&width=650&height=650'
      })
      .setColor(0x00ff00)
      .setTimestamp();

    const targetChannel = interaction.client.channels.cache.get('1400084855236198400');
    if (targetChannel) {
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Your scouting message has been posted!', ephemeral: true });
    } else {
      await interaction.reply({ content: '⚠️ Could not find the scouting channel.', ephemeral: true });
    }
  }
};
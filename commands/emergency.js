const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { managers, enabled } = require('../utils/managers');
const db = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emergencysign')
    .setDescription('Emergency sign a player (bypasses normal restrictions)')
    .addUserOption(option => 
      option.setName('player')
        .setDescription('Player to emergency sign')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for emergency signing')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sender = interaction.user.id;
    const player = interaction.options.getUser('player');
    const reason = interaction.options.getString('reason');


    if (!managers[sender]) {
      return interaction.reply({ content: '❌ You are not an authorized manager.', ephemeral: true });
    }

    if (managers[player.id]) {
      return interaction.reply({ content: '❌ You cannot sign another manager.', ephemeral: true });
    }

    if (player.id === sender) {
      return interaction.reply({ content: '❌ You cannot sign yourself.', ephemeral: true });
    }

    if (player.bot) {
      return interaction.reply({ content: '❌ You cannot sign bots.', ephemeral: true });
    }

    try {
      const existingContract = await db.getContractedTeam(player.id);
      const teamData = managers[sender];

      const embed = new EmbedBuilder()
        .setTitle('🚨 PSL Emergency Contract')
        .setDescription(
          `**EMERGENCY SIGNING**\n` +
          `By accepting this emergency contract, <@${player.id}>, you agree to join the team immediately.\n\n` +
          `${existingContract ? `⚠️ **Current Team**: ${existingContract.emoji} \`${existingContract.teamName}\`\n` : ''}` +
          `🆕 **New Team**: ${teamData.emoji} \`${teamData.team}\`\n\n` +
          `📋 **Emergency Reason**\n\`${reason}\`\n\n` +
          `🖊️ **Authorized By**\n<@${sender}>\n\n` +
          `⚠️ **Note**: This is an emergency signing that may override existing contracts.`
        )
        .setFooter({
          text: '[PSL] Pure Soccer League - ' + new Date().toLocaleString(),
          iconURL: 'https://media.discordapp.net/attachments/1406063047197327513/1406828600073785425/PSL_LOGO_WHITE.png?ex=68a3e2bb&is=68a2913b&hm=747f3479aa0c7b4ae40bd5f14378d0f78c93132eb39a909ae3ef912b7f232311&=&format=webp&quality=lossless&width=650&height=650'
        })
        .setColor(0xff6b6b); 

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`emergency_accept_${sender}_${teamData.team}_${player.id}`)
          .setLabel('Accept Emergency Contract')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🚨'),
        new ButtonBuilder()
          .setCustomId(`emergency_decline_${sender}_${teamData.team}_${player.id}`)
          .setLabel('Decline')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ 
        content: `🚨 <@${player.id}> **EMERGENCY CONTRACT** - Immediate response required!`, 
        embeds: [embed], 
        components: [buttons] 
      });

    } catch (err) {
      console.error('Database error:', err);
      return interaction.reply({ content: '⚠️ Database error occurred.', ephemeral: true });
    }
  }
};
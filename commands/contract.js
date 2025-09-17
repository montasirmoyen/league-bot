const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { managers, enabled } = require('../utils/managers');
const db = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('contract')
    .setDescription('Send a contract to a player')
    .addUserOption(option =>
      option.setName('signee')
        .setDescription('User to send the contract to')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sender = interaction.user.id;
    const signee = interaction.options.getUser('signee');

    const guild = interaction.client.guilds.cache.get('1399571290108723200');
    const member = guild?.members.cache.get(interaction.user.id)
      || await guild?.members.fetch(interaction.user.id).catch(() => null);

    if (!member?.roles.cache.has('1417919425398440088')) {
      return interaction.reply({
        content: '⚠️ The transfer window is currently closed.',
        ephemeral: true
      });
    }

    const guild2 = interaction.client.guilds.cache.get('1399571290108723200');
    const member2 = guild2?.members.cache.get(sender)
      || await guild2?.members.fetch(sender).catch(() => null);

    if (member2?.roles.cache.has('1417920707534524476')) {
      return interaction.reply({
        content: '⚠️ You have the block contract role, you cannot use this command at this momenet.',
        ephemeral: true
      });
    }

    if (managers[signee.id]) {
      return interaction.reply({ content: '❌ You cannot contract another manager.', ephemeral: true });
    }

    if (signee.id === sender) {
      return interaction.reply({ content: '❌ You cannot contract yourself.', ephemeral: true });
    }

    if (signee.bot) {
      return interaction.reply({ content: '❌ You cannot contract bots.', ephemeral: true });
    }

    try {
      const row = await db.getContractedTeam(signee.id);

      if (row) {
        return interaction.reply({ content: `❌ <@${signee.id}> is already contracted to **${row.teamName}**`, ephemeral: true });
      }

      const teamData = managers[sender];

      const embed = new EmbedBuilder()
        .setTitle('📑 PSL Contract')
        .setDescription(
          `By accepting this contract, you agree to the terms established by the manager\n` +
          `and acknowledge the team assigned to you, <@${signee.id}>\n\n` +
          `⚠️ **Note**: You cannot join another team until you are released.\n\n` +
          `🧾 **Team**\n**${teamData.team}**\n\n` +
          `🖊️ **Signed By**\n<@${sender}>\n\n`
        )
        .setFooter({
          text: '[PSL] Pure Soccer League - ' + new Date().toLocaleString(),
          iconURL: 'https://media.discordapp.net/attachments/1396248400122613861/1415814787044081805/PSL_LOGO_WHITE.png?ex=68c493c5&is=68c34245&hm=bdc17b94895be0ce7e1591c3d284af2ae772dbc9e692fac34e1114b8be73ea52&=&format=webp&quality=lossless&width=1440&height=1440'
        })
        .setColor(0x2f3136);

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_${sender}_${teamData.team}_${signee.id}`)
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`decline_${sender}_${teamData.team}_${signee.id}`)
          .setLabel('Decline')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ content: `<@${signee.id}> Pending your decision!`, embeds: [embed], components: [buttons] });
    } catch (err) {
      console.error('Database error:', err);
      return interaction.reply({ content: '⚠️ Database error occurred.', ephemeral: true });
    }
  }
};

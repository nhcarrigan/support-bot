import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

import { BotInt } from "../../interfaces/BotInt";
import { ButtonHandler } from "../../interfaces/ButtonHandler";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles the process of claiming a ticket.
 *
 * @param {BotInt} Bot The bot object.
 * @param {CommandInteraction} interaction The resulting interaction from clicking the claim button.
 */
export const claimHandler: ButtonHandler = async (Bot, interaction) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const { guild, message, member } = interaction;
    const { embeds } = message;

    if (!guild || !member) {
      await interaction.editReply({
        content: "Error finding the guild!",
      });
      return;
    }

    const supportRole = await guild.roles.fetch(Bot.supportRole);

    if (!supportRole) {
      await interaction.editReply("Cannot find support role!");
      return;
    }

    const isSupport = (member as GuildMember).roles.cache.has(supportRole.id);

    if (!isSupport && member.user.id !== Bot.botOwner) {
      await interaction.editReply({
        content: "Only support members can claim a ticket.",
      });
      return;
    }

    const ticketEmbed = embeds[0] as MessageEmbed;
    ticketEmbed.setFields([
      {
        name: "Claimed by:",
        value: `<@${member.user.id}>`,
      },
    ]);

    const claimButton = new MessageButton()
      .setCustomId("claim")
      .setStyle("SUCCESS")
      .setLabel("Claim this ticket!")
      .setEmoji("✋")
      .setDisabled(true);
    const closeButton = new MessageButton()
      .setCustomId("close")
      .setStyle("DANGER")
      .setLabel("Close this ticket!")
      .setEmoji("🗑️");

    const row = new MessageActionRow().addComponents([
      claimButton,
      closeButton,
    ]);

    await (message as Message).edit({
      embeds: [ticketEmbed],
      components: [row],
    });

    await interaction.editReply("You have been assigned this ticket.");
  } catch (err) {
    await errorHandler("claim handler", err);
  }
};

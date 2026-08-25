require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag}`);

  client.application.commands.set([
    {
      name: "vouch",
      description: "Wyślij przykładowy verified vouch"
    }
  ]);
});

client.on(Events.InteractionCreate, async interaction => {

  // Komenda /vouch
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "vouch") {

      const embed = new EmbedBuilder()
        .setColor("#22c55e")
        .setAuthor({
          name: "🛡️ VERIFIED VOUCH"
        })
        .setTitle("Transakcja zweryfikowana")
        .setDescription(
          "System potwierdził zakończenie wymiany.\n### ⭐ Zweryfikowany klient"
        )
        .addFields(
          { name: "🆔 ID", value: "`#2712`", inline: true },
          { name: "👤 Klient", value: interaction.user.toString(), inline: true },
          { name: "💼 Realizator", value: "<@123456789>", inline: true },
          { name: "📦 Produkt", value: "1000 ROBUX", inline: true },
          { name: "💳 Płatność", value: "31 PLN • BLIK", inline: true },
          { name: "⏰ Data", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({
          text: "Cherry Exchange • Verified Voucher"
        });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("review")
            .setLabel("Dodaj opinię")
            .setEmoji("⭐")
            .setStyle(ButtonStyle.Success)
        );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

  }

  // Kliknięcie przycisku
  if (interaction.isButton()) {

    if (interaction.customId === "review") {

      const modal = new ModalBuilder()
        .setCustomId("review_modal")
        .setTitle("Dodaj opinię");

      const stars = new TextInputBuilder()
        .setCustomId("stars")
        .setLabel("Ocena (1-5)")
        .setPlaceholder("5")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const opinion = new TextInputBuilder()
        .setCustomId("opinion")
        .setLabel("Twoja opinia")
        .setPlaceholder("Mega szybka realizacja 🔥")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(stars),
        new ActionRowBuilder().addComponents(opinion)
      );

      return interaction.showModal(modal);

    }

  }

  // Wysłanie opinii
  if (interaction.isModalSubmit()) {

    if (interaction.customId === "review_modal") {

      const stars = interaction.fields.getTextInputValue("stars");
      const opinion = interaction.fields.getTextInputValue("opinion");

      const old = EmbedBuilder.from(interaction.message.embeds[0]);

      old.addFields({
        name: `⭐ Opinia klienta (${stars}/5)`,
        value: `> ${opinion}\n\n**Verified Buyer:** ${interaction.user}`
      });

      await interaction.message.edit({
        embeds: [old],
        components: []
      });

      return interaction.reply({
        content: "✅ Dziękujemy za opinię!",
        ephemeral: true
      });

    }

  }

});

client.login(process.env.TOKEN);

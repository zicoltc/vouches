require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  Events
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag}`);

  const cmd = new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Wyślij własny embed")
    .addStringOption(opt =>
      opt
        .setName("tekst")
        .setDescription("Wklej cały wygląd embeda")
        .setRequired(true)
    );

  await client.application.commands.set([cmd]);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "embed") return;

  const raw = interaction.options.getString("tekst");

  const lines = raw.split("\n");
  let title = "";
  let desc = [];

  for (const line of lines) {
    if (line.startsWith("# ") && !title) {
      title = line.replace("# ", "");
    } else {
      desc.push(line);
    }
  }

  const embed = new EmbedBuilder()
    .setColor("#EBA714")
    .setDescription(desc.join("\n"))
    .setTimestamp();

  if (title) embed.setTitle(title);

  const footerLine = desc.find(x => x.startsWith("- "));
  if (footerLine) {
    embed.setFooter({
      text: footerLine.replace("- ", "")
    });

    embed.setDescription(
      desc.filter(x => x !== footerLine).join("\n")
    );
  }

  await interaction.reply({
    embeds: [embed]
  });
});

client.login(process.env.TOKEN);

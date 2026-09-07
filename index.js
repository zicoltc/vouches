require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Rejestracja komendy
const commands = [
  new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Usuwa wszystkie kanały na serwerze")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Komenda /nuke zarejestrowana");
  } catch (err) {
    console.error(err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "nuke") return;

  await interaction.reply({
    content: "🗑️ Usuwam wszystkie kanały...",
    ephemeral: true
  });

  const channels = interaction.guild.channels.cache;

  for (const channel of channels.values()) {
    try {
      await channel.delete("Masowe czyszczenie kanałów");
    } catch (e) {
      console.log(`Nie udało się usunąć ${channel.name}`);
    }
  }
});

client.login(process.env.TOKEN);

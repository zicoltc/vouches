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

// =========================
// KOMENDY
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("nuke")
    .setDescription("Usuwa wszystkie kanały na serwerze")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
].map(command => command.toJSON());

// =========================
// SPRAWDZANIE ENV
// =========================

if (!process.env.TOKEN) {
  console.error("❌ Brak TOKEN w zmiennych środowiskowych!");
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error("❌ Brak CLIENT_ID w zmiennych środowiskowych!");
  process.exit(1);
}

if (!process.env.GUILD_ID) {
  console.error("❌ Brak GUILD_ID w zmiennych środowiskowych!");
  process.exit(1);
}

// =========================
// REST
// =========================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// =========================
// READY
// =========================

client.once("ready", async () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
  console.log(`🆔 CLIENT_ID: ${process.env.CLIENT_ID}`);
  console.log(`🏠 GUILD_ID: ${process.env.GUILD_ID}`);

  try {
    console.log("⏳ Rejestruję komendę /nuke...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log("✅ Komenda /nuke została zarejestrowana na serwerze!");
  } catch (error) {
    console.error("❌ Błąd podczas rejestracji komendy:");
    console.error(error);
  }
});

// =========================
// INTERAKCJE
// =========================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== "nuke") return;

  // Sprawdzenie serwera
  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Ta komenda może być używana tylko na serwerze.",
      ephemeral: true
    });
  }

  // Sprawdzenie administratora
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Nie masz uprawnień administratora.",
      ephemeral: true
    });
  }

  await interaction.reply({
    content: "🗑️ Usuwam wszystkie kanały...",
    ephemeral: true
  });

  try {
    const channels = await interaction.guild.channels.fetch();

    console.log(`🗑️ Znaleziono ${channels.size} kanałów.`);

    let deleted = 0;
    let failed = 0;

    for (const [id, channel] of channels) {
      try {
        await channel.delete("Masowe czyszczenie kanałów");
        deleted++;

        console.log(`✅ Usunięto: ${channel.name}`);
      } catch (error) {
        failed++;

        console.log(
          `❌ Nie udało się usunąć kanału: ${channel.name || id}`
        );
      }
    }

    console.log(
      `🏁 Zakończono. Usunięto: ${deleted}, błędy: ${failed}`
    );
  } catch (error) {
    console.error("❌ Błąd podczas pobierania kanałów:");
    console.error(error);
  }
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);

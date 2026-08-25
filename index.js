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
  Events,
  AttachmentBuilder
} = require("discord.js");

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ==========================================
// TRANSAKCJE
// ==========================================

const DATA_FILE = path.join(__dirname, "transaction.json");

function getNextTransactionId() {
  let data = {
    lastId: 0
  };

  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(
        fs.readFileSync(DATA_FILE, "utf8")
      );
    } catch {
      data = {
        lastId: 0
      };
    }
  }

  data.lastId++;

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );

  return data.lastId;
}

// ==========================================
// ZAOKRĄGLONY PROSTOKĄT
// ==========================================

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.lineTo(
    x + width - radius,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  );

  ctx.lineTo(
    x + width,
    y + height - radius
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(
    x + radius,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );

  ctx.lineTo(
    x,
    y + radius
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  );

  ctx.closePath();
}

// ==========================================
// POLE NA GRAFICE
// ==========================================

function drawField(ctx, label, value, x, y) {

  ctx.fillStyle = "#9299a8";
  ctx.font = "bold 19px Arial";

  ctx.fillText(
    label,
    x,
    y
  );

  ctx.fillStyle = "#f5f7fa";
  ctx.font = "bold 29px Arial";

  let finalValue = String(value);

  if (finalValue.length > 32) {
    finalValue =
      finalValue.substring(0, 29) + "...";
  }

  ctx.fillText(
    finalValue,
    x,
    y + 38
  );
}

// ==========================================
// GENEROWANIE PNG
// ==========================================

async function createTransactionImage({
  buyer,
  seller,
  product,
  price
}) {

  const transactionNumber =
    getNextTransactionId();

  const transactionId =
    `${String(transactionNumber).padStart(5, "0")}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

  const canvas =
    createCanvas(1400, 800);

  const ctx =
    canvas.getContext("2d");

  // TŁO
  ctx.fillStyle = "#0c0e14";

  ctx.fillRect(
    0,
    0,
    1400,
    800
  );

  // GŁÓWNA KARTA
  ctx.fillStyle = "#13161f";

  roundRect(
    ctx,
    50,
    50,
    1300,
    700,
    35
  );

  ctx.fill();

  // OBRAMOWANIE
  ctx.strokeStyle = "#ffc107";
  ctx.lineWidth = 3;

  roundRect(
    ctx,
    50,
    50,
    1300,
    700,
    35
  );

  ctx.stroke();

  // LOGO
  ctx.fillStyle = "#ffc107";
  ctx.font = "bold 52px Arial";

  ctx.fillText(
    "STARSHOP",
    95,
    120
  );

  // NUMER
  ctx.fillStyle = "#f1f3f6";
  ctx.font = "bold 30px Arial";

  ctx.fillText(
    `TRANSACTION #${String(transactionNumber).padStart(5, "0")}`,
    95,
    170
  );

  // STATUS
  ctx.fillStyle = "#1d4a35";

  roundRect(
    ctx,
    1000,
    95,
    280,
    65,
    15
  );

  ctx.fill();

  ctx.fillStyle = "#96f5b4";
  ctx.font = "bold 23px Arial";

  ctx.fillText(
    "✓ COMPLETED",
    1050,
    137
  );

  // LINIA
  ctx.strokeStyle = "#373b46";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(
    95,
    210
  );

  ctx.lineTo(
    1305,
    210
  );

  ctx.stroke();

  // DANE
  drawField(
    ctx,
    "BUYER",
    buyer,
    95,
    270
  );

  drawField(
    ctx,
    "SELLER",
    seller,
    95,
    365
  );

  drawField(
    ctx,
    "PRODUCT",
    product,
    95,
    460
  );

  drawField(
    ctx,
    "PRICE",
    price,
    95,
    555
  );

  // DATA
  const now =
    new Date();

  const date =
    now.toLocaleString(
      "pl-PL",
      {
        timeZone: "Europe/Warsaw",
        dateStyle: "short",
        timeStyle: "short"
      }
    );

  drawField(
    ctx,
    "DATE",
    date,
    760,
    270
  );

  // ID TRANSAKCJI
  drawField(
    ctx,
    "TRANSACTION ID",
    transactionId,
    760,
    365
  );

  // FOOTER
  ctx.strokeStyle = "#373b46";

  ctx.beginPath();

  ctx.moveTo(
    95,
    680
  );

  ctx.lineTo(
    1305,
    680
  );

  ctx.stroke();

  ctx.fillStyle = "#8f96a5";
  ctx.font = "22px Arial";

  ctx.fillText(
    "STARSHOP • Secure & Verified",
    95,
    720
  );

  ctx.fillStyle = "#ffc107";
  ctx.font = "bold 22px Arial";

  ctx.fillText(
    `Transaction #${String(transactionNumber).padStart(5, "0")}`,
    1050,
    720
  );

  return {
    buffer: canvas.toBuffer("image/png"),
    transactionNumber,
    transactionId
  };
}

// ==========================================
// BOT READY + KOMENDY
// ==========================================

client.once(
  "ready",
  async () => {

    console.log(
      `✅ ${client.user.tag}`
    );

    await client.application.commands.set([

      {
        name: "vouch",
        description:
          "Wyślij verified vouch"
      },

      {
        name: "produkty",
        description:
          "Wyświetl listę produktów Star Shop"
      }

    ]);

    console.log("✅ Komendy /vouch i /produkty załadowane");
  }
);

// ==========================================
// INTERAKCJE
// ==========================================

client.on(
  Events.InteractionCreate,
  async interaction => {

    // ======================================
    // KOMENDY
    // ======================================

    if (
      interaction.isChatInputCommand()
    ) {

      // ====================================
      // /PRODUKTY
      // ====================================

      if (
        interaction.commandName === "produkty"
      ) {

        const embed =
          new EmbedBuilder()

            .setColor("#FFD700")

            .setAuthor({
              name: "🛒 STAR SHOP"
            })

            .setTitle(
              "🛒 STAR SHOP × PRODUKTY"
            )

            .setDescription(`
> ✨ **N1TR0**
> Prezent • Boosty serwera • Dekoracje profilu • Nitro

> 🎬 **STR3AM!NG**
> Netflix • Spotify • Disney+ • SkyShowtime

> 🔐 **K0NT4**
> Betclic • NordVPN • MullvadVPN • Inne konta

> 💎 **MET0DY I D0STAWCY**
> Metody na zarobek • Dostawcy • Tańsze produkty

> 📱 **SOC1AL B00ST**
> Followy • Subskrypcje • Polubienia • Wyświetlenia

> 👥 **M3MBERS**
> Boty online/offline • Masowe reakcje • Inne usługi

> 🎮 **GRY I DOŁADOWANIA**
> Minecraft • Steam • CS2 • Doładowania

> 🎲 **R0BL0X**
> Robuxy • Przedmioty • GAG2 • Inne

> 🤝 **M1DDLEM4N**
> Pośrednictwo • Bezpieczne transakcje

> 🤖 **INNE USŁUGI**
> Serwery • Weryfikacja SMS • Boty Discord

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 **SPRAWDŹ SWOJE SZCZĘŚCIE**
Kliknij przycisk poniżej i zobacz, co możesz wygrać!

💰 **GWARANCJA NAJNIŻSZEJ CENY**
Nie znalazłeś taniej? Napisz do nas — sprawdzimy!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ **Star Shop** • Bezpieczne zakupy • Szybka realizacja
            `)

            .setFooter({
              text:
                "Star Shop • Premium Products"
            });

        // PRZYCISKI
        const row =
          new ActionRowBuilder()
            .addComponents(

              new ButtonBuilder()
                .setLabel(
                  "🎁 Sprawdź szczęście"
                )
                .setStyle(
                  ButtonStyle.Link
                )
                .setURL(
                  "https://discord.com/channels/1457543887064399936/1505564158962176010"
                ),

              new ButtonBuilder()
                .setLabel(
                  "💰 Najniższa cena"
                )
                .setStyle(
                  ButtonStyle.Link
                )
                .setURL(
                  "https://discord.com/channels/1457543887064399936/1457543888083488803"
                )

            );

        return interaction.reply({
          embeds: [
            embed
          ],

          components: [
            row
          ]
        });
      }

      // ====================================
      // /VOUCH
      // ====================================

      if (
        interaction.commandName === "vouch"
      ) {

        const transactionNumber =
          getNextTransactionId();

        const transactionId =
          `${String(transactionNumber).padStart(5, "0")}-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;

        const buyer =
          interaction.user.toString();

        const seller =
          "<@123456789>";

        const product =
          "1000 ROBUX";

        const price =
          "31 PLN • BLIK";

        // GENEROWANIE PNG
        const image =
          await createTransactionImage({

            buyer:
              interaction.user.username,

            seller:
              "Seller123",

            product:
              product,

            price:
              "31,00 PLN"

          });

        const attachment =
          new AttachmentBuilder(
            image.buffer,
            {
              name:
                `transaction-${String(transactionNumber).padStart(5, "0")}.png`
            }
          );

        // EMBED
        const embed =
          new EmbedBuilder()

            .setColor("#22c55e")

            .setAuthor({
              name:
                "🛡️ VERIFIED VOUCH"
            })

            .setTitle(
              "Transakcja zweryfikowana"
            )

            .setDescription(
              "System potwierdził zakończenie wymiany.\n### ⭐ Zweryfikowany klient"
            )

            .addFields(

              {
                name: "🆔 ID",
                value:
                  `#${String(transactionNumber).padStart(5, "0")}`,
                inline: true
              },

              {
                name: "👤 Klient",
                value:
                  buyer,
                inline: true
              },

              {
                name: "💼 Realizator",
                value:
                  seller,
                inline: true
              },

              {
                name: "📦 Produkt",
                value:
                  product,
                inline: true
              },

              {
                name: "💳 Płatność",
                value:
                  price,
                inline: true
              },

              {
                name: "⏰ Data",
                value:
                  `<t:${Math.floor(Date.now() / 1000)}:F>`
              }

            )

            .setThumbnail(
              interaction.guild.iconURL()
            )

            .setFooter({
              text:
                "Starshop • Verified Voucher"
            });

        // PRZYCISK OPINII
        const row =
          new ActionRowBuilder()
            .addComponents(

              new ButtonBuilder()

                .setCustomId(
                  "review"
                )

                .setLabel(
                  "Dodaj opinię"
                )

                .setEmoji("⭐")

                .setStyle(
                  ButtonStyle.Success
                )

            );

        return interaction.reply({

          content:
            "✅ **Transakcja zakończona pomyślnie!**",

          embeds: [
            embed
          ],

          components: [
            row
          ],

          files: [
            attachment
          ]

        });
      }
    }

    // ======================================
    // PRZYCISK OPINII
    // ======================================

    if (
      interaction.isButton()
    ) {

      if (
        interaction.customId === "review"
      ) {

        const modal =
          new ModalBuilder()

            .setCustomId(
              "review_modal"
            )

            .setTitle(
              "Dodaj opinię"
            );

        const stars =
          new TextInputBuilder()

            .setCustomId(
              "stars"
            )

            .setLabel(
              "Ocena (1-5)"
            )

            .setPlaceholder(
              "5"
            )

            .setStyle(
              TextInputStyle.Short
            )

            .setRequired(true);

        const opinion =
          new TextInputBuilder()

            .setCustomId(
              "opinion"
            )

            .setLabel(
              "Twoja opinia"
            )

            .setPlaceholder(
              "Mega szybka realizacja 🔥"
            )

            .setStyle(
              TextInputStyle.Paragraph
            )

            .setRequired(true);

        modal.addComponents(

          new ActionRowBuilder()
            .addComponents(
              stars
            ),

          new ActionRowBuilder()
            .addComponents(
              opinion
            )

        );

        return interaction.showModal(
          modal
        );
      }
    }

    // ======================================
    // WYSŁANIE OPINII
    // ======================================

    if (
      interaction.isModalSubmit()
    ) {

      if (
        interaction.customId ===
        "review_modal"
      ) {

        const stars =
          interaction.fields
            .getTextInputValue(
              "stars"
            );

        const opinion =
          interaction.fields
            .getTextInputValue(
              "opinion"
            );

        const rating =
          Number(stars);

        if (
          isNaN(rating) ||
          rating < 1 ||
          rating > 5
        ) {

          return interaction.reply({
            content:
              "❌ Ocena musi być liczbą od 1 do 5.",

            ephemeral: true
          });
        }

        const message =
          interaction.message;

        if (
          !message ||
          !message.embeds.length
        ) {

          return interaction.reply({
            content:
              "❌ Nie udało się znaleźć vouchera.",

            ephemeral: true
          });
        }

        const old =
          EmbedBuilder.from(
            message.embeds[0]
          );

        old.addFields({

          name:
            `⭐ Opinia klienta (${rating}/5)`,

          value:
            `> ${opinion}\n\n**Verified Buyer:** ${interaction.user}`

        });

        await message.edit({

          embeds: [
            old
          ],

          components: []
        });

        return interaction.reply({

          content:
            "✅ Dziękujemy za opinię!",

          ephemeral: true
        });
      }
    }

  }
);

// ==========================================
// LOGIN
// ==========================================

client.login(
  process.env.TOKEN
);

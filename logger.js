import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

/**
 * Envia embed de entrada (success / fail)
 */
export async function sendEntryEmbed({
  username,
  userId,
  userAvatar,
  raffleName,
  raffleSlug,
  giveawaysJoined,
  success = true,
  message = "Entry successful"
}) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    username: "CatBot",
    avatar_url: "https://i.imgur.com/9xZQZ9F.png", // avatar do bot
    embeds: [
      {
        author: {
          name: username,
          icon_url: userAvatar
        },

        // 🔗 TÍTULO COM LINK CAMUFLADO
        title: success
          ? `You Joined: ${raffleName}`
          : `Entry Failed: ${raffleName}`,

        // 🔗 LINK REAL PARA A RAFFLE
        url: `https://www.alphabot.app/${raffleSlug}`,

        color: success ? 0x7C3AED : 0xEF4444,

        thumbnail: {
          url: "https://i.imgur.com/9xZQZ9F.png" // imagem do bot à direita
        },

        fields: [
          {
            name: "User",
            value: `<@${userId}>\n@${username}`,
            inline: true
          },
          {
            name: "Giveaways Joined",
            value: String(giveawaysJoined ?? "—"),
            inline: true
          },
          {
            name: "Subscription",
            value: "<@&1464927696403431635>",
            inline: true
          },
          {
            name: success ? "✅ Status" : "❌ Status",
            value: message,
            inline: false
          }
        ],

        footer: {
          text: `Built by Solus • Hoje às ${new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })}`
        },

        timestamp: new Date().toISOString()
      }
    ]
  });
}

/**
 * Snapshot inicial (quando captura raffles)
 */
export async function sendSnapshotEmbed(total) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    username: "CatBot",
    avatar_url: "https://i.imgur.com/9xZQZ9F.png",
    embeds: [
      {
        title: "📸 Snapshot iniciado",
        description: `Raffles ativas capturadas: **${total}**`,
        color: 0x3498db,
        footer: {
          text: "CatBot • AlphaBot Automation"
        },
        timestamp: new Date().toISOString()
      }
    ]
  });
}

/**
 * Embed especial de WIN
 */
export async function sendWinEmbed({
  username,
  userId,
  userAvatar,
  raffleName,
  raffleSlug
}) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    username: "CatBot",
    avatar_url: "https://i.imgur.com/9xZQZ9F.png",
    embeds: [
      {
        author: {
          name: username,
          icon_url: userAvatar
        },

        title: `🏆 WIN: ${raffleName}`,
        url: `https://www.alphabot.app/${raffleSlug}`,

        color: 0xFACC15,

        thumbnail: {
          url: "https://i.imgur.com/9xZQZ9F.png"
        },

        fields: [
          {
            name: "Winner",
            value: `<@${userId}>`,
            inline: true
          },
          {
            name: "Raffle",
            value: raffleName,
            inline: true
          }
        ],

        footer: {
          text: "CatBot • Congratulations!"
        },

        timestamp: new Date().toISOString()
      }
    ]
  });
}

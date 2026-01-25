import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

/**
 * Embed de entrada (sucesso ou falha)
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

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      username: "CATBOT",
      avatar_url: "https://i.imgur.com/yxvI3zp.png",

      embeds: [
        {
          author: {
            name: username,
            icon_url: userAvatar
          },

          title: `You Joined: ${raffleName}`,
          url: `https://www.alphabot.app/${raffleSlug}`,

          color: success ? 0x7C3AED : 0xEF4444,

          thumbnail: {
            url: "https://i.imgur.com/9xZQZ9F.png"
          },

          fields: [
            {
              name: "User",
              value: `<@${userId}>`,
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
            text: "Built by Solus"
          },

          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (err) {
    console.error("Webhook sendEntryEmbed error:", err.message);
  }
}

/**
 * Embed de snapshot (quando o scan inicia)
 */
export async function sendSnapshotEmbed(totalRaffles) {
  if (!ENTRIES_WEBHOOK) return;

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      username: "Solus Subscription APP",
      avatar_url: "https://i.imgur.com/9xZQZ9F.png",

      embeds: [
        {
          title: "📸 Snapshot iniciado",
          description: `Raffles capturadas: **${totalRaffles}**`,
          color: 0x3498DB,

          footer: {
            text: "CatBot • Snapshot"
          },

          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (err) {
    console.error("Webhook sendSnapshotEmbed error:", err.message);
  }
}

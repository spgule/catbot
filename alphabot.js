import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

/**
 * Normaliza erro em categoria legível
 */
function formatFailure(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("telegram")) {
    return "❌ Telegram not connected";
  }
  if (msg.includes("discord")) {
    return "❌ Discord requirement(s)";
  }
  if (msg.includes("429") || msg.includes("rate")) {
    return "⏱️ Rate limited";
  }
  if (msg.includes("timeout")) {
    return "⌛ Request timeout";
  }
  if (msg.includes("ended")) {
    return "🚫 Opportunity ended";
  }

  return `❌ ${message || "Entry failed"}`;
}

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
  message
}) {
  if (!ENTRIES_WEBHOOK) return;

  // fallback de segurança
  const safeRaffleName = raffleName || "Unknown Raffle";
  const safeSlug = raffleSlug || "";

  const raffleUrl = safeSlug
    ? `https://www.alphabot.app/${safeSlug}`
    : "https://www.alphabot.app/raffles";

  const statusText = success
    ? "✅ Entry successful"
    : formatFailure(message);

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      username: "CATBOT",
      avatar_url: "https://i.imgur.com/yxvI3zp.png",

      embeds: [
        {
          author: {
            name: username || "Unknown User",
            icon_url: userAvatar
          },

          title: `${safeRaffleName}`,
          url: raffleUrl,

          color: success ? 0x7C3AED : 0xEF4444,

          thumbnail: {
            url: "https://i.imgur.com/yxvI3zp.png"
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
              name: success ? "✅ Status" : "❌ Failure Reason",
              value: statusText,
              inline: false
            }
          ],

          footer: {
            text: "Built by CATBOT"
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
 * Embed de snapshot (scan)
 */
export async function sendSnapshotEmbed(totalRaffles) {
  if (!ENTRIES_WEBHOOK) return;

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      username: "CATBOT",
      avatar_url: "https://i.imgur.com/yxvI3zp.png",

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

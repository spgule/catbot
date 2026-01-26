import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

/**
 * Remove o sufixo aleatório do slug
 * gems-x-pocketsol-gtd-dtc-l0ewdp -> Gems X Pocketsol Gtd Dtc
 */
function formatRaffleNameFromSlug(slug) {
  if (!slug || typeof slug !== "string") return "Unknown Raffle";

  const lastDash = slug.lastIndexOf("-");
  const cleaned = lastDash > 0 ? slug.substring(0, lastDash) : slug;

  return cleaned
    .split("-")
    .map(w =>
      w.toLowerCase() === "x"
        ? "X"
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

/**
 * Normaliza erro
 */
function formatFailure(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("telegram")) return "❌ Telegram not connected";
  if (msg.includes("discord")) return "❌ Discord requirement(s)";
  if (msg.includes("429") || msg.includes("rate")) return "⏱️ Rate limited";
  if (msg.includes("timeout")) return "⌛ Request timeout";
  if (msg.includes("ended")) return "🚫 Opportunity ended";

  return `❌ ${message || "Entry failed"}`;
}

/**
 * Embed de entry
 */
export async function sendEntryEmbed({
  username,
  userId,
  userAvatar,

  raffleSlug,
  raffleName,

  giveawaysJoined,
  success = true,
  message
}) {
  if (!ENTRIES_WEBHOOK) return;

  const finalSlug = raffleSlug || "";
  const finalName = raffleName || formatRaffleNameFromSlug(finalSlug);

  const raffleUrl = finalSlug
    ? `https://www.alphabot.app/${finalSlug}`
    : "https://www.alphabot.app/raffles";

  const statusText = success
    ? "✅ Entry successful"
    : formatFailure(message);

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      embeds: [
        {
          author: {
            name: username || "CATBOT",
            icon_url: userAvatar
          },

          title: `${finalName}`,
          url: raffleUrl,

          color: success ? 0x7C3AED : 0xEF4444,

          thumbnail: {
            url: "https://i.imgur.com/9Apykdo.jpeg"
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
 * Snapshot embed (EXPORT CORRETO)
 */
export async function sendSnapshotEmbed(totalRaffles) {
  if (!ENTRIES_WEBHOOK) return;

  try {
    await axios.post(ENTRIES_WEBHOOK, {
      embeds: [
        {
          title: "📸 Snapshot iniciado",
          description: `Raffles capturadas: **${totalRaffles}**`,
          color: 0x3498DB,
          footer: { text: "CatBot • Snapshot" },
          timestamp: new Date().toISOString()
        }
      ]
    });
  } catch (err) {
    console.error("Webhook sendSnapshotEmbed error:", err.message);
  }
}

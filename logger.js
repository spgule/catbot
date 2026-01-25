import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

/* =========================
   SAFE POST
========================= */
async function safePost(payload) {
  if (!ENTRIES_WEBHOOK) return;

  try {
    await axios.post(ENTRIES_WEBHOOK, payload, {
      timeout: 15000,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(
      "[ENTRIES WEBHOOK ERROR]",
      err.response?.status,
      err.message
    );
  }
}

/* =========================
   ENTRY EMBED
========================= */
export async function sendEntryEmbed({
  username,
  userId,
  avatarUrl,
  raffleName,
  raffleSlug,
  joinedCount,
  subscription,
  success,
  message
}) {
  await safePost({
    username: "CatBot",
    avatar_url: "https://i.imgur.com/9xZQZ9F.png",
    embeds: [
      {
        author: {
          name: String(username || "CatBot User").slice(0, 256),
          icon_url: avatarUrl || "https://i.imgur.com/9xZQZ9F.png"
        },
        title: success
          ? `You Joined: ${raffleName}`
          : `Entry Failed: ${raffleName}`,
        url: raffleSlug
          ? `https://www.alphabot.app/raffles/${raffleSlug}`
          : undefined,
        color: success ? 0x7C3AED : 0xEF4444,
        fields: [
          {
            name: "👤 User",
            value: userId ? `<@${userId}>` : "Unknown",
            inline: true
          },
          {
            name: "🎟️ Giveaways Joined",
            value: joinedCount != null ? String(joinedCount) : "—",
            inline: true
          },
          {
            name: "💎 Subscription",
            value: subscription || "Standard",
            inline: true
          },
          {
            name: success ? "✅ Status" : "❌ Status",
            value: message || (success ? "Entry successful" : "Entry failed"),
            inline: false
          }
        ],
        footer: {
          text: "Built by CatBot • AlphaBot Automation"
        },
        timestamp: new Date().toISOString()
      }
    ]
  });
}

/* =========================
   SNAPSHOT EMBED
========================= */
export async function sendSnapshotEmbed(total) {
  await safePost({
    username: "CatBot",
    embeds: [
      {
        title: "📸 Snapshot iniciado",
        description: `Raffles ativas capturadas: **${total}**`,
        color: 0x3498db,
        footer: { text: "CatBot v2.0" },
        timestamp: new Date().toISOString()
      }
    ]
  });
}

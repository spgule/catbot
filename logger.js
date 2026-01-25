import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

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
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    username: "CatBot",
    avatar_url: "https://i.imgur.com/9xZQZ9F.png", // ícone do bot (opcional)
    embeds: [
      {
        author: {
          name: username || "CatBot User",
          icon_url: avatarUrl || "https://i.imgur.com/9xZQZ9F.png"
        },

        title: success
          ? `You Joined: ${raffleName}`
          : `Entry Failed: ${raffleName}`,

        url: `https://www.alphabot.app/raffles/${raffleSlug}`,

        color: success ? 0x7C3AED : 0xEF4444, // roxo / vermelho

        fields: [
          {
            name: "👤 User",
            value: `<@${userId}>`,
            inline: true
          },
          {
            name: "🎟️ Giveaways Joined",
            value: joinedCount ? String(joinedCount) : "—",
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

import axios from "axios";

const ENTRIES_WEBHOOK = process.env.DISCORD_ENTRIES_WEBHOOK;

export async function sendEntryEmbed({ userId, slug, success, message }) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    embeds: [
      {
        title: "CATBOT • Raffle Entry",
        color: success ? 0x2ecc71 : 0xe74c3c,
        fields: [
          { name: "👤 User", value: `<@${userId}>`, inline: true },
          { name: "🎟️ Raffle", value: slug, inline: true },
          {
            name: success ? "✅ Status" : "❌ Status",
            value: message,
            inline: false,
          },
        ],
        footer: { text: "CatBot v2.0" },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function sendSnapshotEmbed(total) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    embeds: [
      {
        title: "📸 Snapshot iniciado",
        color: 0x3498db,
        description: `Raffles ativas capturadas: **${total}**`,
        footer: { text: "CatBot v2.0" },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

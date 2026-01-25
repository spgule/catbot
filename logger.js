export async function sendEntryEmbed({
  username,          // 👈 username REAL do Discord
  userId,
  userAvatar,        // 👈 avatar REAL do Discord
  raffleName,
  raffleSlug,
  giveawaysJoined,
  success = true,
  message = "Entry successful"
}) {
  if (!ENTRIES_WEBHOOK) return;

  await axios.post(ENTRIES_WEBHOOK, {
    username: "Solus Subscription APP", // nome do app (igual ao exemplo)
    avatar_url: "https://i.imgur.com/yxvI3zp.png",

    embeds: [
      {
        // 🔥 CABEÇALHO CORRETO
        author: {
          name: username,              // ex: superfeijao
          icon_url: userAvatar         // avatar real do usuário
        },

        // 🔗 TÍTULO CLICÁVEL
        title: `You Joined: ${raffleName}`,
        url: `https://www.alphabot.app/${raffleSlug}`,

        color: 0x7C3AED,

        // 🧠 LOGO DO BOT À DIREITA
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
            name: "✅ Status",
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
}

import { Client, GatewayIntentBits, SlashCommandBuilder, Events } from "discord.js";
import db from "./db.js";
import { encrypt } from "./crypto.js";
import { triggerSnapshot } from "./alphabot.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("config")
      .setDescription("Register Alphabot API Key")
      .addStringOption(o =>
        o.setName("api_key").setDescription("API Key").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("status")
      .setDescription("Show your stats"),
  ]);

  console.log("🤖 Discord bot online");
});

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;

  if (i.commandName === "config") {
    const apiKey = i.options.getString("api_key");

    db.prepare(`
      INSERT OR REPLACE INTO users (id, apiKey)
      VALUES (?, ?)
    `).run(i.user.id, encrypt(apiKey));

    triggerSnapshot();

    return i.reply({
      content: "✅ API Key salva. Snapshot iniciado.",
      ephemeral: true,
    });
  }

  if (i.commandName === "status") {
    const u = db.prepare("SELECT entered, wins FROM users WHERE id=?").get(i.user.id);

    if (!u) {
      return i.reply({ content: "⚠️ Use `/config` primeiro.", ephemeral: true });
    }

    return i.reply({
      content:
`📊 **Seu status**
🎟️ Entradas válidas: ${u.entered ?? 0}
🏆 Wins: ${u.wins ?? 0}`,
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

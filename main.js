
const {Client, Intents} = require("discord.js")
const client = new Client({intents: ["GuildMessages", "DirectMessages", "GuildMembers"]})
require("dotenv").config();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
  if (msg.author.bot)
    return;
  // On message
  console.log("Content : ", msg.content)
  if (msg.content === "ping") {
    msg.reply("pong");
  }
})

async function main() {
    await client.login(process.env.DISCORD_TOKEN);

  const tmp = await client.guilds.fetch();
  const guild = tmp.find(v => v.name === "coucou");

  const yo = await guild.fetch();
  const chans = await yo.channels.fetch();
  const correctChan = chans.find(v => v.name === "allo");

  const users = await yo.members.fetch();  
  users.forEach(v => {
    console.log("test : ", v.user.username);
  });
  const me = users.find(v => v.user.username === "Ppoinsinet").send("yoo");
}

main();

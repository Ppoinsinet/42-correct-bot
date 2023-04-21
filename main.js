
const {Client, Intents} = require("discord.js")
const client = new Client({intents: ["GuildMessages", "DirectMessages", "GuildMembers"]})
require("dotenv").config();

const Scrapper = require("./js/classes/Scrapper");
const DAY_OF_WEEKS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

let projectName = "";
let scrapper = null;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
  if (msg.author.id !== process.env.MY_DISCORD_ID)
    return;
  console.log("Content : ", msg.content)
  // On message
  const split = msg.content.split(" ");

  if (split.length > 0) {

    switch (split[0].toUpperCase()) {
      case "START":
        if (scrapper !== null)
          return msg.author.send("Scrapper already running. Stop it if needed.");
        if (split.length === 1)
          return msg.author.send("Missing name of project");
        scrapper = new Scrapper();
        scrapper.start(split[1], onCallback);
        projectName = split[1];
        msg.author.send("Starting scrapper on " + projectName);
        break;

      case "STOP":
        if (scrapper === null)
          return msg.author.send("No scrapper running.");
        scrapper.stop = true;
        scrapper = null;
        return msg.author.send("Scrapper stopped");
    
      default:
        break;
    }
  }
})

let usersToNotice = null;

function onCallback(arr) {
  console.log("Callback : ", arr);
  if (usersToNotice === null)
    return ;
    
  let txt = "";
  let index = 0;
  for (let it of arr) {
    if (it.title.toUpperCase() !== "AVAILABLE")
      continue ;

    const from = new Date(it.start);
    const to = new Date(it.end);
    txt += "DE : " + DAY_OF_WEEKS[from.getDay() - 1] + from.toLocaleString() + "\n A : " + DAY_OF_WEEKS[to.getDay() - 1] + to.toLocaleString() + "\n"; 
    if (index + 1 < arr.length)
      txt += "\n";
    else
      txt += `https://projects.intra.42.fr/projects/${projectName}/slots`;
    index++;
  }

  usersToNotice.forEach(v => {
    if (v.user.bot === true)
      return ;
    v.user.send(txt);
  });
}

async function main() {
  
  await client.login(process.env.DISCORD_TOKEN);

  const tmp = await client.guilds.fetch();
  const guild = tmp.find(v => v.name === "coucou");
  const guildData = await guild.fetch();

  usersToNotice = await guildData.members.fetch();  
  usersToNotice.forEach(v => {
    if (v.user.bot)
      return ;
    if (v.user.id === process.env.MY_DISCORD_ID)
      v.user.send("Starting service");
    console.log("User to notice : ", v.user.username + " et " + v.user.id);
  });
}

main();

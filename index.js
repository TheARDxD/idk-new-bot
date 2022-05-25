const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
const { DiscordTogether } = require('discord-together');
const keepAlive = require("./server")
const SpamStore = require("./antispam") // DONT DELETE THIS [ANTISPAM]
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});


client.discordTogether = new DiscordTogether(client);

client.once('ready', () => {
    console.log('Ready!')
    client.user.setStatus('dnd')
});

// [ANTISPAM] Don't delete this vvv
const spamStore = new SpamStore()
// ^^^ Don't delete this [ANTISPAM]

//VC-activity code
client.on('messageCreate', async message => {
  let activityMessage = ""
    if (message.content === '!start') {
        if(message.member.voice.channel) {
            client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'doodlecrew').then(async invite => {
    return activityMessage = `Click this link to start your activity: \n${invite.code}`
          })
        } else {
      return activityMessage = "You're not in a voice channel!"} 
        if (spamStore.isSpam(activityMessage)) {
          console.log(`Not sending ${activityMessage} because it classifies as spam`)
          return
    }  else {
          console.log(`Not spam, sending: ${activityMessage}`)
          spamStore.storeMessage(activityMessage)}
    }  
})

//AI chat-bot code:
function rep(botResponse) {
  return botResponse.replaceAll(":akashieating:", ":yum:")
              .replaceAll(":Akashilook:", ":eyes:")
              .replaceAll("Yuns", "TheARD")
              .replaceAll(":kleemad:", "<:SuperShock:887057560581050368>")
              .replaceAll("penis", "||penis||") //profanity filters here
              .replaceAll("ass", "||ass||")
              .replaceAll("horny", "||horny||")
              .replaceAll("fuck", "||fuck||")
              .replaceAll(":pppinkwave:", "I'm here!")
              .replaceAll(":ppkirbdisgust:", "<:SwagAngry:824638745864831047>")
}
client.on('message', async message => {
    // ignore messages from the bot itself
    if (message.author.bot || !message.content.includes("<@970607463554494496>")) return
    
    const data = 
        await fetch('https://api-inference.huggingface.co/models/deepparag/Aeona', {
            method: 'POST',
            body: JSON.stringify({
                inputs: {
                    text: message.content.replace("<@970607463554494496> ", "")
                }
            }),
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`
            }
        })
        .then(r => r.json())

    let botResponse = "generated_text" in data
        ? data.generated_text
        : data.error
    
    // [ANTISPAM] Don't delete this vvv
    if (spamStore.isSpam(botResponse)) {
        console.log(`Not sending ${botResponse} because it classifies as spam`)
        return
    } else {
        console.log(`Not spam, sending: ${botResponse}`)
        spamStore.storeMessage(botResponse)
    }
    // ^^^ Don't delete this [ANTISPAM]
    
    try {
        await message.reply({
            content: rep(botResponse)
                               
        })
    } catch (e) {
        console.error(e)
    }
})



keepAlive()
client.login(process.env.TOKEN)
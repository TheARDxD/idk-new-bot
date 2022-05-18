

    let smth = ":akashieating:"
    smth = smth.replaceAll(":akashieating:", ":yum:")
    console.log(smth)

const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
const keepAlive = require("./server")

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});

client.once('ready', () => {
    console.log('Ready!')
    client.user.setStatus('invisible')
});

// client.on('message', message => {
//     if (!message.author.id === '601721161642147849') {
//         message.react('🤡')
//     }
// }) 

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
    
    console.log(botResponse)

    try {
        await message.reply({
            content: botResponse.replaceAll(":akashieating:", ":yum:")
        })
    } catch (e) {
        console.error(e)
    }
})

keepAlive()
client.login(process.env.TOKEN)





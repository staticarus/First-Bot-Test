require('dotenv').config() // Initialise les variables d'environnement
const Discord = require('discord.js')
const Alert = require('./models/alert')
const Utils = require('./utils/utils')
const Timers = require('./utils/cron')
// -------------------------------
const client = new Discord.Client()
const listecommandes = ['!add','!show','!help','!time','!webhook']
const regexTime = /^(((0?[1-4]?)(-|\/))?(0|0?[1-9]|1[0-9]|2[0-3])(-|\/)([012345]?[0-9]))$/g
var AlertsList = [] // contient les données des alertes
var timeoutsList = [] // contient les vrais timeouts, qui déclenchent les alertes
var webhookActive = true // sert à activer/désactiver les cronjobs
// -------------------------------
client.on('ready', () => {console.log("> Bot correctly started")})
client.on('message', msg => {
    if(msg.author.id === process.env.BOT_ID) return
    if (msg.webhookID) return;
    else MessageParsing(msg.content, msg)
})
client.login(process.env.BOT_TOKEN)
Timers.startTimers()
// -------------------------------
function MessageParsing(MessageContent, msg) {
    var WordsList = MessageContent.split(/\s/)
    console.log('Input : '+ WordsList) // every word inside the msg
    switch(WordsList[0]){
        case '!add':
            var result = command_add(WordsList, msg)
            if(result === 1) msg.react('✅') // reactions require "see old messages" authorization
            else msg.react('❌')
            break;
        case '!show':
            var result = command_show(WordsList, msg)
            break;
        case '!help':
            msg.channel.send(`Les commandes disponibles sont : ${listecommandes.join(' , ')}`)
            break;
        case '!time':
            var result = command_time(WordsList, msg)
            break;
        case '!webhook':
            var result = command_webhook(WordsList, msg)
            break;
        case '!alertes':
            break;
        default:
            break;
    }
}
function command_add(WordsList, msg) {
    console.log("Entering command_add function");
    var add_content = WordsList[1].match(regexTime) // returns array with match or null
    if(!add_content) return console.log("Erreur dans le parsing du Timer");

    var TimeValuesToParse = WordsList[1].split(/-/)
    var time_total = 0
    switch (TimeValuesToParse.length) {
        case 3:
            time_total += parseInt(TimeValuesToParse[0], 10)*24*60*60 // parseInt optionnel car js non-typé, mais pour être sûr
            time_total += parseInt(TimeValuesToParse[1], 10)*60*60    // PSA : le parseInt retire le zéro de devant (donc utile pour les jours ici !)
            time_total += parseInt(TimeValuesToParse[2], 10)*60
            time_total *= 1000
            var TimeCase = 3
            console.log("We are in tab 3");
            break;
        case 2:
            time_total += parseInt(TimeValuesToParse[0], 10)*60*60
            time_total += parseInt(TimeValuesToParse[1], 10)*60
            time_total *= 1000
            var TimeCase = 2
            console.log("We are in tab 2");
            break;
        case 1:
            time_total += parseInt(TimeValuesToParse[0], 10)*60
            time_total *= 1000
            var TimeCase = 1
            console.log("We are in tab 1");
            break;
        default:
            console.log("Error during tab length comparison")
            return
    }

    console.log('Time parsed = ' + time_total)

    WordsList.shift() // Removes the !command
    WordsList.shift() // Removes the time argument
    TextOfTheAlert = WordsList.join(' ')
    
    var thisAlert = new Alert(`Alert${AlertsList.length.toString()}`, msg.author, TextOfTheAlert, time_total)
    console.log(thisAlert['guid']);
    console.log(thisAlert['name'])
    console.log(thisAlert['author'])
    console.log(thisAlert['text'])
    console.log(thisAlert['time'])

    var alertIndex = AlertsList.push(thisAlert)

    setTimeout(() => {
        const channel = client.channels.cache.get(process.env.CHAN_ID)
        channel.send(`Bip boup ! ${thisAlert.author} il te faut __**${thisAlert.text}**__ !`)
        var i = findAlertByGuid(thisAlert.guid)
        AlertsList.splice(i,1) // supprime 1 élément à partir de i
    }, time_total);
    console.log(`Alerte créée pour ${thisAlert['text']} dans ${time_total} ms`)

    //ConfirmAlertCreation(TextOfTheAlert, TimeValuesToParse, TimeCase)

    function findAlertByGuid(guid) {
        return AlertsList.findIndex((x) => x.guid === guid)
    }

    return 1
}
function command_show(WordsList, msg) {
    switch (WordsList[1]) {
        case 'me':
            var alertsByMe = AlertsList.filter(e => e.author.id === msg.author.id).sort((a,b) => a.time - b.time) // tri croissant
            if(alertsByMe.length > 0) {
                var textToSend = "```Alarms currently in queue :\n---------------------------\n"
                alertsByMe.forEach(i => {
                    var j = Utils.timeConverter(i.time)
                    j = Utils.timeAligner(j)
                    var h = Utils.usernameAligner(i.author.username)
                    textToSend += `${j[0]}j ${j[1]}h ${j[2]}m - ${h}-\t${i.text}\n`
                })
                textToSend += "```"
                msg.channel.send(textToSend)
            }
            else return msg.channel.send("There is no alert currently in queue");
            break;
        case 'all':
            var alertsByAll = AlertsList.sort((a,b) => a.time - b.time)
            if (alertsByAll.length > 0) {
                var textToSend = "```Alarms currently in queue :\n---------------------------\n"
                alertsByAll.forEach(i => {
                    var j = Utils.timeConverter(i.time)
                    j = Utils.timeAligner(j)
                    var h = Utils.usernameAligner(i.author.username)
                    textToSend += `${j[0]}j ${j[1]}h ${j[2]}m - ${h}-\t${i.text}\n`
                })
                textToSend += "```"
                msg.channel.send(textToSend)      
            }
            else return msg.channel.send("There is no alert currently in queue");
            break;
        default: // idem que 'all'
            var alertsByAll = AlertsList.sort((a,b) => a.time - b.time)
            if (alertsByAll.length > 0) {
                var textToSend = "```Alarms currently in queue :\n---------------------------\n"
                alertsByAll.forEach(i => {
                    //var k = Utils.timeCalculate(i.time)
                    var j = Utils.timeConverter(i.time)
                    j = Utils.timeAligner(j)
                    var h = Utils.usernameAligner(i.author.username)
                    textToSend += `${j[0]}j ${j[1]}h ${j[2]}m - ${h}-\t${i.text}\n`
                })
                textToSend += "```"
                msg.channel.send(textToSend)      
            }
            else return msg.channel.send("There is no alert currently in queue");
            break;
    }
}
function command_time(WordsList, msg) { // utilisé à des fins de tests
    var valuesConverted = timeConverter(parseInt(WordsList[1], 10))
    console.log(`Days = ${valuesConverted[0]}, Hours = ${valuesConverted[1]}, Minutes = ${valuesConverted[2]}`);
}
function command_webhook(WordsList, msg) {
    if(WordsList[1] && WordsList[1] === 'status') {
        switch(webhookActive) {
            case true:
                msg.channel.send(`Timers are currently ON.`)
            break;
            case false:
                msg.channel.send(`Timers are currently OFF.`)
            break;
        }
        return 0
    }
    if(WordsList[1] && WordsList[1] != 'status') {
        msg.channel.send(`The correct subcommand for \`!webhook\` is \`status\``)
        return 0
    }
    else {
        webhookActive = !webhookActive
        if(webhookActive) {
            Timers.startTimers()
            msg.channel.send(`Settings changed : timers are now ON.`)
        }
        else { 
            Timers.stopTimers()
            msg.channel.send(`Settings changed : timers are now OFF.`)
        }
        return 1
    }  
}
var CronJob = require('cron').CronJob;

var cronList = []

function startTimers() {
    cronCreation()
    cronList.forEach(i => i.start())
}
function stopTimers() {
    cronList.forEach(i => i.stop())
}

function cronCreation() {
    
    cronList.push(jobDaily = new CronJob(
        '0 0 16 * * *',
        function() {
            console.log('Daily reset');
        },
        null,
        true,
        'Europe/Brussels'
    ))
    
    cronList.push(jobFish = new CronJob(
        '* * */5 * * *',
        function() {
            console.log('Fish');
        },
        null,
        true,
        'Europe/Brussels'
    ))
}

exports.startTimers = startTimers
exports.stopTimers = stopTimers
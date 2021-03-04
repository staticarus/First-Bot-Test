function timeCalculate(time) {
    new Date().getTime() //reçoit les ms de la date actuelle, écoulés depuis le 1er janvier 1970 0:00 UTC
}

function timeConverter(time) {
    var minutes = time/1000/60 // ms -> sec -> min
    var hours = Math.floor(minutes/60)
    minutes = minutes % 60
    var days = Math.floor(hours/24) // si pas de jour, days devient '0'
    hours = hours % 24
    return [days, hours, minutes]
}

function timeAligner(time) {
    for (let i = 1; i < time.length; i++) { // on commence à 1 pour ne pas toucher à days
        if(time[i].toString().length===1) {
            time[i] = `0${+time[i]}`
        }
        else time[i] = time[i]
    }
    //return [parseInt(time[0],10),parseInt(time[1],10),parseInt(time[2],10)]  // parseInt retire les zéros de devant
    return [time[0],time[1],time[2]]  
}

function usernameAligner(username) {
    if(username.length > 10) return username.slice(0,10)
    if(username.length === 10) return
    else {
        var spaceToAdd = 10 - username.length
        for (let i = 0; i < spaceToAdd; i++) {
            username += " "            
        }
        return username
    }
}

exports.timeConverter = timeConverter
exports.usernameAligner = usernameAligner
exports.timeAligner = timeAligner
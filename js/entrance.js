/*
 * @Author: Avin lee 
 * @Date: 2021-08-11 14:20:13 
 * @Last Modified by: Avin lee
 * @Last Modified time: 2021-08-27 09:31:56
 */
const schedule = require('node-schedule')
const fs = require('fs')
const {
    signOutTime
} = require('../config')
const slink = require('./main')
const todayStr = new Date().toLocaleDateString()
const logPath = `./log/${todayStr}.txt`

function getNowTimeDetail(unit) {
    return new Date()[`get${unit}s`]()
}

function getCfgTimeDetail(unit) {
    return parseInt(signOutTime.split(':')[['hour', 'minute', 'second'].indexOf(unit)])
}

function nowTimeStr() {
    return new Date().toTimeString().split(' ')[0]
}

try {
    const hour = getCfgTimeDetail('hour')
    const minute = getCfgTimeDetail('minute')
    const second = getCfgTimeDetail('second')
    fs.writeFileSync(logPath, `LOG FOR ${todayStr}:\n\n`)
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL] Illegal time "${signOutTime}" of <signOutTime>\n`)
        console.log(`[WARNING] Illegal time "${signOutTime}" of <signOutTime>`)
    } else if (hour < getNowTimeDetail('Hour') || (hour === getNowTimeDetail('Hour') && minute < getNowTimeDetail('Minute'))) {
        fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL] you can not signOut early than now : ${nowTimeStr()}\n`)
        console.log(`[WARNING] you can not signOut early than now : ${nowTimeStr()}`)
    } else {
        let processCharacter = ['-', '\\', '|', '/']
        let loadingCharacter = ['', '.', '..', '...']
        let index = 0
        console.log(`[RUNNING] [${processCharacter[index]}] do not close this window ${loadingCharacter[index]}`)
        this.interval = setInterval(() => {
            index === 3 ? index = 0 : index++
            process.stdout.cursorTo(0, 0)
            process.stdout.clearScreenDown()
            console.log(`[RUNNING] [${processCharacter[index]}] do not close this window ${loadingCharacter[index]}`)
        }, 200)
        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS] start timing\n`)
        schedule.scheduleJob(`${second} ${minute} ${hour} * * *`, () => {
            clearInterval(this.interval)
            process.stdout.cursorTo(0, 0)
            process.stdout.clearScreenDown()
            console.log(`[RUNNING] [√] do not close this window`)
            fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS] process start\n`)
            new slink()
        })
    }
} catch (err) {
    fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL] error in timer\n[Message] ${err}`)
}

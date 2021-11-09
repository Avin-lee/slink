/*
 * @Author: Avin lee 
 * @Date: 2021-08-11 14:20:20 
 * @Last Modified by: Avin lee
 * @Last Modified time: 2021-10-23 16:30:01
 */
const puppeteer = require('puppeteer')
const fs = require('fs')
const nodeCmd = require('node-cmd')
const {
    pathUrl,
    oaUrl,
    userName,
    pathPwd,
    oaPwd,
    isProject,
    projectName,
    workDetail,
    isShotDown
} = require('../config')
const browserPath = './chrome/chrome.exe'
const todayStr = new Date().toLocaleDateString()
const logPath = `./log/${todayStr}.txt`

function asyncSetTimeOut(fn, time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(fn()), time)
    })
}

function nowTimeStr() {
    return new Date().toTimeString().split(' ')[0]
}

class slink {
    constructor() {
        const _self = this;
        (async () => {
            try {
                _self.browser = await puppeteer.launch({
                    executablePath: browserPath,
                    headless: true,
                    args: ['--start-maximized'],
                    slowMo: 20
                })
                _self._pathLogIn(_self._oaLogIN)
                await asyncSetTimeOut(async () => {
                    _self.browser && _self.browser.close()
                    fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][OA] OA can not sign out, most like your work time less than half day\n`)
                }, 120000)
                _self._shotDownComputer()
            } catch (err) {
                fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL] init browser error\n[Message] ${err}\n`)
                _self.browser && _self.browser.close()
            }
        })()
    }
    async _pathLogIn(cb) {
        const _self = this
        try {
            if (_self.browser) {
                let page = await _self.browser.newPage()
                await page.goto(pathUrl)
                await page.setViewport({
                    width: 1920,
                    height: 1080
                })
                await page.waitForSelector('input#login_name')
                await page.type('input#login_name', userName)
                await page.waitForSelector('input#login_pwd')
                await page.type('input#login_pwd', pathPwd)
                await page.waitForSelector('input#_submit')
                let loginBtn = await page.$('input#_submit')
                await loginBtn.click().then(async () => {
                    await asyncSetTimeOut(async () => {
                        let isLoadingSuccess = await page.$('#box-header')
                        if (isLoadingSuccess) {
                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] path login success\n`)
                            await page.waitForSelector('a#sys_menu_handler')
                            let headHoverBlock = await page.$('a#sys_menu_handler')
                            await headHoverBlock.click()
                            await page.waitForSelector('a[title="点击打开 [ 工时录入] 功能"]')
                            let workTimeEntrance = await page.$('a[title="点击打开 [ 工时录入] 功能"]')
                            await workTimeEntrance.click()
                            let iframeHandle = await page.waitForSelector('#page_ifr_test_dailylog')
                            let frame = await iframeHandle.contentFrame()
                            await frame.waitForSelector('td.fc-today')
                            let todayCell = await frame.$('td.fc-today')
                            // click today
                            await todayCell.click().then(async () => {
                                await asyncSetTimeOut(async () => {
                                    let dialogIframeHandle = await frame.waitForSelector('.dialog-bd iframe')
                                    let dialogIframe = await dialogIframeHandle.contentFrame()
                                    // isProject
                                    if (isProject) {
                                        // select your project
                                        await dialogIframe.waitForSelector('input#project')
                                        let projectInput = await dialogIframe.$('input#project')
                                        await projectInput.click()
                                        await dialogIframe.waitForSelector('.oas-associate-panel.oas-overlay li.associate-item')
                                        let projectNameArr = await dialogIframe.$$eval('.oas-associate-panel.oas-overlay li.associate-item', el => el.map(elSub => elSub.textContent))
                                        let index = 0
                                        let selectSuccess = false
                                        for (let pName of projectNameArr) {
                                            if (pName === projectName) {
                                                let targetProject = await dialogIframe.$(`li.associate-item[index="${index}"]`)
                                                await targetProject.click().then(async () => {
                                                    selectSuccess = true
                                                    fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] select project <${projectName}> success\n`)
                                                })
                                            }
                                            index++
                                        }
                                        if (index === projectNameArr.length && !selectSuccess) {
                                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][PATH] don't find project <${projectName}> in path\n`)
                                            _self.browser && _self.browser.close()
                                        }
                                    } else {
                                        // change to un-project radio
                                        await dialogIframe.waitForSelector('input[type="radio"][value="2"]')
                                        let notProjectRadio = await dialogIframe.$('input[type="radio"][value="2"]')
                                        await notProjectRadio.click().then(async () => {
                                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] change to un-project radio success\n`)
                                        })
                                    }
                                    // input your work-time
                                    await dialogIframe.waitForSelector('span#oaWorkHour')
                                    let availableWorkTime = await dialogIframe.$eval('span#oaWorkHour', el => el.textContent)
                                    await dialogIframe.type('input#workhour', availableWorkTime).then(async () => {
                                        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] work-time input success <${availableWorkTime} h>\n`)
                                    })
                                    // input your work-detail
                                    await dialogIframe.type('textarea[name="detail"]', workDetail).then(async () => {
                                        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] work-detail input success\n`)
                                    })
                                    // confirm
                                    let confirmButton = await frame.$('a.oas-btn.oas-recommend')
                                    await confirmButton.click().then(async () => {
                                        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][PATH] path finished\n`)
                                        // loading oa
                                        await cb && cb.call(_self)
                                    })
                                }, 3000)
                            })
                        } else {
                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][PATH] path login fail, check your userName and password\n`)
                            _self.browser && _self.browser.close()
                            return
                        }
                    }, 5000)
                })
            } else {
                fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][PATH] not find a browser to login path\n`)
            }
        } catch (err) {
            fs.appendFileSync(logPath, `[${nowTimeStr()}] [ERROR] processing error\n[Message] ${err}\n`)
        }
    }
    async _oaLogIN() {
        const _self = this
        try {
            if (_self.browser) {
                let page = await _self.browser.newPage()
                await page.goto(oaUrl)
                await page.setViewport({
                    width: 1920,
                    height: 1080
                })
                await page.waitForSelector('input#userName')
                await page.type('input#userName', userName)
                await page.waitForSelector('input#password')
                await page.type('input#password', oaPwd)
                await page.waitForSelector('button#go')
                let loginBtn = await page.$('button#go')
                await loginBtn.click().then(async () => {
                    await asyncSetTimeOut(async () => {
                        let isLoadingSuccess = await page.$('a#user')
                        if (isLoadingSuccess) {
                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][OA] oa login success\n`)
                            let signOutButton = await page.$('a.bn-sign.off')
                            await signOutButton.click().then(async () => {
                                await asyncSetTimeOut(async () => {
                                    const hasSignOutSuccessfully = await page.$('a.bn-sign.cancel.offcancel')
                                    if (hasSignOutSuccessfully) {
                                        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][OA] oa sign out success\n`)
                                        fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS][OA] oa finished\n`)
                                    }
                                    _self.browser && _self.browser.close()
                                    _self._shotDownComputer()
                                }, 2000)
                            })
                        } else {
                            fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][OA] oa login fail, check your userName and password\n`)
                            _self.browser && _self.browser.close()
                            return
                        }
                    }, 5000)
                })
            } else {
                fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL][OA] not find a browser to login oa\n`)
            }
        } catch (err) {
            fs.appendFileSync(logPath, `[${nowTimeStr()}] [ERROR] processing error\n[Message] ${err}\n`)
        }
    }
    async _shotDownComputer() {
        if (isShotDown) {
            nodeCmd.get('shutdown -f -s -t 3', (err) => {
                if (err) {
                    fs.appendFileSync(logPath, `[${nowTimeStr()}] [FAIL] shut down computer fail\n[MESSAGE] ${err}`)
                } else {
                    fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS] shut down computer success\n`)
                    fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS] process finished\n`)
                }
            })
        } else {
            fs.appendFileSync(logPath, `[${nowTimeStr()}] [SUCCESS] process finished\n`)
        }
    }
}

module.exports = slink

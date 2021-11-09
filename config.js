/*
 * @Author: Avin lee 
 * @Date: 2021-08-11 14:27:24 
 * @Last Modified by: Avin lee
 * @Last Modified time: 2021-11-06 15:55:48
 */
const config = {
    // path [@String]
    pathUrl: 'http://path.xa.fiberhome.com:8090/path/SSO!login.action',
    // oa [@String]
    oaUrl: 'http://oa.xa.fiberhome.com:8080/weboa/auth/login!loginSuccess.action',
    // userName [@String]
    userName: 'x7353',
    // path password [@String]
    pathPwd: '1',
    // oa password [@String]
    oaPwd: '1',
    // work-time type [@Boolean]
    isProject: true,
    // is project ? project name : '' [@String] (search in your path)
    projectName: 'IBD_JD-Custom-1.2.0',
    // work detail [@String]
    workDetail: '排版管理项目优化',
    // signOut time [@String] (24h format, such as '18:01:09')
    signOutTime: '17:20:10',
    // shot down computer when finished? [@Boolean]
    isShotDown: true
}

module.exports = config

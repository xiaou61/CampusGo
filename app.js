//核心包依赖
const { GetInitUtils } = require('./libs/getinitUtils');

// app.js
App({
    onLaunch() {
        GetInitUtils();  //初始化通用工具类
    },
    /**
     * 全局的初始数据
     */
    globalData: {
        userInfo: null
    },
})
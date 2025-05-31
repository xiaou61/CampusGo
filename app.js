//核心包依赖
const jjsk = require('./libs/jjsk');
const { request } = require('./utils/request')
const app = getApp()
// app.js
App({

    /**
     * 全局的初始数据
     */
    globalData: {
        userInfo: null
    },

    onLaunch() {
        // 检查登录状态
        this.checkLoginStatus()
    },

    // 检查登录状态
    checkLoginStatus() {
        const token = wx.getStorageSync('token')
        if (!token) {
            // 获取当前页面路径
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            const currentPath = currentPage ? currentPage.route : ''
            
            // 如果当前不在登录页，则跳转到登录页
            if (currentPath !== 'pages/login/login') {
                // 使用setTimeout确保页面已经加载完成
                setTimeout(() => {
                    wx.redirectTo({
                        url: '/pages/login/login'
                    })
                }, 100)
            }
        }
    },

    // 全局监听页面显示
    onShow() {
        this.checkLoginStatus()
    }
})
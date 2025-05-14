// pages/home/home.js
var media = require('../../data/media')
var map = require('../../data/map')
var school = require('../../data/school')
var data = require('../../data/data')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        miniprogram_name: data.miniprogram_name, // 校园导航小程序名称
        school_information: school.school_information, // 学校信息
        AppID: school.AppID,  // 学校招生小程序AppID

        laba: media.laba,  // 喇叭样式
        school_logo: media.school_logo,  // 学校logo
        school_background: media.school_background,  //首页顶部背景图
        top_image: media.background,  // 首页顶部图片框

        function_buttons: media.function_buttons,  // 常用功能

        school_icon: media.school_icon,  // 学校图标
        book: media.book,  // 图书图标
        jwxt: media.jwxt,  // jwxt
        // wave: media.wave,  // 波浪动画


        // label: media.label,  //学校简介图标

        luckin:media.luckin,
        LuckinAppID:"wx21c7506e98a2fe75",
        mixue:media.MiXue,
        MiXueAppID:"wx7696c66d2245d107",
        magazine: media.magazine,  // 友情链接-招生信息-icon
        // school: media.school,   // 未找到相关用处
        information: media.information,  // 小程序相关信息
        notes: media.notes, 
        admin: media.admin,  
        contact: media.contact, 
        hevttc: media.hevttc,  // 学校公众号
        //weather: media.weather,  // 天气图标

        //APIKEY: data.weatherKey,  // 和风天气API
        school_location: parseFloat(map.longitude).toFixed(2) + "," + parseFloat(map.latitude).toFixed(2),  // 学校位置


        indicatorDots: true, //是否显示面板指示点
        indicatorColor: "white", //指示点颜色
        activeColor: "#2adce2", //当前选中的指示点颜色
        autoplay: true, //是否自动切换
        circular: true, //是否采用衔接滑动
        interval: 3500, //间隔时间
        duration: 1500, //滑动时间

        dialogShow: false,
        buttons: [{
            text: '关闭'
        }],

        showTyping: true,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        //this.getWeather()
        this.startTypingLoop()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    /**
     * 用户点击右上角分享到朋友圈
     */
    onShareTimeline: function (res) {

    },

    //图片比例
    imgHeight: function (e) {
        var winWid = wx.getWindowInfo().windowWidth; //获取当前屏幕的宽度
        var imgh = e.detail.height; //图片高度
        var imgw = e.detail.width; //图片宽度
        var swiperH = winWid * imgh / imgw + "px" //等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
        this.setData({
            Height: swiperH //设置高度
        })
    },

    // 学校官微
    toschool() {
        wx.previewImage({
            current: this.data.hevttc[0],
            urls: this.data.hevttc
        })
    },

    // 图书馆官微
    tolibrary() {
        wx.previewImage({
            current: this.data.hevttc[1],
            urls: this.data.hevttc
        })
    },

    // 教务系统网站
    tofinance() {
        wx.previewImage({
            current: this.data.hevttc[2],
            urls: this.data.hevttc
        })
    },


    // 招生官微
    toMiniProgram() {
        wx.navigateToMiniProgram({
            appId: this.data.AppID,
        })
    },

    // 蜜雪冰城
    toMiXue() {
        wx.navigateToMiniProgram({
            appId: this.data.MiXueAppID,
        })
    },
    
    //瑞幸咖啡
    toLuckin() {
        wx.navigateToMiniProgram({
            appId: this.data.LuckinAppID,
        })
    },




    // 获取天气
    // getWeather() {
    //     var that = this
    //     wx.request({
    //         url: 'https://devapi.qweather.com/v7/weather/now?key=' + that.data.APIKEY + "&location=" + that.data.school_location,
    //         success(result) {
    //             var res = result.data
    //             that.setData({
    //                 now: res.now
    //             })
    //         }
    //     })
    // },

    //点击图片可查看
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var url = e.target.dataset.src
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: this.data.background // 需要预览的图片http链接列表
        })
    },

    // 跳转到地图页
    map() {
        wx.switchTab({
            url: '../map/map',
        })
    },

    // 跳转到校园页
    ai() {
        wx.switchTab({
            url: '../ai/ai',
        })
    },

    // 跳转到地点汇总页
    guide() {
        // wx.switchTab({
        //   url: '../site/site',
        // })
        wx.switchTab({
          url: '../school/school',
        })
    },

    // 友情链接
    link() {
        this.setData({
            dialogShow: true,
        })
    },

    // 关闭 mp-dialog 会话框
    mapmarker(e) {
        this.setData({
            dialogShow: false,
        })
    },

    // 学校简介
    tointroduction() {
        wx.navigateTo({
            url: "/pages/home/introduction/introduction",
        });
    },

    //致谢页面
    Thanks() {
      wx.navigateTo({
        url: "/pages/home/thanks/thanks",
      })
    },

    startTypingLoop() {
        const that = this
        if (this.typingTimer) clearInterval(this.typingTimer)
        this.setData({ showTyping: false })
        setTimeout(() => {
            that.setData({ showTyping: true })
        }, 100) // 先隐藏再显示，触发动画
        this.typingTimer = setInterval(() => {
            that.setData({ showTyping: false })
            setTimeout(() => {
                that.setData({ showTyping: true })
            }, 100)
        }, 20000)
    },

    onUnload() {
        if (this.typingTimer) clearInterval(this.typingTimer)
    },
})
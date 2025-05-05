// pages/home/introduction/introduction.js
var school = require('../../../data/school')
var media = require('../../../data/media')
const app = getApp()
Page({

    /**
     * 组件的初始数据
     */
    data: {
        logo :media.school_logo,
        school_information: school.school_information,
        school_background: media.background,

        navigation: media.navigation,
        videourl: media.videourl,

        indicatorDots: true,
        indicatorColor: "white", //指示点颜色
        activeColor: "#2adce2", //当前选中的指示点颜色
        autoplay: true, //是否自动切换
        circular: true, //是否采用衔接滑动
        interval: 3500, //间隔时间
        duration: 1500, //滑动时间
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化页面时添加可见类
        this.observeElements()
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
        // 页面显示时重新观察元素
        this.observeElements()
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

    // 观察元素是否进入视口
    observeElements() {
        const query = wx.createSelectorQuery()
        const elements = [
            '.section',
            '.section-title',
            '.intro-text',
            '.intro-image',
            '.feature-item',
            '.contact-item'
        ]

        elements.forEach(selector => {
            query.selectAll(selector).boundingClientRect()
        })

        query.exec((res) => {
            if (!res || !Array.isArray(res)) return;
            
            res.forEach((rects, index) => {
                if (!rects || !Array.isArray(rects)) return;
                
                rects.forEach((rect, i) => {
                    if (rect && rect.top < wx.getWindowInfo().windowHeight) {
                        const className = elements[index]
                        const elementQuery = wx.createSelectorQuery()
                        elementQuery.selectAll(className).boundingClientRect()
                        elementQuery.exec((elements) => {
                            if (elements && elements[0] && elements[0][i]) {
                                const element = elements[0][i]
                                if (element) {
                                    // 元素已经在视口中，不需要额外处理
                                }
                            }
                        })
                    }
                })
            })
        })
    },

    // 监听页面滚动
    onPageScroll(e) {
        this.observeElements()
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

    tomap() {
        wx.switchTab({
            url: '../../../pages/map/map',
        })
    },
    //点击图片可查看
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var url = e.target.dataset.src
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: this.data.background // 需要预览的图片http链接列表
        })
    },
})
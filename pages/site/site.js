
// pages/site/site.js
var map = require('../../data/map')
var media = require('../../data/media')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tag: media.tag,
        little_location: media.little_location,
        site_data: map.site_data,
        
        category: 0,

        id: null,
        card: null,
        dialogShow: false,
        buttons: [{
            text: '设为终点'
        }],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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

    changeCategory: function (e) {
        console.log("类别", e.currentTarget.id)
        this.setData({
            category: e.currentTarget.id,
        })
    },

    click: function (e) {
        console.log("点击事件数据：", e.currentTarget.dataset)
        var card = e.currentTarget.dataset
        let id = e.currentTarget.id

        // 处理图片数据
        if (card.images && Array.isArray(card.images)) {
            console.log("使用已有的图片数组：", card.images)
        } else {
            console.log("使用单张图片：", card.img)
            card.images = [card.img]
        }

        console.log("最终图片数据：", card.images)

        this.setData({
            dialogShow: true,
            card: card,
            id: id,
        })
    },

    //点击图片可查看
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var current = e.target.dataset.src
        var urls = this.data.card.images
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
    },

    mapmarker(e) {
        this.setData({
            dialogShow: false,
        })
        console.log(e.detail)
        let choose = e.detail.item.text
        var id = this.data.id
        var category = this.data.category

        if (choose == "设为终点") {
            var end = this.data.site_data[category].list[id]
            console.log(end)
            wx.setStorageSync('end', end)
            wx.switchTab({
                url: '../../pages/map/map',
            })
        } else {
            var start = this.data.site_data[category].list[id]
            console.log(start)
            wx.setStorageSync('start', start)
            wx.switchTab({
                url: '../../pages/map/map',
            })
        }
    }

})
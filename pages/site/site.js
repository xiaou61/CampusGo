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
            text: '到这里'
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
        // 读取起点数据
        const startPoint = wx.getStorageSync('startPoint');
        if (startPoint) {
            this.setData({ start: startPoint });
            wx.removeStorageSync('startPoint'); // 使用后清除
        }

        // 读取终点数据
        const endPoint = wx.getStorageSync('endPoint');
        if (endPoint) {
            this.setData({ end: endPoint });
            wx.removeStorageSync('endPoint'); // 使用后清除
        }
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
        console.log("类别", e.currentTarget.dataset.id)
        this.setData({
            category: e.currentTarget.dataset.id,
        })
    },

    click: function (e) {
        console.log("点击事件数据：", e.currentTarget.dataset)
        var card = e.currentTarget.dataset
        let id = parseInt(e.currentTarget.id)  // 将id转换为数字

        // 从site_data中获取完整的地点信息
        const currentCategory = this.data.site_data[this.data.category];
        const locationInfo = currentCategory.list[id];
        
        console.log("当前分类：", currentCategory)
        console.log("地点ID：", id)
        console.log("地点信息：", locationInfo)

        if (!locationInfo) {
            wx.showToast({
                title: '获取地点信息失败',
                icon: 'none'
            });
            return;
        }
        
        // 合并数据
        card = {
            ...card,
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude,
            name: locationInfo.name,
            aliases: locationInfo.aliases,
            desc: locationInfo.desc,
            images: locationInfo.images || [locationInfo.img]
        }

        console.log("完整的地点信息：", card)

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

    /**
     * 处理地图标记点击事件
     * @param {Object} e - 事件对象
     */
    mapmarker(e) {
        try {
            // 获取当前卡片数据
            const card = this.data.card;
            if (!card || !card.latitude || !card.longitude) {
                wx.showToast({
                    title: '无效的地点信息',
                    icon: 'none'
                });
                return;
            }
            wx.openLocation({
                latitude: card.latitude,
                longitude: card.longitude,
                name: card.name,
                address: card.aliases || card.name,
                scale: 18
            });
            this.setData({ dialogShow: false });
        } catch (error) {
            wx.showToast({
                title: error.message || '操作失败',
                icon: 'none',
                duration: 2000
            });
        }
    }

})
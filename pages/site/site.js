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

    /**
     * 处理地图标记点击事件
     * @param {Object} e - 事件对象
     */
    mapmarker(e) {
        try {
            // 获取点击的数据
            const data = e.currentTarget.dataset;
            if (!data) {
                throw new Error('无效的数据对象');
            }

            // 显示加载状态
            wx.showLoading({
                title: '加载中...',
                mask: true
            });

            // 保存分类信息到本地存储
            const currentCategory = this.data.site_data[this.data.category];
            wx.setStorageSync('searchCategory', currentCategory.id);

            // 保存地点数据到本地存储
            const locationData = {
                name: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
                category_id: currentCategory.id
            };

            // 保存起点或终点数据到本地存储
            const isStartPoint = this.data.search_id === 1;
            wx.setStorageSync(isStartPoint ? 'startPoint' : 'endPoint', locationData);

            // 关闭弹窗
            this.setData({
                dialogShow: false
            }, () => {
                // 在弹窗关闭后延迟一小段时间再跳转，确保动画完成
                setTimeout(() => {
                    // 隐藏加载状态
                    wx.hideLoading();
                    
                    // 返回地图页面
                    wx.switchTab({
                        url: '/pages/map/map',
                        success: () => {
                            console.log('成功切换到地图页面');
                        },
                        fail: (error) => {
                            console.error('切换页面失败:', error);
                            wx.showToast({
                                title: '切换页面失败',
                                icon: 'none'
                            });
                        }
                    });
                }, 300); // 300ms的延迟，可以根据实际动画时长调整
            });

        } catch (error) {
            console.error('mapmarker方法执行出错:', error);
            wx.hideLoading(); // 确保在出错时也隐藏加载状态
            wx.showToast({
                title: error.message || '操作失败',
                icon: 'none',
                duration: 2000
            });
        }
    }

})
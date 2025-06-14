// pages/hot/hot.js
const { request } = require('../../utils/request.js')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hotList: [],
        currentCategory: 'all',
        categories: [
            { id: 'all', name: '全部' },
            { id: 'zhiHu', name: '知乎' },
            { id: 'WeiBo', name: '微博' },
            { id: 'CodeFather', name: '编程导航' },
            { id: 'BiliBili', name: '哔哩哔哩' },
            { id: 'WyCloudMusic', name: '网易云音乐' },
            { id: 'DouYin', name: '抖音' },
            { id: 'CSDN', name: 'CSDN' },
            { id: 'JueJin', name: '掘金' }
        ],
        refreshing: false,
        showQRCode: false,
        qrcodeUrl: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadHotList()
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
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 加载热榜数据
    async loadHotList() {
        try {
            const res = await request({
                url: 'hot/list',
                method: 'post'
            })

            if (res.code === 200) {
                // 处理数据，如果是全部分类，只保留每个平台的前两条
                const processedData = res.data.map(platform => {
                    if (this.data.currentCategory === 'all') {
                        return {
                            ...platform,
                            data: platform.data.slice(0, 2) // 只保留前两条数据
                        }
                    }
                    return platform
                })

                this.setData({
                    hotList: processedData
                })
            } else {
                wx.showToast({
                    title: res.msg || '加载失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('加载热榜失败:', error)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        }
    },

    // 切换分类
    onCategoryTap(e) {
        const category = e.currentTarget.dataset.category
        this.setData({
            currentCategory: category
        }, () => {
            // 切换分类后重新加载数据
            this.loadHotList()
        })
    },

    // 下拉刷新
    async onRefresh() {
        this.setData({
            refreshing: true
        })
        
        try {
            await this.loadHotList()
        } catch (error) {
            console.error('刷新失败:', error)
            wx.showToast({
                title: '刷新失败',
                icon: 'none'
            })
        } finally {
            this.setData({
                refreshing: false
            })
        }
    },

    // 点击热榜项
    onHotItemTap(e) {
        const url = e.currentTarget.dataset.url
        // 使用微信小程序API生成二维码
        wx.showLoading({
            title: '生成二维码中...',
        })
        
        // 将URL转换为二维码
        wx.downloadFile({
            url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
            success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({
                        qrcodeUrl: res.tempFilePath,
                        showQRCode: true
                    })
                } else {
                    wx.showToast({
                        title: '生成二维码失败',
                        icon: 'none'
                    })
                }
            },
            fail: () => {
                wx.showToast({
                    title: '生成二维码失败',
                    icon: 'none'
                })
            },
            complete: () => {
                wx.hideLoading()
            }
        })
    },

    closeQRCode() {
        this.setData({
            showQRCode: false,
            qrcodeUrl: ''
        })
    }
})
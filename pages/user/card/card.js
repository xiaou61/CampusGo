// pages/user/card/card.js
const { request } = require('../../../utils/request')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        balance: '0.00',
        transactions: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadWalletInfo()
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
        this.loadWalletInfo()
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

    // 加载钱包信息
    loadWalletInfo() {
        request({
            url: 'student/wallet/info',
            method: 'GET'
        }).then(res => {
            if (res.code === 200 && res.data) {
                this.setData({
                    balance: res.data.balance || '0.00',
                    transactions: res.data.transactions || []
                })
            } else {
                wx.showToast({
                    title: res.msg || '获取钱包信息失败',
                    icon: 'none'
                })
            }
        }).catch(error => {
            console.error('加载钱包信息失败：', error)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        })
    },

    // 处理充值
    handleRecharge() {
        wx.navigateTo({
            url: '/pages/user/card/recharge/recharge'
        })
    },

    // 处理提现
    handleWithdraw() {
        wx.navigateTo({
            url: '/pages/user/card/withdraw/withdraw'
        })
    },

    // 处理转账
    handleTransfer() {
        wx.navigateTo({
            url: '/pages/user/card/transfer/transfer'
        })
    },

    // 处理账单
    handleBill() {
        wx.navigateTo({
            url: '/pages/user/card/bill/bill'
        })
    },

    // 处理银行卡
    handleCards() {
        wx.navigateTo({
            url: '/pages/user/card/cards/cards'
        })
    },

    // 处理设置
    handleSettings() {
        wx.navigateTo({
            url: '/pages/user/card/settings/settings'
        })
    },

    // 查看所有交易记录
    viewAllTransactions() {
        wx.navigateTo({
            url: '/pages/user/card/transactions/transactions'
        })
    },

    // 查看交易详情
    viewTransactionDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/user/card/transaction-detail/transaction-detail?id=${id}`
        })
    }
})
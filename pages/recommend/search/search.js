// pages/recommend/search/search.js
const { request } = require('../../../utils/request')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        historyList: [],
        hotList: [
            { keyword: '校园活动', count: 1234, rank: 1 },
            { keyword: '学习资料', count: 986, rank: 2 },
            { keyword: '美食推荐', count: 876, rank: 3 },
            { keyword: '校园招聘', count: 765, rank: 4 },
            { keyword: '社团招新', count: 654, rank: 5 }
        ],
        searchResults: [],
        loading: false,
        refreshing: false,
        noMore: false,
        page: 1,
        pageSize: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 从本地存储加载搜索历史
        const historyList = wx.getStorageSync('searchHistory') || []
        this.setData({ historyList })
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

    // 搜索输入
    onSearchInput(e) {
        this.setData({
            searchValue: e.detail.value
        })
    },

    // 清除搜索
    clearSearch() {
        this.setData({
            searchValue: '',
            searchResults: []
        })
    },

    // 执行搜索
    async onSearch() {
        if (!this.data.searchValue.trim()) return

        // 保存搜索历史
        const historyList = [this.data.searchValue, ...this.data.historyList.filter(item => item !== this.data.searchValue)].slice(0, 10)
        this.setData({ historyList })
        wx.setStorageSync('searchHistory', historyList)

        // 重置搜索状态
        this.setData({
            searchResults: [],
            page: 1,
            noMore: false
        })

        // 执行搜索
        await this.searchPosts()
    },

    // 点击历史记录
    onHistoryTap(e) {
        const keyword = e.currentTarget.dataset.keyword
        this.setData({ searchValue: keyword })
        this.onSearch()
    },

    // 点击热门搜索
    onHotTap(e) {
        const keyword = e.currentTarget.dataset.keyword
        this.setData({ searchValue: keyword })
        this.onSearch()
    },

    // 清除历史记录
    clearHistory() {
        wx.showModal({
            title: '提示',
            content: '确定要清除搜索历史吗？',
            success: (res) => {
                if (res.confirm) {
                    this.setData({ historyList: [] })
                    wx.removeStorageSync('searchHistory')
                }
            }
        })
    },

    // 搜索帖子
    async searchPosts() {
        if (this.data.loading || this.data.noMore) return

        this.setData({ loading: true })

        try {
            const res = await request({
                url: 'user/post/search',
                method: 'GET',
                data: {
                    keyword: this.data.searchValue
                }
            })

            if (res.code === 200) {
                const newPosts = res.data || []
                
                this.setData({
                    searchResults: [...this.data.searchResults, ...newPosts],
                    page: this.data.page + 1,
                    noMore: newPosts.length < this.data.pageSize
                })
            } else {
                wx.showToast({
                    title: res.msg || '搜索失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('搜索失败:', error)
            wx.showToast({
                title: '搜索失败',
                icon: 'none'
            })
        } finally {
            this.setData({ loading: false })
        }
    },

    // 下拉刷新
    async onRefresh() {
        this.setData({
            refreshing: true,
            page: 1,
            noMore: false
        })
        
        try {
            await this.searchPosts()
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

    // 返回上一页
    goBack() {
        wx.navigateBack()
    },

    // 跳转到帖子详情
    goToDetail(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            wx.showToast({
                title: '帖子ID不存在',
                icon: 'none'
            })
            return
        }
        wx.navigateTo({
            url: `/pages/recommend/detail/detail?id=${id}`,
            fail: (err) => {
                console.error('跳转失败：', err)
                wx.showToast({
                    title: '跳转失败',
                    icon: 'none'
                })
            }
        })
    },

    // 关注用户
    followUser(e) {
        const id = e.currentTarget.dataset.id
        // 实现关注逻辑
    },

    // 点赞
    toggleLike(e) {
        const id = e.currentTarget.dataset.id
        // 实现点赞逻辑
    },

    // 显示评论
    showComments(e) {
        const id = e.currentTarget.dataset.id
        // 实现评论逻辑
    },

    // 分享帖子
    sharePost(e) {
        const id = e.currentTarget.dataset.id
        // 实现分享逻辑
    },

    // 预览图片
    previewImage(e) {
        const { urls, current } = e.currentTarget.dataset
        wx.previewImage({
            urls,
            current
        })
    }
})
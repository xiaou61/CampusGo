// pages/recommend/recommend.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentCategory: 'all',
        currentTab: 'home',
        loading: false,
        hasMore: true,
        pageNum: 1,
        pageSize: 10,
        posts: [],
        searchValue: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadPosts()
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
        this.setData({
            posts: [],
            pageNum: 1,
            hasMore: true
        })
        this.loadPosts()
        wx.stopPullDownRefresh()
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
        return {
            title: '推荐帖子',
            path: '/pages/recommend/recommend'
        }
    },

    // 加载帖子数据
    loadPosts(isLoadMore = false) {
        if (this.data.loading || (!isLoadMore && !this.data.hasMore)) return
        
        this.setData({ loading: true })
        
        // 这里替换为实际的API调用
        setTimeout(() => {
            const mockPosts = this.getMockPosts()
            const newPosts = isLoadMore ? [...this.data.posts, ...mockPosts] : mockPosts
            
            this.setData({
                posts: newPosts,
                hasMore: this.data.pageNum < 3, // 模拟只有3页数据
                pageNum: isLoadMore ? this.data.pageNum + 1 : 1,
                loading: false
            })
        }, 1000)
    },

    // 模拟数据
    getMockPosts() {
        return Array(this.data.pageSize).fill(0).map((_, index) => ({
            id: this.data.posts.length + index,
            username: `用户${this.data.posts.length + index}`,
            avatar: '/assets/images/avatar.png',
            time: '刚刚',
            content: '这是一条测试帖子内容，可以包含文字、图片等多媒体内容。',
            images: [
                '/assets/images/post1.jpg',
                '/assets/images/post2.jpg',
                '/assets/images/post3.jpg'
            ],
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50)
        }))
    },

    // 分类切换
    onCategoryTap(e) {
        const category = e.currentTarget.dataset.category
        this.setData({
            currentCategory: category,
            posts: [],
            pageNum: 1,
            hasMore: true
        })
        this.loadPosts()
    },

    // 搜索输入
    onSearchInput(e) {
        this.setData({
            searchValue: e.detail.value
        })
    },

    // 加载更多
    onLoadMore() {
        if (this.data.hasMore) {
            this.loadPosts(true)
        }
    },

    // 点赞
    onLikeTap(e) {
        const id = e.currentTarget.dataset.id
        const posts = this.data.posts.map(post => {
            if (post.id === id) {
                return { ...post, likes: post.likes + 1 }
            }
            return post
        })
        this.setData({ posts })
    },

    // 评论
    onCommentTap(e) {
        const id = e.currentTarget.dataset.id
        wx.showToast({
            title: '评论功能开发中',
            icon: 'none'
        })
    },

    // 分享
    onShareTap(e) {
        const id = e.currentTarget.dataset.id
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    },

    // 图片预览
    previewImage(e) {
        const { urls, current } = e.currentTarget.dataset
        wx.previewImage({
            urls,
            current
        })
    },

    // 通知按钮点击
    onNotificationTap() {
        wx.showToast({
            title: '通知功能开发中',
            icon: 'none'
        })
    },

    // 菜单按钮点击
    onMenuTap() {
        wx.showToast({
            title: '菜单功能开发中',
            icon: 'none'
        })
    },

    // 底部导航切换
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
        
        // 这里可以添加实际的页面跳转逻辑
        wx.showToast({
            title: `${tab}页面开发中`,
            icon: 'none'
        })
    },

    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '推荐帖子'
        }
    }
})
// pages/recommend/recommend.js
const { request } = require('../../utils/request.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentCategory: 'all',
        currentTab: 'all',
        loading: false,
        hasMore: true,
        pageNum: 1,
        pageSize: 10,
        posts: [],
        searchValue: '',
        refreshing: false,
        noMore: false,
        page: 1,
        newPostsCount: 0,  // 新增：新帖子数量
        lastRefreshTime: '' // 新增：上次刷新时间
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化上次刷新时间
        this.setData({
            lastRefreshTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        })
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

    // 下拉刷新
    async onRefresh() {
        this.setData({
            refreshing: true,
            page: 1,
            noMore: false
        })
        
        try {
            // 获取新帖子数量
            const countRes = await request({
                url: 'user/post/countNewPosts',
                method: 'post',
                data: {
                    lastRefreshTime: this.data.lastRefreshTime
                }
            })

            if (countRes.code === 200) {
                const newCount = parseInt(countRes.data) || 0
                // 使用本地时间
                const now = new Date()
                const currentTime = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0') + ':' + 
                    String(now.getSeconds()).padStart(2, '0')
                
                this.setData({
                    newPostsCount: newCount,
                    lastRefreshTime: currentTime
                })
                
                // 显示刷新时间和新帖子数量
                let message = ``
                if (newCount > 0) {
                    message += `\n为你推荐${newCount}条新帖子`
                    wx.showToast({
                      title: message,
                      icon: 'none',
                      duration: 2000
                  })
                }
            }

            await this.loadPosts(true)
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

    // 加载帖子数据
    async loadPosts(isRefresh = false) {
        if (this.data.loading || this.data.noMore) return

        this.setData({ loading: true })

        try {
            // 根据分类选择不同的接口和参数
            const url = this.data.currentTab === 'all' ? 'user/post/list' : 'user/post/listByCategory'
            const requestData = {
                pageNum: this.data.page,
                pageSize: this.data.pageSize,
                sortField: 'create_time',
                desc: true
            }

            // 只在非全部分类时添加category字段
            if (this.data.currentTab !== 'all') {
                requestData.category = this.data.currentTab
            }

            const res = await request({
                url: url,
                method: 'post',
                data: requestData
            })

            if (res.code === 200) {
                const newPosts = res.data.list || []
                
                // 处理帖子数据，添加必要的字段
                const processedPosts = newPosts.map(post => ({
                    id: post.id,
                    userId: post.userId,
                    title: post.title,
                    content: post.content,
                    images: post.imageUrls || [],
                    likes: post.likeCount,
                    comments: post.commentCount,
                    views: post.viewCount,
                    createTime: post.createTime,
                    updateTime: post.updateTime,
                    category: post.category,
                    username: post.nickname,
                    avatar: post.avatarUrl
                }))
                
                this.setData({
                    posts: isRefresh ? processedPosts : [...this.data.posts, ...processedPosts],
                    page: this.data.page + 1,
                    noMore: newPosts.length < this.data.pageSize
                })
            } else {
                wx.showToast({
                    title: res.msg || '加载失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('加载帖子失败:', error)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        } finally {
            this.setData({ loading: false })
        }
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
        if (tab === this.data.currentTab) return

        this.setData({
            currentTab: tab,
            posts: [],
            page: 1,
            noMore: false
        })
        this.loadPosts()
    },

    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '推荐帖子'
        }
    },

    showSearch(){
      wx.navigateTo({
        url: '../recommend/search/search',
      })
    },

    // 获取内容
    get_cord(){

    },
    
    // 创建帖子
    createPost(){
      wx.navigateTo({
        url: '../recommend/edit_cord/edit_cord',
      })
    },

    // 跳转到帖子详情页
    goToDetail(e) {
        const postId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/recommend/detail/detail?id=${postId}`
        })
    }
})
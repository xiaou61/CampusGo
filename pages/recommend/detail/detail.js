// pages/recommend/detail/detail.js
const { request } = require('../../../utils/request.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        post: null,
        comments: [],
        commentCount: 0,
        commentValue: '',
        replyTo: null,
        showKeyboard: false,
        loading: false,
        noMore: false,
        page: 1,
        pageSize: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const { id } = options
        this.postId = id
        this.loadPost()
        this.loadComments()
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
        if (!this.data.loading && !this.data.noMore) {
            this.loadComments()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 加载帖子详情
    async loadPost() {
        try {
            const res = await request({
                url: `user/post/get/${this.postId}`,
                method: 'post'
            })

            if (res.code === 200) {
                // 处理帖子数据
                const postData = res.data
                const post = {
                    id: postData.id,
                    userId: postData.userId,
                    title: postData.title,
                    content: postData.content,
                    images: postData.imageUrls || [],
                    likes: postData.likeCount,
                    comments: postData.commentCount,
                    views: postData.viewCount,
                    createTime: postData.createTime,
                    updateTime: postData.updateTime,
                    category: postData.category,
                    isLiked: false,
                    isFollowing: false,
                    username: postData.nickname,
                    avatar: postData.avatarUrl
                }

                this.setData({ post })
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
        }
    },

    // 加载评论列表
    async loadComments() {
        if (this.data.loading || this.data.noMore) return

        this.setData({ loading: true })

        try {
            const res = await request({
                url: `user/post/common/pageById/${this.postId}`,
                method: 'post',
                data: {
                    pageNum: this.data.page,
                    pageSize: this.data.pageSize,
                    fetchAll: false,
                    sortField: 'create_time',
                    desc: true
                }
            })

            if (res.code === 200) {
                const { list, total } = res.data
                
                // 处理评论数据
                const comments = list.map(comment => ({
                    id: comment.id,
                    postId: comment.postId,
                    parentId: comment.parentId,
                    userId: comment.userId,
                    username: comment.nickname || '用户' + comment.userId.slice(-4),
                    avatar: comment.avatarUrl || '/assets/images/default-avatar.png',
                    content: comment.content,
                    createTime: comment.createTime,
                    likes: comment.likeCount,
                    isDeleted: comment.isDeleted === 1,
                    isLiked: false,
                    replies: comment.replies || []
                }))
                
                this.setData({
                    comments: [...this.data.comments, ...comments],
                    commentCount: total,
                    page: this.data.page + 1,
                    noMore: comments.length < this.data.pageSize
                })
            } else {
                wx.showToast({
                    title: res.msg || '加载失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('加载评论失败:', error)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        } finally {
            this.setData({ loading: false })
        }
    },

    // 评论输入
    onCommentInput(e) {
        this.setData({
            commentValue: e.detail.value
        })
    },

    // 提交评论
    async submitComment() {
        if (!this.data.commentValue.trim()) return

        try {
            const res = await request({
                url: 'user/post/common/create',
                method: 'post',
                data: {
                    postId: this.postId,
                    parentId: this.data.replyTo ? this.data.replyTo.id : '0',
                    content: this.data.commentValue
                }
            })

            if (res.code === 200) {
                // 重置评论列表状态
                this.setData({
                    comments: [],
                    page: 1,
                    noMore: false,
                    commentValue: '',
                    replyTo: null,
                    showKeyboard: false
                })

                // 重新加载评论列表和帖子详情
                await this.loadComments()
                await this.loadPost()

                wx.showToast({
                    title: '评论成功',
                    icon: 'success'
                })
            } else {
                wx.showToast({
                    title: res.msg || '评论失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('评论失败:', error)
            wx.showToast({
                title: '评论失败',
                icon: 'none'
            })
        }
    },

    // 回复评论
    replyComment(e) {
        const id = e.currentTarget.dataset.id
        const comment = this.data.comments.find(item => item.id === id)
        this.setData({
            replyTo: comment,
            showKeyboard: true
        })
    },

    // 点赞帖子
    async toggleLike() {
        try {
            const res = await request({
                url: `user/post/like/${this.postId}`,
                method: 'post'
            })

            if (res.code === 200) {
                // 更新帖子点赞状态
                this.setData({
                    'post.isLiked': !this.data.post.isLiked,
                    'post.likes': this.data.post.isLiked ? 
                        this.data.post.likes - 1 : 
                        this.data.post.likes + 1
                })

                wx.showToast({
                    title: this.data.post.isLiked ? '取消点赞' : '点赞成功',
                    icon: 'success'
                })
            } else {
                wx.showToast({
                    title: res.msg || '操作失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('点赞失败:', error)
            wx.showToast({
                title: '操作失败',
                icon: 'none'
            })
        }
    },

    // 点赞评论
    async likeComment(e) {
        const id = e.currentTarget.dataset.id
        try {
            const res = await request({
                url: `user/post/common/like/${id}`,
                method: 'post'
            })

            if (res.code === 200) {
                // 更新评论点赞状态
                const comments = this.data.comments.map(comment => {
                    if (comment.id === id) {
                        return {
                            ...comment,
                            isLiked: !comment.isLiked,
                            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                        }
                    }
                    return comment
                })
                
                this.setData({ comments })

                wx.showToast({
                    title: '操作成功',
                    icon: 'success'
                })
            } else {
                wx.showToast({
                    title: res.msg || '操作失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('点赞失败:', error)
            wx.showToast({
                title: '操作失败',
                icon: 'none'
            })
        }
    },

    // 关注用户
    async followUser(e) {
        const id = e.currentTarget.dataset.id
        try {
            await wx.cloud.callFunction({
                name: 'followUser',
                data: { userId: id }
            })

            this.setData({
                'post.isFollowing': true
            })

            wx.showToast({
                title: '关注成功',
                icon: 'success'
            })
        } catch (error) {
            console.error('关注失败:', error)
            wx.showToast({
                title: '操作失败',
                icon: 'none'
            })
        }
    },

    // 分享帖子
    sharePost() {
        // 实现分享逻辑
    },

    // 预览图片
    previewImage(e) {
        const { urls, current } = e.currentTarget.dataset
        wx.previewImage({
            urls,
            current
        })
    },

    // 删除评论
    async deleteComment(e) {
        const id = e.currentTarget.dataset.id
        const isReply = e.currentTarget.dataset.isReply
        const parentId = e.currentTarget.dataset.parentId

        try {
            const res = await request({
                url: `user/post/common/delete/${id}`,
                method: 'delete'
            })

            if (res.code === 200) {
                // 重置评论列表状态
                this.setData({
                    comments: [],
                    page: 1,
                    noMore: false
                })

                // 重新加载评论列表
                await this.loadComments()
                // 重新加载帖子详情
                await this.loadPost()

                wx.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
            } else {
                wx.showToast({
                    title: res.msg || '删除失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('删除失败:', error)
            wx.showToast({
                title: '删除失败',
                icon: 'none'
            })
        }
    },

    // 长按评论显示操作菜单
    onCommentLongPress(e) {
        const id = e.currentTarget.dataset.id
        const isReply = e.currentTarget.dataset.isReply
        const parentId = e.currentTarget.dataset.parentId
        const userId = e.currentTarget.dataset.userId

        // 这里可以添加判断是否是自己的评论
        // const isOwnComment = userId === 当前用户ID

        wx.showActionSheet({
            itemList: ['删除'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    this.deleteComment({
                        currentTarget: {
                            dataset: {
                                id,
                                isReply,
                                parentId
                            }
                        }
                    })
                }
            }
        })
    }
})
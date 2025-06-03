// pages/user/user.js
const { request, upload } = require('../../utils/request')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {
            id: '',
            studentNumber: '',
            name: '',
            avatarUrl: '',
            posts: 0,
            followers: 0,
            following: 0
        },
        miniprogram_name: '校园Go'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      if (app.globalData.userInfo) {
        this.setData({
            userInfo: app.globalData.userInfo
        })
    } else {
        this.loadUserInfo()
    }
        // this.loadUserInfo()
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
      if (app.globalData.userInfo) {
        this.setData({
            userInfo: app.globalData.userInfo
        })
      } else {
          this.loadUserInfo()
      }
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

    // 加载用户信息
    loadUserInfo() {
        console.log('开始加载用户信息')
        request({
            url: 'student/user/info',
            method: 'GET'
        }).then(res => {
            console.log('获取到的用户信息：', res)
            if (res.code === 200 && res.data) {
                const userInfo = {
                    ...this.data.userInfo,
                    ...res.data,
                    posts: this.data.userInfo.posts,
                    followers: this.data.userInfo.followers,
                    following: this.data.userInfo.following
                }
                console.log('设置用户信息：', userInfo)
                this.setData({
                    userInfo: userInfo
                })
            } else {
                console.error('获取用户信息失败：', res)
                wx.showToast({
                    title: res.msg || '获取用户信息失败',
                    icon: 'none'
                })
            }
        }).catch(error => {
            console.error('加载用户信息失败：', error)
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            })
        })
    },

    // 处理退出登录
    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除全局用户信息
                    app.globalData.userInfo = null
                    // 清除本地存储的token
                    wx.removeStorageSync('token')
                    // 跳转到登录页
                    wx.reLaunch({
                        url: '/pages/login/login'
                    })
                }
            }
        })
    },

    // 导航到我的帖子
    navigateToMyPosts() {
        wx.navigateTo({
            url: '/pages/user/posts/posts'
        })
    },

    // 导航到我的收藏
    navigateToFavorites() {
        wx.navigateTo({
            url: '/pages/user/favorites/favorites'
        })
    },

    // 导航到我的点赞
    navigateToLikes() {
        wx.navigateTo({
            url: '/pages/user/likes/likes'
        })
    },

    // 导航到我的评论
    navigateToComments() {
        wx.navigateTo({
            url: '/pages/user/comments/comments'
        })
    },
 
    // 导航到钱包页面
    navigateToCard() {
      wx.navigateTo({
          url: '/pages/user/card/card'
      })
    },    

    // 导航到设置页面
    navigateToSettings() {
        wx.navigateTo({
            url: '/pages/user/setting/setting',
            success: (res) => {
                // 传递用户信息到设置页面
                res.eventChannel.emit('userInfo', { userInfo: this.data.userInfo })
            }
        })
    },

    // 导航到反馈页面
    navigateToFeedback() {
        wx.navigateTo({
            url: '/pages/user/feedback/feedback'
        })
    },

    // 导航到关于页面
    navigateToAbout() {
        wx.navigateTo({
            url: '/pages/user/about/about'
        })
    },

    // 显示开发人员名单
    showDevelopers() {
        wx.navigateTo({
            url: '/pages/home/thanks/thanks'
        })
    },

    // 处理头像上传
    handleAvatarUpload() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            camera: 'front',
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath
                
                // 显示上传中提示
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })

                // 上传图片到服务器
                upload({
                    url: 'file-upload',
                    filePath: tempFilePath,
                    name: 'file'
                }).then(res => {
                    if (res.code === 200) {
                        console.log('上传图片成功：', res.data)
                        // 更新用户头像
                        request({
                            url: 'student/upload/avatar',
                            method: 'POST',
                            header: { 'content-type': 'application/x-www-form-urlencoded' },
                            data: {
                                avatar: res.data
                            }
                        }).then(updateRes => {
                            if (updateRes.code === 200) {
                                // 更新本地用户信息
                                const userInfo = this.data.userInfo
                                userInfo.avatarUrl = res.data
                                this.setData({ userInfo })
                                
                                // 更新全局用户信息
                                app.globalData.userInfo = userInfo
                                
                                wx.showToast({
                                    title: '更新成功',
                                    icon: 'success'
                                })
                            } else {
                                wx.showToast({
                                    title: updateRes.msg || '更新失败',
                                    icon: 'none'
                                })
                            }
                        }).catch(error => {
                            console.error('更新头像失败：', error)
                            wx.showToast({
                                title: '更新失败',
                                icon: 'none'
                            })
                        })
                    } else {
                        wx.showToast({
                            title: res.msg || '上传失败',
                            icon: 'none'
                        })
                    }
                }).catch(error => {
                    console.error('上传头像失败：', error)
                    wx.showToast({
                        title: '上传失败',
                        icon: 'none'
                    })
                }).finally(() => {
                    wx.hideLoading()
                })
            }
        })
    }
})
// pages/recommend/edit_cord/edit_cord.js
const { request, upload } = require('../../../utils/request.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        content: '',
        images: [],
        category: '',
        categoryIndex: 0,
        categories: [
            { value: 'SECOND_HAND', label: '二手闲置' },
            { value: 'HELP', label: '打听求助' },
            { value: 'DATING', label: '恋爱交友' },
            { value: 'CAMPUS', label: '校园趣事' },
            { value: 'JOB', label: '兼职招聘' },
            { value: 'OTHER', label: '其他' }
        ],
        canPublish: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 页面加载时的初始化
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

    // 标题输入
    onTitleInput(e) {
        this.setData({
            title: e.detail.value
        })
        this.checkCanPublish()
    },

    // 内容输入
    onContentInput(e) {
        this.setData({
            content: e.detail.value
        })
        this.checkCanPublish()
    },

    // 分类选择
    onCategorySelect(e) {
        const value = e.currentTarget.dataset.value
        this.setData({
            category: value
        })
        this.checkCanPublish()
    },

    // 检查是否可以发布
    checkCanPublish() {
        const { title, category } = this.data
        const canPublish = title.trim().length > 0 && category
        this.setData({ canPublish })
    },

    // 选择图片
    async chooseImage() {
        try {
            const res = await wx.chooseImage({
                count: 9 - this.data.images.length,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera']
            })

            // 使用 Promise.all 并行上传所有文件
            const uploadPromises = res.tempFilePaths.map(filePath => {
                return upload({
                    url: 'file-upload/batch',
                    filePath: filePath,
                    name: 'files',
                    header: {
                        'content-type': 'multipart/form-data'
                    },
                    formData: {
                        type: 'post' // 可以添加其他表单数据
                    }
                }).then(res => {
                    if (res.code === 200) {
                        return res.data[0] // 获取数组中的第一个URL
                    }
                    throw new Error(res.msg || '上传失败')
                })
            })

            const uploadResults = await Promise.all(uploadPromises)
            
            // 更新图片列表
            this.setData({
                images: [...this.data.images, ...uploadResults]
            })
        } catch (error) {
            console.error('选择图片失败:', error)
            wx.showToast({
                title: error.message || '选择图片失败',
                icon: 'none'
            })
        }
    },

    // 删除图片
    deleteImage(e) {
        const index = e.currentTarget.dataset.index
        const images = [...this.data.images]
        images.splice(index, 1)
        this.setData({ images })
    },

    // 选择位置
    async chooseLocation() {
        try {
            const res = await wx.chooseLocation()
            // 处理位置信息
            console.log('选择的位置:', res)
        } catch (error) {
            console.error('选择位置失败:', error)
        }
    },

    // 选择话题
    chooseTopic() {
        // 实现话题选择逻辑
    },

    // 发布帖子
    async publishPost() {
        if (!this.data.canPublish) return

        wx.showLoading({
            title: '发布中...',
            mask: true
        })

        try {
            const { title, content, images, category } = this.data
            
            // 打印请求数据，用于调试
            console.log('发布帖子数据:', {
                title: title.trim(),
                content: content.trim(),
                imageUrls: images,
                category: category.trim()
            })

            // 调用创建帖子接口
            const res = await request({
                url: 'user/post/create',
                method: 'post',
                data: {
                    title: title.trim(),
                    content: content.trim() || '',  // 如果内容为空，发送空字符串
                    imageUrls: images || [],        // 如果没有图片，发送空数组
                    category: category.trim() || '' // 如果分类为空，发送空字符串
                }
            })

            console.log('发布帖子响应:', res)

            if (res.code === 200) {
                wx.hideLoading()
                wx.showToast({
                    title: '发布成功',
                    icon: 'success'
                })

                // 获取页面栈
                const pages = getCurrentPages()
                // 获取上一页实例
                const prevPage = pages[pages.length - 2]
                
                // 如果上一页存在，调用其刷新方法
                if (prevPage) {
                    // 如果上一页有 onLoad 方法，调用它
                    if (prevPage.onLoad) {
                        prevPage.onLoad()
                    }
                    // 如果上一页有 onShow 方法，调用它
                    if (prevPage.onShow) {
                        prevPage.onShow()
                    }
                }

                // 返回上一页
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            } else {
                throw new Error(res.msg || '发布失败')
            }
        } catch (error) {
            console.error('发布失败:', error)
            wx.hideLoading()
            wx.showToast({
                title: error.message || '发布失败',
                icon: 'none'
            })
        }
    },

    // 返回上一页
    goBack() {
        wx.navigateBack()
    }
})
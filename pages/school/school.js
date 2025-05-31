/**
 * @author https://github.com/xiaou61
 * 学校页面
 * 主要功能：
 * 1. 展示学校指南
 * 2. 处理指南点击事件
 * 3. 提供指南搜索功能
 * 4. 支持指南分类切换
 */
// pages/school/school.js
var school = require('../../data/school')
var media = require('../../data/media')
import { getSchoolGuide } from '../../data/schoolGuide'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        allWords: [],
        green_arrow: media.green_arrow,
        pageNum: 1,
        pageSize: 10,
        hasMore: true,
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.loadGuideData()
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
        this.setData({ pageNum: 1, hasMore: true })
        this.loadGuideData()
        wx.stopPullDownRefresh()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onScrollToLower() {
        if (this.data.hasMore) {
            this.loadGuideData(true)
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 加载指南数据
    loadGuideData(isLoadMore = false) {
        if (this.data.loading || (!isLoadMore && !this.data.hasMore)) return
        
        this.setData({ loading: true })
        
        getSchoolGuide(this.data.pageNum, this.data.pageSize)
            .then(res => {
                const newList = isLoadMore ? [...this.data.allWords, ...res.list] : res.list
                this.setData({
                    allWords: newList,
                    hasMore: res.list.length === this.data.pageSize,
                    pageNum: isLoadMore ? this.data.pageNum + 1 : 1,
                    loading: false
                })
            })
            .catch(err => {
                wx.showToast({
                    title: err,
                    icon: 'none'
                })
                this.setData({ loading: false })
            })
    },

    /* 关于侧边栏，点击跳转 */
    jump(event) {
        let id = event.currentTarget.dataset.id;
        // 获取到跳转锚点id
        wx.navigateTo({
            url: '/pages/school/guidance/guidance?id=' + id, // 通过url传到跳转页面
        })
    },

})
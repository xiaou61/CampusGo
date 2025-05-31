/**
 * @author https://github.com/xiaou61
 * 学校指南页面
 * 主要功能：
 * 1. 展示学校指南
 * 2. 处理指南点击事件
 * 3. 提供指南搜索功能
 * 4. 支持指南分类切换
 */
// pages/school/guidance/guidance.js
import { getSchoolGuide } from '../../../data/schoolGuide'

Page({
  data: {
    allWords: [],
    curWords: [],
    height: 0,
    detail: 'id0',
    loading: false
  },

  onLoad(options) {
    console.log(options.id);
    this.setData({
      height: wx.getWindowInfo().windowHeight - 50,
      detail: 'id' + options.id
    })
    this.loadGuideData()
  },

  // 加载指南数据
  loadGuideData() {
    this.setData({ loading: true })
    getSchoolGuide(1, 100) // 获取更多数据用于搜索
      .then(res => {
        this.setData({
          allWords: res.list,
          curWords: res.list,
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

  getRect() {
    var that = this
    wx.createSelectorQuery().select('#search').boundingClientRect(function (rect) {
      rect.height // 节点的高度
    }).exec(res => {
      console.log(res)
      that.setData({
        top: res[0].height
      })
    })
  },

  clickImg: function (e) {
    console.log(e.currentTarget.dataset)
    var currentUrl = e.currentTarget.dataset.url;
    var currentId = e.currentTarget.dataset.id;
    var imageList = this.data.curWords[currentId].imageList
    console.log("当前显示图片", currentUrl)
    console.log("需要预览的图片", imageList)
    wx.previewImage({
      current: currentUrl,
      urls: imageList,
      fail: function (err) {
        console.log('放大图片失败', err)
        wx.showToast({
          title: '放大图片失败',
          icon: 'none'
        })
      },
    })
  },

  bindInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  search() {
    console.log('search', this.data.inputValue)
    wx.showLoading({
      title: '搜索中',
    })
    var res = []
    for (const i of this.data.allWords) {
      if (i.title.indexOf(this.data.inputValue) != -1 || 
          i.content.indexOf(this.data.inputValue) != -1 || 
          (i.keywords && i.keywords.indexOf(this.data.inputValue) != -1)) {
        res.push(i)
      }
    }
    console.log(this.data.allWords)
    console.log(res)
    wx.hideLoading()
    if (res.length == 0) {
      wx.showToast({
        title: '无搜索结果',
        icon: 'none'
      })
    } else {
      this.setData({
        curWords: res
      })
    }
  },
})
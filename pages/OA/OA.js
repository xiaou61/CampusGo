// pages/OA/OA.js
const { request } = require('../../utils/request.js')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用户信息
        userInfo: {
            name: '',
            avatar: '/images/avatar.png'
        },
        // 当前选中的标签页
        currentTab: 'home',
        // 未读消息数量
        unreadCount: 2,
        // 是否显示通知面板
        showNotificationPanel: false,
        // 是否显示提示框
        showToast: false,
        // 提示框消息
        toastMessage: '',
        // 是否有更多消息
        hasMoreMessages: true,
        // 星期几
        weekDays: ['日', '一', '二', '三', '四', '五', '六'],
        // 日历数据
        calendarDays: [],
        // 今日日程
        todaySchedule: [],
        // 待办任务
        tasks: [
            {
                id: 1,
                title: '2023年第四季度财务报表审核',
                deadline: '2023-12-30',
                department: '财务部',
                priority: 'urgent'
            },
            {
                id: 2,
                title: '新员工入职审批',
                deadline: '2023-12-25',
                department: '人事部',
                priority: 'normal'
            },
            {
                id: 3,
                title: '年终会议准备材料',
                deadline: '2024-01-05',
                department: '行政部',
                priority: 'low'
            }
        ],
        // 消息列表
        messages: [
            {
                id: 1,
                sender: '李总',
                time: '10:30',
                content: '请准备下周一会议的材料，谢谢！',
                unread: true,
                avatar: '/images/avatar.png'
            },
            {
                id: 2,
                sender: '系统通知',
                time: '昨天',
                content: '您有一个新的报销申请待审批',
                unread: false,
                avatar: '/images/avatar.png'
            },
            {
                id: 3,
                sender: '王经理',
                time: '昨天',
                content: '项目进度报告已更新，请查看',
                unread: false,
                avatar: '/images/avatar.png'
            }
        ],
        // 通知列表
        notifications: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 从全局数据获取用户信息
        const userInfo = app.globalData.userInfo
        if (userInfo) {
            this.setData({
                'userInfo.name': userInfo.name || '',
                'userInfo.avatar': userInfo.avatar || '/images/avatar.png'
            })
        }
        
        this.initCalendar()
        this.loadTodaySchedule()
        this.loadNotifications()
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

    // 初始化日历
    initCalendar() {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const today = now.getDate()
        
        // 获取当月第一天是星期几
        const firstDay = new Date(year, month, 1).getDay()
        // 获取当月天数
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        const calendarDays = []
        
        // 填充上月剩余日期
        for (let i = 0; i < firstDay; i++) {
            const prevMonthDays = new Date(year, month, 0).getDate()
            calendarDays.push({
                day: prevMonthDays - firstDay + i + 1,
                date: `${year}-${month}-${prevMonthDays - firstDay + i + 1}`,
                isToday: false,
                hasEvent: false
            })
        }
        
        // 填充当月日期
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push({
                day: i,
                date: `${year}-${month + 1}-${i}`,
                isToday: i === today,
                hasEvent: Math.random() > 0.7 // 随机生成事件标记
            })
        }
        
        // 填充下月开始日期
        const remainingDays = 42 - calendarDays.length // 6行7列
        for (let i = 1; i <= remainingDays; i++) {
            calendarDays.push({
                day: i,
                date: `${year}-${month + 2}-${i}`,
                isToday: false,
                hasEvent: false
            })
        }
        
        this.setData({ calendarDays })
    },

    // 加载今日日程
    loadTodaySchedule() {
        // 使用request.js中的方法
        request({
            url: 'schedule/today',
            method: 'GET'
        }).then(res => {
            if (res.code === 200) {
                this.setData({ todaySchedule: res.data })
            } else {
                this.showToast('加载日程失败')
            }
        }).catch(err => {
            console.error('加载日程失败:', err)
            this.showToast('加载日程失败')
        })
    },

    // 加载通知
    loadNotifications() {
        // 使用request.js中的方法
        request({
            url: 'notification/list',
            method: 'GET'
        }).then(res => {
            if (res.code === 200) {
                this.setData({ notifications: res.data })
            } else {
                this.showToast('加载通知失败')
            }
        }).catch(err => {
            console.error('加载通知失败:', err)
            this.showToast('加载通知失败')
        })
    },

    // 显示通知面板
    showNotificationPanel() {
        this.setData({ showNotificationPanel: true })
    },

    // 隐藏通知面板
    hideNotificationPanel() {
        this.setData({ showNotificationPanel: false })
    },

    // 显示提示框
    showToast(message) {
        this.setData({
            showToast: true,
            toastMessage: message
        })
        
        setTimeout(() => {
            this.setData({ showToast: false })
        }, 3000)
    },

    // 切换标签页
    switchTab(e) {
        const tab = e.currentTarget.dataset.tab
        this.setData({ currentTab: tab })
        
        // 根据标签页执行相应操作
        switch (tab) {
            case 'home':
                // 刷新首页数据
                break
            case 'work':
                // 跳转到工作页面
                wx.navigateTo({ url: '/pages/work/work' })
                break
            case 'message':
                // 跳转到消息页面
                wx.navigateTo({ url: '/pages/message/message' })
                break
            case 'profile':
                // 跳转到个人页面
                wx.navigateTo({ url: '/pages/profile/profile' })
                break
        }
    },

    // 查看任务详情
    viewTaskDetail(e) {
        const taskId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/task/detail?id=${taskId}`
        })
    },

    // 查看日程详情
    viewScheduleDetail(e) {
        const scheduleId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/schedule/detail?id=${scheduleId}`
        })
    },

    // 查看消息详情
    viewMessageDetail(e) {
        const messageId = e.currentTarget.dataset.id
        // 标记消息为已读
        const messages = this.data.messages.map(msg => {
            if (msg.id === messageId) {
                return { ...msg, unread: false }
            }
            return msg
        })
        this.setData({ messages })
        
        wx.navigateTo({
            url: `/pages/message/detail?id=${messageId}`
        })
    },

    // 查看通知详情
    viewNotificationDetail(e) {
        const notificationId = e.currentTarget.dataset.id
        // 标记通知为已读
        const notifications = this.data.notifications.map(notif => {
            if (notif.id === notificationId) {
                return { ...notif, unread: false }
            }
            return notif
        })
        this.setData({ notifications })
        
        wx.navigateTo({
            url: `/pages/notification/detail?id=${notificationId}`
        })
    },

    // 查看日期日程
    viewDaySchedule(e) {
        const date = e.currentTarget.dataset.date
        wx.navigateTo({
            url: `/pages/schedule/day?date=${date}`
        })
    },

    // 加载更多消息
    loadMoreMessages() {
        // 模拟加载更多消息
        this.setData({
            hasMoreMessages: false
        })
        this.showToast('没有更多消息了')
    },

    // 清除所有通知
    clearAllNotifications() {
        this.setData({
            notifications: []
        })
        this.showToast('已清除所有通知')
    },

    // 导航到各个功能页面
    navigateToApproval() {
        wx.navigateTo({ url: '/pages/approval/approval' })
    },

    navigateToSchedule() {
        wx.navigateTo({ url: '/pages/schedule/schedule' })
    },

    navigateToReport() {
        wx.navigateTo({ url: '/pages/report/report' })
    },

    navigateToDocument() {
        wx.navigateTo({ url: '/pages/document/document' })
    },

    navigateToContacts() {
        wx.navigateTo({ url: '/pages/contacts/contacts' })
    },

    navigateToAnnouncement() {
        wx.navigateTo({ url: '/pages/announcement/announcement' })
    },

    navigateToExam() {
        wx.navigateTo({ url: '/pages/OA/exam/exam' })
    },

    navigateToMore() {
        wx.navigateTo({ url: '/pages/more/more' })
    },

    navigateToMoreTasks() {
        wx.navigateTo({ url: '/pages/task/list' })
    },

    navigateToMoreSchedule() {
        wx.navigateTo({ url: '/pages/schedule/list' })
    },

    navigateToMoreMessages() {
        wx.navigateTo({ url: '/pages/message/list' })
    }
})
// pages/login/forget/fotget.js
const { request } = require('../../../utils/request.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        canSendCode: true,
        codeText: '获取验证码',
        countdown: 60,
        canSubmit: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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

    // 返回上一页
    goBack() {
        wx.navigateBack()
    },

    // 邮箱输入
    onEmailInput(e) {
        this.setData({
            email: e.detail.value
        })
        this.checkCanSendCode()
        this.checkCanSubmit()
    },

    // 验证码输入
    onCodeInput(e) {
        this.setData({
            code: e.detail.value
        })
        this.checkCanSubmit()
    },

    // 密码输入
    onPasswordInput(e) {
        this.setData({
            password: e.detail.value
        })
        this.checkCanSubmit()
    },

    // 确认密码输入
    onConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value
        })
        this.checkCanSubmit()
    },

    // 切换密码显示
    togglePassword() {
        this.setData({
            showPassword: !this.data.showPassword
        })
    },

    // 切换确认密码显示
    toggleConfirmPassword() {
        this.setData({
            showConfirmPassword: !this.data.showConfirmPassword
        })
    },

    // 检查是否可以发送验证码
    checkCanSendCode() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const canSend = emailRegex.test(this.data.email)
        this.setData({
            canSendCode: canSend
        })
    },

    // 检查是否可以提交
    checkCanSubmit() {
        const { email, code, password, confirmPassword } = this.data
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const emailValid = emailRegex.test(email)
        const codeValid = /^\d{4}$/.test(code)
        const passwordValid = /^.{6,20}$/.test(password)
        const confirmValid = password === confirmPassword

        this.setData({
            canSubmit: emailValid && codeValid && passwordValid && confirmValid
        })
    },

    // 发送验证码
    async sendCode() {
        if (!this.data.canSendCode) return

        try {
            const res = await request({
                url: 'captcha/email/code',
                method: 'GET',
                data: {
                    email: this.data.email
                }
            })

            if (res.code === 200) {
                wx.showToast({
                    title: '验证码已发送',
                    icon: 'success'
                })
                this.startCountdown()
            } else {
                wx.showToast({
                    title: res.msg || '发送失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('发送验证码失败:', error)
            wx.showToast({
                title: '发送失败',
                icon: 'none'
            })
        }
    },

    // 开始倒计时
    startCountdown() {
        this.setData({
            canSendCode: false,
            codeText: `${this.data.countdown}s`
        })

        const timer = setInterval(() => {
            if (this.data.countdown <= 1) {
                clearInterval(timer)
                this.setData({
                    canSendCode: true,
                    codeText: '获取验证码',
                    countdown: 60
                })
            } else {
                this.setData({
                    countdown: this.data.countdown - 1,
                    codeText: `${this.data.countdown - 1}s`
                })
            }
        }, 1000)
    },

    // 提交修改
    async submit() {
        if (!this.data.canSubmit) return

        try {
            const res = await request({
                url: 'student/forget/password',
                method: 'post',
                header:{
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    email: this.data.email,
                    code: this.data.code,
                    password: this.data.password
                }
            })

            if (res.code === 200) {
                wx.showToast({
                    title: '密码修改成功',
                    icon: 'success'
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            } else {
                wx.showToast({
                    title: res.msg || '修改失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('修改密码失败:', error)
            wx.showToast({
                title: '修改失败',
                icon: 'none'
            })
        }
    }
})
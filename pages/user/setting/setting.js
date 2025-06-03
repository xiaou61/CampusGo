// pages/user/setting/setting.js
const { request } = require('../../../utils/request')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        email: '',
        notificationEnabled: true,
        darkMode: false,
        cacheSize: '0KB',
        showEmailDialog: false,
        email: '',
        verificationCode: '',
        countdown: 0,
        canSendCode: true,
        showPasswordDialog: false,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        userInfo: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取传递过来的用户信息
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('userInfo', (data) => {
            this.setData({
                userInfo: data.userInfo,
                email: data.userInfo.email || ''
            })
        })
        this.loadSettings()
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

    // 处理个人资料
    handleProfile() {
        wx.navigateTo({
            url: '/pages/user/profile/profile'
        })
    },

    // 处理修改密码
    handlePassword() {
        this.setData({
            showPasswordDialog: true
        });
    },

    // 隐藏修改密码弹窗
    hidePasswordDialog() {
        this.setData({
            showPasswordDialog: false,
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    },

    // 处理原密码输入
    handleOldPasswordInput(e) {
        this.setData({
            oldPassword: e.detail.value
        });
    },

    // 处理新密码输入
    handleNewPasswordInput(e) {
        this.setData({
            newPassword: e.detail.value
        });
    },

    // 处理确认密码输入
    handleConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value
        });
    },

    // 确认修改密码
    confirmChangePassword() {
        const { oldPassword, newPassword, confirmPassword } = this.data;

        if (!oldPassword) {
            wx.showToast({
                title: '请输入原密码',
                icon: 'none'
            });
            return;
        }

        if (!newPassword) {
            wx.showToast({
                title: '请输入新密码',
                icon: 'none'
            });
            return;
        }

        if (newPassword.length < 6) {
            wx.showToast({
                title: '新密码不能少于6位',
                icon: 'none'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            wx.showToast({
                title: '两次输入的密码不一致',
                icon: 'none'
            });
            return;
        }

        // 调用修改密码接口
        request({
            url: 'student/update/password',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                oldPassword: oldPassword,
                newPassword: newPassword
            }
        }).then(res => {
            if (res.code === 200) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success'
                });
                this.hidePasswordDialog();
            } else {
                wx.showToast({
                    title: res.msg || '修改失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            wx.showToast({
                title: '修改失败',
                icon: 'none'
            });
        });
    },

    // 处理手机号码
    handlePhone() {
        this.setData({
            showEmailDialog: true
        });
    },

    // 隐藏邮箱绑定弹窗
    hideEmailDialog() {
        this.setData({
            showEmailDialog: false,
            email: '',
            verificationCode: '',
            countdown: 0,
            canSendCode: true
        });
    },

    // 处理邮箱输入
    handleEmailInput(e) {
        const email = e.detail.value;
        this.setData({
            email,
            canSendCode: this.validateEmail(email)
        });
    },

    // 处理验证码输入
    handleCodeInput(e) {
        this.setData({
            verificationCode: e.detail.value
        });
    },

    // 清除邮箱输入
    clearEmail() {
        this.setData({
            email: '',
            canSendCode: false
        });
    },

    // 验证邮箱格式
    validateEmail(email) {
        const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return reg.test(email);
    },

    // 发送验证码
    sendVerificationCode() {
        if (!this.data.canSendCode || this.data.countdown > 0) return;

        const email = this.data.email;
        if (!this.validateEmail(email)) {
            wx.showToast({
                title: '请输入正确的邮箱地址',
                icon: 'none'
            });
            return;
        }

        // 开始倒计时
        this.setData({
            countdown: 60,
            canSendCode: false
        });

        const timer = setInterval(() => {
            if (this.data.countdown <= 1) {
                clearInterval(timer);
                this.setData({
                    countdown: 0,
                    canSendCode: true
                });
            } else {
                this.setData({
                    countdown: this.data.countdown - 1
                });
            }
        }, 1000);

        // 调用发送验证码接口
        request({
            url: 'captcha/email/code',
            method: 'GET',
            data: {
                email: email
            }
        }).then(res => {
            if (res.code === 200) {
                wx.showToast({
                    title: '验证码已发送',
                    icon: 'success'
                });
            } else {
                wx.showToast({
                    title: res.msg || '发送失败',
                    icon: 'none'
                });
                // 发送失败时重置倒计时
                clearInterval(timer);
                this.setData({
                    countdown: 0,
                    canSendCode: true
                });
            }
        }).catch(err => {
            wx.showToast({
                title: '发送失败',
                icon: 'none'
            });
            // 发送失败时重置倒计时
            clearInterval(timer);
            this.setData({
                countdown: 0,
                canSendCode: true
            });
        });
    },

    // 确认绑定邮箱
    confirmBindEmail() {
        const { email, verificationCode } = this.data;
        
        if (!this.validateEmail(email)) {
            wx.showToast({
                title: '请输入正确的邮箱地址',
                icon: 'none'
            });
            return;
        }

        if (!verificationCode) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none'
            });
            return;
        }

        // 调用绑定邮箱接口
        request({
            url: 'student/bind/email',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                email: email,
                code: verificationCode
            }
        }).then(res => {
            if (res.code === 200) {
                wx.showToast({
                    title: '绑定成功',
                    icon: 'success'
                });
                this.setData({
                    phone: email,
                    showEmailDialog: false
                });
            } else {
                wx.showToast({
                    title: res.msg || '绑定失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            wx.showToast({
                title: '绑定失败',
                icon: 'none'
            });
        });
    },

    // 处理消息通知开关
    handleNotificationChange(e) {
        const value = e.detail.value
        this.setData({
            notificationEnabled: value
        })
        wx.setStorageSync('notificationEnabled', value)
    },

    // 处理清除缓存
    handleClearCache() {
        wx.showModal({
            title: '提示',
            content: '确定要清除缓存吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.clearStorage({
                        success: () => {
                            wx.showToast({
                                title: '清除成功',
                                icon: 'success'
                            })
                        }
                    })
                }
            }
        })
    },

    // 处理关于我们
    handleAbout() {
        wx.navigateTo({
            url: '/pages/user/about/about'
        })
    },

    // 处理意见反馈
    handleFeedback() {
        wx.navigateTo({
            url: '/pages/user/feedback/feedback'
        })
    },

    // 处理隐私政策
    handlePrivacy() {
        wx.navigateTo({
            url: '/pages/user/privacy/privacy'
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
    }
})
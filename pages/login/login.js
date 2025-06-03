const { request } = require('../../utils/request')
var media = require('../../data/media')
const { school_logo } = require('../../data/media')

Page({
  data: {
    studentNumber: '',
    password: '',
    studentNumberError: '',
    passwordError: '',
    showPassword: false,
    rememberMe: false,
    loading: false,
    school_logo:media.school_logo1
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      this.redirectToHome()
    }
    
    // 检查是否有保存的登录信息
    const savedLogin = wx.getStorageSync('savedLogin')
    if (savedLogin) {
      this.setData({
        studentNumber: savedLogin.studentNumber,
        password: savedLogin.password,
        rememberMe: true
      })
    }
  },

  onStudentNumberInput(e) {
    this.setData({
      studentNumber: e.detail.value,
      studentNumberError: ''
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      passwordError: ''
    })
  },

  validateStudentNumber() {
    const { studentNumber } = this.data
    if (!studentNumber) {
      this.setData({
        studentNumberError: '请输入学号'
      })
      return false
    }
    if (!/^\d{8,12}$/.test(studentNumber)) {
      this.setData({
        studentNumberError: '请输入8-12位数字的学号'
      })
      return false
    }
    return true
  },

  validatePassword() {
    const { password } = this.data
    if (!password) {
      this.setData({
        passwordError: '请输入密码'
      })
      return false
    }
    if (password.length < 6) {
      this.setData({
        passwordError: '密码长度不能少于6位'
      })
      return false
    }
    return true
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  toggleRememberMe() {
    this.setData({
      rememberMe: !this.data.rememberMe
    })
  },

  onForgotPassword() {
    wx.showModal({
      title: '忘记密码',
      content: '请联系管理员重置密码',
      showCancel: false
    })
  },

  handleLogin() {
    const { studentNumber, password, rememberMe } = this.data
    
    // 验证输入
    if (!this.validateStudentNumber() || !this.validatePassword()) {
      return
    }

    this.setData({ loading: true })

    request({
      url: 'student/login',
      method: 'POST',
      data: {
        studentNumber,
        password
      }
    }).then(res => {
      this.setData({ loading: false })
      if (res.code === 200) {
        // 保存token
        wx.setStorageSync('token', res.data.token)
        
        // 如果选择了记住我，保存登录信息
        if (rememberMe) {
          wx.setStorageSync('savedLogin', { studentNumber, password })
        } else {
          wx.removeStorageSync('savedLogin')
        }

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        this.redirectToHome()
      } else {
        wx.showToast({
          title: res.msg || '登录失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      this.setData({ loading: false })
      wx.showToast({
        title: err,
        icon: 'none'
      })
    })
  },

  redirectToHome() {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  // 获取用户信息

}) 
const baseUrl = 'http://4170f302.r9.cpolar.cn/uapi/' // 这里需要替换成你的实际后端地址

function request(options) {
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'satoken': token || '', // 使用satoken作为token的header key
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.data.code === 401 || res.data.code === 500 || res.data.msg?.includes('未登录')) {
          // token 过期或未登录，清除token并跳转登录页
          wx.removeStorageSync('token')
          wx.redirectTo({ 
            url: '/pages/login/login',
            success: () => {
              reject(res.data)
            }
          })
        } else {
          resolve(res.data)
        }
      },
      fail(err) {
        console.error('请求失败：', err)
        wx.showToast({ 
          title: '网络错误，请检查网络连接', 
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })
  })
}

function upload(options) {
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: baseUrl + options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {}, // 可附加其它字段
      header: {
        'satoken': token || '',
        ...(options.header || {})
      },
      success(res) {
        const data = JSON.parse(res.data)
        if (data.code === 401 || data.code === 500 || data.msg?.includes('未登录')) {
          // token 过期或未登录，清除token并跳转登录页
          wx.removeStorageSync('token')
          wx.redirectTo({ 
            url: '/pages/login/login',
            success: () => {
              reject(data)
            }
          })
        } else {
          resolve(data)
        }
      },
      fail(err) {
        console.error('上传失败：', err)
        wx.showToast({ 
          title: '网络错误，请检查网络连接', 
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  upload
} 
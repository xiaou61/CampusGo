// 这里需要替换成你的实际后端地址
const baseUrl = 'http://localhost:8080/uapi/'  //本地测试
// const baseUrl = 'http://51acf174.r39.cpolar.top/uapi/'   //内网测试

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

function streamRequest({ url, method, data, onMessage, onDone, onError }) {
  const token = wx.getStorageSync('token')
  const fullUrl = baseUrl + url + '?message=' + encodeURIComponent(data.message)

  let buffer = ''

  const task = wx.request({
    url: fullUrl,
    method: method || 'GET',
    header: {
      'satoken': token || '',
      'Accept': 'text/event-stream',
      'Connection': 'keep-alive'
    },
    enableChunked: true,  // 保证支持分块响应
    success(res) {
      if (res.statusCode !== 200) {
        onError?.('[ERROR]请求失败')
      }
    },
    fail(err) {
      console.error('流式请求失败：', err)
      onError?.('[ERROR]网络错误')
    }
  })

  task.onChunkedData((res) => {
    try {
      // 注意：这里用 TextDecoder 解码 Uint8Array（二进制）数据
      const chunk = new TextDecoder().decode(res.data)
      buffer += chunk
      // 按换行符分割
      const lines = buffer.split('\n')
      buffer = lines.pop()  // 最后一行不完整，暂存缓存

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const content = line.slice(5).trim()

          if (content === '[DONE]') {
            onDone?.()
          } else if (content.startsWith('[ERROR]')) {
            onError?.(content)
          } else {
            onMessage?.(content)
          }
        }
      }
    } catch (e) {
      console.error('解析流错误', e)
      onError?.('[ERROR]解析失败')
    }
  })

  return task
}

module.exports = {
  request,
  upload,
  streamRequest
} 
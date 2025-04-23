const app = getApp()
const config = require('../../utils/config')

Page({
    data: {
        messages: [],
        inputValue: '',
        scrollToView: '',
        userAvatar: '/images/user-avatar.png',
        aiAvatar: '/images/ai-avatar.png',
        isTyping: false
    },

    onLoad(options) {
        this.initChatHistory()
    },

    initChatHistory: function() {
        const welcomeMessage = {
            id: Date.now(),
            role: 'ai',
            content: '你好！我是校园AI助手，有什么可以帮助你的吗？',
            time: this.formatTime(new Date())
        }
        this.setData({
            messages: [welcomeMessage],
            scrollToView: 'msg-' + welcomeMessage.id
        })
    },

    onInput: function(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },

    sendMessage: function() {
        if (!this.data.inputValue.trim() || this.data.isTyping) return

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: this.data.inputValue,
            time: this.formatTime(new Date())
        }

        this.setData({
            messages: [...this.data.messages, userMessage],
            inputValue: '',
            scrollToView: 'msg-' + userMessage.id,
            isTyping: true
        })

        // 添加等待消息
        const waitingMessage = {
            id: Date.now(),
            role: 'ai',
            content: '正在思考中...',
            time: this.formatTime(new Date())
        }

        this.setData({
            messages: [...this.data.messages, waitingMessage],
            scrollToView: 'msg-' + waitingMessage.id
        })

        this.callDeepSeekAPI(userMessage.content)
    },

    callDeepSeekAPI: async function(prompt) {
        try {
            console.log('开始调用 API，请求数据:', {
                baseURL: config.baseURL,
                prompt: prompt,
                headers: config.headers
            })

            const response = await new Promise((resolve, reject) => {
                wx.request({
                    url: config.baseURL + '/v1/chat/completions',
                    method: 'POST',
                    header: config.headers,
                    data: {
                        model: config.model,
                        messages: [
                            {
                                role: "system",
                                content: "You are a helpful assistant."
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000
                    },
                    success: (res) => {
                        console.log('请求成功:', res)
                        resolve(res)
                    },
                    fail: (err) => {
                        console.error('请求失败:', err)
                        reject(new Error('网络请求失败: ' + JSON.stringify(err)))
                    }
                })
            })

            console.log('API 响应:', response)

            // 检查响应状态和数据
            if (!response) {
                throw new Error('API响应为空')
            }

            if (response.statusCode !== 200) {
                throw new Error(`API响应异常: 状态码 ${response.statusCode}, 响应数据: ${JSON.stringify(response.data)}`)
            }

            if (!response.data) {
                throw new Error('API响应数据为空')
            }

            // 检查响应数据结构
            if (!response.data.choices || !response.data.choices[0]?.message?.content) {
                throw new Error('API响应格式错误: ' + JSON.stringify(response.data))
            }

            // 移除等待消息
            const messages = this.data.messages.filter(msg => msg.content !== '正在思考中...')
            
            const aiMessage = {
                id: Date.now(),
                role: 'ai',
                content: response.data.choices[0].message.content,
                time: this.formatTime(new Date())
            }

            this.setData({
                messages: [...messages, aiMessage],
                scrollToView: 'msg-' + aiMessage.id,
                isTyping: false
            })
        } catch (error) {
            console.error('API调用失败:', error)
            
            // 移除等待消息
            const messages = this.data.messages.filter(msg => msg.content !== '正在思考中...')
            
            // 添加错误消息
            const errorMessage = {
                id: Date.now(),
                role: 'ai',
                content: '抱歉，我遇到了一些问题。请稍后再试。错误信息：' + error.message,
                time: this.formatTime(new Date())
            }

            this.setData({
                messages: [...messages, errorMessage],
                scrollToView: 'msg-' + errorMessage.id,
                isTyping: false
            })

            // 显示错误提示
            wx.showToast({
                title: '请求失败，请检查网络连接或API配置',
                icon: 'none',
                duration: 2000
            })
        }
    },

    formatTime: function(date) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    },

    showError: function(message) {
        wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
        })
    }
})
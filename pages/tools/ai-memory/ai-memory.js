const app = getApp()

Page({
    data: {
        messages: [],
        inputValue: '',
        scrollToMessage: '',
        loading: false,
        sessionId: '' // 用于标识对话会话
    },

    onLoad() {
        // 生成会话ID
        this.setData({
            sessionId: Date.now().toString(),
            messages: [
                {
                    id: 1,
                    role: 'ai',
                    content: '你好！我是AI助手，我会记住我们的对话内容。有什么可以帮你的吗？'
                }
            ]
        })
    },

    onInput(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },

    async sendMessage() {
        if (!this.data.inputValue.trim() || this.data.loading) return

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: this.data.inputValue
        }

        // 添加用户消息
        this.setData({
            messages: [...this.data.messages, userMessage],
            inputValue: '',
            scrollToMessage: `msg-${userMessage.id}`,
            loading: true
        })

        try {
            // 调用AI接口，带上会话ID和历史消息
            const res = await wx.request({
                url: `${app.globalData.baseUrl}/ai/chat/memory`,
                method: 'POST',
                data: {
                    message: userMessage.content,
                    sessionId: this.data.sessionId,
                    history: this.data.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                }
            })

            if (res.data.code === 0) {
                // 添加AI回复
                const aiMessage = {
                    id: Date.now(),
                    role: 'ai',
                    content: res.data.data
                }
                this.setData({
                    messages: [...this.data.messages, aiMessage],
                    scrollToMessage: `msg-${aiMessage.id}`
                })
            } else {
                wx.showToast({
                    title: 'AI回复失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            wx.showToast({
                title: '网络错误',
                icon: 'none'
            })
        } finally {
            this.setData({
                loading: false
            })
        }
    }
}) 
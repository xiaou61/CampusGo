const app = getApp()
const config = require('../../utils/config')
const { qaData, findSimilarQuestion } = require('../../pages/ai/qa_data.js');

Page({
    data: {
        messages: [],
        inputValue: '',
        scrollToView: '',
        userAvatar: '/images/user-avatar.png',
        aiAvatar: '/images/ai-avatar.png',
        isTyping: false,
        suggestedQuestions: []
    },

    onLoad(options) {
        this.initChatHistory()
        this.updateSuggestedQuestions()
    },

    initChatHistory: function() {
        const welcomeMessage = {
            id: Date.now(),
            role: 'ai',
            content: '你好！我是河北科技师范学院专属校园AI助手，有什么可以帮助你的吗？',
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
        this.updateSuggestedQuestions()
    },

    updateSuggestedQuestions: function() {
        const input = this.data.inputValue.toLowerCase();
        const suggestions = [];
        
        if (!input) {
            suggestions.push(...qaData.map(item => item.q));
        } else {
            qaData.forEach(item => {
                if (item.q.toLowerCase().includes(input)) {
                    suggestions.push(item.q);
                }
            });
        }
        
        this.setData({
            suggestedQuestions: suggestions.slice(0, 5)
        });
    },

    onSuggestedQuestionTap: function(e) {
        const question = e.currentTarget.dataset.question;
        this.setData({
            inputValue: question
        });
        this.sendMessage();
    },

    sendMessage: function() {
        const input = this.data.inputValue.trim();
        if (!input) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            time: this.formatTime(new Date())
        };

        this.setData({
            messages: [...this.data.messages, userMessage],
            inputValue: '',
            suggestedQuestions: [],
            scrollToView: 'msg-' + userMessage.id
        });

        const matchedQA = findSimilarQuestion(input);
        if (matchedQA) {
            setTimeout(() => {
                const aiMessage = {
                    id: Date.now(),
                    role: 'ai',
                    content: matchedQA.a,
                    time: this.formatTime(new Date())
                };
                this.setData({
                    messages: [...this.data.messages, aiMessage],
                    scrollToView: 'msg-' + aiMessage.id
                });
            }, 500);
        } else {
            const loadingMessage = {
                id: Date.now(),
                role: 'ai',
                content: 'loading',
                time: this.formatTime(new Date())
            };
            this.setData({
                messages: [...this.data.messages, loadingMessage],
                scrollToView: 'msg-' + loadingMessage.id,
                isTyping: true
            });
            this.callDeepSeekAPI(input);
        }
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
                    url: config.baseURL + '/chat/completions',
                    method: 'POST',
                    header: config.headers,
                    data: {
                        model: config.model,
                        messages: [
                            {
                                "role": "system",
                                "content": "You are a smart campus assistant for Hebei Normal University of Science and Technology. When users ask for directions or how to get somewhere, tell them to check the in-app map for accurate routes and navigation. When users ask about school-related information, guide them to the campus guide section. Always respond clearly and helpfully in simplified Chinese unless requested otherwise."
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

            if (!response) {
                throw new Error('API响应为空')
            }

            if (response.statusCode !== 200) {
                throw new Error(`API响应异常: 状态码 ${response.statusCode}, 响应数据: ${JSON.stringify(response.data)}`)
            }

            if (!response.data) {
                throw new Error('API响应数据为空')
            }

            if (!response.data.choices || !response.data.choices[0]?.message?.content) {
                throw new Error('API响应格式错误: ' + JSON.stringify(response.data))
            }

            const messages = this.data.messages.filter(msg => msg.content !== 'loading')
            
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
            
            const messages = this.data.messages.filter(msg => msg.content !== 'loading')
            
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
    },

    onLongPress: function(e) {
        const content = e.currentTarget.dataset.content
        wx.setClipboardData({
            data: content,
            success: function() {
                wx.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success',
                    duration: 1500
                })
            }
        })
    },

    onTowxmlError: function(e) {
        console.error('towxml 解析错误:', e.detail)
    }
})
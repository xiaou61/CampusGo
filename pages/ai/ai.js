/**
 * @author https://github.com/xiaou61
 * 相关技术文：
 */
const app = getApp()
const config = require('../../utils/config')
const { qaData, findSimilarQuestion } = require('../../pages/ai/qa_data.js');

// 每日最大提问次数
const MAX_DAILY_QUESTIONS = 50;

Page({
    data: {
        messages: [],
        inputValue: '',
        scrollToView: '',
        userAvatar: '/images/user-avatar.png',
        aiAvatar: '/images/ai-avatar.png',
        isTyping: false,
        suggestedQuestions: [],
        remainingQuestions: MAX_DAILY_QUESTIONS
    },

    onLoad(options) {
        this.initChatHistory()
        this.updateSuggestedQuestions()
        this.checkDailyLimit()
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

    // 检查每日限制
    checkDailyLimit: function() {
        const today = new Date().toDateString()
        const dailyData = wx.getStorageSync('ai_daily_data')
        
        if (dailyData && dailyData.date === today) {
            this.setData({
                remainingQuestions: MAX_DAILY_QUESTIONS - dailyData.count
            })
        } else {
            // 新的一天，重置计数
            wx.setStorageSync('ai_daily_data', {
                date: today,
                count: 0
            })
            this.setData({
                remainingQuestions: MAX_DAILY_QUESTIONS
            })
        }
    },

    // 更新提问计数
    updateQuestionCount: function() {
        const dailyData = wx.getStorageSync('ai_daily_data')
        const today = new Date().toDateString()
        
        if (dailyData && dailyData.date === today) {
            dailyData.count += 1
            wx.setStorageSync('ai_daily_data', dailyData)
            this.setData({
                remainingQuestions: MAX_DAILY_QUESTIONS - dailyData.count
            })
        } else {
            // 新的一天，重置计数
            wx.setStorageSync('ai_daily_data', {
                date: today,
                count: 1
            })
            this.setData({
                remainingQuestions: MAX_DAILY_QUESTIONS - 1
            })
        }
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
            // 本地问答不消耗次数
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
            // 检查剩余次数
            if (this.data.remainingQuestions <= 0) {
                wx.showToast({
                    title: '今日AI提问次数已用完，请明天再来',
                    icon: 'none',
                    duration: 2000
                })
                return;
            }

            // 更新提问计数
            this.updateQuestionCount();

            // 添加加载状态
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
                                "content": "You are a smart campus assistant for Hebei Normal University of Science and Technology. When users ask for directions or how to get somewhere, tell them to check the in-app map for accurate routes and navigation. When users ask about school-related information, guide them to the campus guide section. Always respond clearly and helpfully in simplified Chinese unless requested otherwise. When using lists, make sure to format them properly with numbers or bullet points on the same line as the content."
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
                content: response.data.choices[0].message.content
                  // 修复“1.”后有两个空格 + 换行的问题
                  .replace(/(\d\.)\s{2,}\n/g, '$1 ')
                  
                  // 修复编号前多余换行或空格（如 “\n   2.” → “\n2.”）
                  .replace(/\n\s*(\d+\.)\s+/g, '\n$1 ')
              
                  // 修复无序列表格式（让 - 后统一缩进）
                  .replace(/\n\s*-\s+/g, '\n  - ')
              
                  // 修复任务列表显示（可选）
                  .replace(/\[ \]/g, '☐')
                  .replace(/\[x\]/gi, '✅'),
              
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
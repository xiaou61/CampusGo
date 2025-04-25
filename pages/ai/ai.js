/**
 * @author https://github.com/xiaou61
 * AI聊天页面
 * 主要功能：
 * 1. 实现与AI助手的对话功能
 * 2. 处理消息的发送和接收
 * 3. 格式化消息内容（包括有序列表、无序列表等）
 * 4. 管理聊天历史记录
 * 5. 处理每日提问限制
 * 请勿修改下面的任何一句核心代码包括样式！！！！ 修改之前要备份
 */

const app = getApp()
const config = require('../../utils/config')
const { qaData, findSimilarQuestion } = require('../../pages/ai/qa_data.js');

// 每日最大提问次数限制
const MAX_DAILY_QUESTIONS = 50;

Page({
    data: {
        messages: [], // 存储聊天消息
        inputValue: '', // 输入框内容
        scrollToView: '', // 自动滚动到指定消息
        userAvatar: '/images/user-avatar.png', // 用户头像
        aiAvatar: '/images/ai-avatar.png', // AI头像
        isTyping: false, // AI是否正在输入
        suggestedQuestions: [], // 建议问题列表
        remainingQuestions: MAX_DAILY_QUESTIONS // 剩余提问次数
    },

    // 页面加载时初始化
    onLoad(options) {
        this.initChatHistory() // 初始化聊天历史
        this.updateSuggestedQuestions() // 更新建议问题
        this.checkDailyLimit() // 检查每日限制
    },

    // 初始化聊天历史
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

    // 输入框内容变化时触发
    onInput: function(e) {
        this.setData({
            inputValue: e.detail.value
        })
        this.updateSuggestedQuestions() // 更新建议问题
    },

    // 更新建议问题列表
    updateSuggestedQuestions: function() {
        const input = this.data.inputValue.toLowerCase();
        const suggestions = [];
        
        if (!input) {
            // 如果输入框为空，显示所有建议问题
            suggestions.push(...qaData.map(item => item.q));
        } else {
            // 根据输入内容过滤建议问题
            qaData.forEach(item => {
                if (item.q.toLowerCase().includes(input)) {
                    suggestions.push(item.q);
                }
            });
        }
        
        this.setData({
            suggestedQuestions: suggestions.slice(0, 5) // 最多显示5个建议
        });
    },

    // 点击建议问题时触发
    onSuggestedQuestionTap: function(e) {
        const question = e.currentTarget.dataset.question;
        this.setData({
            inputValue: question
        });
        this.sendMessage(); // 发送消息
    },

    // 检查每日提问限制
    checkDailyLimit: function() {
        const today = new Date().toDateString()
        const dailyData = wx.getStorageSync('ai_daily_data')
        
        if (dailyData && dailyData.date === today) {
            // 如果是同一天，更新剩余次数
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

    // 发送消息
    sendMessage: function() {
        const input = this.data.inputValue.trim();
        if (!input) return;

        // 创建用户消息
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

        // 检查本地问答库
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

    // 调用DeepSeek API
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
                                "content": "You are a smart campus assistant for Hebei Normal University of Science and Technology. When users ask for directions or how to get somewhere, tell them to check the in-app map for accurate routes and navigation. When users ask about school-related information, guide them to the campus guide section. Always respond clearly and helpfully in simplified Chinese unless requested otherwise. When using lists, make sure to format them properly with numbers or bullet points on the same line as the content. When answering with multiple points, use capitalized Chinese numerals like “一、二、三” to organize your response. Do not use Arabic numerals like 1, 2, 3 in lists."
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
            
           // 创建AI回复消息，并进行格式处理
           const aiMessage = {
            id: Date.now(),
            role: 'ai',
            content: response.data.choices[0].message.content
              // 修复“1.”后两个空格+换行的错误情况（仅处理错误，不破坏正常格式）
              .replace(/(\d\.)\s{2,}\n/g, '$1 ')
          
              // 保留编号结构但去掉多余的空格（不影响“1. **目标**”这种格式）
              .replace(/\n {2,}(\d+\.)/g, '\n$1')
          
              // 保留正确缩进的无序列表（但去掉开头多余空格）
              .replace(/\n\s*-\s+/g, '\n  - ')
          
              // 转换任务列表样式（可选美化）
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

    // 格式化时间
    formatTime: function(date) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    },

    // 显示错误信息
    showError: function(message) {
        wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
        })
    },

    // 长按消息复制内容
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

    // 处理towxml解析错误
    onTowxmlError: function(e) {
        console.error('towxml 解析错误:', e.detail)
    }
})
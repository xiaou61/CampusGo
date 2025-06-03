// pages/ai/ai.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        messages: [], // 消息列表
        inputMessage: '', // 输入框内容
        scrollToMessage: '', // 滚动到指定消息
        aiAvatar: '/images/ai-avatar.png', // AI头像
        userAvatar: '/images/user-avatar.png', // 用户头像
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化欢迎消息
        this.addMessage({
            type: 'ai',
            content: '你好！我是你的AI助手，有什么我可以帮你的吗？',
            time: this.formatTime(new Date())
        });
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

    // 输入框内容变化
    onInputChange: function(e) {
        this.setData({
            inputMessage: e.detail.value
        });
    },

    // 发送消息
    sendMessage: function() {
        const message = this.data.inputMessage.trim();
        if (!message) return;

        // 添加用户消息
        this.addMessage({
            type: 'user',
            content: message,
            time: this.formatTime(new Date())
        });

        // 清空输入框
        this.setData({
            inputMessage: ''
        });

        // 模拟AI回复
        this.simulateAIResponse(message);
    },

    // 清空输入框
    clearInput: function() {
        this.setData({
            inputMessage: ''
        });
    },

    // 添加消息到列表
    addMessage: function(message) {
        const messages = this.data.messages;
        message.id = messages.length;
        messages.push(message);
        
        this.setData({
            messages: messages,
            scrollToMessage: `msg-${message.id}`
        });
    },

    // 模拟AI回复
    simulateAIResponse: function(userMessage) {
        // 这里可以替换为实际的AI接口调用
        setTimeout(() => {
            this.addMessage({
                type: 'ai',
                content: '我收到了你的消息：' + userMessage + '\n\n这是一个模拟的回复，你可以在这里接入实际的AI接口。',
                time: this.formatTime(new Date())
            });
        }, 1000);
    },

    // 加载更多消息
    loadMoreMessages: function() {
        // 实现加载历史消息的逻辑
        console.log('加载更多消息');
    },

    // 格式化时间
    formatTime: function(date) {
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
})
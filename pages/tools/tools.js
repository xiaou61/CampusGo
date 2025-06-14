Page({
    data: {
        tools: [
            {
                id: 'ai-chat',
                name: 'AI对话',
                icon: '/assets/icons/ai-chat.png',
                path: '/pages/tools/ai-chat/ai-chat'
            },
            {
                id: 'ai-memory',
                name: 'AI记忆对话',
                icon: '/assets/icons/ai-memory.png',
                path: '/pages/tools/ai-memory/ai-memory'
            }
        ]
    },

    onToolTap(e) {
        const toolId = e.currentTarget.dataset.tool
        const tool = this.data.tools.find(t => t.id === toolId)
        if (tool) {
            wx.navigateTo({
                url: tool.path
            })
        }
    }
}) 
Component({
  properties: {
    content: {
      type: String,
      value: '',
      observer: function(newVal) {
        console.log('收到新内容:', newVal)
        if (newVal) {
          this.parseMarkdown(newVal)
        }
      }
    }
  },
  data: {
    nodes: []
  },
  methods: {
    parseMarkdown: function(content) {
      console.log('开始解析Markdown:', content)
      const lines = content.split('\n')
      const nodes = []
      let currentCodeBlock = null
      let currentParagraph = []
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // 处理代码块
        if (line.trim().startsWith('```')) {
          if (currentCodeBlock === null) {
            // 开始新的代码块
            currentCodeBlock = {
              type: 'code',
              language: line.trim().substring(3).trim() || 'text',
              content: []
            }
          } else {
            // 结束代码块
            nodes.push({
              type: 'code',
              text: currentCodeBlock.content.join('\n'),
              language: currentCodeBlock.language
            })
            currentCodeBlock = null
          }
          continue
        }
        
        if (currentCodeBlock !== null) {
          // 在代码块中，保留原始格式
          currentCodeBlock.content.push(line)
          continue
        }
        
        // 处理空行
        if (line.trim() === '') {
          if (currentParagraph.length > 0) {
            nodes.push({
              type: 'p',
              text: this.parseInlineMarkdown(currentParagraph.join('\n'))
            })
            currentParagraph = []
          }
          continue
        }
        
        if (line.startsWith('#')) {
          // 处理标题
          if (currentParagraph.length > 0) {
            nodes.push({
              type: 'p',
              text: this.parseInlineMarkdown(currentParagraph.join('\n'))
            })
            currentParagraph = []
          }
          const level = line.match(/^#+/)[0].length
          const text = this.parseInlineMarkdown(line.replace(/^#+\s*/, ''))
          nodes.push({
            type: `h${level}`,
            text: text
          })
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // 处理无序列表
          if (currentParagraph.length > 0) {
            nodes.push({
              type: 'p',
              text: this.parseInlineMarkdown(currentParagraph.join('\n'))
            })
            currentParagraph = []
          }
          const items = []
          while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
            const itemText = this.parseInlineMarkdown(lines[i].substring(2))
            items.push({
              text: itemText
            })
            i++
          }
          i--
          nodes.push({
            type: 'ul',
            nodes: items
          })
        } else if (/^\d+\.\s/.test(line)) {
          // 处理有序列表
          if (currentParagraph.length > 0) {
            nodes.push({
              type: 'p',
              text: this.parseInlineMarkdown(currentParagraph.join('\n'))
            })
            currentParagraph = []
          }
          const items = []
          while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
            const itemText = this.parseInlineMarkdown(lines[i].replace(/^\d+\.\s/, ''))
            items.push({
              text: itemText
            })
            i++
          }
          i--
          nodes.push({
            type: 'ol',
            nodes: items
          })
        } else {
          // 收集段落内容
          currentParagraph.push(line)
        }
      }
      
      // 处理最后一个段落
      if (currentParagraph.length > 0) {
        nodes.push({
          type: 'p',
          text: this.parseInlineMarkdown(currentParagraph.join('\n'))
        })
      }
      
      // 处理未闭合的代码块
      if (currentCodeBlock !== null) {
        nodes.push({
          type: 'code',
          text: currentCodeBlock.content.join('\n'),
          language: currentCodeBlock.language
        })
      }
      
      console.log('解析结果:', nodes)
      this.setData({ nodes })
    },

    parseInlineMarkdown: function(text) {
      // 将文本转换为 rich-text 支持的格式
      let currentText = text
      
      // 处理粗体
      currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        return `<strong>${content}</strong>`
      })
      
      // 处理斜体
      currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
        return `<em>${content}</em>`
      })
      
      // 处理删除线
      currentText = currentText.replace(/~~(.*?)~~/g, (match, content) => {
        return `<del>${content}</del>`
      })
      
      // 处理行内代码
      currentText = currentText.replace(/`(.*?)`/g, (match, content) => {
        return `<code>${content}</code>`
      })
      
      // 处理链接
      currentText = currentText.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, href) => {
        return `<a href="${href}">${text}</a>`
      })
      
      return currentText
    }
  }
}) 
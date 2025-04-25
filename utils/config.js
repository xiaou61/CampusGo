// utils/config.js
const config = {
  // API配置 注意！！！此apikey切勿上传到任何开源社区！切勿暴漏！！
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-459fe7b76fe348de9b69df7219452c24',
  model: "deepseek-chat",
  // 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-459fe7b76fe348de9b69df7219452c24'
  }
}

module.exports = config 
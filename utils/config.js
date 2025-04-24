// utils/config.js
const config = {
  // API配置 注意！！！此apikey切勿上传到任何开源社区！切勿暴漏！！
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-4ecd546690124085b63316161bb6de39',
  model: "deepseek-chat",
  // 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-4ecd546690124085b63316161bb6de39'
  }
}

module.exports = config 
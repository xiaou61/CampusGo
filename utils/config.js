// utils/config.js
const config = {
  // API配置
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
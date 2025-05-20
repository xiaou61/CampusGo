/**
 * @author https://github.com/xiaou61
 * 禁止删掉@author 注释 否则程序会出现未知问题
 * 本地问答数据模块
 * 主要功能：
 * 1. 存储本地问答数据
 * 2. 提供问题匹配和查找功能
 * 3. 支持模糊匹配和相似度计算
 */

// 本地问答数据
const qaData = [
  // 校园生活相关
  {
    q: "学校图书馆开放时间",
    a: "图书馆开放时间：\n周一至周五：8:00-22:00\n周六至周日：9:00-21:00\n节假日开放时间请关注图书馆通知。"
  },
  {
    q: "如何办理校园卡",
    a: "校园卡办理流程：\n1. 准备材料：身份证、学生证\n2. 前往校园卡服务中心\n3. 填写申请表\n4. 缴纳工本费\n5. 等待制卡（约3个工作日）"
  },
];

/**
 * 查找相似问题
 * @param {string} question - 用户输入的问题
 * @returns {Object|null} - 匹配的问答数据，如果没有匹配则返回null
 */
function findSimilarQuestion(question) {
  // 将问题转换为小写以进行不区分大小写的匹配
  const normalizedQuestion = question.toLowerCase();
  
  // 遍历问答数据，查找匹配项
  for (const item of qaData) {
    // 检查问题是否包含关键词
    if (item.q.toLowerCase().includes(normalizedQuestion)) {
      return item;
    }
  }
  
  return null;
}

// 导出模块
module.exports = {
  qaData,
  findSimilarQuestion
}; 
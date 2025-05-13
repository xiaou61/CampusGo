/**
 * @author https://github.com/peng1031
 * 禁止删掉@author 注释 否则程序会出现未知问题
 * 开发人员名单
 * 主要功能：
 * 1. 存储开发人员名单
 * 2. 提供thanks页面数据支持
 */

const teamData = {
  // 项目介绍
  teamIntro: "本项目由河北科技师范学院数学与信息科技学院学生团队开发，旨在为师生提供便捷的校园服务。团队成员来自不同专业，各司其职，共同打造了这个充满活力的校园服务平台。",
  
  // 核心团队信息
  coreTeam: [
    {
      id: 'leader',
      title: "项目负责人",
      members: ["张三", "李四"]
    },
    {
      id: 'developers',
      title: "核心开发人员",
      members: ["王五", "赵六"]
    },
    {
      id: 'painters',
      title: "绘画组",
      members: ["周八", "张三", "李四"]
    },
    {
      id: 'devTeam',
      title: "开发组",
      members: ["刘一", "刘二", "刘三"]
    }
  ],

  // 特别鸣谢
  specialThanks: [
    {
      id: 'school',
      icon: "school",
      text: "河北科技师范学院信息工程学院"
    },
    {
      id: 'teachers',
      icon: "teacher",
      text: "指导老师：张教授 李教授"
    },
    {
      id: 'support',
      icon: "support",
      text: "技术支持：腾讯云 微信小程序团队"
    },
    {
      id: 'users',
      icon: "users",
      text: "参与测试的师生用户"
    }
  ]
};

module.exports = {
  teamData: teamData
};


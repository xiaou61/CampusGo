/**
 * @author 任众、李子凡
 * @date 2025-05-14
 * @file data/schoolGuide.js
 * @description 学校指南数据
 */

const { request } = require('../utils/request')

// 获取校园指南数据
export const getSchoolGuide = (pageNum = 1, pageSize = 10) => {
  return new Promise((resolve, reject) => {
    request({
      url: 'campus/guide/list',
      method: 'POST',
      data: {
        pageNum,
        pageSize,
        fetchAll: false,
        sortField: 'create_time',
        desc: true
      }
    }).then(res => {
      if (res.code === 200) {
        resolve(res.data)
      } else {
        reject(res.msg || '获取校园指南数据失败')
      }
    }).catch(err => {
      reject(err)
    })
  })
}

export const school_guide = [
   
]
  

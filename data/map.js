/**
 * @file data/map.js
 * @author 任众、李子凡
 * @date 2025-05-14
 * @description 地图相关参数，如需修改请修改./siteData.js
 */

// 地图相关
import { site_data } from './siteData'

module.exports = {
    // 地图部分参数
  
    // 腾讯位置服务API
    mapKey: "LHTBZ-NDYEC-7FT2G-AYLRU-KLHY6-SCF7R",
  
    // 学校精确坐标（用于地图定位和获取天气数据）
    longitude: 119.548667,
    latitude: 39.912336,
  
    // 是否展示 POI 点
    enablepoi: true,
    // 是否显示带有方向的当前定位点
    showLocation: true,
    // 缩放级别
    scale: 15.81,
    // 最小缩放级别，比缩放级别小0.3-0.4为宜
    minscale: 15.51,
  
    // 自定义图层  
    groundoverlay: {
      // 图层透明度 0-1，对应 0%-100%
      opacity: 1,
      //西南角（手绘地图图片的左下角基准）
      southwest_latitude: 39.908041,    
      southwest_longitude: 119.544301,    
      //东北角（手绘地图图片的右上角基准）
      northeast_latitude: 39.915039,    
      northeast_longitude: 119.551533,   
    },
  
    // 地图边界
    boundary: {
      //西南角
      southwest_latitude: 39.906968,
      southwest_longitude: 119.543406,
      //东北角
      northeast_latitude: 39.917704,
      northeast_longitude: 119.553928,
    },
  
    // 学校边界
    school_boundary: {
      // 东（学校最东端点的 经度）
      east: 119.553928,
      // 西（学校最西端点的 经度）
      west: 119.543406,
      // 南（学校最南端点的 纬度）
      south: 39.906968,
      // 北（学校最北端点的 纬度）
      north: 39.917704,
    },
  
    // 闭合多边形
    points: [{"latitude":"39.908180","longitude":"119.548027"},{"latitude":"39.912063","longitude":"119.544078"},{"latitude":"39.914723","longitude":"119.546760"},{"latitude":"39.914650","longitude":"119.547789"},{"latitude":"39.915003","longitude":"119.548815"},{"latitude":"39.914896","longitude":"119.549628"},{"latitude":"39.914180","longitude":"119.550873"},{"latitude":"39.912940","longitude":"119.549368"},{"latitude":"39.912176","longitude":"119.549442"},{"latitude":"39.912468","longitude":"119.550601"},{"latitude":"39.911645","longitude":"119.551320"},{"latitude":"39.911135","longitude":"119.551070"},{"latitude":"39.910516","longitude":"119.551623"}],
  
  
    // 地点数据（如需修改请修改./siteDate.js）
    site_data
  }
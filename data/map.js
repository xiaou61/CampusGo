/* data/map.js */
// 地图相关
module.exports = {
  // 地图部分参数

  // 腾讯位置服务API
  mapKey: "ZQWBZ-NQBLV-W7CPF-U7QIR-5HBNQ-AOFUE",

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
    opacity: 0,
    //西南角
    southwest_latitude: 39.906968,
    southwest_longitude: 119.543406,
    //东北角
    northeast_latitude: 39.917704,
    northeast_longitude: 119.553928,
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
  //todo 这个待修改
  school_boundary: {
    // 东（学校最东端点的 经度）
    east: 110.280699,
    // 西（学校最西端点的 经度）
    west: 110.2733,
    // 南（学校最南端点的 纬度）
    south: 25.089701,
    // 北（学校最北端点的 纬度）
    north: 25.09839,
  },

  // 闭合多边形
  points: [{"latitude":"39.908180","longitude":"119.548027"},{"latitude":"39.912063","longitude":"119.544078"},{"latitude":"39.914723","longitude":"119.546760"},{"latitude":"39.914650","longitude":"119.547789"},{"latitude":"39.915003","longitude":"119.548815"},{"latitude":"39.914896","longitude":"119.549628"},{"latitude":"39.914180","longitude":"119.550873"},{"latitude":"39.912940","longitude":"119.549368"},{"latitude":"39.912176","longitude":"119.549442"},{"latitude":"39.912468","longitude":"119.550601"},{"latitude":"39.911645","longitude":"119.551320"},{"latitude":"39.911135","longitude":"119.551070"},{"latitude":"39.910516","longitude":"119.551623"}],

  // 默认地点
  default_point: {
    name: "东南一门",
    aliases: "学校正大门",
    img: "https://cdnjson.com/images/2023/02/26/schoolgate_dongmen.jpg",
    desc: "学校正大门\n可以通行行人和车辆",
    latitude: 39.908927,
    longitude: 119.54864
  },

  // 地点数据（使用嵌套列表存储）
  //todo 这个是核心定位数据
  site_data: [{
      id: 1,
      name: "图书馆",
      list: [{
          id: 1,
          name: "图书馆",
          aliases: "学校图书馆",
          img: "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
          desc: "全校最大的图书馆",
          latitude: 39.910054,
          longitude: 119.548771
        },
        {
            id: 2,
            name: "易学超市",
            aliases: "易学超市",
            img: "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
            images: [
              "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
              "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
              "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
            ],
            desc: "全校最大的超市",
            latitude: 39.910833,
            longitude: 119.548387
          },
      ]
    },
    {
        id: 2,
        name: "图书馆2",
        list: [{
            id: 1,
            name: "图书馆",
            aliases: "学校图书馆",
            img: "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
            desc: "全校最大的图书馆",
            latitude: 39.910054,
            longitude: 119.548771
          },
          {
              id: 2,
              name: "易学超市",
              aliases: "易学超市",
              img: "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
              images: [
                "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
                "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
                "https://cdnjson.com/images/2023/02/26/building_zhishan.jpg",
              ],
              desc: "全校最大的超市",
              latitude: 39.910833,
              longitude: 119.548387
            },
        ]
      },
  ]
}
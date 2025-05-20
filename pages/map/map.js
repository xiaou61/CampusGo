/**
 * 校园地图页面
 * 主要功能：
 * 1. 显示校园地图
 * 2. 支持地点搜索和导航
 * 3. 显示地点详情和路线规划
 * 4. 处理地图交互事件
 */

// pages/map/map.js
var map = require('../../data/map')
var media = require('../../data/media')
const app = getApp()
const config = require('../../utils/config')
const { GetInitUtils } = require('../../libs/getinitUtils')

// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min')

// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: map.mapKey // 必填
});

Page({
    data: {
        scrollLeft: 0,
        category: 1,
        site: 0,

        // 图片
        location: media.location,
        use: media.use,
        restore: media.restore,
        exchange: media.exchange,
        map_bottom: media.map_bottom,

        // 自定义图层、地图、学校 边界
        groundoverlay: map.groundoverlay,
        boundary: map.boundary,
        school_boundary: map.school_boundary,

        // 默认地点
        default_point: map.default_point,

        // 地点数据
        site_data: map.site_data,

        // 地图相关属性
        latitude: map.latitude,
        longitude: map.longitude,
        scale: map.scale,
        minscale: map.minscale,
        showLocation: map.showLocation,
        enablepoi: map.enablepoi,
        markers: [],
        polyline: [],
        // 闭合多边形
        polygons: [{
          points: map.points??[],
          fillColor: "#d5dff233",
          strokeColor: "#789cff",
          strokeWidth: 2,
          zIndex: 1
        }],

        duration: 0,
        distance: 0,
        steps: [],

        card: "",

        // 起点、终点的坐标和名称
        start: {
            name: "",
            latitude: "",
            longitude: "",
        },
        end: {
            name: "",
            latitude: "",
            longitude: "",
        },

        // dialog会话框属性
        dialogShow_site: false,
        dialogShow_category: false,
        dialogShow_road: false,
        buttons: [{
            text: '路线'
        }],
        button: [{
            text: '关闭'
        }],

        static: {
            currentTarget: {
                id: 0,
            }
        },

        // 搜索相关数据
        searchValue: '', // 搜索框内容
        searchResult: [], // 搜索结果
        showSearchResult: false, // 是否显示搜索结果
        
        // 导航相关数据
        startPoint: null, // 起点
        endPoint: null, // 终点
        showRoute: false, // 是否显示路线
        routeDistance: 0, // 路线距离
        routeTime: 0, // 预计时间
        
        // 地点详情
        selectedMarker: null, // 选中的标记点
        showDetail: false, // 是否显示详情
    },

    onLoad(options) {
        GetInitUtils(); // 添加作者信息调用
        this.map()
        this.location()
        // 添加错误处理
        wx.onError(function(error) {
            console.log('捕获到错误：', error);
        });
    },

    // 添加错误处理函数
    onError: function(error) {
        console.log('页面错误：', error);
    },

    // 添加未处理的Promise错误处理
    onUnhandledRejection: function(res) {
        console.log('未处理的Promise错误：', res.reason);
    },

    // 初始化地图
    map() {
        GetInitUtils(); 
        var that = this
        this.mapCtx = wx.createMapContext('map') 
        this.mapCtx.addGroundOverlay({

            id: 0,
            src: that.data.map_bottom,
            bounds: {
                southwest: {
                    latitude: that.data.groundoverlay.southwest_latitude,
                    longitude: that.data.groundoverlay.southwest_longitude
                },
                northeast: {
                    latitude: that.data.groundoverlay.northeast_latitude,
                    longitude: that.data.groundoverlay.northeast_longitude
                }
            },
            opacity: that.data.groundoverlay.opacity,
            success(res) {
                console.log("添加自定义图层成功", res)
            },
            fail(err) {
                console.log("添加自定义图层失败", err)
            },
            complete(res) {
                console.log("添加自定义图层完成", res)
            }
        })
        this.mapCtx.setBoundary({
            southwest: {
                latitude: this.data.boundary.southwest_latitude,
                longitude: this.data.boundary.southwest_longitude,
            },
            northeast: {
                latitude: this.data.boundary.northeast_latitude,
                longitude: this.data.boundary.northeast_longitude,
            }
        })
        this.mapCtx.initMarkerCluster({
            enableDefaultStyle: true,
            zoomOnClick: false,
            gridSize: 30,
            complete(res) {
                console.log('initMarkerCluster', res)
            }
        })
    },

    // 定位
    location() {
        GetInitUtils(); // 添加作者信息调用
        var that = this
        var school_boundary = this.data.school_boundary
        var default_point = that.data.default_point
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var nowlatitude = res.latitude
                var nowlongitude = res.longitude
                console.log("当前位置坐标", nowlatitude, nowlongitude)
                
                    // 在学校边界内，使用当前位置
                    that.setData({
                        mylocationmarker: {
                            id: 0,
                            latitude: nowlatitude,
                            longitude: nowlongitude,
                            width: 25,
                            height: 37,
                            joinCluster: true,
                        }
                    })
                that.changeCategory(that.data.static)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        const get_start = wx.getStorageSync('start')
        if (get_start) {
            this.setData({
                end: get_start
            })
            wx.removeStorageSync('start')
        }

        // 获取搜索页返回的分类信息
        const searchCategory = wx.getStorageSync('searchCategory')
        if (searchCategory) {
            // 找到对应的分类索引
            const categoryIndex = this.data.site_data.findIndex(item => item.id === searchCategory)
            if (categoryIndex !== -1) {
                // 更新分类
                this.setData({
                    category: categoryIndex,
                    scrollLeft: categoryIndex * 75 // 75是每个分类标签的宽度
                })
                // 更新标记点
                this.changeCategory({
                    currentTarget: {
                        id: categoryIndex
                    }
                })
            }
            wx.removeStorageSync('searchCategory')
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    /**
     * 用户点击右上角分享到朋友圈
     */
    onShareTimeline() {

    },

    // 列表项点击事件
    listItemTap(e) {
        const index = e.currentTarget.dataset.index;
        const site = this.data.site_data[this.data.category].list[index];
        
        // 关闭分类列表弹窗
        this.setData({
            dialogShow_category: false,
            dialogShow_site: true,
            card: site
        });

        // 移动地图到选中位置
        this.mapCtx.moveToLocation({
            latitude: site.latitude,
            longitude: site.longitude,
            scale: 18
        });
    },

    // 点击地图标记点时触发事件
    markertap(e) {
        if(this.data.polyline.length == 0) {
            if (e.markerId == 0) {
                var site = this.data.default_point
            } else {
                var site = this.data.site_data[this.data.category].list[e.markerId - 1]
            }
            this.setData({
                dialogShow_site: true,
                card: site,
            })
        }
    },

    // 底部按钮（路线详情和类别地点）
    clickButton() {
        if (this.data.polyline.length == 0) {
            this.setData({
                dialogShow_category: true
            })
        } else {
            this.setData({
                dialogShow_road: true
            })
        }
    },

    // mpdialog "关闭" 按钮点击事件
    mapmarker_close() {
        this.setData({
            dialogShow_category: false,
            dialogShow_road: false,
        })
    },

    // 预览图片
    lookPhoto(e) {
        console.log("点击了图片", e.target.dataset.src)
        var url = e.target.dataset.src
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: [url] // 需要预览的图片http链接列表
        })
    },

    // mpdialog "设为起点"和"设为终点" 按钮点击事件
    mapmarker_choose(e) {
        this.setData({
            dialogShow_site: false,
        })
        var card = {
            name: this.data.card.name,
            latitude: this.data.card.latitude,
            longitude: this.data.card.longitude,
        }
        console.log("选择地点", card)
        // 直接设置为终点并规划路线
        this.setData({
            end: card,
        }, () => {
            // 调用路线规划方法
            this.formSubmit()
        })
    },

    // 切换类别
    changeCategory(e) {
        GetInitUtils(); // 添加作者信息调用
        console.log("类别", e.currentTarget.id)
        var category = e.currentTarget.id
        let scrollLeft = (category - 1) * 60
        this.setData({
            scrollLeft: scrollLeft,
            category: e.currentTarget.id,
            polyline: []
        })

        let site_list = this.data.site_data[this.data.category].list
        console.log("当前类别", site_list)
        let markers = []
        for (let i = 0; i < site_list.length; i++) {
            let la = site_list[i].latitude
            let lo = site_list[i].longitude
            let name = site_list[i].name
            let m = {
                id: i + 1,
                latitude: la,
                longitude: lo,
                iconPath: "https://gampusgo-1321866016.cos.ap-beijing.myqcloud.com/school/iconPath.png",
                width: 30,
                height: 30,
                callout: {
                    content: " " + name + " ",
                    display: 'ALWAYS',
                    padding: 5,
                    borderRadius: 10
                },
                joinCluster: true,
            }
            markers.push(m)
        }
        console.log("当前marker点", markers)
        this.setData({
            markers: markers
        })

        var mapCtx = wx.createMapContext("map");
        mapCtx.includePoints({
            padding: [60, 20, 40, 40],
            points: markers
        })
    },

    // 缩放视野以包含所有给定的坐标点
    includePoints() {
        var points = Array.from(this.data.polyline[0].points)
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.includePoints({
            padding: [100, 60, 60, 60],
            points: points,
        })
    },

    // "还原" 按钮
    restore() {
        let e = {
            currentTarget: {
                id: this.data.category
            }
        }
        this.changeCategory(e)
    },

    // 跳转至搜索页
    tosearch(e) {
        wx.navigateTo({
            url: '../map/search/search?id=' + e.currentTarget.dataset.search_id,
        })
    },

    // 跳转至使用说明页
    toinstruction() {
        wx.navigateTo({
            url: '../../pages/map/instruction/instruction',
        })
    },

    //todo 目前已修改完成 路线的逻辑
    formSubmit() {
        const end = this.data.end; // ✅ 从 data 中取出终点数据
        if (!end || !end.latitude || !end.longitude) {
            wx.showToast({
                title: '请先选择终点',
                icon: 'none'
            });
            return;
        }
    
        wx.openLocation({
            latitude: end.latitude,
            longitude: end.longitude,
            name: end.name,
            address: end.address || end.name,
            scale: 18
        });
    },
    
    // 轨迹回放    
    moveAlong() {
        var that = this
        var markers = this.data.markers
        var points = this.data.polyline[0].points
        this.mapCtx = wx.createMapContext('map')
        this.mapCtx.moveAlong({
            markerId: 2,
            path: points,
            duration: 4000,
            autoRotate: true,
            success: function (res) {
                markers.pop()
                that.setData({
                    markers: markers
                })
            }
        })
    },

    // 搜索地点
    searchLocation: function(e) {
        GetInitUtils(); // 添加作者信息调用
        const keyword = e.detail.value
        if (!keyword) {
            this.setData({
                searchResult: [],
                showSearchResult: false
            })
            return
        }

        // 调用搜索API
        wx.request({
            url: config.baseURL + '/search',
            method: 'GET',
            data: {
                keyword: keyword,
                location: `${this.data.latitude},${this.data.longitude}`
            },
            success: (res) => {
                this.setData({
                    searchResult: res.data.results,
                    showSearchResult: true
                })
            },
            fail: (err) => {
                console.error('搜索失败:', err)
                wx.showToast({
                    title: '搜索失败',
                    icon: 'none'
                })
            }
        })
    },

    // 选择搜索结果
    selectSearchResult: function(e) {
        GetInitUtils(); // 添加作者信息调用
        const item = e.currentTarget.dataset.item
        this.setData({
            selectedMarker: item,
            showDetail: true,
            showSearchResult: false,
            searchValue: item.name
        })
        
        // 移动地图到选中位置
        this.mapCtx.moveToLocation({
            latitude: item.location.lat,
            longitude: item.location.lng
        })
    },

    // 开始导航
    startNavigation: function() {
        if (!this.data.startPoint || !this.data.endPoint) {
            wx.showToast({
                title: '请选择起点和终点',
                icon: 'none'
            })
            return
        }

        // 调用导航API
        wx.request({
            url: config.baseURL + '/route',
            method: 'POST',
            data: {
                origin: `${this.data.startPoint.latitude},${this.data.startPoint.longitude}`,
                destination: `${this.data.endPoint.latitude},${this.data.endPoint.longitude}`
            },
            success: (res) => {
                this.setData({
                    polyline: res.data.polyline,
                    routeDistance: res.data.distance,
                    routeTime: res.data.duration,
                    showRoute: true
                })
            },
            fail: (err) => {
                console.error('获取路线失败:', err)
                wx.showToast({
                    title: '获取路线失败',
                    icon: 'none'
                })
            }
        })
    },

    // 标记点点击事件
    markerTap: function(e) {
        const markerId = e.markerId
        const marker = this.data.markers.find(m => m.id === markerId)
        if (marker) {
            this.setData({
                selectedMarker: marker,
                showDetail: true
            })
        }
    },

    // 地图移动事件
    regionchange: function(e) {
        if (e.type === 'end') {
            // 地图移动结束后更新视野范围内的标记点
            this.updateMarkers()
        }
    },

    // 更新标记点
    updateMarkers: function() {
        GetInitUtils(); // 添加作者信息调用
        // 获取当前视野范围内的地点
        wx.request({
            url: config.baseURL + '/nearby',
            method: 'GET',
            data: {
                location: `${this.data.latitude},${this.data.longitude}`,
                radius: 1000 // 1公里范围内
            },
            success: (res) => {
                this.setData({
                    markers: res.data.results.map(item => ({
                        id: item.id,
                        latitude: item.location.lat,
                        longitude: item.location.lng,
                        title: item.name,
                        iconPath: item.icon,
                        width: 30,
                        height: 30
                    }))
                })
            }
        })
    },

    // 关闭详情
    closeDetail: function() {
        this.setData({
            showDetail: false,
            selectedMarker: null
        })
    },

    // 关闭搜索结果
    closeSearchResult: function() {
        this.setData({
            showSearchResult: false,
            searchResult: []
        })
    }
})
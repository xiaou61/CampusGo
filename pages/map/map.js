// pages/map/map.js
var map = require('../../data/map')
var media = require('../../data/media')
const app = getApp()

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
            text: '设为终点'
        }],
        button: [{
            text: '关闭'
        }],

        static: {
            currentTarget: {
                id: 0,
            }
        }
    },

    onLoad(options) {
        this.map()
        this.location()
    },

    // 初始化地图
    map() {
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
        var that = this
        var school_boundary = this.data.school_boundary
        var default_point = that.data.default_point
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var nowlatitude = res.latitude
                var nowlongitude = res.longitude
                console.log("当前位置坐标", nowlatitude, nowlongitude)
                if (nowlatitude > school_boundary.south && nowlatitude < school_boundary.north && nowlongitude > school_boundary.west && nowlongitude < school_boundary.east) {
                    that.setData({
                        mylocationmarker: {
                            id: 0,
                            latitude: nowlatitude,
                            longitude: nowlongitude,
                            width: 25,
                            height: 37,
                            callout: {
                                content: " 当前位置 ",
                                display: 'ALWAYS',
                                padding: 5,
                                borderRadius: 10
                            },
                            joinCluster: true,
                        },
                        start: {
                            name: "当前位置",
                            latitude: nowlatitude,
                            longitude: nowlongitude,
                        }
                    })
                } else {
                    that.setData({
                        mylocationmarker: {
                            id: 0,
                            latitude: default_point.latitude,
                            longitude: default_point.longitude,
                            width: 25,
                            height: 37,
                            callout: {
                                content: " " + default_point.name + " ",
                                display: 'ALWAYS',
                                padding: 5,
                                borderRadius: 10
                            },
                            joinCluster: true,
                        },
                        start: {
                            name: default_point.name,
                            latitude: default_point.latitude,
                            longitude: default_point.longitude,
                        }
                    })

                    wx.showToast({
                        title: '当前位置不在校区内\n默认位置设为' + that.data.default_point.name,
                        icon: 'none',
                        duration: 2000
                    })
                }
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
        const get_end = wx.getStorageSync('end')
        console.log("get_start", get_start)
        console.log("get_end", get_end)
        if (get_start) {
            var start = {
                name: get_start.name,
                latitude: get_start.latitude,
                longitude: get_start.longitude,
            }
            this.setData({
                start: start
            })
            wx.clearStorageSync()
        }
        if (get_end) {
            var end = {
                name: get_end.name,
                latitude: get_end.latitude,
                longitude: get_end.longitude,
            }
            this.setData({
                end: end
            })
            wx.clearStorageSync()
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
        var choose = e.detail.item.text
        var card = {
            name: this.data.card.name,
            latitude: this.data.card.latitude,
            longitude: this.data.card.longitude,
        }
        console.log("选择地点", card)
        if (choose == "设为起点") {
            this.setData({
                start: card
            })
        } else {
            this.setData({
                end: card,
            })
        }
    },

    // 切换类别
    changeCategory(e) {
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
                iconPath: "https://3gimg.qq.com/lightmap/xcx/demoCenter/images/Marker3_Activated@3x.png",
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
        markers.push(this.data.mylocationmarker)
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
    }
})
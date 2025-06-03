import { request } from '../../utils/request';

Page({
  data: {
    nowWeek: 1,
    nowMonth: new Date().getMonth() + 1,
    todayMonth: new Date().getMonth() + 1,
    todayDay: new Date().getDate(),
    weekDayCount: [0, 1, 2, 3, 4, 5, 6],
    weekIndexText: ['一', '二', '三', '四', '五', '六', '日'],
    weekCalendar: [],
    totalWeek: 20,
    courseList: [],
    filteredCourses: [],
    courseColor: {},
    windowWidth: 375,
    showSwitchWeek: false,
    firstEntry: true,
  },

  onLoad() {
    const windowWidth = wx.getSystemInfoSync().windowWidth;
    this.setData({ windowWidth });
    this.updateWeekCalendar();
    this.fetchData();
  },

  update() {
    this.fetchData();
  },

  selectWeek() {
    this.setData({ 
      showSwitchWeek: true 
    }, () => {
      // 使用 Skyline 动画
      const query = wx.createSelectorQuery();
      query.select('.switch-week__content').fields({
        node: true,
        size: true,
      }).exec((res) => {
        const content = res[0].node;
        if (content) {
          content.animate([
            { transform: 'translateY(100%)' },
            { transform: 'translateY(0)' }
          ], {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          });
        }
      });
    });
  },

  hideSwitchWeek() {
    const query = wx.createSelectorQuery();
    query.select('.switch-week__content').fields({
      node: true,
      size: true,
    }).exec((res) => {
      const content = res[0].node;
      if (content) {
        content.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(100%)' }
        ], {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onFinish(() => {
          this.setData({ showSwitchWeek: false });
        });
      } else {
        this.setData({ showSwitchWeek: false });
      }
    });
  },

  switchWeek(e) {
    const week = e.currentTarget.dataset.week;
    const query = wx.createSelectorQuery();
    query.selectAll('.switch-week__item-box').fields({
      node: true,
      size: true,
    }).exec((res) => {
      const items = res[0].node;
      if (items) {
        items.forEach((item, index) => {
          if (index + 1 === week) {
            item.animate([
              { transform: 'scale(1)' },
              { transform: 'scale(1.1)' },
              { transform: 'scale(1.05)' }
            ], {
              duration: 300,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
          }
        });
      }
    });

    this.setData({
      nowWeek: week,
      showSwitchWeek: false
    }, () => {
      this.filterCoursesByWeek(week);
    });
  },

  swiperSwitchWeek(e) {
    const week = e.detail.current + 1;
    this.setData({ nowWeek: week }, () => {
      this.filterCoursesByWeek(week);
    });
  },

  updateWeekCalendar() {
    const today = new Date();
    const day = today.getDay() || 7;
    const weekCalendar = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - day + i);
      weekCalendar.push(date.getDate());
    }
    this.setData({ weekCalendar });
  },

  fetchData() {
    request({
      url: 'class-schedule/list',
      method: 'GET'
    }).then(res => {
      const colorList = ['#5B8FF9', '#61DDAA', '#F6BD16', '#7262fd', '#78D3F8', '#9661BC', '#F6903D', '#008685', '#F08BB4'];
      const data = res.data || [];
      const courseList = data.map((item, index) => {
        const weeks = this.parseWeeks(item.weekRange);
        return {
          name: item.courseName,
          teacher: item.teacherName,
          address: item.classroom,
          week: item.dayOfWeek,
          section: item.period,
          sectionCount: 1,
          weeks,
        };
      });

      const courseColor = {};
      courseList.forEach((item, index) => {
        if (!courseColor[item.name]) {
          courseColor[item.name] = colorList[index % colorList.length];
        }
      });

      this.setData({ courseList, courseColor }, () => {
        this.filterCoursesByWeek(this.data.nowWeek);
      });
    });
  },

  parseWeeks(weekRange) {
    const result = [];
    if (weekRange.includes(',')) {
      return weekRange.split(',').map(Number);
    } else if (weekRange.includes('-')) {
      const [start, end] = weekRange.split('-').map(Number);
      for (let i = start; i <= end; i++) result.push(i);
      return result;
    } else {
      return [Number(weekRange)];
    }
  },

  filterCoursesByWeek(week) {
    const filtered = this.data.courseList.filter(item => item.weeks.includes(Number(week)));
    this.setData({ filteredCourses: filtered });
  },

  navCourseDetail(e) {
    const index = e.currentTarget.dataset.index;
    console.log('点击课程：', this.data.filteredCourses[index]);
  }
});

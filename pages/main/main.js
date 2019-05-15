var req = require('../../comm/script/fetch')
var config = require('../../comm/script/config')
const util = require('../../util/util.js')
var message = require('../../template/message/message')
import regeneratorRuntime from '../../comm/runtime.js'
import wxpf from '../../comm/wxpf.js'

var appInstance = getApp()

/**
 * 默认的初始数据
 */
Page({
  data: {
    tab_list: [],
    video_list: [],
    hasMore: true,
    showLoading: true,
    start: 1,
    currentTabID:'0'
  },

  onLoad: function (options) {
    var that=this
    //获取标题栏
    req.getTabs(function(code,res){
      if (typeof code == 'number') {
        if (config.REQ_SUCCSS == code) {
          if (null != res.data && null != res.data.data) {
            //添加一个热门分类到最前面
            var tab = { id: "0", title: "热门", sort:'0'}
            res.data.data.lists.unshift(tab)
            that.setData({
              tab_list: res.data.data.lists,
            })
            req.getVideoList(that,that.data.currentTabID, that.data.start,10)
          }
          return
        } else if (config.REQ_FAIL == code) {
          message.show.call(that, {
            content: '暂时没有数据,请重试!',
            icon: 'null',
            duration: 3000
          })
        } else if (config.REQ_NETERROR == code) {
          that.setData({
            showLoading:false
          })
          message.show.call(that, {
            content: '请求网络失败',
            icon: 'offline',
            duration: 3000
          })

        }
      }
    })
    //点击的分享卡片
    if (null != options.video_id){
      console.log("用户点击的分享卡片")
      wx.navigateTo({
        url: '../../pages/player/player?video_tagid=' + options.video_tagid + "&video_id=" + options.video_id,
      })
    }
  },


  //点击了顶部的TAB
  changeViewType: function (event) {
    var tabID = event.currentTarget.dataset.id
    if (this.data.currentTabID==tabID){
      config.log("重复点击了:"+tabID)
      return
    }
    this.setData({
      video_list: [],
      hasMore: true,
      showLoading: true,
      start: 1,
      currentTabID:tabID
    })
    req.getVideoList(this, this.data.currentTabID, this.data.start, 10)
  },


  //点击了视频条目
  onClickItem: function (event) {
    var data = event.currentTarget.dataset;
    wx.navigateTo({
      url: "../player/player?video_id=" + data.id
    })
  },


  //监听下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      video_list: [],
      hasMore: true,
      showLoading: true,
      start: 1
    })
    req.getVideoList(this, this.data.currentTabID, this.data.start, 10)
  },

  //加载更多
  onReachBottom: function () {
    if (!this.data.showLoading) {
      this.data.start++
      req.getVideoList(this, this.data.currentTabID, this.data.start , 10)
    }
  },

  //分享
  onShareAppMessage: function (res) {
    return {
      title: '我在新趣小视频，邀请你也来围观，超多搞笑视频笑不停！',
      path: '/pages/main/main',
      success :function(res){
        wx.showToast({
          title: "分享成功~",
          icon: 'success',
          duration: 2000
        })
      }
    }
  },

  // async test(){
  //   let res = await wxpf.login()
  //    console.log("登录回调",res)
  //    let userInfo = await wxpf.getUserInfo()
  //   console.log('用户信息获取：', userInfo)
  // },

  /**
 * 生命周期函数--监听页面卸载
 */
  onUnload: function () {

  },
})
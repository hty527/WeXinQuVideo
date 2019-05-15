var req = require('../../comm/script/fetch')
var util = require('../../util/util')
var config = require('../../comm/script/config')
var message = require('../../template/message/message')
var videoID = null
var appInstance = getApp()
var inputText = null

Page({
  data: {
    video_info: null,//视频的基本信息
    recomend_list: [],//视频的推荐列表
    comment_list: [],//留言列表
    showLoading: true,
    showContent: false,
    showCommendEmpty: true,//加载中布局
    showCommendView: false,//评论列表布局
    loadingMsg: "加载中，请稍后...",
    hasMore: true,
    video_height: 1200,
    isShare: false,
    btn_type: "default",// button样式：primary,warn,default
    page: 0,
    inputText: "",
    isPrice: true
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    if (config.DEBUG) {
      console.log(options)
    }
    if (null == options.video_id){
      wx.showToast({
        title: '参数错误，请重试！',
        image:"/image/drawable/ic_error.png"
      })
    }else{
      videoID = options.video_id
      try {
        this.videoContext = wx.createVideoContext('video')
        //获取视频信息
        req.getVideoInfo(this, config.apiList.videoInfo, videoID, null == appInstance.globalData.user_info ? "0" : appInstance.globalData.user_info.user_id)
      } catch (e) {

      }
    }
  },

  onReady: function () {
    req.getRecommendList(this, config.apiList.recommend, 1, 10, this.getRecommendResult)//获取推荐列表
    this.data.page++
    req.getComments(this, config.apiList.videoComments, videoID, this.data.page, config.count)//紧接着获取留言列表
  },


  //获取推荐视频回调,
  getRecommendResult: function () {
    if (null != req){     
      req.postPlayerRecord(config.apiList.playerRecord, videoID, null == appInstance.globalData.user_info ? "0" : appInstance.globalData.user_info.user_id)//上报播放次数
    }
  },

  //隐藏的image加载完成调用
  onImageLoad: function (e) {
    if (null != e && null != e.detail) {
      let height = e.detail['height']//图片原始宽度
      let width = e.detail['width']  //图片原始高度
      let scale = 750 / width        //比例计算
      //最终播放器的实际高度
      this.setData({
        video_height: height * scale
      })
    }
  },

  //分享
  onShareAppMessage: function (res) {
    var path = '/pages/main/main?video_id=' + videoID
    var desp = "我在新视带，邀请你也来围观，超多搞笑视频笑不停！"
    if (null != this.data.video_info) {
      desp = "新趣小视频："+this.data.video_info.desp
    }
    if (null != appInstance.globalData.user_info) {
      desp = appInstance.globalData.user_info.nickname + "@ 我，这个视频很精彩，推荐给你，别错过了。。"
    }
    var that=this;
    return {
      title: desp,
      path: path,
      success: function (res) {
        wx.showToast({
          title: "分享成功~",
          icon: 'success',
          duration: 2000
        })
        //统计分享次数
        if (null != req) {
          req.postShareRecord(that,config.apiList.shareRecord, videoID, null == appInstance.globalData.user_info ? "0" : appInstance.globalData.user_info.user_id)
        }
      },
    }
  },

  //点击对视频点赞按钮
  onClickPrice: function (e) {
    var that=this
    if (req.userLogin(appInstance,function(res){
      console.log("收到登录回调",res)
      //未登录但又重新成功登录了
      that.onPriceVideo()
    })){
      console.log("已经登录了")
      //已经登录了
      that.onPriceVideo()
    }
  },


  //点击了发送按钮
  onClickAddCommend: function () {
    if (null != inputText && inputText.length > 0){
      var that=this
      if (req.userLogin(appInstance,function(res){
        console.log("收到登录回调", res)
        that.addCommedContent()
      })){
        console.log("已经登录了")
        that.addCommedContent()
      }
    }else{
      wx.showToast({
        title: '评论不能为空！',
        duration: 3000,
        image: "/image/drawable/ic_error.png"
      })
      this.setData({
        btn_type: "warn"//primary,warn,
      })
    }
  },


  //对视频点赞动作
  onPriceVideo:function(){
    var that=this
    req.onPriceVideo(videoID, null == appInstance.globalData.user_info ? "0" : appInstance.globalData.user_info.user_id, function (flag, collect_times, video_id){
      //点赞回调
      that.data.video_info.collect_times = collect_times
      that.setData({
        isPrice:flag,
        video_info: that.data.video_info
      })
    })
  },

  //对视频添加评论意图
  addCommedContent :function(){
    var that=this
    //添加评论
    req.addCommend(that, config.apiList.addCommend, videoID, appInstance.globalData.user_info.user_id, inputText,function(code,res){
      //点赞成功回调
      if (typeof code == 'number') {
        if (config.REQ_SUCCSS == code) {
          if (null != res.data && 1 == res.data.code && null != res.data.data.info) {
            wx.showToast({
              title: "评论成功~",
              icon: 'success',
              duration: 2000
            })
            var newinfo = res.data.data.info
            newinfo.add_time = util.parseData(newinfo.add_time)
            that.data.comment_list.unshift(newinfo)//向最前面插入一条数据
            //实时改变评论的数量标识
            var comment_times = parseInt(that.data.video_info.comment_times)
            comment_times++
            that.data.video_info.comment_times = comment_times + ''
            that.setData({
              comment_list: that.data.comment_list,
              inputText: "",
              btn_type: "default",
              video_info: that.data.video_info,
              showCommendEmpty: false,//加载中布局
              showCommendView: true//评论列表布局
            })
            inputText = ""
          }
        } else if (config.REQ_FAIL == code) {
          wx.showToast({
            title: res,
            duration: 2000,
            image: "/image/drawable/ic_error.png"
          })
        } else if (config.REQ_NETERROR == code) {
          wx.showToast({
            title: "无网络连接!",
            duration: 2000,
            image: "/image/drawable/ic_error.png"
          })
        }
      }
    });
  },  


  //点击了推荐列表
  onRecommendListItemClick: function (e) {
    var data = e.currentTarget.dataset
    wx.redirectTo({
      url: "../player/player?video_id=" + data.id 
    })
  },

  //从微信的单聊或者群聊中点击了分享 场景中进入此界面，显示回主页按钮
  onBackHome: function () {
    wx.redirectTo({
      url: '../main/main'
    })
  },

  //监听输入内容,改变发送按钮样式
  onTextChangeListener: function (e) {
    if (null != e) {
      inputText = e.detail.value
    }
    this.setData({
      btn_type: null != inputText && inputText.length > 0 ? "primary" : "default"
    })
  },
  
  //点击了留言列表
  clickCommendListItem : function(){

  },

  //点击了用户的基本信息
  onClickUserInfo: function(){

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (null != this.videoContext) {
      this.videoContext.play()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (null != this.videoContext) {
      this.videoContext.pause()
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (null != this.videoContext) {
      this.videoContext.pause()
    }
    inputText = null;
    this.setData({
      video_info: null,
      recomend_list: [],
      comment_list: []
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //加载更多
    this.data.page++
    req.getComments(this, config.apiList.videoComments, videoID, this.data.page, config.count)//紧接着获取留言列表
  },
})
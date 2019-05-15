module.exports = {
    count: 10,
    REQ_SUCCSS:1,
    REQ_FAIL:2,
    REQ_NETERROR:3,
    REQ_COMPLETE:0,
    PRICE_RESUT:"collect_success",//点赞成功的标识
    DEBUG:true,//日志信息打印开关
    apiList: {
      init: 'https://app.nq6.com/wxapp/index/init',//初始化
      tabs: 'https://app.nq6.com/wxapp/index/cate',//首页列表
      video_list: 'https://app.nq6.com/wxapp/index/cate_video',//视频列表
      hot_list: "https://app.nq6.com/wxapp/index/hot_list",//热门列表
      videoInfo: 'https://app.nq6.com/wxapp/index/video_info',//视频详情
      priceVideo: 'https://app.nq6.com/wxapp/index/like',//点赞
      addCommend:'https://app.nq6.com/wxapp/index/add_comment',//添加评论
      videoComments: 'https://app.nq6.com/wxapp/index/comments',//评论列表
      recommend:"https://app.nq6.com/wxapp/index/relate",//推荐，现在采取的是随机的
      playerRecord: "https://app.nq6.com/wxapp/index/play_record",//统计播放次数
      shareRecord: "https://app.nq6.com/wxapp/index/share"//统计分享次数
    },
    log: log,
    isLogin: isLogin
}

//日志输出
function log(msg) {
  if (this.DEBUG) {
    console.log(msg)
  }
}

//是否登录
function isLogin() {
  const app = getApp()
  if (null != app.globalData.user_info) {
    return true
  }
  return false
}
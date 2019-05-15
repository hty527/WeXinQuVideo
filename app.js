var config = require('comm/script/config')
App({

  globalData: {
    user_info: null,
    scene: 1023,//启动小程序的场景值，默认是从系统桌面启动的
  },
  
  onLaunch: function(ops) {
    console.log(ops)
    //1004从微信打开,1001正常打开小程序 
    this.globalData.scene=ops.scene
    var that=this
    wx.getStorage({
      key: 'user_info',
      success: function (res) {
        if (null != res && null != res.data && null != res.data.user_id) {
          //登录状态有效且用户注册的缓存信息已存在，赋值全局变量
          console.log("用户缓存存在",res)
          that.globalData.user_info = res.data;
        }
      },
      fail: function (res) {
        console.log("用户缓存不存在", res)
      }
    })
  },
})
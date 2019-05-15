var config = require('./config.js')
var message = require('../../template/message/message')
var util = require('../../util/util')

//获取标题栏
function getTabs(callBack) {
  config.log("获取首页分类：")
  wx.request({
    url: config.apiList.tabs,
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      config.log(res)
      if (null != res.data && 1 == res.data.code && null != res.data.data && res.data.data.lists.length > 0) {
        typeof callBack == "function" && callBack(config.REQ_SUCCSS, res)
      } else {
        typeof callBack == "function" && callBack(config.REQ_FAIL, res)
      }
    },
    fail: function (res) {
      typeof callBack == "function" && callBack(config.REQ_NETERROR, res)

    }
  })
}

//根据分类ID获取视频列表
function getVideoList(that, cid, page, pageSize, callBack) {
  if (that.data.hasMore) {
    config.log("获取视频分类列表：cateid=" + cid + ",page=" + page + ",pageSize=" + pageSize)
    var url = null
    //热门
    if (0 == cid) {
      config.log("获取热门视频，页数:" + page)
      url = config.apiList.hot_list
      //其他分类的
    } else {
      config.log("获取分类视频，页数:" + page + ",类别：" + cid)
      url = config.apiList.video_list
    }
    wx.request({
      url: url,
      data: {
        cate_id: cid,
        page: page,
        page_size: pageSize
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        config.log("获取视频列表成功", res)
        wx.stopPullDownRefresh()
        if (1 == res.data.code && null != res.data.data.lists && res.data.data.lists.length > 0) {
          //格式化播放次数
          var newData = res.data.data.lists;
          for (var i = 0; i < newData.length; i++) {
            var playCount = parsePlayCount(parseInt(newData[i].play_times));
            newData[i].play_times = playCount
          }
          that.setData({
            showLoading: false,
            video_list: that.data.video_list.concat(newData)
          })
        } else {
          that.setData({
            hasMore: false,
            showLoading: false
          })
        }
        typeof callBack == 'function' && callBack(res.data)
      },
      fail: function () {
        wx.stopPullDownRefresh()
        that.data.start--
        that.setData({
          showLoading: false
        })
        message.show.call(that, {
          content: '网络连接失败！',
          icon: 'offline',
          duration: 3000
        })
        typeof callBack == 'function' && callBack()
      }
    })

  }
}


function parsePlayCount(count) {
  if (count > 10000) {
    //格式化次数，保留一位小数
    return parseFloat(count / 10000).toFixed(1) + "万"
  }
  return count + ''
}



//用户注册
function getUserData(callBack) {
  try {
    wx.showLoading({
      title: '登录中...',
    })
    var that = this
    //登录
    

    wx.login({
      //用户授权了且登录成功
      success: function (res) {
        config.log("获取用户的微信状态成功")
        wx.getUserInfo({
          lang: "zh_CN",
          success: function (userRes) {
            config.log("获取用户凭证信息成功")
            config.log("登录：encryptedData=" + userRes.encryptedData + ",iv=" + userRes.iv)
            //获取用户的encryptedData，向服务器发起注册
            wx.request({
              url: config.apiList.init,
              data: {
                code: res.code,
                encryptedData: userRes.encryptedData,
                iv: userRes.iv
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              method: 'POST',
              //服务端的回掉  
              success: function (result) {
                wx.hideLoading()
                if (config.DEBUG) {
                  config.log(result)
                }
                if (null != result && 1 == result.data.code && null != result.data.data.info && null != result.data.data.info.user_id) {
                  config.log("获取用户信息并注册/登录成功")
                  getApp().globalData.user_info = result.data.data.info
                  wx.setStorageSync('user_info', result.data.data.info)
                  typeof callBack == 'function' && callBack("登录成功~")
                } else {
                  wx.showToast({
                    title: '登录失败',
                    duration: 300,
                    image: "/image/drawable/ic_error.png",
                  })
                }
              },
              fail: function (res) {
                wx.hideLoading()
                config.log("注册用户信息失败")
              },

            })
          },
          fail: function (res) {
            wx.hideLoading()
            config.log("用户拒绝了授权")
            setTimeout(function () {
              //再次打开授权界面，成功后再次自动创建用户信息
              wx.openSetting({
                success: (res) => {
                  if (null != res && null != res.authSetting) {
                    if (res.authSetting['scope.userInfo']) {
                      that.getUserData(callBack)
                    }
                  }
                }
              });
            }, 100)
          }
        })
      },
      //用户拒绝了授权
      fail: function (res) {
        wx.hideLoading()
        config.log(res)
      }
    })
  } catch (e) {
    config.log("登录异常")
  }
}

/**
 * 用户是否登录成功
 * 返回用户是否已登录，如果未登录，登录，登录失败后 跳转至授权界面,授权成功，自动开始登录
 */
function userLogin(app, callBack) {
  if (null == app.globalData.user_info || null == app.globalData.user_info.user_id) {
    config.log("用户未登录")
    wx.showToast({
      title: '请先登录',
      duration: 300,
      image: "/image/drawable/ic_error.png",
    })
    this.getUserData(callBack)
    return false
  }
  return true
}

//添加视频评论
function addCommend(that, url, video_id, user_id, content, resultCallBack) {

  config.log("添加视频评论：video_id=" + video_id + ",user_id=" + user_id + ",content=" + content)
  wx.showLoading({
    title: '操作中...',
  })
  wx.request({
    url: url,
    data: {
      video_id: video_id,
      user_id: user_id,
      comment: content,
      to_user_id: "0"
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      wx.hideLoading()
      config.log(res)
      if (null != res.data && 1 == res.data.code && null != res.data.data) {
        typeof resultCallBack == 'function' && resultCallBack(config.REQ_SUCCSS, res)
      } else {
        typeof resultCallBack == 'function' && resultCallBack(config.REQ_FAIL, res.data.msg)
      }
    },
    fail: function (res) {
      wx.hideLoading()
      typeof resultCallBack == 'function' && resultCallBack(config.REQ_NETERROR, res)
    }
  })
}

//获取视频信息
function getVideoInfo(that, url, video_id, user_id, cb, fail_cb) {
  config.log("获取视频信息：video_id=" + video_id + ",user_id=" + user_id)
  wx.request({
    url: url,
    data: {
      video_id: video_id,
      user_id: user_id,
      visit_user_id: "0"
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      config.log(res)
      if (null != res && 1 == res.data.code && null != res.data.data.info) {
        var data = res.data.data.info;
        data.add_time = new Date(parseInt(data.add_time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
        var isPrice = false;
        if (1 == data.is_interest) {
          isPrice = true
        }
        that.setData({
          showLoading: false,
          showContent: true,
          video_info: data,
          isPrice: isPrice
        })
      } else {
        message.show.call(that, {
          content: '获取视频信息失败',
          icon: 'null',
          duration: 3000
        })
      }
      typeof cb == 'function' && cb(res.data)
    },

    fail: function () {
      message.show.call(that, {
        content: '网络连接失败！',
        icon: 'offline',
        duration: 3000
      })
      typeof fail_cb == 'function' && fail_cb()
    }
  })
}



//根据视频ID获取评论列表
function getComments(that, url, video_id, page, pageSize, cb, fail_cb) {
  if (that.data.hasMore) {
    config.log("获取评论列表：video_id=" + video_id + ",page=" + page + ",pageSize=" + pageSize);
    wx.request({
      url: url,
      data: {
        video_id: video_id,
        page: page,
        page_size: pageSize
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        config.log(res)
        if (null != res.data && 1 == res.data.code && null != res.data.data.comment_list && res.data.data.comment_list.length > 0) {
          try {
            var dataList = res.data.data.comment_list;
            for (var i = 0; i < dataList.length; i++) {
              var info = dataList[i];
              info.add_time = new Date(parseInt(info.add_time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
              info.comment = decodeURIComponent(info.comment)
            }
          } catch (e) {

          }
          that.setData({
            showCommendEmpty: false,//加载中布局
            showCommendView: true,//评论列表布局
            comment_list: that.data.comment_list.concat(dataList)//添加至列表末尾，拼接数据
          })
        } else {
          that.setData({
            hasMore: false
          })
        }
        typeof cb == 'function' && cb(res.data)
      },
      fail: function () {
        that.data.page--;//还原原来的页数
        message.show.call(that, {
          content: '网络连接失败！',
          icon: 'offline',
          duration: 3000
        })
        typeof fail_cb == 'function' && fail_cb()
      }
    })
  }
}


//获取推荐列表，现在采取的是随机列表
var isGetRecommendList = false;
function getRecommendList(that, url, page, pageSize, cb, fail_cb) {
  if (isGetRecommendList) {
    return
  }
  isGetRecommendList = true
  config.log("获取推荐列表：page=" + page + ",pageSize=" + pageSize)
  wx.request({
    url: url,
    data: {
      page: page,
      page_size: pageSize
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      config.log(res)
      if (null != res.data && 1 == res.data.code && null != res.data.data.lists && res.data.data.lists.length > 0) {
        var newData = res.data.data.lists;
        for (var i = 0; i < newData.length; i++) {
          var playCount = parsePlayCount(parseInt(newData[i].play_times));
          newData[i].play_times = playCount
        }
        that.setData({
          recomend_list: newData
        })
      } else {
        message.show.call(that, {
          content: '推荐视频获取失败',
          icon: 'null',
          duration: 3000
        })
      }
      typeof cb == 'function' && cb()
    },
    fail: function () {
      message.show.call(that, {
        content: '网络连接失败！',
        icon: 'offline',
        duration: 3000
      })
      typeof fail_cb == 'function' && fail_cb()
    },
    complete: function () {
      isGetRecommendList = false
    }
  })
}


//对视频点赞
function onPriceVideo(video_id, user_id, resultCallBack) {
  config.log("对视频点赞：video_id=" + video_id + ",user_id=" + user_id)
  wx.showLoading({
    title: '点赞中,请稍后..'
  })

  wx.request({
    url: config.apiList.priceVideo,
    data: {
      video_id: video_id,
      user_id: user_id
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      wx.hideLoading()
      config.log(res)
      //收藏成功
      if (null != res.data && 1 == res.data.code){
        wx.showToast({
          title: '操作成功',
        })
        if ("collect_success" == res.data.msg){
          typeof resultCallBack == 'function' && resultCallBack(true, res.data.data.collect_times, res.data.data.video_id)
        }else{
          typeof resultCallBack == 'function' && resultCallBack(false, res.data.data.collect_times, res.data.data.video_id)
        }
      }else{
        wx.showToast({
          title: '操作失败',
          image: "/image/drawable/ic_error.png",
        })
      }
    },
    fail: function (res) {
      wx.hideLoading()
      wx.showToast({
        title: '操作失败',
        image: "/image/drawable/ic_error.png",
      })
    }
  })
}

//统计播放次数
function postPlayerRecord(url, videoID, userID) {
  config.log("统计播放次数: videoID=" + videoID + ",userID=" + userID)

  wx.request({
    url: url,
    data: {
      "video_id": videoID,
      "user_id": userID,
      "channel": "1"//小程序类型
    },
    method: "POST",
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      config.log(res)
    },
    fail: function (res) {
      config.log(res)
    }
  })
}
//统计分享视频的次数
function postShareRecord(that, url, videoID, userID) {
  config.log("统计分享次数: videoID=" + videoID + ",userID=" + userID)
  wx.request({
    url: url,
    data: {
      "user_id": userID,
      "video_id": videoID,
      "share_type": "wx_app"//小程序类型
    },
    method: "POST",
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    success: function (res) {
      config.log(res)
      if (null != res.data && 1 == res.data.code && null != res.data.data) {
        config.log(that.data)
        //刷新分享次数
        var shareCount = parseInt(that.data.video_info.share_times);
        shareCount++;
        that.data.video_info.share_times = shareCount + ''
        that.setData({
          video_info: that.data.video_info
        })
      }
    },
    fail: function (res) {
      config.log(res)
    }
  })
}

module.exports = {
  getVideoList: getVideoList,
  getUserData: getUserData,
  onPriceVideo: onPriceVideo,
  getVideoInfo: getVideoInfo,
  addCommend: addCommend,
  getRecommendList: getRecommendList,
  getComments: getComments,
  getTabs: getTabs,
  postPlayerRecord: postPlayerRecord,
  postShareRecord: postShareRecord,
  userLogin: userLogin
}
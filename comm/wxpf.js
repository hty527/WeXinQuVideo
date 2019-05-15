function login(){
  return new Promise((resultCallback, errCallback) => {
    wx.login({
      success: function (res) {
        typeof resultCallback == "function" && resultCallback(res)
      },
      fail: function (res) {
        typeof errCallback == "function" && errCallback(res)
      }
    })
  })
}

function  getUserInfo() {
  return new Promise((resultCallback, errCallback) => {
    wx.getUserInfo({
      success: function (res) {
        typeof resultCallback == "function" && resultCallback(res)
      },
      fail: function (res) {
        typeof errCallback == "function" && errCallback(res)
      }
    })
  })
}

module.exports = {
  login :login,
  getUserInfo: getUserInfo
}
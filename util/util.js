
function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}
 
function getDate() {
  var time = new Date()
  var year = time.getFullYear()
  var month = time.getMonth()
  month = month < 10 ? '0' + month : month
  var day = time.getDay()
  day = day < 10 ? '0' + day : day
  return [year, month, day].join('-')
}

function getTime() {
  var time = new Date()
  var hours = time.getHours()
  hours = hours < 10 ? '0' + hours : hours
  var minute = time.getMinutes()
  minute = minute < 10 ? '0' + minute : minute
  var second = time.getSeconds()
  second = second < 10 ? '0' + second : second
  return [hours, minute, second].join(':')
}

function parseData(nS){
  return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

function decodeString(str){
  return decodeString(str)
}

/**
 * 模拟网络生成视频数据
 */
const getVideoList = page => {
  console.log("getVideoList-page=" + page);
  var video_lists = [
    {
      title: "皇太极",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-6",
      video_desp: "大家好，我是皇太极，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "86",
      share_count: "99",
      comment_count: "100",
      video_path: "http://video.jiecao.fm/11/24/6/%E5%AD%94%E6%98%8E%E7%81%AF.mp4",
      video_cover: "http://img4.jiecaojingxuan.com/2016/11/24/2c3e62bb-6a32-4fb0-a1d5-d1260ad436a4.png@!640_360",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,//是否正在播放
    },
    {
      title: "周杰伦",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-5",
      video_desp: "大家好，我是周杰伦，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "235",
      share_count: "919",
      comment_count: "9900",
      video_path: "http://video.jiecao.fm/8/17/bGQS3BQQWUYrlzP1K4Tg4Q__.mp4",
      video_cover: "http://img4.jiecaojingxuan.com/2016/8/17/bd7ffc84-8407-4037-a078-7d922ce0fb0f.jpg",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,//是否正在播放
    },
    {
      title: "刘德华",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-5",
      video_desp: "大家好，我是刘德华，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "78",
      share_count: "65",
      comment_count: "1200",
      video_path: "http://video.jiecao.fm/8/17/%E6%8A%AB%E8%90%A8.mp4",
      video_cover: "http://img4.jiecaojingxuan.com/2016/8/17/f2dbd12e-b1cb-4daf-aff1-8c6be2f64d1a.jpg",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,//是否正在播放
    },
    {
      title: "郭富城",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-4",
      video_desp: "大家好，我是刘德华，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "98",
      share_count: "85",
      comment_count: "800",
      video_path: "http://video.jiecao.fm/8/16/%E9%A9%BC%E8%83%8C.mp4",
      video_cover: "http://img4.jiecaojingxuan.com/2016/8/16/aaeb5da9-ac50-4712-a28d-863fe40f1fc6.png",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,//是否正在播放
    },
    {
      title: "张学友",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-3",
      video_desp: "大家好，我是张学友，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "980",
      share_count: "835",
      comment_count: "1800",
      video_path: "http://gslb.miaopai.com/stream/ed5HCfnhovu3tyIQAiv60Q__.mp4",
      video_cover: "http://img4.jiecaojingxuan.com/2016/3/14/2204a578-609b-440e-8af7-a0ee17ff3aee.jpg",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,
    },
    {
      title: "黎明",
      user_logo: "/image/drawable/ic_icon.png",
      upload_date: "2018-1-3",
      video_desp: "大家好，我是刘德华，这是我的视频介绍，以下是介绍内容，请猛戳这里哦！",
      collect_count: "1198",
      share_count: "852",
      comment_count: "2800",
      video_path: "http://video.jiecao.fm/5/1/%E8%87%AA%E5%8F%96%E5%85%B6%E8%BE%B1.mp4",
      video_cover: "ttp://img4.jiecaojingxuan.com/2016/5/1/3430ec64-e6a7-4d8e-b044-9d408e075b7c.jpg",
      //显示和隐藏,在wxml中引用变量，在js脚本中改变值,用法：image节点下 wx:if="{{user_cover_visble}}"
      user_cover_visble: true,
      isplaying: false,//是否正在播放
    },
  ]
  return video_lists
}

/**
 * 模拟网络动态生成菜单
 * 传入微信用户ID
 */
const createTabList = wxID =>{
  console.log("wxID=" + wxID);
  var tabs=[
    {
      titleName: "推荐",
      tabID: "0",
      selector: true
    },
    {
      titleName: "热门",
      tabID: "1",
      selector: false
    },
    {
      titleName: "搞笑",
      tabID: "2",
      selector: false
    },
    {
      titleName: "同城",
      tabID: "3",
      selector: false
    },
    {
      titleName: "美女",
      tabID: "4",
      selector: false
    },
    {
      titleName: "舞蹈",
      tabID: "5",
      selector: false
    },
    {
      titleName: "生活",
      tabID: "6",
      selector: false
    }
  ]
  return tabs
}

module.exports = {
  formatTime: formatTime,
  getDate: getDate,
  getTime: getTime,
  getVideoList: getVideoList,
  createTabList: createTabList,
  parseData : parseData,
}

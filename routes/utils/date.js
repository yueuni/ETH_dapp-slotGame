var dateFromTimestamp = (timestamp) => {
    var parse = new Date(timestamp);

    var dayNames = ['(일요일)', '(월요일)', '(화요일)', '(수요일)', '(목요일)', '(금요일)', '(토요일)'];
    var day = dayNames[parse.getDay()];
  
    var year   = parse.getFullYear(),
        month  = parse.getMonth() + 1,
        date   = parse.getDate(),
        hour   = parse.getHours(),
        minute = parse.getMinutes(),
        second = parse.getSeconds();
        ampm   = hour >= 12 ? 'PM' : 'AM';
  
    // 12시간제로 변경
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 => 12
  
    // 10미만인 분과 초를 2자리로 변경
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;
  
    var date = year + '년 ' + month + '월 ' + date + '일 ' + day + ' ' + hour + ':' + minute + ':' + second + ' ' + ampm;
    return date;
}

module.exports = dateFromTimestamp;

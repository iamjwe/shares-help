const moment = require('moment');

exports.nowDate = moment().format("YYYYMMDD");

exports.diffDayNum = (startDate, endDate) => {
    return moment(moment(endDate)).diff(moment(startDate), 'day');
}

exports.getLastDay =  (date, num = 1) => {
    return moment(date).subtract(num, 'days').format('YYYY-MM-DD');
}
// 比较第一个时间是不是比第二个时间后，如果是返回true
judgeDateBefore = (date1, date2) => {
    const diff = moment(date1).diff(moment(date2), 'days');
    if (diff > 0) {
        return false;
    }
    return true;
}
exports.judgeDateBefore = judgeDateBefore;

exports.judgeDateInclude = (date, startDate, endDate) => {
    if (judgeDateBefore(startDate, date) && judgeDateBefore(date,endDate)) {
        return true;
    } else {
        return false;
    }
}
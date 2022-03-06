import * as dayjs from 'dayjs';

export enum dateUnitEnum {
  day,
  week, // 绝对一周，example：本周一 到本周三
  month,
  year,
  weekL,
  monthL,
  yearL,
  weekR, // weekRange相对一周，example：上周三 到 这周三
  monthR,
  yearR,
}

export const getNowDate = () => {
  return dayjs().format('YYYYMMDD');
};

export const formatDate = (date) => {
  return dayjs(date).format('YYYYMMDD');
};

export const addDay = (date: string, recent = 1): string => {
  return formatDate(dayjs(date).add(recent, 'day'));
};

export const subDay = (date: string, recent = 1): string => {
  return formatDate(dayjs(date).subtract(recent, 'day'));
};

export const subMonth = (date: string, recent = 1): string => {
  return formatDate(dayjs(date).subtract(recent, 'month'));
};

export const subYear = (date: string, recent = 1): string => {
  return formatDate(dayjs(date).subtract(recent, 'year'));
};

export const isDateBefore = (date1: string, date2: string): boolean => {
  return dayjs(date1).isBefore(dayjs(date2));
};

export const isDateAfter = (date1: string, date2: string): boolean => {
  return dayjs(date1).isAfter(dayjs(date2));
};
export const isDateEqual = (date1: string, date2: string): boolean => {
  return dayjs(date1).isSame(dayjs(date2));
};

export const getWeekStart = (date) => {
  return formatDate(dayjs(date).startOf('week').add(1, 'day'));
};

export const getWeekEnd = (date) => {
  return formatDate(dayjs(date).endOf('week').add(1, 'day'));
};

export const geeMonthStart = (date) => {
  return formatDate(dayjs(date).startOf('month'));
};

export const geeMonthEnd = (date) => {
  return formatDate(dayjs(date).endOf('month'));
};

export const getYearStart = (date) => {
  return formatDate(dayjs(date).startOf('year'));
};

export const getYearEnd = (date) => {
  return formatDate(dayjs(date).endOf('year'));
};

// 左闭右闭：上周三 => 这周二
export const substractDate = (
  unitType: dateUnitEnum,
  date: string = getNowDate(),
  recent = 1,
): string => {
  let resultDate;
  switch (unitType) {
    case dateUnitEnum.day:
      resultDate = dayjs(date).subtract(recent, 'day');
      break;
    case dateUnitEnum.week:
      resultDate = dayjs(date).startOf('week').add(1, 'day'); // 设置成周一的日期
      break;
    case dateUnitEnum.month:
      resultDate = dayjs(date).startOf('month'); // 设置成月初的日期
      break;
    case dateUnitEnum.year:
      resultDate = dayjs(date).startOf('year');
      break;
    case dateUnitEnum.weekL:
      resultDate = dayjs(date)
        .subtract(recent, 'week')
        .startOf('week')
        .add(1, 'day'); // 上周一
      break;
    case dateUnitEnum.monthL:
      resultDate = dayjs(date).subtract(recent, 'month').startOf('month'); // 上月初一
      break;
    case dateUnitEnum.yearL:
      resultDate = dayjs(date).subtract(recent, 'year').startOf('year'); // 去年初一
      break;
    case dateUnitEnum.weekR:
      resultDate = dayjs(date).subtract(recent, 'week').add(1, 'day');
      break;
    case dateUnitEnum.monthR:
      resultDate = dayjs(date).subtract(recent, 'month').add(1, 'day');
      break;
    case dateUnitEnum.yearR:
      resultDate = dayjs(date).subtract(recent, 'year').add(1, 'day');
      break;
  }
  return formatDate(resultDate);
};

export const spliceByYear = (
  beginDate: string,
  endDate: string,
): { [year: string]: string[] } => {
  const result = {};
  const endDateAfter1Day = addDay(endDate);
  while (beginDate !== endDateAfter1Day) {
    const year = beginDate.match(/\d{4}/)[0];
    if (!result[year]) {
      result[year] = [];
    }
    result[year].push(beginDate);
    beginDate = addDay(beginDate);
  }
  return result;
};

// 左闭右开：相同则返回空数组
export const getRangeDateLoRc = (
  beginDate: string,
  endDate: string,
): string[] => {
  const dateArr = [];
  beginDate = formatDate(beginDate);
  endDate = formatDate(endDate);
  let curDate = beginDate;
  while (curDate !== endDate) {
    dateArr.push(curDate);
    curDate = addDay(curDate, 1);
  }
  return dateArr;
};

// 周3 => 3, 周日 => 0
export const getWeekNum = (date: string): number => {
  return dayjs(date).day();
};

export const setWeekNum = (date: string, num: number): string => {
  return formatDate(dayjs(date).day(num));
};

export const getRangeDateSliceByWeekLoRc = (
  beginDate: string,
  endDate: string,
): string[][] => {
  const dateArr = [];
  beginDate = formatDate(beginDate);
  endDate = formatDate(endDate);
  let curDate = beginDate;
  let curWeekArr = [];
  while (curDate !== endDate) {
    // 每当遇到周一就归并重置一次
    if (getWeekNum(curDate) !== 1) {
      curWeekArr.push(curDate);
    } else {
      dateArr.push(curWeekArr);
      curWeekArr = [curDate];
    }
    curDate = addDay(curDate, 1);
  }
  dateArr.push(curWeekArr);
  return dateArr;
};

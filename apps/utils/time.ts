import * as dayjs from 'dayjs';

// 工作日且晚于5点返回true（TODO：此处最好改为交易日）
export const isTradeDayAfterHour = (time: Date, afterHour: number): boolean => {
  const dayNum = dayjs(time).day();
  if (dayNum === 0 || dayNum === 6) {
    return false;
  }
  return dayjs(time).hour() >= afterHour;
};

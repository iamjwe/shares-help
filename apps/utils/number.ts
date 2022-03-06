export const calAvag = (nums: number[]): number => {
  nums = nums.filter((num) => {
    return !isNaN(num);
  });
  if (nums.length === 0) {
    return NaN;
  }
  let sum = 0;
  nums.forEach((num) => {
    sum += num;
  });
  return Number((sum / nums.length).toFixed(2));
};

// 0.5 => 50%
export const floatToPercent = (point: number): string => {
  let str = Number(point * 100).toFixed(2);
  str += '%';
  return str;
};

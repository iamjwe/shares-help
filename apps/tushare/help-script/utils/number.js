const inRange = (num, startNum, endNum) => {
    return num >= startNum && num <= endNum
}
exports.inRange = inRange;

const inRangeAll = (numArr, startNum, endNum) => {
    for(let i=0; i<numArr.length; i++) {
        if (!inRange(numArr[i], startNum, endNum)) {
            return false;
        };
    }
    return true;
}


exports.inRangeAll = inRangeAll;
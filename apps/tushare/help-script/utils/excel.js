const XLSX = require('xlsx');

exports.writeXlsx = (path, data) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '数据详情');
    XLSX.writeFile(wb, path);
}

exports.readXlsx = (path) => {
    const workbook = XLSX.readFile(path);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    return worksheet;
}
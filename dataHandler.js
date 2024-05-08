const fs = require('fs');

function loadData() {
    try {
        const data = fs.readFileSync('itemArray.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
   
        return [];
    }
}
function saveData(data) {
    fs.writeFileSync('itemArray.json', JSON.stringify(data), 'utf8');
}
function addItem(item) {
    const data = loadData();
    if (!data.includes(item)) {
        data.push(item);
        saveData(data);
        return true; 
    } else {
        return false; 
    }
}

module.exports = {
    loadData,
    saveData,
    addItem
};
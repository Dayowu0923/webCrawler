function getDay() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); 
    const weekday = yesterday.getDay(); 
    if (weekday === 0) { 
        yesterday.setDate(yesterday.getDate() - 2); 
    }
    return yesterday;
}
module.exports = getDay;
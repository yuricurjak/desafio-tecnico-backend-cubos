module.exports = (date) =>{
    date = date.split('-');
    date.reverse();
    date = date.join('-');
    return date;
};
module.exports = (start, end) =>{
    return new Promise(resolve =>{
        let arr=[];
        let date;
        for(let dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
            date = new Date(dt).toISOString().substring(0, 10);
            date = date.split('-');
            date.reverse();
            date = date.join('-');
            arr.push(date);
        }
        return resolve(arr);
    })

};
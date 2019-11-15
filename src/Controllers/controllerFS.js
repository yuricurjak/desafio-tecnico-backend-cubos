const fs = require ('file-system');

file = module.exports = {};

file.writeFile = (message, contents) =>{
    return new Promise((resolve, reject) =>{
        fs.writeFile('./rules.json', JSON.stringify(contents),  function(err) {
            if(err) return reject(err);
            else return resolve(message);
        });
    })
};

file.readFileSync = () =>{
    return new Promise((resolve, reject) =>{
        try{
            let contents = fs.readFileSync('./rules.json', 'utf8');
            contents = JSON.parse(contents);
            return resolve(contents);
        }catch (e) {
            return reject(e);
        }


    })
};
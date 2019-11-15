const rangeDays = require('../Services/rangeDays');
const controllerFS = require('./controllerFS');
const convertISODateFormat = require('../Services/convertDateFormat');

let controllerMain = module.exports ={};

controllerMain.registerRule = async (req, res) =>{
    try{
        let contents = await controllerFS.readFileSync();
        let id = Object.keys(contents.rules).length;
        for (let prop in contents.rules) {
            if (contents.rules[prop].type === 'dailey') {
                if(req.body.type === 'day' || req.body.type === 'dailey' || req.body.type === 'weekly'){
                    if (contents.rules[prop].startTime === req.body.startTime || contents.rules[prop].endTime === req.body.endTime) {
                        return res.status(200).send(`time conflict, rule not added`);
                    }
                }
                else {
                    return res.status(400).send(JSON.stringify({error: `incorrect request format`}));
                }

            } else if (contents.rules[prop].type === 'day') {

                if (req.body.type === 'dailey') {
                        if (contents.rules[prop].startTime === req.body.startTime || contents.rules[prop].endTime === req.body.endTime) {
                            return res.status(200).send(`time conflict, rule not added, day = dailey`);
                        }

                } else if (req.body.type === 'weekly') {
                    let daysReq = req.body.daysWeek.split('-');
                    //daysReq = daysReq.substring(0, 3);
                    let ruleDay = convertISODateFormat(contents.rules[prop].day);
                    let data = new Date(ruleDay).toDateString().substring(0, 3);
                    daysReq.map(day => {
                        day = day.substring(0, 3);
                        if (data === day) {
                            return res.status(200).send(`time conflict, rule not added, day = weekly`);
                        }
                    })

                } else if(req.body.type === 'day'){
                    if (req.body.day === contents.rules[prop].day) {
                        if(req.body.startTime === contents.rules[prop].startTime || req.body.endTime === contents.rules[prop].endTime){
                            return res.status(200).send(`time conflict, rule not added, day = day`);

                        }
                    }

                } else {
                    return res.status(400).send(JSON.stringify({error: `incorrect request format`}));
                }
            } else if (contents.rules[prop].type === 'weekly') {

                if (req.body.type === 'day') {
                    let reqDay = convertISODateFormat(req.body.day);
                    let data = new Date(reqDay).toDateString().substring(0, 3);
                    let daysRule = contents.rules[prop].daysWeek.split('-');
                    daysRule.map(day => {
                        day = day.substring(0, 3);
                        if (data === day) {
                            return res.status(200).send(`time conflict, rule not added, weekly = day`);
                        }
                    })

                } else if (req.body.type === 'weekly') {
                    let daysReq = req.body.daysWeek.split('-');
                    let daysRule = contents.rules[prop].daysWeek.split('-');
                    daysReq.map(value1 => {
                        daysRule.map(value2 => {
                            if (value1 === value2) {
                                return res.status(200).send(`time conflict, rule not added, weekly = weekly`);
                            }
                        })
                    })

                } else if (req.body.type === 'daily'){
                    if (contents.rules[prop].startTime === req.body.startTime || contents.rules[prop].endTime === req.body.endTime) {
                        return res.status(200).send(`time conflict, rule not added, weekly = dailey`);
                    }

                } else {
                    return res.status(400).send(JSON.stringify({error: `incorrect request format`}));
                }
            }
        };
        contents.rules[++id] = req.body;
        let result = await controllerFS.writeFile('Success, rule added', contents);

        console.log(`Successfully added ${req.body.type} rule.`);
        res.status(200).send(`Successfully added ${req.body.type} rule.`);

    }catch (e) {
        return res.status(400).send(JSON.stringify({error: e.message}));
    }
};

controllerMain.listRules = async (req, res) =>{
    let contents = await controllerFS.readFileSync();

    console.log(contents.rules);
    res.status(200).send(JSON.stringify(contents.rules));
};

controllerMain.deleteRule = async (req, res) =>{
    try{
        let contents = await controllerFS.readFileSync();
        let id = req.body.id;
        if(contents.rules[id] !== undefined){
            contents.rules[id] = undefined;
            let result = await controllerFS.writeFile('Success, deleted rule', contents);
            console.log(result);
            res.status(200).send(result);
        } else {
            res.status(200).send('Rule does not exist');
        }
    }catch (e) {
        return res.status(400).send(JSON.stringify({error: e.message}));
    }
};

controllerMain.availableTimes = async (req, res) =>{
    try{
        let vetResult = [];
        let objectResult = {};

        let contents = await controllerFS.readFileSync();
        let startDate = convertISODateFormat(req.body.startDate);
        let endDate = convertISODateFormat(req.body.endDate);

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        let vetRange = await rangeDays(startDate, endDate);

        vetRange.map(value =>{
            for (let prop in contents.rules){
                //verifica o tipo da regra
                //caso seja do tipo "day" verifica se o dia da posição atual do range é igual ao dia da posição das regras
                if(contents.rules[prop].type === 'day'){
                    if(value === contents.rules[prop].day){
                        if(objectResult[value] === undefined){
                            objectResult[value] = [{ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime }];
                        }
                        else {
                            objectResult[value].push({ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime });
                        }

                    }
                }
                //verificar apenas se o dia da posição atual do range já foi adicionado no objeto de resultados, caso já exista adiciona apenas o intervalo
                else if(contents.rules[prop].type === 'daily'){
                    if(objectResult[value] === undefined){
                        objectResult[value] = [{ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime }];
                    }
                    else {
                        objectResult[value].push({ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime });
                    }
                }
                //verifica se o dia da posição atual do range é correspondente aos dias da semana informados na regra
                else if(contents.rules[prop].type === 'weekly'){
                    let dateFomated = convertISODateFormat(value);
                    let data = new Date(dateFomated).toDateString().substring(0, 3);
                    let days = contents.rules[prop].daysWeek.split('-');
                    days.map(day =>{
                        day = day.substring(0,3);
                        if(data === day){
                            if(objectResult[value] === undefined){
                                objectResult[value] = [{ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime }];
                            }
                            else {
                                objectResult[value].push({ start: contents.rules[prop].startTime, end: contents.rules[prop].endTime });
                            }
                        }
                    })

                }

            }
        });

        //coloca o retorno da requisição no padrão solicitado
        console.log(objectResult);
        vetRange.map(data =>{
            if(objectResult[data] !== undefined){
                vetResult.push({day: data, intervals: objectResult[data]})
            }
        });
        res.status(200).send(JSON.stringify(vetResult));
    }catch (e) {
        return res.status(400).send(JSON.stringify({error: e.message}));
    }

};

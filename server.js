const server = require('express')();
const routes = require('./src/Routes/routes');
const port = 3000;

server.use(routes);

server.listen(port, console.log(`server running on port ${port}`));


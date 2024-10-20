import http from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer();

server.listen(port);
console.log(`Server is working on Port: ${port}`);

export { server, port };

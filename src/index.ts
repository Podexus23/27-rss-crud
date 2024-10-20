import http from 'http';
import * as dotenv from 'dotenv';
import requestLog from './helpers/logger.helpers';

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer((req) => {
  try {
    requestLog(req);
  } catch (err) {
    console.log(err);
  }
});

server.listen(port);
console.log(`Server is working on Port: ${port}`);

export { server, port };

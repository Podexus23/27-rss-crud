import http from 'http';
import * as dotenv from 'dotenv';
import requestLog from './helpers/logger.helpers';
import sendResponse from './helpers/response.helper';

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  try {
    requestLog(req);
  } catch (err) {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
});

server.listen(port);
console.log(`Server is working on Port: ${port}`);

export { server, port };

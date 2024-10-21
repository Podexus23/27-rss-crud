import cluster from 'cluster';
import { createServer, IncomingMessage, request, ServerResponse } from 'http';
import { cpus } from 'os';
import { clusterData } from './users/usersData';
import requestLog from './helpers/logger.helper';
import urlController from './cluster/urlCluster.controller';
import sendResponse from './helpers/response.helper';
import { IUserCluster } from './users/users.interface';
import { checkNewUserData } from './helpers/checkersCluster.helper';

const PORT = 4000;
const numCPUs = cpus().length;
let currentWorker = 1;

function createWorkers() {
  for (let i = 1; i < numCPUs; i += 1) {
    const worker = cluster.fork({ PORT: PORT + i });

    // Listen for messages from workers
    worker.on('message', (message) => {
      const { type, key, value } = message;
      switch (type) {
        case 'GET_ALL':
          // Send requested data to worker
          worker.send({ type: 'RESPONSE_ALL', value: JSON.stringify(clusterData) || null });
          break;
        case 'GET':
          {
            const user = clusterData.find((e: IUserCluster) => e.key === key);

            // Send requested data to worker
            if (!user) {
              worker.send({
                type: 'NO_USER',
                key,
                value: JSON.stringify({ status: 404, data: 'User not found' }) || null,
              });
            } else {
              worker.send({ type: 'RESPONSE', key, value: JSON.stringify(user) || null });
            }
          }
          break;
        case 'POST': {
          // add new user to database
          clusterData.push(value);
          break;
        }
        case 'PUT': {
          const user = clusterData.find((e: IUserCluster) => e.key === key);
          if (!user) {
            worker.send({
              type: 'NO_USER',
              key,
              value: JSON.stringify({ status: 404, data: 'User not found' }) || null,
            });
          } else {
            const isUser = checkNewUserData(value);
            if (isUser) {
              isUser.key = key;
              clusterData.forEach((elem, j) => {
                if (elem.key === key) clusterData[j] = isUser;
              });
              worker.send({ type: 'RESPONSE', key, value: JSON.stringify(isUser) || null });
            } else {
              worker.send({
                type: 'WRONG_DATA',
                key,
                value: JSON.stringify({ status: 404, data: 'WRONG DATA' }) || null,
              });
            }
          }
          // Update the database
          clusterData[key] = value;
          break;
        }
        case 'DELETE': {
          const user = clusterData.find((e: IUserCluster) => e.key === key);
          const userIndex = clusterData.findIndex((e) => e.key === key);
          if (!user) {
            worker.send({
              type: 'NO_USER',
              key,
              value: JSON.stringify({ status: 404, data: 'User not found' }) || null,
            });
          } else {
            clusterData.splice(userIndex, 1);
            worker.send({ type: 'RESPONSE', key, value: JSON.stringify({}) || null });
          }
          // Remove from the database
          break;
        }
        default:
          break;
      }
    });
  }
}

function setLoadBalancer(req: IncomingMessage, res: ServerResponse) {
  const workerPort = PORT + currentWorker;
  console.log(`Forwarding request to worker on port ${workerPort}`);

  const proxyRequest = request(
    {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyResponse) => {
      res.writeHead(proxyResponse.statusCode || 500, proxyResponse.headers);
      proxyResponse.pipe(res, { end: true });
    },
  );

  req.pipe(proxyRequest, { end: true });
  currentWorker = currentWorker >= numCPUs - 1 ? 1 : currentWorker + 1;
}
// Shared in-memory database
// const clusterData: { [key: string]: any } = {};

if (cluster.isPrimary) {
  // Fork workers

  createWorkers();
  // Load balancer logic
  createServer(setLoadBalancer).listen(PORT, () => {
    console.log(`Load balancer listening on port ${PORT}`);
  });
} else {
  // Worker logic
  createServer((req: IncomingMessage, res: ServerResponse) => {
    try {
      requestLog(req);
      urlController(req, res);
    } catch (err) {
      sendResponse(
        res,
        500,
        'Errors on the server side that occur during the processing of a request',
      );
    }
  }).listen(process.env.PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${process.env.PORT}`);
  });
}

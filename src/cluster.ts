import cluster from 'cluster';
import {
  createServer, IncomingMessage, request, ServerResponse,
} from 'http';
import { cpus } from 'os';
import { parse } from 'url';

const PORT = 4000;
const numCPUs = cpus().length;
let currentWorker = 1;

interface MassAss {
  type: string;
  value?: string;
  key: string;
}

// Shared in-memory database
const sharedDatabase: { [key: string]: any } = {};

if (cluster.isPrimary) {
  // Fork workers
  for (let i = 1; i < numCPUs; i += 1) {
    const worker = cluster.fork({ PORT: PORT + i });

    // Listen for messages from workers
    worker.on('message', (message) => {
      const { type, key, value } = message;
      switch (type) {
        case 'GET':
          // Send requested data to worker
          worker.send({ type: 'RESPONSE', key, value: JSON.stringify(sharedDatabase) || null });
          break;
        case 'SET':
          // Update the database
          sharedDatabase[key] = value;
          break;
        case 'DELETE':
          // Remove from the database
          delete sharedDatabase[key];
          break;
        default:
          break;
      }
    });
  }

  // Load balancer logic
  createServer((req: IncomingMessage, res: ServerResponse) => {
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
  }).listen(PORT, () => {
    console.log(`Load balancer listening on port ${PORT}`);
  });
} else {
  // Worker logic
  createServer((req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req;
    const parsedUrl = parse(url || '', true);
    const path = parsedUrl.pathname || '';

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      const key = path.slice(1); // e.g., /user -> user

      if (method === 'GET') {
        // Request data from the primary process
        if (process.send) process.send({ type: 'GET', key } as MassAss);

        // Listen for the response
        process.on('message', (message: MassAss) => {
          if (message.type === 'RESPONSE' && message.key === key) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ key, value: JSON.parse(message.value as string) }));
          }
        });
      }

      if (method === 'POST') {
        // Set data in the shared database
        const value = JSON.parse(body);
        if (process.send) process.send({ type: 'SET', key, value });
        res.writeHead(201);
        res.end('Data created');
      }

      if (method === 'DELETE') {
        // Delete data from the shared database
        if (process.send) process.send({ type: 'DELETE', key });
        res.writeHead(204);
        res.end('Data deleted');
      }
    });
  }).listen(process.env.PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${process.env.PORT}`);
  });
}

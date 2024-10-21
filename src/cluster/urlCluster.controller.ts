import { IncomingMessage, ServerResponse } from 'http';
import sendResponse from '../helpers/response.helper';
import { getUser, getUsers } from './getCluster.method';
import postUser from './postCluster.method';
import updateUser from './putCluster.method';
import deleteUser from './deleteCluster.method';

const LINKS = {
  main: '/api/users',
};

export default function urlController(req: IncomingMessage, res: ServerResponse) {
  try {
    const address = req.url;
    const fixedAddress = address?.replace('$', '');
    const id = fixedAddress?.split('/')[3];

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!fixedAddress?.includes(LINKS.main) || address === '/api/users/') {
        sendResponse(res, 404, 'Sorry. Page not found');
      }

      if (req.method === 'GET') {
        if (fixedAddress === LINKS.main) getUsers(res);
        if (fixedAddress?.includes(LINKS.main) && id) getUser(res, id);
      }

      if (req.method === 'POST') {
        if (fixedAddress === LINKS.main) postUser(req, res, body);
      }

      if (req.method === 'PUT') {
        if (fixedAddress?.includes(LINKS.main) && id) updateUser(req, res, id, body);
      }

      if (req.method === 'DELETE') {
        if (fixedAddress?.includes(LINKS.main) && id) deleteUser(res, id);
      }
    });
  } catch {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

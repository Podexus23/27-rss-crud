import { IncomingMessage, ServerResponse } from 'http';
import sendResponse from '../helpers/response.helper';
import { getUser, getUsers } from '../methods/get.method';

const LINKS = {
  main: '/api/users',
};

export default function urlController(req: IncomingMessage, res: ServerResponse) {
  try {
    const address = req.url;
    const fixedAddress = address?.replace('$', '');
    const id = fixedAddress?.split('/')[3];

    if (!fixedAddress?.includes(LINKS.main) || address === '/api/users/') {
      sendResponse(res, 404, 'Sorry. Page not found');
    }

    if (req.method === 'GET') {
      if (fixedAddress === LINKS.main) getUsers(res);
      if (fixedAddress?.includes(LINKS.main) && id) getUser(res, id);
    }
  } catch {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

import { IncomingMessage, ServerResponse } from 'http';
import sendResponse from '../helpers/response.helper';

const LINKS = {
  main: '/api/users',
};

export default function urlController(req: IncomingMessage, res: ServerResponse) {
  try {
    const address = req.url;
    const fixedAddress = address?.replace('$', '');

    if (!fixedAddress?.includes(LINKS.main) || address === '/api/users/') {
      sendResponse(res, 404, 'Sorry. Page not found');
    }
  } catch {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

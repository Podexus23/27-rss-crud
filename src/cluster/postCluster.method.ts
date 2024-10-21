import { IncomingMessage, ServerResponse } from 'http';
import { v1 } from 'uuid';
import sendResponse from '../helpers/response.helper';
import { checkNewUserData } from '../helpers/checkersCluster.helper';

export default function postUser(req: IncomingMessage, res: ServerResponse, body: string) {
  try {
    const isUser = checkNewUserData(body, res);

    if (isUser) {
      isUser.key = v1();
      if (process.send) process.send({ type: 'POST', key: isUser.key, value: isUser });
      sendResponse(res, 201, isUser);
    } else {
      sendResponse(res, 400, 'Body does not contain required fields or type is wrong');
    }
  } catch {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

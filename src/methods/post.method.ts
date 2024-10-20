import { IncomingMessage, ServerResponse } from 'http';
import { v1 } from 'uuid';
import sendResponse from '../helpers/response.helper';
import userData from '../users/usersData';
import { checkNewUserData } from '../helpers/checkers.helper';

export default function postUser(req: IncomingMessage, res: ServerResponse) {
  try {
    let newUser = '';
    req.setEncoding('utf-8');

    req.on('error', (err) => err);
    req.on('data', (chunk) => {
      newUser += chunk;
    });
    req.on('end', () => {
      const isUser = checkNewUserData(newUser, res);
      if (isUser) {
        isUser.id = v1();
        userData.push(isUser);
        sendResponse(res, 201, isUser);
      } else {
        sendResponse(res, 400, 'Body does not contain required fields or type is wrong');
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

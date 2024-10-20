import { IncomingMessage, ServerResponse } from 'node:http';
import { validate } from 'uuid';
import sendResponse from '../helpers/response.helper';
import userData from '../users/usersData';
import { checkNewUserData } from '../helpers/checkers.helper';

export default function updateUser(req: IncomingMessage, res: ServerResponse, id: string) {
  try {
    if (!validate(id)) sendResponse(res, 400, 'sorry wrong ID');
    if (validate(id)) {
      const user = userData.find((e) => e.id === id);
      if (!user) sendResponse(res, 404, 'User not found');
      if (user) {
        let newUserData = '';
        req.setEncoding('utf-8');

        req.on('error', (err) => err);
        req.on('data', (chunk) => {
          newUserData += chunk;
        });
        req.on('end', () => {
          const isUser = checkNewUserData(newUserData, res);
          if (isUser) {
            isUser.id = id;
            userData.forEach((elem, i) => {
              if (elem.id === id) userData[i] = isUser;
            });
            sendResponse(res, 200, isUser);
          } else {
            sendResponse(res, 400, 'Body does not contain required fields or type is wrong');
          }
        });
      }
    }
  } catch (error) {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

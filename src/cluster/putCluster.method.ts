import { IncomingMessage, ServerResponse } from 'node:http';
import { validate } from 'uuid';
import sendResponse from '../helpers/response.helper';
import { Message } from '../users/users.interface';

export default function updateUser(
  req: IncomingMessage,
  res: ServerResponse,
  key: string,
  body: string,
) {
  try {
    if (!validate(key)) sendResponse(res, 400, 'sorry wrong ID');
    if (validate(key)) {
      if (process.send) process.send({ type: 'PUT', key, value: body });

      process.on('message', (message: Message) => {
        if (message.type === 'NO_USER') {
          sendResponse(res, 404, 'User not found');
        }
        if (message.type === 'RESPONSE') {
          sendResponse(res, 201, JSON.parse(message.value as string));
        }
        if (message.type === 'WRONG_DATA') {
          sendResponse(res, 400, 'Body does not contain required fields or type is wrong');
        }
      });
    }
  } catch (error) {
    sendResponse(
      res,
      500,
      'Errors on the server side that occur during the processing of a request',
    );
  }
}

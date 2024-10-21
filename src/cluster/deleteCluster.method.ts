import { ServerResponse } from 'http';
import { validate } from 'uuid';
import sendResponse from '../helpers/response.helper';
import { Message } from '../users/users.interface';

export default function deleteUser(res: ServerResponse, key: string) {
  try {
    if (!validate(key)) sendResponse(res, 400, 'sorry wrong ID');
    if (validate(key)) {
      if (process.send) process.send({ type: 'DELETE', key });

      process.on('message', (message: Message) => {
        if (message.type === 'NO_USER') {
          sendResponse(res, 404, 'User not found');
        }
        if (message.type === 'RESPONSE') {
          sendResponse(res, 204, JSON.parse(message.value as string));
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

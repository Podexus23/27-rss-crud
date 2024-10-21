import { ServerResponse } from 'http';
import { validate } from 'uuid';
import sendResponse from '../helpers/response.helper';
import { Message } from '../users/users.interface';

function getUsers(res: ServerResponse) {
  // sendResponse(res, 200, userData);

  if (process.send) process.send({ type: 'GET_ALL' });
  process.on('message', (message: Message) => {
    if (message.type === 'RESPONSE_ALL') {
      sendResponse(res, 200, JSON.parse(message.value as string));
    }
  });
}

function getUser(res: ServerResponse, key: string) {
  try {
    if (!validate(key)) sendResponse(res, 400, 'sorry wrong ID');
    if (validate(key)) {
      if (process.send) process.send({ type: 'GET', key });
      process.on('message', (message: Message) => {
        if (message.type === 'NO_USER') {
          sendResponse(res, 404, 'User not found');
        }
        if (message.type === 'RESPONSE') {
          sendResponse(res, 200, JSON.parse(message.value as string));
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

export { getUsers, getUser };

import { ServerResponse } from 'http';
import { validate } from 'uuid';
import userData from '../users/usersData';
import sendResponse from '../helpers/response.helper';

function getUsers(res: ServerResponse) {
  sendResponse(res, 200, userData);
}

function getUser(res: ServerResponse, id: string) {
  try {
    if (!validate(id)) sendResponse(res, 400, 'sorry wrong ID');
    if (validate(id)) {
      const user = userData.find((e) => e.id === id);
      if (!user) sendResponse(res, 404, 'User not found');
      if (user) sendResponse(res, 200, user);
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

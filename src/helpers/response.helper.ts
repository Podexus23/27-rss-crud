import { ServerResponse } from 'http';
import { IUser } from '../users/users.interface';

export default function sendResponse(
  res: ServerResponse,
  status: number,
  sendData: IUser | IUser[] | string,
) {
  res.statusCode = status;
  res.setHeader('Content-type', 'application/json');
  res.end(
    JSON.stringify({
      data: sendData,
    }),
  );
}

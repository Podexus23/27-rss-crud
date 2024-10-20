import { ServerResponse } from 'http';
import { IUser } from '../users/users.interface';

function checkURL(url: string): boolean {
  if (url.includes('/api/users')) return true;
  return false;
}

function checkNewUserData(data: string, res?: ServerResponse): IUser | false {
  try {
    const { username, age, hobbies }: IUser = JSON.parse(data);
    if (
      typeof username === 'string'
      && typeof age === 'number'
      && Array.isArray(hobbies)
      && hobbies.every((item) => typeof item === 'string')
    ) {
      return { username, age, hobbies };
    }
    return false;
  } catch (error) {
    res?.writeHead(500, { 'Content-Type': 'application/json' });
    res?.write(
      JSON.stringify({
        message: 'Errors on the server side that occur during the processing of a request',
      }),
    );
    res?.end();
    return false;
  }
}

export { checkURL, checkNewUserData };

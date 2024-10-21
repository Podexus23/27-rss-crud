import { IUser } from './users.interface';

export const userData: IUser[] = [
  {
    username: 'Tony',
    age: 23,
    hobbies: [],
    id: '7c186260-942f-11ed-b879-91858c42770e',
  },
  {
    username: 'Boo',
    age: 12,
    hobbies: ['some hobbies'],
    id: 'fbf589e0-942f-11ed-b879-91858c42770e',
  },
];

export const clusterData: { [key: string]: IUser } = {
  '7c186260-942f-11ed-b879-91858c42770e': {
    username: 'Tony',
    age: 23,
    hobbies: [],
    id: '7c186260-942f-11ed-b879-91858c42770e',
  },
};

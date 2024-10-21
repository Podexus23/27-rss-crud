export interface IUser {
  id?: string;
  username: string;
  age: number;
  hobbies: string[];
}
export interface IUserCluster {
  key?: string;
  username: string;
  age: number;
  hobbies: string[];
}

export interface Message {
  type: string;
  value?: string;
  key?: string;
}

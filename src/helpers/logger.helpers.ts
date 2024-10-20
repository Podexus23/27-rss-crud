import { IncomingMessage } from 'http';
import { EOL } from 'os';

export default function requestLog(req: IncomingMessage) {
  const message = `Method: ${req.method} ${EOL}URL: ${req.url}`;
  console.log(message);
}

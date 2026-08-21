import type { Express } from 'express';
import { createServer, Server } from 'node:http';

export interface TestServer {
  url: string;
  close: () => Promise<void>;
}

export function startTestServer(app: Express): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const server: Server = createServer(app);

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to get server address'));
        return;
      }
      const url = `http://127.0.0.1:${address.port}`;
      resolve({
        url,
        close: () =>
          new Promise<void>((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });

    server.on('error', reject);
  });
}

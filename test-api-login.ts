import { app } from './server.ts';
import http from 'http';

const server = http.createServer(app);
server.listen(8081, () => {
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      process.exit(0);
    });
  });
  req.write(JSON.stringify({ email: 'admin@example.com', password: 'admin' }));
  req.end();
});

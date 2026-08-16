import { app } from './server.ts';
import http from 'http';

const server = http.createServer(app);
server.listen(8081, () => {
  http.get('http://localhost:8081/api/platforms', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      process.exit(0);
    });
  });
});

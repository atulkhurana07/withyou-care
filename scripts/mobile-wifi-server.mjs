import net from 'node:net';
import os from 'node:os';
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Forward only the website port. Firebase emulators stay on loopback.
const privateIp = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
const addresses = () => Object.values(os.networkInterfaces()).flat()
  .filter((address) => address && address.family === 'IPv4' && !address.internal && privateIp(address.address))
  .map((address) => address.address);
const host = '0.0.0.0';
let previousAddresses = JSON.stringify(addresses());
setInterval(() => {
  const currentAddresses = addresses();
  const snapshot = JSON.stringify(currentAddresses);
  if (snapshot === previousAddresses) return;
  previousAddresses = snapshot;
  console.log('Wi-Fi changed. Update Connection settings in the app:');
  for (const ip of currentAddresses) {
    console.log(`App server address: http://${ip}:3100`);
    console.log(`Phone APK download: http://${ip}:3101/withyou-care-wifi.apk`);
  }
}, 10000).unref();
const allowedPeer = (socket) => privateIp(socket.remoteAddress || '') || socket.remoteAddress === '127.0.0.1';
const server = net.createServer((phone) => {
  if (!allowedPeer(phone)) { phone.destroy(); return; }
  const website = net.connect(3000, '127.0.0.1');
  phone.pipe(website).pipe(phone);
  phone.on('error', () => website.destroy());
  website.on('error', () => phone.destroy());
  phone.on('close', () => website.destroy());
  website.on('close', () => phone.destroy());
});
server.on('error', (error) => {
  console.error(`Wi-Fi bridge could not start: ${error.message}`);
  process.exitCode = 1;
});
server.listen(3100, host, () => {
  for (const ip of addresses()) console.log(`App server address: http://${ip}:3100`);
  console.log('Keep the local website and Firebase emulators running. Use synthetic demo data only.');
});

const apk = fileURLToPath(new URL('../output/mobile/withyou-care-wifi.apk', import.meta.url));
const downloads = http.createServer((request, response) => {
  if (!allowedPeer(request.socket)) { response.writeHead(403).end(); return; }
  if (request.url === '/health' || request.url === '/withyou-care-wifi.apk' || request.url === '/') {
    console.log(`Phone connection: ${request.socket.remoteAddress} ${request.method} ${request.url}`);
    response.on('finish', () => console.log(`Phone response: ${response.statusCode}`));
  }
  if (['GET', 'HEAD'].includes(request.method) && request.url === '/') {
    const authority = request.headers.host;
    const ip = addresses().find(ip => authority === `${ip}:3101`) || addresses()[0];
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><title>WithYou connection</title><main style="font-family:Arial;padding:24px;max-width:520px"><h1>Computer connected</h1><p>Your phone can reach WithYou.</p><p>Download the updated app and install it over the old version.</p><p><a href="/withyou-care-wifi.apk">Download WithYou APK</a></p><p>App server address: <strong>http://${ip}:3100</strong></p><p>In the app, use Connection settings if you need to change this address.</p></main>`);
    return;
  }
  if (request.method === 'GET' && request.url === '/health') {
    const probe = http.get('http://127.0.0.1:3000/api/workspace', (upstream) => {
      upstream.resume();
      const ready = upstream.statusCode === 401 || upstream.statusCode === 200;
      response.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ ready, serverAddresses: addresses().map(ip => `http://${ip}:3100`) }));
    });
    probe.setTimeout(5000, () => probe.destroy());
    probe.on('error', () => { if (!response.writableEnded) response.writeHead(503).end('{"ready":false}'); });
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method) || request.url !== '/withyou-care-wifi.apk') {
    response.writeHead(404).end('Open /withyou-care-wifi.apk to download the Android demo.');
    return;
  }
  try {
    const file = statSync(apk);
    response.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="withyou-care-wifi.apk"',
      'Content-Length': file.size,
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') response.end();
    else {
      const stream = createReadStream(apk);
      stream.on('error', () => response.destroy());
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    }
  } catch {
    response.writeHead(503).end('Build the Wi-Fi APK first.');
  }
});
downloads.on('error', (error) => console.error(`APK download server: ${error.message}`));
downloads.on('clientError', (error, socket) => {
  console.error(`Phone browser protocol error: ${error.code}. Use http://, not https://, for this local demo.`);
  socket.destroy();
});
downloads.listen(3101, host, () => {
  for (const ip of addresses()) console.log(`Phone APK download: http://${ip}:3101/withyou-care-wifi.apk`);
});

import { createHash } from 'node:crypto';

const pin = process.argv[2];

if (!pin || !/^\d+$/.test(pin)) {
  console.error('Cara pakai: npm run hash-pin 123456');
  process.exit(1);
}

const hash = createHash('sha256').update(pin, 'utf8').digest('hex');
console.log(hash);

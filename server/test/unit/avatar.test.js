import test from 'node:test';
import assert from 'node:assert/strict';
import { detectAvatarMimeType } from '../../src/utils/avatar.js';

test('detects supported profile image formats from their signatures', () => {
  assert.equal(
    detectAvatarMimeType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/png',
  );
  assert.equal(detectAvatarMimeType(Buffer.from([0xff, 0xd8, 0xff])), 'image/jpeg');
  assert.equal(detectAvatarMimeType(Buffer.from('RIFF0000WEBP')), 'image/webp');
});

test('rejects unknown and incomplete image signatures', () => {
  assert.equal(detectAvatarMimeType(Buffer.from('not an image')), null);
  assert.equal(detectAvatarMimeType(Buffer.from([0x89, 0x50, 0x4e])), null);
});

import { customAlphabet } from 'nanoid';

export const SHORT_ID_LENGTH = 10;

// https://zelark.github.io/nano-id-cc/
// ~10 years or 8M IDs needed, in order to have a 1% probability of at least one collision.
export const shortId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', SHORT_ID_LENGTH);

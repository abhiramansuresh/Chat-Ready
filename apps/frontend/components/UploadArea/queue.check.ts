// Self-check for the upload queue rules. Run: node queue.check.ts
import assert from "node:assert/strict";

import { MAX_FILES, mergeIntoQueue } from "./queue.ts";

const MAX_BYTES = 25 * 1024 * 1024;

function fakeFile(name: string, size: number): File {
  return { name, size } as File;
}

// Accepts a plain batch.
const added = mergeIntoQueue([], [fakeFile("a.pdf", 10), fakeFile("b.pdf", 20)], MAX_BYTES);
assert.deepEqual(added.files.map((file) => file.name), ["a.pdf", "b.pdf"]);
assert.equal(added.notice, null);

// Appends to an existing queue and drops exact duplicates.
const deduped = mergeIntoQueue(added.files, [fakeFile("a.pdf", 10), fakeFile("c.pdf", 30)], MAX_BYTES);
assert.deepEqual(deduped.files.map((file) => file.name), ["a.pdf", "b.pdf", "c.pdf"]);
assert.equal(deduped.notice, null, "a duplicate is silently skipped, not a warning");

// Same name at a different size is a different file.
const resized = mergeIntoQueue([fakeFile("a.pdf", 10)], [fakeFile("a.pdf", 11)], MAX_BYTES);
assert.equal(resized.files.length, 2);

// Oversized files are skipped with a reason, and do not block the rest.
const oversized = mergeIntoQueue(
  [],
  [fakeFile("huge.pdf", MAX_BYTES + 1), fakeFile("small.pdf", 10)],
  MAX_BYTES,
);
assert.deepEqual(oversized.files.map((file) => file.name), ["small.pdf"]);
assert.match(oversized.notice ?? "", /huge\.pdf.*25MB/);

// The cap holds, and the overflow is reported.
const overflowing = mergeIntoQueue(
  [],
  Array.from({ length: MAX_FILES + 3 }, (_, index) => fakeFile(`f${index}.pdf`, 10)),
  MAX_BYTES,
);
assert.equal(overflowing.files.length, MAX_FILES);
assert.match(overflowing.notice ?? "", new RegExp(`Only ${MAX_FILES} files`));

// The cap counts what is already queued, not just the new batch.
const alreadyFull = mergeIntoQueue(
  Array.from({ length: MAX_FILES }, (_, index) => fakeFile(`q${index}.pdf`, 10)),
  [fakeFile("one-more.pdf", 10)],
  MAX_BYTES,
);
assert.equal(alreadyFull.files.length, MAX_FILES);
assert.ok(alreadyFull.notice);

// Merging is pure — the caller's array is never mutated.
const original = [fakeFile("keep.pdf", 10)];
mergeIntoQueue(original, [fakeFile("new.pdf", 10)], MAX_BYTES);
assert.equal(original.length, 1);

console.log("queue.check.ts: all assertions passed");

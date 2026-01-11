import { openDB } from 'idb';
import type { FileMetadata } from './dmTypes';

const MEDIA_DB_NAME = 'nostr-dm-cache-v2'; // Same DB as message cache
const MEDIA_STORE_NAME = 'media-blobs';
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB limit

interface CachedBlob {
	id: string;
	blob: Blob;
	timestamp: number;
	size: number;
}

function getCacheKey(fileMetadata: FileMetadata): string {
	// Use hash if available (most reliable), otherwise URL + encryption params
	if (fileMetadata.hash) {
		return `decrypted:${fileMetadata.hash}`;
	}
	const urlPart = fileMetadata.url || '';
	const keyPart = fileMetadata.decryptionKey?.substring(0, 16) || '';
	return `decrypted:${urlPart}:${keyPart}`;
}

async function getDB() {
	return openDB(MEDIA_DB_NAME, 2, {
		upgrade(db, _oldVersion) {
			// Ensure message cache store exists (created by dmLib.ts)
			if (!db.objectStoreNames.contains('dm-cache')) {
				db.createObjectStore('dm-cache');
			}
			// Create media store if it doesn't exist
			if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
				const store = db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
				store.createIndex('timestamp', 'timestamp');
			}
		},
	});
}

async function getTotalCacheSize(db: Awaited<ReturnType<typeof getDB>>): Promise<number> {
	const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
	const store = tx.store;
	let total = 0;
	let cursor = await store.openCursor();

	while (cursor) {
		total += (cursor.value as CachedBlob).size;
		cursor = await cursor.continue();
	}

	await tx.done;
	return total;
}

async function evictOldest(
	db: Awaited<ReturnType<typeof getDB>>,
	bytesToFree: number
): Promise<void> {
	const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
	const store = tx.store;
	const index = store.index('timestamp');

	let freed = 0;
	let cursor = await index.openCursor();

	while (cursor && freed < bytesToFree) {
		const entry = cursor.value as CachedBlob;
		freed += entry.size;
		await cursor.delete();
		cursor = await cursor.continue();
	}

	await tx.done;
}

export async function isCached(fileMetadata: FileMetadata): Promise<boolean> {
	try {
		const db = await getDB();
		const key = getCacheKey(fileMetadata);
		const cached = await db.get(MEDIA_STORE_NAME, key);
		return !!cached;
	} catch {
		return false;
	}
}

export async function getCachedDecryptedBlob(
	fileMetadata: FileMetadata
): Promise<Blob | null> {
	try {
		const db = await getDB();
		const key = getCacheKey(fileMetadata);
		const cached = await db.get(MEDIA_STORE_NAME, key) as CachedBlob | undefined;

		if (cached) {
			// Update timestamp (mark as recently used)
			await db.put(MEDIA_STORE_NAME, { ...cached, timestamp: Date.now() });
			return cached.blob;
		}

		return null;
	} catch (error) {
		console.warn('[MediaCache] Failed to get cached blob:', error);
		return null;
	}
}

export async function cacheDecryptedBlob(
	fileMetadata: FileMetadata,
	decryptedBlob: Blob
): Promise<void> {
	try {
		const db = await getDB();
		const key = getCacheKey(fileMetadata);
		const blobSize = decryptedBlob.size;

		// Check current total size
		const totalSize = await getTotalCacheSize(db);

		// Evict oldest if adding this would exceed limit
		if (totalSize + blobSize > MAX_CACHE_SIZE) {
			const bytesToFree = totalSize + blobSize - MAX_CACHE_SIZE;
			await evictOldest(db, bytesToFree);
		}

		// Add new entry
		await db.put(MEDIA_STORE_NAME, {
			id: key,
			blob: decryptedBlob,
			timestamp: Date.now(),
			size: blobSize,
		});
	} catch (error) {
		console.warn('[MediaCache] Failed to cache blob:', error);
	}
}


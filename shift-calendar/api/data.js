import { put, head } from '@vercel/blob';

const BLOB_KEY = 'shift-calendar-data.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const blobInfo = await head(BLOB_KEY).catch(() => null);
      if (!blobInfo) return res.status(200).json({ instructors: [] });
      const response = await fetch(blobInfo.downloadUrl || blobInfo.url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({ instructors: [] });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await put(BLOB_KEY, JSON.stringify(body), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

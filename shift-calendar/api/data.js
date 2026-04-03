const BLOB_STORE_ID = 'store_nUXT5DQcVPY0JXJd';
const BLOB_FILENAME = 'shift-calendar-data.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });

  if (req.method === 'GET') {
    try {
      // Blob REST APIでファイルのURLを取得
      const listRes = await fetch(
        `https://blob.vercel-storage.com?prefix=${BLOB_FILENAME}&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const listData = await listRes.json();
      const blobs = listData.blobs || [];

      if (blobs.length === 0) {
        return res.status(200).json({ instructors: [] });
      }

      // downloadUrlからファイル内容を取得
      const fileRes = await fetch(blobs[0].downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await fileRes.json();
      return res.status(200).json(data);
    } catch (e) {
      console.error('GET error:', e);
      return res.status(200).json({ instructors: [] });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      // Blob REST APIでファイルをアップロード（上書き）
      const putRes = await fetch(
        `https://blob.vercel-storage.com/${BLOB_FILENAME}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-api-version': '7',
              'x-access': 'private',
            'x-add-random-suffix': '0',
            'x-cache-control-max-age': '0',
          },
          body,
        }
      );

      if (!putRes.ok) {
        const errText = await putRes.text();
        return res.status(500).json({ error: errText });
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

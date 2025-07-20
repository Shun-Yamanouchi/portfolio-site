const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 8080;

// データベース接続プールを作成
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fly.ioの内部ネットワークではSSLは不要ですが、外部接続の場合は必要です
  // process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : undefined
});

// 起動時にテーブルが存在するか確認し、なければ作成する
const createTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id BIGINT PRIMARY KEY,
        upload_date TIMESTAMPTZ NOT NULL,
        src TEXT NOT NULL,
        title VARCHAR(255),
        location VARCHAR(255),
        comment TEXT,
        is_best BOOLEAN DEFAULT false
      );
    `);
    console.log('Table "photos" is ready.');
  } catch (err) {
      console.error('Error creating table:', err);
  } finally {
    client.release();
  }
};
createTable();

// JSONと静的ファイルを使えるようにする設定
app.use(express.json({ limit: '10mb' })); // Base64形式の画像データは大きいため制限を緩和
app.use(express.static(path.join(__dirname, 'public')));

// --- APIエンドポイント ---

// 全ての写真を取得する
app.get('/api/photos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos');
    res.json(result.rows);
  } catch (err) {
    console.error('API GET Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 新しい写真をアップロードする
app.post('/api/photos', async (req, res) => {
  const { id, uploadDate, src, title, location, comment, isBest } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO photos (id, upload_date, src, title, location, comment, is_best) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, uploadDate, src, title, location, comment, isBest]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('API POST Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 写真を削除する
app.delete('/api/photos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM photos WHERE id = $1', [id]);
        res.status(204).send(); // 成功したがコンテンツはない
    } catch (err) {
        console.error('API DELETE Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Best 3の設定を更新する
app.put('/api/photos/:id/best', async (req, res) => {
    const { id } = req.params;
    const { isBest } = req.body;
    try {
        // 先に現在のBest3の数をチェック
        if (isBest) {
            const countResult = await pool.query('SELECT COUNT(*) FROM photos WHERE is_best = true');
            if (parseInt(countResult.rows[0].count) >= 3) {
                return res.status(400).json({ error: 'Best3は3枚までしか選択できません。' });
            }
        }
        const result = await pool.query(
            'UPDATE photos SET is_best = $1 WHERE id = $2 RETURNING *',
            [isBest, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('API PUT Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});


// どのURLにアクセスされても、index.htmlを返す設定
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
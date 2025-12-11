import { query, execute } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    // GET - Get NFC events
    if (req.method === 'GET') {
      const { limit = 10, unprocessed } = req.query;

      let sql = 'SELECT * FROM nfc_events';
      const params = [];
      let paramIndex = 1;

      if (unprocessed === 'true') {
        sql += ` WHERE processed = false`;
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
      params.push(parseInt(limit));

      const events = await query(sql, params);

      return res.json({
        success: true,
        count: events.length,
        data: events.map(e => ({
          id: e.id,
          uid: e.uid,
          event: e.event,
          deviceId: e.device_id,
          processed: e.processed,
          transactionId: e.transaction_id,
          userName: e.user_name,
          total: e.total ? parseFloat(e.total) : null,
          createdAt: e.created_at,
        })),
      });
    }

    // POST - Record NFC event
    if (req.method === 'POST') {
      const { nfc_uid, event = 'nfc_detected' } = req.body;

      if (!nfc_uid) {
        return res.status(400).json({
          success: false,
          error: 'NFC UID required',
        });
      }

      const deviceId = req.headers['x-forwarded-for'] || req.headers['x-device-id'] || 'unknown';

      await execute(
        `INSERT INTO nfc_events (uid, event, device_id) VALUES ($1, $2, $3)`,
        [nfc_uid, event, deviceId]
      );

      return res.json({
        success: true,
        message: 'NFC event recorded',
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('NFC events error:', error);
    res.status(500).json({
      success: false,
      error: 'NFC operation failed',
    });
  }
}

import { execute, queryOne } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { eventId, transactionId, userName, total } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID required',
      });
    }

    // Verify event exists
    const event = await queryOne('SELECT id FROM nfc_events WHERE id = $1', [eventId]);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'NFC event not found',
      });
    }

    // Update event
    await execute(
      `UPDATE nfc_events
       SET processed = true, transaction_id = $1, user_name = $2, total = $3
       WHERE id = $4`,
      [transactionId || null, userName || null, total || null, eventId]
    );

    res.json({
      success: true,
      message: 'NFC event marked as processed',
    });
  } catch (error) {
    console.error('NFC mark-processed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark event as processed',
    });
  }
}

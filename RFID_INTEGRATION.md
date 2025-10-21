# 🔐 RFID RC522 NFC Payment Trigger Integration Guide

Complete guide for the RFID RC522 NFC payment trigger feature in the ShopPad project.

---

## 📋 Overview

The RFID RC522 NFC payment trigger feature enables contactless checkout initiation using NFC-enabled devices (phones, cards, or tags). When a user places their NFC device near the RFID RC522 reader, the system automatically triggers a checkout confirmation dialog.

---

## ✨ Features

### Core Functionality
- ✅ **NFC Detection** - Automatic detection of NFC-enabled devices
- ✅ **Checkout Confirmation** - User-friendly dialog with Yes/No options
- ✅ **Payment Simulation** - Success/failure flow with visual feedback
- ✅ **Cart Validation** - Only triggers when cart has items
- ✅ **Event Processing** - Prevents duplicate triggers
- ✅ **Multi-language Support** - English and Arabic translations
- ✅ **Real-time Updates** - Fast response time (1-2 seconds)

### User Experience
1. User adds items to cart
2. User places NFC device near RFID RC522 reader
3. System detects NFC and shows "Are you ready to checkout?" dialog
4. User clicks "Yes" → Payment processing → Success/Failure message
5. User clicks "No" → Dialog closes, returns to shopping
6. On success: Cart clears automatically after 3 seconds

---

## 🔧 Hardware Setup

### Required Components
- **ESP32 Microcontroller** (or ESP8266)
- **RFID RC522 Module**
- **NFC-enabled cards or phones**
- **Jumper wires**

### Wiring Diagram

```
RFID RC522 → ESP32
─────────────────────
SDA (SS)   → GPIO 5
SCK        → GPIO 18
MOSI       → GPIO 23
MISO       → GPIO 19
IRQ        → Not connected
GND        → GND
RST        → GPIO 27
3.3V       → GPIO 33 (configured as power output)
```

### Pin Configuration

| RFID RC522 Pin | ESP32 Pin | Description |
|----------------|-----------|-------------|
| SDA (SS)       | GPIO 5    | Chip Select |
| SCK            | GPIO 18   | SPI Clock   |
| MOSI           | GPIO 23   | Master Out  |
| MISO           | GPIO 19   | Master In   |
| RST            | GPIO 27   | Reset       |
| GND            | GND       | Ground      |
| 3.3V           | **GPIO 33** | **Power (3.3V output)** |

**Important Notes:**
- **GPIO 33 is configured as an OUTPUT pin set to HIGH (3.3V)** to serve as a dedicated power supply for the RFID module
- This is a workaround for ESP32 boards with limited dedicated 3.3V power pins
- GPIO 33 is set to HIGH during the setup phase before RFID initialization
- Make sure to use 3.3V logic levels, NOT 5V, as the RFID RC522 module is not 5V tolerant
- GPIO 33 can safely provide enough current for the RFID RC522 module (typical consumption: 13-26mA)

---

## 💻 Software Setup

### ESP32 Firmware

#### Required Libraries
Install the following library in Arduino IDE:
- **MFRC522** by GithubCommunity (v1.4.10 or later)

#### Installation Steps
1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Search for "MFRC522"
4. Install the library by GithubCommunity
5. Upload the updated firmware to ESP32

#### Configuration
The firmware is already configured in `sketch_oct19a/ESP32-We/ESP32-We.ino`:
- NFC check interval: 500ms
- SPI pins: Default ESP32 SPI pins
- Server endpoint: `/nfc`

### Backend Server

The server automatically handles NFC events with three new endpoints:
- `POST /nfc` - Receive NFC events from ESP32
- `GET /nfc` - Retrieve recent NFC events
- `POST /nfc/mark-processed` - Mark events as processed

No additional configuration required.

### Frontend

The frontend automatically polls for NFC events and displays the checkout dialog.

**Configuration options in `src/pages/Shopping.tsx`:**
```typescript
const { nfcEvent, markAsProcessed } = useNFCDetection({
  enabled: true,           // Enable/disable NFC detection
  pollInterval: 1000,      // Polling interval in ms (default: 1000)
  onNFCDetected: (event) => {
    // Custom callback when NFC is detected
  },
});
```

---

## 🎯 Usage

### For Customers

1. **Add items to cart** - Browse and add products
2. **Tap NFC device** - Place your NFC-enabled phone or card near the reader
3. **Confirm checkout** - Click "Yes" when asked "Are you ready to checkout?"
4. **Wait for confirmation** - See "Payment Successful" or "Payment Failed" message
5. **Complete** - Cart clears automatically on success

### For Developers

#### Testing NFC Detection

**Using NFC Cards:**
```bash
# Place any NFC card (MIFARE Classic, NTAG, etc.) near the reader
# The ESP32 will detect it and send the UID to the server
```

**Using NFC-enabled Phones:**
```bash
# Enable NFC on your phone (Settings → NFC)
# Place the back of your phone near the reader
# The system will detect the phone's NFC chip
```

#### Monitoring NFC Events

**ESP32 Serial Monitor:**
```
🔔 NFC CARD DETECTED!
   UID: A1B2C3D4
✅ NFC event sent to server
```

**Server Logs:**
```
NFC event received { uid: 'A1B2C3D4', event: 'nfc_detected' }
```

**Frontend Console:**
```
NFC detected: { uid: 'A1B2C3D4', timestamp: '2025-10-21T...' }
```

---

## 🔄 Data Flow

```
┌─────────────┐
│  NFC Card   │
│  or Phone   │
└──────┬──────┘
       │ (Place near reader)
       ▼
┌─────────────┐
│ RFID RC522  │
│   Module    │
└──────┬──────┘
       │ (SPI Communication)
       ▼
┌─────────────┐
│    ESP32    │
│  Firmware   │
└──────┬──────┘
       │ (HTTPS POST /nfc)
       ▼
┌─────────────┐
│   Backend   │
│   Server    │
└──────┬──────┘
       │ (GET /nfc polling)
       ▼
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │ (Display dialog)
       ▼
┌─────────────┐
│    User     │
│  Confirms   │
└─────────────┘
```

---

## 📊 API Reference

### ESP32 → Server

**Endpoint:** `POST /nfc`

**Request:**
```json
{
  "nfc_uid": "A1B2C3D4",
  "event": "nfc_detected",
  "timestamp": 123456
}
```

**Response:**
```json
{
  "success": true,
  "message": "NFC event received",
  "uid": "A1B2C3D4",
  "timestamp": "2025-10-21T12:34:56.789Z"
}
```

### Frontend → Server

**Get NFC Events**

**Endpoint:** `GET /nfc?unprocessed=true&limit=1`

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "uid": "A1B2C3D4",
      "event": "nfc_detected",
      "timestamp": "2025-10-21T12:34:56.789Z",
      "deviceId": "192.168.1.100",
      "processed": false
    }
  ]
}
```

**Mark Event as Processed**

**Endpoint:** `POST /nfc/mark-processed`

**Request:**
```json
{
  "uid": "A1B2C3D4",
  "timestamp": "2025-10-21T12:34:56.789Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event marked as processed"
}
```

---

## 🎨 UI Components

### NFCCheckoutDialog

**Props:**
```typescript
interface NFCCheckoutDialogProps {
  isOpen: boolean;              // Show checkout confirmation
  onConfirm: () => void;        // Called when user clicks "Yes"
  onCancel: () => void;         // Called when user clicks "No"
  showSuccess?: boolean;        // Show success dialog
  showFailure?: boolean;        // Show failure dialog
  onSuccessClose?: () => void;  // Called when success dialog closes
  onFailureClose?: () => void;  // Called when failure dialog closes
}
```

**Usage:**
```typescript
<NFCCheckoutDialog
  isOpen={showCheckoutDialog}
  onConfirm={handleCheckoutConfirm}
  onCancel={handleCheckoutCancel}
  showSuccess={showSuccessDialog}
  showFailure={showFailureDialog}
  onFailureClose={handleFailureClose}
/>
```

---

## 🔍 Troubleshooting

### ESP32 Issues

**Problem:** RFID RC522 initialization failed
**Solution:**
- Check wiring connections
- Verify 3.3V power supply (NOT 5V)
- Ensure SPI pins are correctly connected
- Try different GPIO pins if needed

**Problem:** NFC card not detected
**Solution:**
- Place card closer to the reader (< 3cm)
- Ensure card is NFC-compatible (MIFARE, NTAG, etc.)
- Check if RFID module LED is blinking
- Verify firmware is uploaded correctly

### Server Issues

**Problem:** NFC events not received
**Solution:**
- Check ESP32 WiFi connection
- Verify server is running
- Check firewall settings
- Review server logs for errors

### Frontend Issues

**Problem:** Checkout dialog not appearing
**Solution:**
- Check browser console for errors
- Verify NFC detection hook is enabled
- Ensure cart has items
- Check network tab for API calls

---

## 🚀 Future Enhancements

- [ ] Real payment gateway integration
- [ ] Multiple payment methods support
- [ ] Transaction history logging
- [ ] Receipt generation
- [ ] Email/SMS notifications
- [ ] Loyalty card integration
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard for NFC events

---

## 📝 Notes

- **Security:** NFC UID is transmitted over HTTPS
- **Privacy:** No sensitive payment data is stored
- **Performance:** Detection latency < 500ms
- **Compatibility:** Works with most NFC cards and phones
- **Scalability:** Supports multiple ESP32 devices

---

## 📚 Related Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [QR_CODE_INTEGRATION.md](QR_CODE_INTEGRATION.md) - QR code scanner
- [BARCODE_INTEGRATION.md](BARCODE_INTEGRATION.md) - Barcode scanner
- [README.md](README.md) - Project overview

---

**Version:** 1.6.0  
**Last Updated:** 2025-10-21  
**Author:** ShopPad Team


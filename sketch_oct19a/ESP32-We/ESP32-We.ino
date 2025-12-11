/**
 * ESP32/ESP8266 Weight Sensor with HTTPS Communication and RFID RC522 NFC Auto-Payment
 *
 * Hardware:
 * - ESP32 or ESP8266 board
 * - HX711 Load Cell Amplifier
 * - Load Cell (weight sensor)
 * - RFID RC522 Module (NFC reader)
 *
 * Features:
 * - WiFi connectivity with auto-reconnection
 * - HTTPS communication with server
 * - Real-time weight data transmission (100ms interval)
 * - RFID RC522 NFC detection for AUTO-PAYMENT trigger
 * - Raw numeric weight data
 * - Error handling and recovery
 * - Status monitoring via Serial
 *
 * Payment Methods:
 * 1. NFC Card: Tap NFC card to auto-pay (card must be linked to user account)
 * 2. Phone: User can pay manually via phone app
 *
 * Author: ShopPad Team
 * Version: 2.0.0
 * Date: 2025-12-11
 */

#include <HX711.h>
#include <SPI.h>
#include <MFRC522.h>

// Determine board type and include appropriate libraries
#if defined(ESP32)
  #include <WiFi.h>
  #include <WiFiClientSecure.h>
  #define BOARD_TYPE "ESP32"
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
  #include <WiFiClientSecure.h>
  #define BOARD_TYPE "ESP8266"
#else
  #error "This code is designed for ESP32 or ESP8266 only"
#endif

#include <ArduinoJson.h>

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

// WiFi credentials
const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration - PRODUCTION (DigitalOcean Droplet)
const char* SERVER_HOST = "138.68.137.154";  // Your DigitalOcean Droplet IP
const int SERVER_PORT = 5050;
const char* SERVER_ENDPOINT = "/weight";

// HX711 pins
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;

// RFID RC522 pins (SPI)
const int RFID_SS_PIN = 5;     // SDA/SS pin
const int RFID_RST_PIN = 27;   // RST pin
const int RFID_VCC_PIN = 33;   // Power supply pin (3.3V output)
// SPI pins (default for ESP32):
// MOSI = GPIO 23
// MISO = GPIO 19
// SCK = GPIO 18

// Timing configuration - REAL-TIME MODE
const unsigned long SEND_INTERVAL = 100;  // 0.1 seconds (100ms) for near real-time
const unsigned long WIFI_RETRY_INTERVAL = 5000;  // 5 seconds
const unsigned long NFC_CHECK_INTERVAL = 500;  // Check for NFC every 500ms

// Weight sensor calibration
// NEGATIVE value because load cell is reading inverted
// Based on: -0.54 kg reading for actual 445g (0.445 kg)
// Ratio: 0.54 / 0.445 = 1.213
// New factor: -3268.3 / 1.213 = -2694
const float CALIBRATION_FACTOR = -2694.0;  // Negative to invert the reading
// NOTE: Fine-tune this value if readings are still off
// If reading too high: decrease this number (more negative)
// If reading too low: increase this number (less negative)

// ============================================================================
// GLOBAL OBJECTS
// ============================================================================

HX711 scale;
MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
WiFiClientSecure client;
unsigned long lastSendTime = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastNFCCheck = 0;
int reconnectAttempts = 0;
bool nfcDetected = false;
String lastNFCUID = "";

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

void connectToWiFi();
bool sendWeightData(float weight);
bool sendNFCPayment(String uid);
bool sendNFCEvent(String uid);
float getWeight();
void printStatus();
void checkNFC();
String getNFCUID();

// ============================================================================
// SETUP
// ============================================================================

void setup() {
  // Initialize Serial
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║   ESP32/ESP8266 Weight Sensor + NFC Auto-Payment      ║");
  Serial.println("║   Version: 2.0.0                                       ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  Serial.println();
  Serial.print("Board Type: ");
  Serial.println(BOARD_TYPE);
  Serial.println();
  Serial.println("Payment Methods:");
  Serial.println("  1. NFC Card: Tap to auto-pay (requires linked account)");
  Serial.println("  2. Phone App: Manual payment via smartphone");
  Serial.println();

  // Configure GPIO 33 as power supply for RFID module
  Serial.println("🔧 Configuring GPIO 33 as RFID power supply...");
  pinMode(RFID_VCC_PIN, OUTPUT);
  digitalWrite(RFID_VCC_PIN, HIGH);  // Set to 3.3V
  delay(100);  // Allow power to stabilize
  Serial.println("✅ GPIO 33 set to HIGH (3.3V) for RFID power");

  // Initialize SPI for RFID
  Serial.println("🔧 Initializing SPI for RFID...");
  SPI.begin();

  // Initialize RFID RC522
  Serial.println("🔧 Initializing RFID RC522...");
  rfid.PCD_Init();
  delay(100);

  // Check RFID module
  byte version = rfid.PCD_ReadRegister(rfid.VersionReg);
  if (version == 0x00 || version == 0xFF) {
    Serial.println("❌ RFID RC522 initialization failed!");
    Serial.println("   Check wiring and connections");
  } else {
    Serial.println("✅ RFID RC522 initialized successfully");
    Serial.print("   Firmware Version: 0x");
    Serial.println(version, HEX);
  }

  // Initialize HX711
  Serial.println("🔧 Initializing HX711 load cell...");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  if (scale.wait_ready_timeout(1000)) {
    Serial.println("✅ HX711 initialized successfully");
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare();  // Reset to zero
    Serial.println("✅ Scale tared (zeroed)");
  } else {
    Serial.println("❌ HX711 initialization failed!");
    Serial.println("   Check wiring and connections");
  }

  // Configure WiFi client for HTTPS
  #if defined(ESP32)
    client.setInsecure();  // Skip certificate validation (for development)
  #elif defined(ESP8266)
    client.setInsecure();  // Skip certificate validation (for development)
  #endif

  // Connect to WiFi
  connectToWiFi();

  Serial.println("\n✅ Setup complete!");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println();
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
  unsigned long currentTime = millis();

  // Check WiFi connection periodically
  if (currentTime - lastWiFiCheck >= WIFI_RETRY_INTERVAL) {
    lastWiFiCheck = currentTime;

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️  WiFi disconnected! Attempting to reconnect...");
      connectToWiFi();
    }
  }

  // Check for NFC detection at specified interval
  if (currentTime - lastNFCCheck >= NFC_CHECK_INTERVAL) {
    lastNFCCheck = currentTime;
    checkNFC();
  }

  // Send weight data at specified interval
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;

    if (WiFi.status() == WL_CONNECTED) {
      // Get weight reading
      float weight = getWeight();

      // Send to server
      bool success = sendWeightData(weight);

      if (success) {
        reconnectAttempts = 0;  // Reset reconnect counter on success
      } else {
        reconnectAttempts++;
        Serial.print("⚠️  Failed to send data. Attempt: ");
        Serial.println(reconnectAttempts);
      }
    } else {
      Serial.println("❌ Cannot send data - WiFi not connected");
    }

    printStatus();
  }

  // Small delay to prevent watchdog issues
  delay(10);
}

// ============================================================================
// WIFI CONNECTION
// ============================================================================

void connectToWiFi() {
  Serial.println("📡 Connecting to WiFi...");
  Serial.print("   SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected successfully!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    reconnectAttempts = 0;
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.println("   Will retry in 5 seconds...");
  }
}

// ============================================================================
// WEIGHT READING
// ============================================================================

float getWeight() {
  if (scale.wait_ready_timeout(100)) {  // Reduced timeout for real-time
    float weight = scale.get_units(3);  // Reduced from 10 to 3 readings for speed

    // Round to 2 decimal places
    weight = round(weight * 100.0) / 100.0;

    return weight;
  } else {
    // Don't print error in real-time mode (too much spam)
    return 0.0;
  }
}

// ============================================================================
// HTTPS COMMUNICATION
// ============================================================================

bool sendWeightData(float weight) {
  // Reduced logging for real-time mode (only print weight)
  Serial.print("📤 ");
  Serial.print(weight, 2);
  Serial.print(" kg");

  // Check if connection is still alive, reconnect if needed
  if (!client.connected()) {
    Serial.print(" [Reconnecting...] ");
    if (!client.connect(SERVER_HOST, SERVER_PORT)) {
      Serial.println(" ❌ Failed!");
      return false;
    }
    Serial.print(" ✅ ");
  }

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["weight"] = weight;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Build HTTP POST request with keep-alive for faster subsequent requests
  String request = String("POST ") + SERVER_ENDPOINT + " HTTP/1.1\r\n" +
                   "Host: " + SERVER_HOST + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "Content-Length: " + jsonPayload.length() + "\r\n" +
                   "Connection: keep-alive\r\n\r\n" +
                   jsonPayload;

  // Send request
  client.print(request);

  // Wait for response (reduced timeout for real-time)
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 1000) {  // Reduced from 5000ms to 1000ms
      Serial.println(" ❌ Timeout!");
      client.stop();
      return false;
    }
    delay(1);  // Reduced delay
  }

  // Read response quickly
  bool success = false;
  while (client.available()) {
    String line = client.readStringUntil('\n');
    // Check for success in response
    if (line.indexOf("\"success\":true") > 0 || line.indexOf("\"success\": true") > 0) {
      success = true;
    }
  }

  // Don't close connection - keep it alive for next request
  // client.stop();  // COMMENTED OUT for keep-alive

  if (success) {
    Serial.println(" ✅");
  } else {
    Serial.println(" ⚠️");
  }

  return success;
}

// ============================================================================
// STATUS DISPLAY
// ============================================================================

void printStatus() {
  Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("📊 Status Report");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  Serial.print("WiFi: ");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("✅ Connected (");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm)");
  } else {
    Serial.println("❌ Disconnected");
  }

  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");

  // Fixed timer calculation to prevent overflow
  unsigned long currentTime = millis();
  unsigned long timeSinceLastSend = currentTime - lastSendTime;
  if (timeSinceLastSend < SEND_INTERVAL) {
    Serial.print("Next send in: ");
    Serial.print((SEND_INTERVAL - timeSinceLastSend) / 1000.0, 1);
    Serial.println(" seconds");
  } else {
    Serial.println("Next send: Now");
  }

  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ============================================================================
// NFC DETECTION AND AUTO-PAYMENT
// ============================================================================

void checkNFC() {
  // Reset the loop if no new card present on the sensor/reader
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Verify if the NUID has been read
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Get the UID
  String uid = getNFCUID();

  // Check if this is a new card (different from last detected)
  if (uid != lastNFCUID) {
    lastNFCUID = uid;
    nfcDetected = true;

    Serial.println("\n╔════════════════════════════════════════════════════════╗");
    Serial.println("║              💳 NFC CARD DETECTED                       ║");
    Serial.println("╚════════════════════════════════════════════════════════╝");
    Serial.print("   UID: ");
    Serial.println(uid);
    Serial.println("   Triggering auto-payment...");

    // Trigger auto-payment
    if (WiFi.status() == WL_CONNECTED) {
      bool paymentSuccess = sendNFCPayment(uid);

      if (paymentSuccess) {
        Serial.println("╔════════════════════════════════════════════════════════╗");
        Serial.println("║         ✅ PAYMENT SUCCESSFUL!                         ║");
        Serial.println("╚════════════════════════════════════════════════════════╝");
      } else {
        Serial.println("⚠️  Payment failed or card not linked");
        Serial.println("   Falling back to notification mode...");
        // Send as regular NFC event for frontend handling
        sendNFCEvent(uid);
      }
    } else {
      Serial.println("❌ Cannot process payment - WiFi not connected");
    }
  }

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
}

String getNFCUID() {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

// ============================================================================
// SEND NFC PAYMENT (AUTO-PAYMENT)
// ============================================================================

bool sendNFCPayment(String uid) {
  Serial.print("💳 Sending NFC payment request... ");

  // Check if connection is still alive, reconnect if needed
  if (!client.connected()) {
    Serial.print(" [Reconnecting...] ");
    if (!client.connect(SERVER_HOST, SERVER_PORT)) {
      Serial.println(" ❌ Connection failed!");
      return false;
    }
    Serial.print(" ✅ ");
  }

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["nfc_uid"] = uid;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Build HTTP POST request to NFC payment endpoint
  String request = String("POST /nfc/payment HTTP/1.1\r\n") +
                   "Host: " + SERVER_HOST + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "Content-Length: " + jsonPayload.length() + "\r\n" +
                   "Connection: keep-alive\r\n\r\n" +
                   jsonPayload;

  // Send request
  client.print(request);

  // Wait for response with timeout
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 3000) {  // 3 second timeout for payment
      Serial.println(" ❌ Timeout!");
      return false;
    }
    delay(10);
  }

  // Read and parse response
  bool success = false;
  String statusLine = "";
  String responseBody = "";
  bool readingHeaders = true;
  int contentLength = 0;

  // Read status line
  statusLine = client.readStringUntil('\n');

  // Check HTTP status code
  if (statusLine.indexOf("200") > 0) {
    success = true;
    Serial.println(" ✅ Payment processed!");
  } else if (statusLine.indexOf("402") > 0) {
    Serial.println(" ⚠️ Payment failed!");
  } else if (statusLine.indexOf("404") > 0) {
    Serial.println(" ⚠️ Card not linked!");
  } else if (statusLine.indexOf("400") > 0) {
    Serial.println(" ⚠️ Cart empty or invalid request!");
  } else {
    Serial.print(" ❌ HTTP Error: ");
    Serial.println(statusLine);
  }

  // Read remaining response headers and body
  while (client.available()) {
    String line = client.readStringUntil('\n');
    // Look for success in response body
    if (line.indexOf("\"success\":true") > 0 || line.indexOf("\"success\": true") > 0) {
      success = true;
    }
    // Print payment details if found
    if (line.indexOf("\"total\":") > 0) {
      Serial.println("   " + line);
    }
    if (line.indexOf("\"userName\":") > 0) {
      Serial.println("   " + line);
    }
  }

  return success;
}

// ============================================================================
// SEND NFC EVENT (FALLBACK NOTIFICATION)
// ============================================================================

bool sendNFCEvent(String uid) {
  Serial.print("📤 Sending NFC notification... ");

  // Check if connection is still alive, reconnect if needed
  if (!client.connected()) {
    Serial.print(" [Reconnecting...] ");
    if (!client.connect(SERVER_HOST, SERVER_PORT)) {
      Serial.println(" ❌ Failed!");
      return false;
    }
    Serial.print(" ✅ ");
  }

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["nfc_uid"] = uid;
  doc["event"] = "nfc_detected";
  doc["timestamp"] = millis();

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Build HTTP POST request with keep-alive
  String request = String("POST /nfc HTTP/1.1\r\n") +
                   "Host: " + SERVER_HOST + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "Content-Length: " + jsonPayload.length() + "\r\n" +
                   "Connection: keep-alive\r\n\r\n" +
                   jsonPayload;

  // Send request
  client.print(request);

  // Wait for response with timeout
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 1000) {  // 1 second timeout
      Serial.println(" ❌ Timeout!");
      return false;
    }
    delay(1);
  }

  // Read response status line
  String statusLine = client.readStringUntil('\n');
  bool success = statusLine.indexOf("200") > 0 || statusLine.indexOf("201") > 0;

  // Discard remaining response
  while (client.available()) {
    client.read();
  }

  if (success) {
    Serial.println(" ✅");
  } else {
    Serial.print(" ❌ Server error: ");
    Serial.println(statusLine);
  }

  return success;
}


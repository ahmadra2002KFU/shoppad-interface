/**
 * ESP32/ESP8266 Weight Sensor with HTTPS Communication
 *
 * Hardware:
 * - ESP32 or ESP8266 board
 * - HX711 Load Cell Amplifier
 * - Load Cell (weight sensor)
 *
 * Features:
 * - WiFi connectivity with auto-reconnection
 * - HTTPS communication with server
 * - 10-second data transmission interval
 * - Raw numeric weight data
 * - Error handling and recovery
 * - Status monitoring via Serial
 *
 * Author: ShopPad Team
 * Version: 1.0.0
 * Date: 2025-10-20
 */

#include <HX711.h>

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

// Timing configuration - REAL-TIME MODE
const unsigned long SEND_INTERVAL = 100;  // 0.1 seconds (100ms) for near real-time
const unsigned long WIFI_RETRY_INTERVAL = 5000;  // 5 seconds

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
WiFiClientSecure client;
unsigned long lastSendTime = 0;
unsigned long lastWiFiCheck = 0;
int reconnectAttempts = 0;

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

void connectToWiFi();
bool sendWeightData(float weight);
float getWeight();
void printStatus();

// ============================================================================
// SETUP
// ============================================================================

void setup() {
  // Initialize Serial
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║   ESP32/ESP8266 Weight Sensor - HTTPS Client          ║");
  Serial.println("║   Version: 1.0.0                                       ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  Serial.println();
  Serial.print("Board Type: ");
  Serial.println(BOARD_TYPE);
  Serial.println();

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


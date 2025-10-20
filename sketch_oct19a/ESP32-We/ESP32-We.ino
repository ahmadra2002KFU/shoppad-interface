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

// Server configuration
const char* SERVER_HOST = "10.232.200.83";  // Your laptop's IP address
const int SERVER_PORT = 5050;
const char* SERVER_ENDPOINT = "/weight";

// HX711 pins
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;

// Timing configuration
const unsigned long SEND_INTERVAL = 10000;  // 10 seconds in milliseconds
const unsigned long WIFI_RETRY_INTERVAL = 5000;  // 5 seconds

// Weight sensor calibration
const float CALIBRATION_FACTOR = 10.0;  // Adjust based on your calibration

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
  if (scale.wait_ready_timeout(1000)) {
    float weight = scale.get_units(10);  // Average of 10 readings

    // Round to 2 decimal places
    weight = round(weight * 100.0) / 100.0;

    return weight;
  } else {
    Serial.println("❌ HX711 not ready!");
    return 0.0;
  }
}

// ============================================================================
// HTTPS COMMUNICATION
// ============================================================================

bool sendWeightData(float weight) {
  Serial.println("\n📤 Sending weight data to server...");
  Serial.print("   Weight: ");
  Serial.print(weight, 2);
  Serial.println(" kg");

  // Connect to server
  Serial.print("   Connecting to ");
  Serial.print(SERVER_HOST);
  Serial.print(":");
  Serial.print(SERVER_PORT);
  Serial.println("...");

  if (!client.connect(SERVER_HOST, SERVER_PORT)) {
    Serial.println("❌ Connection to server failed!");
    return false;
  }

  Serial.println("✅ Connected to server");

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["weight"] = weight;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Build HTTP POST request
  String request = String("POST ") + SERVER_ENDPOINT + " HTTP/1.1\r\n" +
                   "Host: " + SERVER_HOST + "\r\n" +
                   "Content-Type: application/json\r\n" +
                   "Content-Length: " + jsonPayload.length() + "\r\n" +
                   "Connection: close\r\n\r\n" +
                   jsonPayload;

  // Send request
  client.print(request);
  Serial.println("   Request sent");

  // Wait for response
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 5000) {
      Serial.println("❌ Server response timeout!");
      client.stop();
      return false;
    }
    delay(10);
  }

  // Read response
  bool success = false;
  String response = "";

  while (client.available()) {
    String line = client.readStringUntil('\n');
    response += line + "\n";

    // Check for success in response
    if (line.indexOf("\"success\":true") > 0 || line.indexOf("\"success\": true") > 0) {
      success = true;
    }
  }

  client.stop();

  if (success) {
    Serial.println("✅ Data sent successfully!");
  } else {
    Serial.println("⚠️  Server returned error or unexpected response");
    Serial.println("   Response preview:");
    Serial.println(response.substring(0, 200));
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

  Serial.print("Next send in: ");
  Serial.print((SEND_INTERVAL - (millis() - lastSendTime)) / 1000);
  Serial.println(" seconds");

  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}


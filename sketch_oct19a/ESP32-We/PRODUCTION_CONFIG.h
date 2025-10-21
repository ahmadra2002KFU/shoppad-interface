/**
 * Production Configuration for ESP32/ESP8266
 * 
 * This file contains the configuration for connecting to a production server
 * on DigitalOcean or other cloud platforms.
 * 
 * INSTRUCTIONS:
 * 1. Copy the relevant section below
 * 2. Update ESP32-We.ino with these values
 * 3. Upload to your ESP32/ESP8266
 */

// ============================================
// OPTION 1: Using Domain Name (Recommended)
// ============================================
// Use this if you have a domain name pointing to your DigitalOcean Droplet

const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration with domain
const char* SERVER_HOST = "shoppad.yourdomain.com";  // CHANGE THIS to your domain
const int SERVER_PORT = 443;  // Standard HTTPS port (if using Nginx)
const char* SERVER_ENDPOINT = "/weight";

// SSL Configuration
// With Let's Encrypt certificate, ESP32 can validate the certificate
// No need for client.setInsecure()


// ============================================
// OPTION 2: Using IP Address (Direct Connection)
// ============================================
// Use this if connecting directly to Droplet IP without domain

const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration with IP
const char* SERVER_HOST = "138.68.137.154";  // Your DigitalOcean Droplet IP  
const int SERVER_PORT = 5050;  // Direct connection to Node.js server
const char* SERVER_ENDPOINT = "/weight";

// SSL Configuration
// With self-signed certificate, ESP32 needs to skip validation
// Add this in setup() function:
// client.setInsecure();  // Skip SSL certificate validation


// ============================================
// OPTION 3: Using Nginx Reverse Proxy
// ============================================
// Use this if you configured Nginx as reverse proxy

const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration with Nginx
const char* SERVER_HOST = "shoppad.yourdomain.com";  // Your domain
const int SERVER_PORT = 443;  // Nginx HTTPS port
const char* SERVER_ENDPOINT = "/weight";

// SSL Configuration
// Nginx handles SSL, ESP32 connects to Nginx
// With Let's Encrypt, no need for client.setInsecure()


// ============================================
// COMPLETE EXAMPLE CODE
// ============================================

/*
// WiFi credentials
const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration - PRODUCTION
const char* SERVER_HOST = "shoppad.yourdomain.com";  // Your DigitalOcean domain
const int SERVER_PORT = 443;  // Standard HTTPS port
const char* SERVER_ENDPOINT = "/weight";

// In setup() function:
void setup() {
  Serial.begin(115200);
  
  // Initialize HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  
  // SSL Configuration
  // If using Let's Encrypt (with domain):
  // No additional configuration needed
  
  // If using self-signed certificate (with IP):
  // client.setInsecure();  // Uncomment this line
}

// In loop() function:
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    if (scale.is_ready()) {
      float weight = scale.get_units(10);
      
      // Send to server
      WiFiClientSecure client;
      HTTPClient http;
      
      // If using self-signed certificate:
      // client.setInsecure();
      
      String url = String("https://") + SERVER_HOST + ":" + SERVER_PORT + SERVER_ENDPOINT;
      http.begin(client, url);
      http.addHeader("Content-Type", "application/json");
      
      String payload = "{\"weight\":" + String(weight, 2) + "}";
      int httpCode = http.POST(payload);
      
      if (httpCode > 0) {
        Serial.printf("HTTP Response: %d\n", httpCode);
      } else {
        Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
      }
      
      http.end();
    }
  }
  
  delay(10000);  // Send every 10 seconds
}
*/


// ============================================
// TROUBLESHOOTING
// ============================================

/*
ISSUE: ESP32 cannot connect to server
SOLUTION:
1. Check SERVER_HOST is correct (domain or IP)
2. Check SERVER_PORT is correct (443 for Nginx, 5050 for direct)
3. Check firewall allows incoming connections
4. Check server is running: curl https://your-domain.com/status

ISSUE: SSL certificate error
SOLUTION:
1. If using domain with Let's Encrypt: Certificate should work automatically
2. If using IP with self-signed: Add client.setInsecure() in setup()
3. Check certificate is valid: openssl s_client -connect your-domain.com:443

ISSUE: HTTP 400 Bad Request
SOLUTION:
1. Check JSON payload format: {"weight": 12.34}
2. Check Content-Type header is set to application/json
3. Check weight value is within range (0-1000 kg)

ISSUE: HTTP 403 Forbidden
SOLUTION:
1. Check CORS configuration on server
2. Check firewall rules
3. Check rate limiting settings

ISSUE: Connection timeout
SOLUTION:
1. Check WiFi connection is stable
2. Check server is reachable: ping your-domain.com
3. Increase timeout in HTTPClient
4. Check DNS resolution
*/


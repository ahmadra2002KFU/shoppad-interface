# PowerShell script to generate self-signed SSL certificates for Windows
# This script uses PowerShell's built-in certificate generation (no OpenSSL required)

Write-Host "`n🔐 Generating SSL certificates for HTTPS server (Windows)...`n" -ForegroundColor Cyan

$sslDir = Join-Path $PSScriptRoot "ssl"
$certPath = Join-Path $sslDir "cert.pem"
$keyPath = Join-Path $sslDir "key.pem"

# Create ssl directory if it doesn't exist
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir | Out-Null
    Write-Host "✅ Created ssl directory" -ForegroundColor Green
}

# Check if certificates already exist
if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    Write-Host "⚠️  SSL certificates already exist!" -ForegroundColor Yellow
    Write-Host "   Key:  $keyPath" -ForegroundColor Gray
    Write-Host "   Cert: $certPath" -ForegroundColor Gray
    Write-Host "`nTo regenerate, delete the existing files and run this script again.`n" -ForegroundColor Gray
    exit 0
}

try {
    Write-Host "Generating self-signed certificate...`n" -ForegroundColor Cyan

    # Generate self-signed certificate
    $cert = New-SelfSignedCertificate `
        -Subject "CN=localhost" `
        -DnsName "localhost", "127.0.0.1" `
        -KeyAlgorithm RSA `
        -KeyLength 4096 `
        -NotBefore (Get-Date) `
        -NotAfter (Get-Date).AddYears(1) `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -FriendlyName "ShopPad Development Certificate" `
        -HashAlgorithm SHA256 `
        -KeyUsage DigitalSignature, KeyEncipherment `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

    # Export certificate to PEM format
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certPem = "-----BEGIN CERTIFICATE-----`n"
    $certPem += [System.Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $certPem += "`n-----END CERTIFICATE-----`n"
    [System.IO.File]::WriteAllText($certPath, $certPem)

    # Export private key
    # Note: PowerShell doesn't directly export private keys to PEM format
    # We'll use a workaround with PKCS12
    $password = ConvertTo-SecureString -String "temp" -Force -AsPlainText
    $pfxPath = Join-Path $sslDir "temp.pfx"
    
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null
    
    # Convert PFX to PEM using .NET
    $pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, $password, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
    $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfx)
    $keyBytes = $rsa.ExportRSAPrivateKey()
    
    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n"
    $keyPem += [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $keyPem += "`n-----END RSA PRIVATE KEY-----`n"
    [System.IO.File]::WriteAllText($keyPath, $keyPem)

    # Clean up
    Remove-Item $pfxPath -Force
    Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force

    Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
    Write-Host "   Key:  $keyPath" -ForegroundColor Gray
    Write-Host "   Cert: $certPath" -ForegroundColor Gray
    Write-Host "`n📝 Note: These are self-signed certificates for development only." -ForegroundColor Yellow
    Write-Host "   For production, use certificates from a trusted CA.`n" -ForegroundColor Yellow
    
    Write-Host "🔧 ESP32 Configuration:" -ForegroundColor Cyan
    Write-Host "   - Set client.setInsecure() for development" -ForegroundColor Gray
    Write-Host "   - Or use certificate fingerprint for better security`n" -ForegroundColor Gray

} catch {
    Write-Host "`n❌ Error generating certificates:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nTrying alternative method...`n" -ForegroundColor Yellow
    
    # Alternative: Create basic self-signed cert without private key export
    Write-Host "Creating basic certificate (Node.js will handle key generation)...`n" -ForegroundColor Cyan
    
    # For development, we can use a simpler approach
    Write-Host "⚠️  Please use one of these alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Install Git for Windows (includes OpenSSL)" -ForegroundColor Gray
    Write-Host "   2. Use WSL (Windows Subsystem for Linux)" -ForegroundColor Gray
    Write-Host "   3. Download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html`n" -ForegroundColor Gray
    
    exit 1
}


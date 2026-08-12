param(
  [string]$IpAddress
)

$ErrorActionPreference = 'Stop'

function Get-PrimaryIpv4Address {
  $defaultRoute = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

  if (-not $defaultRoute) {
    throw 'Could not detect the primary network interface.'
  }

  $address = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $defaultRoute.InterfaceIndex |
    Where-Object { $_.IPAddress -notlike '169.254.*' -and $_.IPAddress -ne '127.0.0.1' } |
    Select-Object -First 1 -ExpandProperty IPAddress

  if (-not $address) {
    throw 'Could not detect the local IPv4 address.'
  }

  return $address
}

if (-not $IpAddress) {
  $IpAddress = Get-PrimaryIpv4Address
}

$parsedAddress = $null
if (-not [System.Net.IPAddress]::TryParse($IpAddress, [ref]$parsedAddress) -or
    $parsedAddress.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
  throw "Invalid IPv4 address: $IpAddress"
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$certificateDirectory = Join-Path $projectRoot '.cert'
$pfxPath = Join-Path $certificateDirectory 'pasco-lab-local.pfx'
$cerPath = Join-Path $certificateDirectory 'pasco-lab-local.cer'
$configPath = Join-Path $certificateDirectory 'local-https.json'
$friendlyNamePrefix = 'PASCO Lab Local HTTPS'
$friendlyName = "$friendlyNamePrefix ($IpAddress)"
$passphrase = [Guid]::NewGuid().ToString('N')
$securePassphrase = ConvertTo-SecureString $passphrase -AsPlainText -Force

New-Item -ItemType Directory -Path $certificateDirectory -Force | Out-Null

Get-ChildItem 'Cert:\CurrentUser\My' |
  Where-Object { $_.FriendlyName -like "$friendlyNamePrefix*" } |
  Remove-Item -Force

Get-ChildItem 'Cert:\CurrentUser\Root' |
  Where-Object { $_.FriendlyName -like "$friendlyNamePrefix*" } |
  Remove-Item -Force

$certificate = New-SelfSignedCertificate `
  -Type Custom `
  -Subject 'CN=PASCO Lab Local' `
  -FriendlyName $friendlyName `
  -KeyAlgorithm RSA `
  -KeyLength 2048 `
  -HashAlgorithm SHA256 `
  -KeyExportPolicy Exportable `
  -KeyUsage DigitalSignature, KeyEncipherment `
  -CertStoreLocation 'Cert:\CurrentUser\My' `
  -NotAfter (Get-Date).AddYears(1) `
  -TextExtension @(
    '2.5.29.37={text}1.3.6.1.5.5.7.3.1',
    "2.5.29.17={text}DNS=localhost&IPAddress=127.0.0.1&IPAddress=$IpAddress"
  )

Export-PfxCertificate `
  -Cert $certificate `
  -FilePath $pfxPath `
  -Password $securePassphrase `
  -Force | Out-Null

Export-Certificate `
  -Cert $certificate `
  -FilePath $cerPath `
  -Force | Out-Null

Import-Certificate `
  -FilePath $cerPath `
  -CertStoreLocation 'Cert:\CurrentUser\Root' | Out-Null

@{
  ipAddress = $IpAddress
  passphrase = $passphrase
  thumbprint = $certificate.Thumbprint
} | ConvertTo-Json | Set-Content -Path $configPath -Encoding ASCII

Write-Host ''
Write-Host 'Local HTTPS certificate is ready.' -ForegroundColor Green
Write-Host "Open on this computer: https://localhost:3443"
Write-Host "Open on tablets in the same Wi-Fi: https://${IpAddress}:3443"
Write-Host "HTTP redirect: http://${IpAddress}:3000"
Write-Host "Certificate file for tablets: $cerPath"


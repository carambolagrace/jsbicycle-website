# 静态预览服务器（dist/）
# 监听 4175 端口，将 dist/ 作为根目录，可通过浏览器访问验证。
$port = 4175
$root = Join-Path $PSScriptRoot 'dist'
if (-not (Test-Path $root)) {
  Write-Host "[ERROR] dist folder not found: $root"
  exit 1
}

Add-Type -AssemblyName System.Net
Add-Type -AssemblyName System.Net.Http
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
  $listener.Start()
  Write-Host ""
  Write-Host "============================================================"
  Write-Host "  dist preview server started"
  Write-Host ""
  Write-Host "  Home     http://localhost:$port/index.html"
  Write-Host "  Page     http://localhost:$port/page.html?page=news"
  Write-Host "  Detail   http://localhost:$port/detail.html?type=news&id=pa-rider"
  Write-Host ""
  Write-Host "  Press Ctrl+C to stop"
  Write-Host "============================================================"
  Write-Host ""

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $relativePath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($relativePath)) { $relativePath = 'index.html' }

    $filePath = Join-Path $root $relativePath
    if (-not (Test-Path $filePath)) {
      $filePath = Join-Path $root 'index.html'
    }

    $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
    $contentType = switch ($extension) {
      '.html' { 'text/html; charset=utf-8' }
      '.css'  { 'text/css; charset=utf-8' }
      '.js'   { 'application/javascript; charset=utf-8' }
      '.json' { 'application/json; charset=utf-8' }
      '.jpg'  { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.png'  { 'image/png' }
      '.gif'  { 'image/gif' }
      '.svg'  { 'image/svg+xml' }
      default { 'application/octet-stream' }
    }

    try {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  {0}  {1}  ({2} bytes)" -f $request.HttpMethod, $request.Url.LocalPath, $bytes.Length)
    } catch {
      $response.StatusCode = 500
      Write-Host "  [ERROR] $filePath : $_"
    } finally {
      $response.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
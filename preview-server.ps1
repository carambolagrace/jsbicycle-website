param(
    [int]$Port = 4174
)

$siteRoot = $PSScriptRoot
$rootPath = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Preview server: http://localhost:$Port/site/"

$contentTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.svg'  = 'image/svg+xml'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $relativePath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relativePath) -or $relativePath -eq 'site' -or $relativePath -eq 'site/') {
            $filePath = Join-Path $siteRoot 'index.html'
        }
        elseif ($relativePath.StartsWith('site/')) {
            $filePath = Join-Path $siteRoot $relativePath.Substring(5)
        }
        else {
            $filePath = Join-Path $rootPath $relativePath
        }

        $filePath = [System.IO.Path]::GetFullPath($filePath)
        if (-not $filePath.StartsWith($rootPath) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $context.Response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $context.Response.OutputStream.Write($notFound, 0, $notFound.Length)
            $context.Response.Close()
            continue
        }

        $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $context.Response.ContentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}

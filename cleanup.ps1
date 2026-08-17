$ws = 'd:\LGG-办公\协会网站'
$files = @('index.html','page.html','detail.html','script.js','page.js','detail.js','styles.css','preview-server.ps1','preview.log','preview-dist.log')
foreach ($name in $files) {
  $f = Join-Path $ws $name
  if (Test-Path -LiteralPath $f) {
    Remove-Item -LiteralPath $f -Force
    Write-Host ('removed  {0}' -f $name)
  } else {
    Write-Host ('skip    {0}' -f $name)
  }
}
Remove-Item -LiteralPath 'd:\LGG-办公\协会网站\cleanup.ps1' -Force
Write-Host 'cleanup script removed'
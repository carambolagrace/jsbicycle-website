# 协会官网一键部署脚本 — 走 Netlify
# 用法：双击运行 或在PowerShell 里执行 ./build-deploy.ps1
$ErrorActionPreference = 'Stop'

Write-Host '=== 协会官网一键部署 ===' -ForegroundColor Cyan
Write-Host ''

# 切到脚本所在目录的父目录（即项目根目录）
Set-Location (Split-Path -Parent $PSCommandPath) | Out-Null
$projectRoot = (Get-Location).Path
Write-Host "[1/4] 项目目录: $projectRoot" -ForegroundColor Gray

# 1. 构建
Write-Host ''
Write-Host '[2/4] 正在构建项目 (vite build)...' -ForegroundColor Cyan
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host '✗ 构建失败！' -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host '✓ 构建完成' -ForegroundColor Green

# 2. 检查 dist
$distPath = Join-Path $projectRoot 'dist'
if (-not (Test-Path $distPath)) {
    Write-Host '✗ dist 目录不存在！' -ForegroundColor Red
    exit 1
}
$fileCount = (Get-ChildItem $distPath -Recurse -File | Measure-Object).Count
Write-Host "[3/4] dist 目录文件数: $fileCount" -ForegroundColor Gray

# 3. 部署
Write-Host ''
Write-Host '[4/4] 正在部署到 Netlify (production)...' -ForegroundColor Cyan
$env:NETLIFY_AUTH_TOKEN = 'nfp_suVZxYEpA8VsnYoANTq6pW3MeFPgPrqi1028'
$deployOutput = netlify deploy --prod --dir=dist 2>&1 | Out-String
Write-Host $deployOutput

if ($deployOutput -match 'Deploy succeeded|Website URL|production URL') {
    Write-Host ''
    Write-Host '=========================================' -ForegroundColor Green
    Write-Host '✓ 部署成功！' -ForegroundColor Green
    Write-Host '网址: https://beautiful-mandazi-9d9cd3.netlify.app/' -ForegroundColor Green
    Write-Host '=========================================' -ForegroundColor Green
} else {
    Write-Host '⚠ 部署可能未成功，请查看上方输出' -ForegroundColor Yellow
}

Write-Host ''
Read-Host '按回车键关闭窗口'
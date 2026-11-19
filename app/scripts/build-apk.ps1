# Builds the Menufy Android debug APK from the current web app.
#
#   powershell -ExecutionPolicy Bypass -File app\scripts\build-apk.ps1
#
# Requirements: Node 22.12+, pnpm, JDK 17+, Android SDK (ANDROID_HOME / local.properties).
# Output: Menufy-v1.0.1-debug.apk one folder above the repository, i.e. next to the old APK.
# Pass -OutputDir to write it somewhere else.

param(
    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

$app = Split-Path -Parent $PSScriptRoot
$repo = Split-Path -Parent $app
$apkName = "Menufy-v1.0.1-debug.apk"
if (-not $OutputDir) { $OutputDir = Split-Path -Parent $repo }

Push-Location $app
try {
    Write-Host "==> Installing dependencies"
    pnpm install --frozen-lockfile

    Write-Host "==> Building web app (app/dist)"
    pnpm build

    Write-Host "==> Syncing web assets into the Android project"
    pnpm exec cap sync android

    $bundle = Join-Path $app "android/app/src/main/assets/public/assets"
    $hasBundle = (Test-Path $bundle) -and (Get-ChildItem $bundle -Filter "index-*.js" -ErrorAction SilentlyContinue)
    if (-not $hasBundle) {
        throw "Capacitor sync did not copy the JS bundle into android/app/src/main/assets/public. The APK would launch blank."
    }

    Write-Host "==> Building debug APK"
    Push-Location (Join-Path $app "android")
    try {
        .\gradlew.bat assembleDebug
    } finally {
        Pop-Location
    }

    $source = Join-Path $app "android/app/build/outputs/apk/debug/app-debug.apk"
    if (-not (Test-Path $source)) {
        throw "Gradle did not produce $source"
    }

    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    $destination = Join-Path $OutputDir $apkName
    Copy-Item $source $destination -Force
    Write-Host ""
    Write-Host "Done: $destination"
    Write-Host "The previous build (Menufy-debug.apk) is left untouched."
} finally {
    Pop-Location
}

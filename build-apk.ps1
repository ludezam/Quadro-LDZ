param([string]$ToolsConfig = (Join-Path $PSScriptRoot 'tools.local.json'))
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Usa as ferramentas existentes sem mover ou modificar o SDK compartilhado.
if (Test-Path -LiteralPath $ToolsConfig) {
    $tools = Get-Content -LiteralPath $ToolsConfig -Raw | ConvertFrom-Json
} else {
    $tools = [pscustomobject]@{ javaHome = $env:JAVA_HOME; sdkRoot = $env:ANDROID_HOME }
    if (!$tools.javaHome -or !$tools.sdkRoot) {
        throw 'Configure JAVA_HOME e ANDROID_HOME ou copie tools.local.example.json para tools.local.json e ajuste os caminhos.'
    }
}
$env:JAVA_HOME = $tools.javaHome
$env:ANDROID_HOME = $tools.sdkRoot
$env:ANDROID_USER_HOME = Join-Path $PSScriptRoot '.android'
$sdk = $tools.sdkRoot
$jdk = Join-Path $tools.javaHome 'bin'
$buildTools = Join-Path $sdk 'build-tools/34.0.0'
$androidJar = Join-Path $sdk 'platforms/android-34/android.jar'
foreach ($path in @("$jdk/java.exe", "$jdk/javac.exe", "$jdk/keytool.exe", "$jdk/jar.exe",
    "$buildTools/aapt.exe", "$buildTools/d8.bat", "$buildTools/zipalign.exe", "$buildTools/apksigner.bat", $androidJar)) {
    if (!(Test-Path -LiteralPath $path)) { throw "Ferramenta ausente: $path" }
}
function Run-Native {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Falha em $Command (codigo $LASTEXITCODE)" }
}
$source = Join-Path $PSScriptRoot 'app/src/main'
# Cada compilacao usa uma pasta nova; nao apaga artefatos anteriores.
$work = Join-Path $PSScriptRoot ('build/manual/' + [guid]::NewGuid().ToString('N'))
$classes = Join-Path $work 'classes'
$dex = Join-Path $work 'dex'
$generated = Join-Path $work 'generated'
$output = Join-Path $PSScriptRoot 'outputs'
foreach ($directory in @($classes, $dex, $generated, $output, $env:ANDROID_USER_HOME)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}
$utf8 = New-Object System.Text.UTF8Encoding($false)
$manifest = Get-Content -LiteralPath "$source/AndroidManifest.xml" -Raw
$manifest = $manifest.Replace('<manifest ', '<manifest package="br.com.galeria.painel" ')
$manifestPath = Join-Path $work 'AndroidManifest.xml'
[IO.File]::WriteAllText($manifestPath, $manifest, $utf8)
$unsigned = Join-Path $work 'unsigned.apk'
Write-Host 'Empacotando recursos Android...'
Run-Native "$buildTools/aapt.exe" @('package', '-f', '-M', $manifestPath, '-S', "$source/res", '-A', "$source/assets",
    '-I', $androidJar, '-J', $generated, '-F', $unsigned, '--min-sdk-version', '28', '--target-sdk-version', '34',
    '--version-code', '3', '--version-name', '0.3.0')
Write-Host 'Compilando Java...'
$javaFiles = @(Get-ChildItem "$source/java", $generated -Recurse -Filter '*.java' | ForEach-Object { $_.FullName })
Run-Native "$jdk/javac.exe" (@('-encoding', 'UTF-8', '-source', '8', '-target', '8', '-bootclasspath', "$androidJar;$buildTools/core-lambda-stubs.jar", '-d', $classes) + $javaFiles)
Write-Host 'Gerando DEX...'
$classFiles = @(Get-ChildItem $classes -Recurse -Filter '*.class' | ForEach-Object { $_.FullName })
Run-Native "$buildTools/d8.bat" (@('--lib', $androidJar, '--min-api', '28', '--output', $dex) + $classFiles)
Run-Native "$jdk/jar.exe" @('uf', $unsigned, '-C', $dex, 'classes.dex')
$aligned = Join-Path $work 'aligned.apk'
Run-Native "$buildTools/zipalign.exe" @('-f', '4', $unsigned, $aligned)
$key = Join-Path $env:ANDROID_USER_HOME 'galeria-debug.keystore'
if (!(Test-Path -LiteralPath $key)) {
    Run-Native "$jdk/keytool.exe" @('-genkeypair', '-keystore', $key, '-storepass', 'android', '-keypass', 'android',
        '-alias', 'androiddebugkey', '-dname', 'CN=Galeria Debug', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-noprompt')
}
$apk = Join-Path $output 'Quadro-LDZ-0.3.0-teste.apk'
Write-Host 'Assinando e verificando APK...'
Run-Native "$buildTools/apksigner.bat" @('sign', '--ks', $key, '--ks-key-alias', 'androiddebugkey', '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', $apk, $aligned)
Run-Native "$buildTools/apksigner.bat" @('verify', '--verbose', $apk)
Run-Native "$buildTools/zipalign.exe" @('-c', '4', $apk)
Run-Native "$buildTools/aapt.exe" @('dump', 'badging', $apk)
Get-FileHash -LiteralPath $apk -Algorithm SHA256
Write-Host "APK pronto: $apk"

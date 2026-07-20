param(
    [string]$Voice = "Microsoft Hazel Desktop",
    [double]$Tempo = 1.44
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$artifacts = Join-Path $root "artifacts"
$ssmlPath = Join-Path $root "docs\demo-voiceover-build-week-en.ssml"
$wavePath = Join-Path $artifacts "oneops-build-week-voiceover-en.wav"
$videoPath = Join-Path $artifacts "oneops-openai-build-week-demo.mp4"
$outputPath = Join-Path $artifacts "oneops-openai-build-week-demo-narrated.mp4"
$ffmpeg = Join-Path $root ".video-tools\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"

if (-not (Test-Path $ffmpeg)) {
    throw "FFmpeg was not found. Install imageio-ffmpeg into .video-tools first."
}

Add-Type -AssemblyName System.Speech
$ssml = Get-Content $ssmlPath -Raw -Encoding UTF8
$ssml = $ssml.Replace("Microsoft Hazel Desktop", $Voice)
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $synth.SetOutputToWaveFile($wavePath)
    $synth.SpeakSsml($ssml)
} finally {
    $synth.Dispose()
}

& $ffmpeg -y -hide_banner -loglevel error `
    -i $videoPath -i $wavePath `
    -filter_complex "[1:a]atempo=$Tempo,adelay=1000|1000,volume=1.06[a]" `
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -t 98 `
    -movflags +faststart $outputPath

if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed with exit code $LASTEXITCODE."
}

Write-Host "Build Week demo written to $outputPath"

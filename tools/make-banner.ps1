$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$artPath = Join-Path $PSScriptRoot '../app/src/main/assets/art/br-01.jpg'
$painting = [System.Drawing.Image]::FromFile($artPath)
$destination = Join-Path $PSScriptRoot '../app/src/main/res/drawable'
function New-ArtLogo {
    param([int]$Width,[int]$Height,[string]$Name,[bool]$Square)
    $image = New-Object System.Drawing.Bitmap($Width,$Height)
    $g = [System.Drawing.Graphics]::FromImage($image)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $scale = [Math]::Max($Width/[double]$painting.Width,$Height/[double]$painting.Height)
    $paintWidth = [int]($painting.Width*$scale)
    $paintHeight = [int]($painting.Height*$scale)
    $g.DrawImage($painting,[int](($Width-$paintWidth)/2),[int](($Height-$paintHeight)/2),$paintWidth,$paintHeight)
    $veil = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45,237,231,218))
    $g.FillRectangle($veil,0,0,$Width,$Height)
    $paper = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238,237,231,218))
    $ink = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#303129'))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140,48,49,41),2)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    if($Square){
        $plate = New-Object System.Drawing.RectangleF(40,157,432,198)
        $font = New-Object System.Drawing.Font('Georgia',49)
        $text = "Quadro`nLDZ"
    }else{
        $plate = New-Object System.Drawing.RectangleF(64,113,512,134)
        $font = New-Object System.Drawing.Font('Georgia',44)
        $text = 'Quadro LDZ'
    }
    $g.FillRectangle($paper,$plate)
    $g.DrawRectangle($pen,$plate.X+8,$plate.Y+8,$plate.Width-16,$plate.Height-16)
    $g.DrawString($text,$font,$ink,$plate,$format)
    $image.Save((Join-Path $destination $Name),[System.Drawing.Imaging.ImageFormat]::Png)
    foreach($resource in @($font,$format,$pen,$ink,$paper,$veil,$g,$image)){$resource.Dispose()}
}
New-ArtLogo 512 512 'icon_art.png' $true
New-ArtLogo 640 360 'banner_art.png' $false
$painting.Dispose()

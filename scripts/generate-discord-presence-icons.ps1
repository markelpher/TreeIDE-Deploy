Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root 'assets\discord-presence'
[System.IO.Directory]::CreateDirectory($outputDir) | Out-Null

function New-PresenceCanvas([string]$background) {
    $bitmap = [System.Drawing.Bitmap]::new(512, 512)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($background))
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 28)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    return @{ Bitmap = $bitmap; Graphics = $graphics; Pen = $pen }
}

function Save-PresenceCanvas($canvas, [string]$name) {
    $canvas.Bitmap.Save(
        (Join-Path $outputDir "$name.png"),
        [System.Drawing.Imaging.ImageFormat]::Png
    )
    $canvas.Pen.Dispose()
    $canvas.Graphics.Dispose()
    $canvas.Bitmap.Dispose()
}

function Draw-PresenceFile($canvas, [int]$left, [int]$top, [int]$foldX, [int]$right, [int]$foldY, [int]$bottom) {
    $outline = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $outline.AddLines([System.Drawing.Point[]]@(
        [System.Drawing.Point]::new($left, $top),
        [System.Drawing.Point]::new($foldX, $top),
        [System.Drawing.Point]::new($right, $foldY),
        [System.Drawing.Point]::new($right, $bottom),
        [System.Drawing.Point]::new($left, $bottom)
    ))
    $outline.CloseFigure()
    $canvas.Graphics.DrawPath($canvas.Pen, $outline)
    $outline.Dispose()

    $fold = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $fold.AddLines([System.Drawing.Point[]]@(
        [System.Drawing.Point]::new($foldX, $top),
        [System.Drawing.Point]::new($foldX, $foldY),
        [System.Drawing.Point]::new($right, $foldY)
    ))
    $canvas.Graphics.DrawPath($canvas.Pen, $fold)
    $fold.Dispose()
}

$treeIdeBackground = '#212121'

$editor = New-PresenceCanvas $treeIdeBackground
$editor.Graphics.DrawLines($editor.Pen, @(
    [System.Drawing.Point]::new(195, 165),
    [System.Drawing.Point]::new(115, 256),
    [System.Drawing.Point]::new(195, 347)
))
$editor.Graphics.DrawLines($editor.Pen, @(
    [System.Drawing.Point]::new(317, 165),
    [System.Drawing.Point]::new(397, 256),
    [System.Drawing.Point]::new(317, 347)
))
$editor.Graphics.DrawLine($editor.Pen, 278, 145, 234, 367)
Save-PresenceCanvas $editor 'editor'

# The structure and build artwork are reference-driven raster assets. Preserve
# the approved files when regenerating the remaining deterministic icons.
$structureAsset = Join-Path $outputDir 'structure.png'
if (-not (Test-Path -LiteralPath $structureAsset)) {
    $structure = New-PresenceCanvas $treeIdeBackground
    $structure.Graphics.DrawLines($structure.Pen, @(
        [System.Drawing.Point]::new(120, 105),
        [System.Drawing.Point]::new(120, 330),
        [System.Drawing.Point]::new(205, 330)
    ))
    $structure.Graphics.DrawLine($structure.Pen, 120, 185, 205, 185)
    $structure.Graphics.DrawLines($structure.Pen, @(
        [System.Drawing.Point]::new(245, 105),
        [System.Drawing.Point]::new(325, 105),
        [System.Drawing.Point]::new(360, 140),
        [System.Drawing.Point]::new(415, 140),
        [System.Drawing.Point]::new(415, 225),
        [System.Drawing.Point]::new(245, 225),
        [System.Drawing.Point]::new(245, 105)
    ))
    $structure.Graphics.DrawLines($structure.Pen, @(
        [System.Drawing.Point]::new(245, 285),
        [System.Drawing.Point]::new(325, 285),
        [System.Drawing.Point]::new(360, 320),
        [System.Drawing.Point]::new(415, 320),
        [System.Drawing.Point]::new(415, 405),
        [System.Drawing.Point]::new(245, 405),
        [System.Drawing.Point]::new(245, 285)
    ))
    Save-PresenceCanvas $structure 'structure'
}

$file = New-PresenceCanvas $treeIdeBackground
Draw-PresenceFile $file 115 75 325 410 160 430
Save-PresenceCanvas $file 'file'

$files = New-PresenceCanvas $treeIdeBackground
$files.Graphics.DrawLines($files.Pen, [System.Drawing.Point[]]@(
    [System.Drawing.Point]::new(95, 155),
    [System.Drawing.Point]::new(95, 430),
    [System.Drawing.Point]::new(315, 430)
))
Draw-PresenceFile $files 185 75 325 410 160 345
Save-PresenceCanvas $files 'files'

$text = New-PresenceCanvas $treeIdeBackground
$text.Pen.Width = 24
$text.Graphics.DrawLine($text.Pen, 105, 145, 407, 145)
$text.Graphics.DrawLine($text.Pen, 105, 220, 355, 220)
$text.Graphics.DrawLine($text.Pen, 105, 295, 407, 295)
$text.Graphics.DrawLine($text.Pen, 105, 370, 285, 370)
Save-PresenceCanvas $text 'text'

$templates = New-PresenceCanvas $treeIdeBackground
$templates.Graphics.DrawRectangle($templates.Pen, 105, 105, 302, 105)
$templates.Graphics.DrawRectangle($templates.Pen, 105, 265, 165, 142)
$templates.Graphics.DrawRectangle($templates.Pen, 325, 265, 82, 142)
Save-PresenceCanvas $templates 'templates'

$buildAsset = Join-Path $outputDir 'build.png'
if (-not (Test-Path -LiteralPath $buildAsset)) {
    $build = New-PresenceCanvas $treeIdeBackground
    $build.Graphics.DrawLines($build.Pen, @(
        [System.Drawing.Point]::new(105, 185),
        [System.Drawing.Point]::new(105, 400),
        [System.Drawing.Point]::new(330, 400)
    ))
    $build.Graphics.DrawLines($build.Pen, @(
        [System.Drawing.Point]::new(190, 105),
        [System.Drawing.Point]::new(300, 105),
        [System.Drawing.Point]::new(340, 145),
        [System.Drawing.Point]::new(420, 145),
        [System.Drawing.Point]::new(420, 300),
        [System.Drawing.Point]::new(190, 300),
        [System.Drawing.Point]::new(190, 105)
    ))
    Save-PresenceCanvas $build 'build'
}

$settings = New-PresenceCanvas $treeIdeBackground
$gearPoints = [System.Drawing.PointF[]]::new(32)
for ($index = 0; $index -lt $gearPoints.Length; $index++) {
    $radius = if (($index % 4) -in @(1, 2)) { 184 } else { 150 }
    $angle = (($index * 360 / $gearPoints.Length) - 90) * [Math]::PI / 180
    $gearPoints[$index] = [System.Drawing.PointF]::new(
        [single](256 + $radius * [Math]::Cos($angle)),
        [single](256 + $radius * [Math]::Sin($angle))
    )
}
$whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$backgroundBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($treeIdeBackground))
$settings.Graphics.FillPolygon($whiteBrush, $gearPoints)
$settings.Graphics.FillEllipse($backgroundBrush, 194, 194, 124, 124)
$whiteBrush.Dispose()
$backgroundBrush.Dispose()
Save-PresenceCanvas $settings 'settings'

$idle = New-PresenceCanvas $treeIdeBackground
$idle.Pen.Width = 20
$idle.Graphics.DrawRectangle($idle.Pen, 70, 140, 372, 232)
foreach ($x in @(112, 180, 248, 316, 384)) {
    $idle.Graphics.DrawLine($idle.Pen, $x, 202, $x + 22, 202)
}
foreach ($x in @(130, 198, 266, 334)) {
    $idle.Graphics.DrawLine($idle.Pen, $x, 260, $x + 22, 260)
}
$idle.Graphics.DrawLine($idle.Pen, 112, 318, 142, 318)
$idle.Graphics.DrawLine($idle.Pen, 190, 318, 322, 318)
$idle.Graphics.DrawLine($idle.Pen, 370, 318, 400, 318)
Save-PresenceCanvas $idle 'idle'

Write-Output "Generated Discord Presence icons in $outputDir"

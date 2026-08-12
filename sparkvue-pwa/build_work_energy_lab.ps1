$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$workspaceRoot = $PSScriptRoot
$resourcesZip = Join-Path $workspaceRoot 'data\resources.zip'
$labEntryName = 'Experiments/Quick Start Labs/Work and Kinetic Energy.spklab'
$outputLabPath = Join-Path $workspaceRoot 'data\Work and Kinetic Energy - Presentation and Test.spklab'

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Escape-Html {
    param([Parameter(Mandatory = $true)][string]$Text)

    [System.Security.SecurityElement]::Escape($Text)
}

function New-TextPageHtml {
    param(
        [Parameter(Mandatory = $true)][string]$Text
    )

    $escaped = Escape-Html $Text

    return @"
<div class="workbook-page" style="left: 63.7109px; top: 13.05px; width: 896.578px; height: 495.9px; background-image: none; background-size: 100% 100%;">
<div style="left: 0%; top: 0%; width: 100%; height: 100%; pointer-events: auto;" data-item-type="TEXT" data-property-index="0" class="workbook-item">
<div class="text-view text-input" style="width: 100%; height: 100%; background-color: rgb(255, 255, 255);">
<div class="text-field-container" href="#"><textarea autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="width: 100%; height: 100%; font-family: &quot;Lucida Sans Unicode&quot;, &quot;Arial Unicode MS&quot;, &quot;Helvetica Neue Light&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, &quot;Droid Sans Fallback&quot;, &quot;Droid Sans&quot;, sans-serif; letter-spacing: -1px;">$escaped</textarea></div>
</div>
</div>
</div>
"@
}

function New-TextPageJson {
    param(
        [Parameter(Mandatory = $true)][string]$PageName,
        [Parameter(Mandatory = $true)][string]$Text
    )

    [pscustomobject]@{
        pageName = $PageName
        items    = @(
            [pscustomobject]@{
                displayType = 'TEXT'
                text        = $Text
            }
        )
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Object
    )

    $json = $Object | ConvertTo-Json -Depth 32
    Write-Utf8File -Path $Path -Content $json
}

function Write-ZipFromDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$SourceRoot,
        [Parameter(Mandatory = $true)][string]$DestinationZip
    )

    if (Test-Path $DestinationZip) {
        Remove-Item $DestinationZip -Force
    }

    $zipFileStream = [System.IO.File]::Open($DestinationZip, [System.IO.FileMode]::Create, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    try {
        $zipArchive = New-Object System.IO.Compression.ZipArchive($zipFileStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
        try {
            Get-ChildItem -LiteralPath $SourceRoot -Recurse -File | ForEach-Object {
                $relativeName = $_.FullName.Substring($SourceRoot.Length).TrimStart('\', '/').Replace('\', '/')
                $entry = $zipArchive.CreateEntry($relativeName)
                $entryStream = $entry.Open()
                try {
                    $sourceStream = [System.IO.File]::OpenRead($_.FullName)
                    try {
                        $sourceStream.CopyTo($entryStream)
                    }
                    finally {
                        $sourceStream.Dispose()
                    }
                }
                finally {
                    $entryStream.Dispose()
                }
            }
        }
        finally {
            $zipArchive.Dispose()
        }
    }
    finally {
        $zipFileStream.Dispose()
    }
}

function Get-InnerLabFolder {
    param(
        [Parameter(Mandatory = $true)][string]$SourceLabPath,
        [Parameter(Mandatory = $true)][string]$WorkingRoot
    )

    $raw = [System.IO.File]::ReadAllBytes($SourceLabPath)
    if ($raw.Length -lt 2 -or $raw[1] -ne 0x50 -or $raw[2] -ne 0x4B) {
        throw "Unexpected lab format: $SourceLabPath"
    }

    $zipPath = Join-Path $WorkingRoot 'base-lab.zip'
    $zipBytes = New-Object byte[] ($raw.Length - 1)
    [System.Array]::Copy($raw, 1, $zipBytes, 0, $zipBytes.Length)
    [System.IO.File]::WriteAllBytes($zipPath, $zipBytes)

    $extractPath = Join-Path $WorkingRoot 'lab-extract'
    if (Test-Path $extractPath) {
        Remove-Item $extractPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $extractPath | Out-Null

    Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath -Force

    return $extractPath
}

$introText = @'
Работа и кинетическая энергия

Цель
Понять, как работа силы связана с изменением кинетической энергии тела.

Основные формулы
A = F * s * cos(α)
Ek = m * v² / 2
ΔEk = Ek2 - Ek1
Aсум = ΔEk

Что должно получиться
- положительная работа увеличивает кинетическую энергию;
- отрицательная работа уменьшает кинетическую энергию;
- площадь под графиком F(x) показывает работу;
- скорость и сила меняются синхронно во время движения тележки.

Структура опыта
1. Измерить силу, положение и скорость тележки.
2. Сравнить графики F(t), v(t) и F(x).
3. Проверить теорему о работе и кинетической энергии.
'@

$setupText = @'
Подготовка и датчики

Нужные датчики
- Smart Cart Force Sensor
- Smart Cart Position Sensor
- Velocity из датчика положения тележки

Перед началом
1. Установите тележку на трек.
2. Обнулите датчик силы.
3. Проверьте, что датчик положения и скорости подключён.
4. Задайте частоту 50 Гц.
5. Нажмите Start и плавно перемещайте тележку вдоль трека.
6. Повторите опыт с большей массой или более сильным усилием.

На что смотреть
- F(t) показывает момент действия силы;
- v(t) показывает, как быстро меняется движение;
- F(x) помогает оценить работу как площадь под графиком;
- ΔEk сравнивается с работой силы.
'@

$testText = @'
Мини-тест

1. Что называют работой силы?

2. Запишите формулу кинетической энергии.

3. Какой знак работы соответствует ускорению тележки?

4. Что показывает площадь под графиком F(x)?

5. Почему при удвоении скорости кинетическая энергия возрастает в 4 раза?

6. Какие датчики нужны для этой лабораторной?

7. Что сравнивает теорема работы и кинетической энергии?

8. Как меняется кинетическая энергия, если суммарная работа отрицательна?

9. Почему важно обнулить датчик силы перед опытом?

10. Что меняется сильнее при одном и том же усилии: скорость или энергия?
'@

$answersText = @'
Ключ ответов

1. Работа силы - это произведение силы на перемещение и косинус угла между ними.

2. Ek = m * v² / 2.

3. Положительный знак.

4. Работу силы на данном перемещении.

5. Потому что кинетическая энергия пропорциональна квадрату скорости.

6. Датчик силы и датчик положения/скорости тележки.

7. Суммарная работа равна изменению кинетической энергии.

8. Кинетическая энергия уменьшается.

9. Чтобы убрать постоянное смещение и получить корректную нулевую линию.

10. При одинаковой силе и одинаковом времени быстрее меняется скорость, а энергия меняется через квадрат скорости.
'@

$tempRoot = Join-Path $env:TEMP ("sparkvue-work-energy-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    $sourceLab = Join-Path $tempRoot 'Work and Kinetic Energy.spklab'
    $outer = [System.IO.Compression.ZipFile]::OpenRead($resourcesZip)
    try {
        $entry = $outer.GetEntry($labEntryName)
        if (-not $entry) {
            throw "Could not find $labEntryName in $resourcesZip"
        }

        $outStream = [System.IO.File]::Create($sourceLab)
        try {
            $inStream = $entry.Open()
            try {
                $inStream.CopyTo($outStream)
            }
            finally {
                $inStream.Dispose()
            }
        }
        finally {
            $outStream.Dispose()
        }
    }
    finally {
        $outer.Dispose()
    }

    $extractPath = Get-InnerLabFolder -SourceLabPath $sourceLab -WorkingRoot $tempRoot
    $configPath = Join-Path $extractPath 'EPUB\config'
    $htmlPath = Join-Path $extractPath 'EPUB\html'

    $pages = @(
        [pscustomobject]@{
            jsonFile = 'page_intro.json'
            htmlFile = 'page_intro.html'
            pageName = 'Теория: работа и кинетическая энергия'
            text     = $introText
        }
        [pscustomobject]@{
            jsonFile = 'page_setup.json'
            htmlFile = 'page_setup.html'
            pageName = 'Подготовка и датчики'
            text     = $setupText
        }
        [pscustomobject]@{
            jsonFile = 'page0.json'
            htmlFile = 'page0.html'
            pageName = 'График 1: сила и скорость во времени'
        }
        [pscustomobject]@{
            jsonFile = 'page18a2df832e6a.json'
            htmlFile = 'page18a2df832e6a.html'
            pageName = 'График 2: сила и скорость по положению'
        }
        [pscustomobject]@{
            jsonFile = 'page_test.json'
            htmlFile = 'page_test.html'
            pageName = 'Мини-тест'
            text     = $testText
        }
        [pscustomobject]@{
            jsonFile = 'page_answers.json'
            htmlFile = 'page_answers.html'
            pageName = 'Ключ ответов'
            text     = $answersText
        }
    )

    foreach ($page in $pages) {
        $jsonFile = Join-Path $configPath $page.jsonFile
        $htmlFile = Join-Path $htmlPath $page.htmlFile

        if ($page.PSObject.Properties.Name -contains 'text') {
            $jsonObject = New-TextPageJson -PageName $page.pageName -Text $page.text
            $htmlObject = New-TextPageHtml -Text $page.text
            Write-JsonFile -Path $jsonFile -Object $jsonObject
            Write-Utf8File -Path $htmlFile -Content $htmlObject
        }
        else {
            $jsonObject = Get-Content -Raw -LiteralPath $jsonFile | ConvertFrom-Json
            $jsonObject.pageName = $page.pageName
            Write-JsonFile -Path $jsonFile -Object $jsonObject
        }
    }

    $tocPath = Join-Path $configPath 'toc.json'
    $tocObject = [pscustomobject]@{
        nextPageId = 6
        showsLiveDataBar = $true
        ownsDashboard = $false
        selectedUnitFormat = -1
        tableOfContents = @(
            [pscustomobject]@{ pageName = 'Теория: работа и кинетическая энергия'; htmlFile = 'page_intro.html'; jsonFile = 'page_intro.json' }
            [pscustomobject]@{ pageName = 'Подготовка и датчики'; htmlFile = 'page_setup.html'; jsonFile = 'page_setup.json' }
            [pscustomobject]@{ pageName = 'График 1: сила и скорость во времени'; htmlFile = 'page0.html'; jsonFile = 'page0.json' }
            [pscustomobject]@{ pageName = 'График 2: сила и скорость по положению'; htmlFile = 'page18a2df832e6a.html'; jsonFile = 'page18a2df832e6a.json' }
            [pscustomobject]@{ pageName = 'Мини-тест'; htmlFile = 'page_test.html'; jsonFile = 'page_test.json' }
            [pscustomobject]@{ pageName = 'Ключ ответов'; htmlFile = 'page_answers.html'; jsonFile = 'page_answers.json' }
        )
    }
    Write-JsonFile -Path $tocPath -Object $tocObject

    $outputZip = Join-Path $tempRoot 'Work and Kinetic Energy - Presentation and Test.zip'
    $finalLab = $outputLabPath

    if (Test-Path $outputZip) {
        Remove-Item $outputZip -Force
    }
    if (Test-Path $finalLab) {
        Remove-Item $finalLab -Force
    }

    Write-ZipFromDirectory -SourceRoot $extractPath -DestinationZip $outputZip

    $zipBytes = [System.IO.File]::ReadAllBytes($outputZip)
    $labBytes = New-Object byte[] ($zipBytes.Length + 1)
    $labBytes[0] = 0x73
    [System.Array]::Copy($zipBytes, 0, $labBytes, 1, $zipBytes.Length)
    [System.IO.File]::WriteAllBytes($finalLab, $labBytes)

    $resources = [System.IO.Compression.ZipFile]::Open($resourcesZip, 'Update')
    try {
        $existing = $resources.GetEntry($labEntryName)
        if ($existing) {
            $existing.Delete()
        }

        $newEntry = $resources.CreateEntry($labEntryName)
        $entryStream = $newEntry.Open()
        try {
            $finalBytes = [System.IO.File]::ReadAllBytes($finalLab)
            $entryStream.Write($finalBytes, 0, $finalBytes.Length)
        }
        finally {
            $entryStream.Dispose()
        }
    }
    finally {
        $resources.Dispose()
    }

    Write-Host "Created lab package: $finalLab"
    Write-Host "Updated resource entry: $labEntryName"
    Write-Host "Pages: $($tocObject.tableOfContents.Count)"
}
finally {
    # Keep the generated artifact but clean the temporary working tree.
    if (Test-Path $tempRoot) {
        Remove-Item $tempRoot -Recurse -Force
    }
}

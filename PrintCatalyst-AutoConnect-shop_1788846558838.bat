<# :
@echo off
setlocal
chcp 65001 >nul
title Print Catalyst - 1-Click Printer Bridge
color 0B
cls
powershell -NoProfile -ExecutionPolicy Bypass -Command "$content=[System.IO.File]::ReadAllText('%~f0', [System.Text.Encoding]::UTF8); Invoke-Expression $content"
exit /b
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          PRINT CATALYST - 1-CLICK INSTANT PRINTER BRIDGE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Shop Name  : Mahakal Stationary" -ForegroundColor White
Write-Host "  Shop ID    : shop_1788846558838" -ForegroundColor White
Write-Host "  Server URL : https://printcatalyst-new.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "  Scanning Windows for installed USB, Wi-Fi and Network Printers..." -ForegroundColor Gray
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

$installed = Get-Printer | Select-Object Name, DriverName, Default
if (-not $installed) {
  Write-Host "  [!] No printers found. Please ensure your printer is turned on and connected." -ForegroundColor Yellow
} else {
  $list = @()
  foreach ($p in $installed) {
    $isColor = ($p.Name -match '(?i)color|tank|photo|c3530|l8050|deskjet|inkjet' -or ($p.DriverName -and $p.DriverName -match '(?i)color'))
    $type = if ($isColor) { 'COLOR_INKJET_PHOTO' } else { 'MONO_LASER' }
    $list += @{
      name = $p.Name
      driver = $p.DriverName
      isDefault = [bool]$p.Default
      supportsColor = [bool]$isColor
      type = $type
    }
    Write-Host ("   [+] Detected: " + $p.Name + " (" + $(if ($isColor) {'Color'} else {'Monochrome'}) + ")") -ForegroundColor Green
  }

  $payload = @{
    shopId = 'shop_1788846558838'
    hostname = $env:COMPUTERNAME
    printers = $list
  } | ConvertTo-Json -Depth 4

  Write-Host ""
  Write-Host "[*] Linking detected printers with your online Dashboard..." -ForegroundColor Yellow

  try {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls
    
    $res = Invoke-RestMethod -Uri "https://printcatalyst-new.onrender.com/api/v1/printers/auto-detect" -Method Post -Body $payload -ContentType "application/json"
    
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ("  [SUCCESS] All " + $installed.Count + " printer(s) are now LIVE in your Dashboard!") -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
  } catch {
    Write-Host ""
    Write-Host ("  [!] Connection error: " + $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   >>> PRINT CATALYST BRIDGE IS ACTIVE & LISTENING <<<" -ForegroundColor Green
Write-Host "   Keep this window open or minimized in the background." -ForegroundColor White
Write-Host "   Any Test Prints or Print Orders from Dashboard print automatically!" -ForegroundColor Yellow
Write-Host "   (Press Ctrl+C anytime to close the bridge)" -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$toolsDir = Join-Path (Join-Path $env:LOCALAPPDATA 'PrintCatalyst') 'bin'
if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null }
$sumatraExe = Join-Path $toolsDir 'SumatraPDF.exe'

if (-not (Test-Path $sumatraExe)) {
  $existingSumatra = (Get-Command SumatraPDF.exe -ErrorAction SilentlyContinue)
  if ($existingSumatra) {
    $sumatraExe = $existingSumatra.Source
  } else {
    try {
      Write-Host "   [*] Preparing direct high-fidelity document engine..." -ForegroundColor DarkGray
      $dlUrls = @(
        "https://printcatalyst-new.onrender.com/bin/SumatraPDF.exe",
        "https://www.sumatrapdfreader.org/dl/rel/3.6.1/SumatraPDF-3.6.1-64.zip"
      )
      foreach ($u in $dlUrls) {
        try {
          if ($u.EndsWith(".exe")) {
            Invoke-WebRequest -Uri $u -OutFile $sumatraExe -UseBasicParsing -TimeoutSec 20
            if (Test-Path $sumatraExe) { break }
          } elseif ($u.EndsWith(".zip")) {
            $zp = Join-Path $env:TEMP "sumatra_dl.zip"
            Invoke-WebRequest -Uri $u -OutFile $zp -UseBasicParsing -TimeoutSec 40
            Expand-Archive -Path $zp -DestinationPath $toolsDir -Force
            $found = Get-ChildItem -Path $toolsDir -Filter "SumatraPDF*.exe" | Select-Object -First 1
            if ($found -and $found.FullName -ne $sumatraExe) {
              Move-Item -Path $found.FullName -Destination $sumatraExe -Force
            }
            Remove-Item -Path $zp -Force -ErrorAction SilentlyContinue
            if (Test-Path $sumatraExe) { break }
          }
        } catch {}
      }
    } catch {}
  }
}
if (Test-Path $sumatraExe) {
  Write-Host "   [+] Direct Document & PDF Engine: ACTIVE" -ForegroundColor Green
}

$pollUrl = "https://printcatalyst-new.onrender.com/api/v1/agent/pending?shopId=shop_1788846558838"

while ($true) {
  try {
    $resp = Invoke-RestMethod -Uri $pollUrl -Method Get -TimeoutSec 10
    if ($resp -and $resp.actions -and $resp.actions.Count -gt 0) {
      foreach ($act in $resp.actions) {
        if ($act.type -eq 'TEST_PRINT') {
          Write-Host ""
          Write-Host ("[" + (Get-Date -Format 'HH:mm:ss') + "] [TEST PRINT] Received diagnostic test for: " + $act.printerName) -ForegroundColor Cyan
          $targetName = $act.printerName
          $prn = Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq $targetName -or $_.Name -like "*$targetName*" -or $targetName -like "*$($_.Name)*" } | Select-Object -First 1
          if ($prn) {
            $resCode = Invoke-CimMethod -InputObject $prn -MethodName PrintTestPage
            Write-Host ("   [+] Native Windows Test Page dispatched to " + $prn.Name + "! (Status: " + $resCode.ReturnValue + ")") -ForegroundColor Green
          } else {
            $testLines = @(
              "========================================",
              " PRINT CATALYST - TEST PRINT",
              " Printer: " + $act.printerName,
              " Shop: Mahakal Stationary",
              " Time: " + (Get-Date),
              " Status: HARDWARE CONNECTION VERIFIED",
              "========================================"
            )
            $testLines -join [Environment]::NewLine | Out-Printer -Name "$targetName"
            Write-Host "   [+] Diagnostic print ticket dispatched via Out-Printer!" -ForegroundColor Green
          }
        } elseif ($act.type -eq 'PRINT_JOB') {
          $ord = $act.order
          $pName = if ($act.targetPrinter -and $act.targetPrinter.name) { $act.targetPrinter.name } else { $ord.assignedPrinterName }
          Write-Host ""
          Write-Host ("[" + (Get-Date -Format 'HH:mm:ss') + "] [PRINT ORDER] #" + $ord.id + " (" + $ord.customerName + ") -> " + $pName) -ForegroundColor Cyan

          # Create temp folder for downloaded files
          $tempDir = Join-Path $env:TEMP ("PrintCatalyst_" + $ord.id)
          if (-not (Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force | Out-Null }

          # Set target printer as default
          try {
            $prObj = Get-CimInstance Win32_Printer | Where-Object { $_.Name -eq $pName -or $_.Name -like "*$pName*" } | Select-Object -First 1
            if ($prObj) {
              Invoke-CimMethod -InputObject $prObj -MethodName SetDefaultPrinter | Out-Null
              Write-Host ("   [*] Set default printer to: " + $prObj.Name) -ForegroundColor DarkGray
            }
          } catch {}

          $filesPrinted = 0
          if ($ord.items -and $ord.items.Count -gt 0) {
            foreach ($item in $ord.items) {
              $fUrl = $item.fileUrl
              if (-not $fUrl) { continue }

              # Build full URL if relative
              if ($fUrl -and -not $fUrl.StartsWith("http")) {
                $fUrl = "https://printcatalyst-new.onrender.com" + $fUrl
              }

              $localName = if ($item.fileName) { $item.fileName } else { Split-Path $fUrl -Leaf }
              # Sanitize filename
              $localName = $localName -replace '[<>:"/\\|?*'']', '_'
              $localPath = Join-Path $tempDir $localName

              try {
                Write-Host ("   [>] Downloading: " + $item.fileName + " ...") -ForegroundColor Yellow
                Invoke-WebRequest -Uri $fUrl -OutFile $localPath -TimeoutSec 60
                Write-Host ("   [+] Downloaded: " + $localPath) -ForegroundColor Green

                $copies = if ($item.copies) { [int]$item.copies } else { 1 }
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $printedThisFile = $false

                # Method 1: SumatraPDF high-fidelity silent printing with exact paper & fit
                if (Test-Path $sumatraExe) {
                  try {
                    Write-Host ("   [*] Sending to spooler: " + $pName + " (" + $copies + " copy/copies)") -ForegroundColor Cyan
                    $paper = if ($item.paperSize) { $item.paperSize } else { "A4" }
                    $copySetting = "fit,paper=" + $paper + "," + $copies + "x"
                    $pArgs = @("-print-to", $pName, "-print-settings", $copySetting, "-silent", $localPath)
                    $p = Start-Process -FilePath $sumatraExe -ArgumentList $pArgs -PassThru -Wait
                    $printedThisFile = $true
                    Write-Host ("   [+] Document spooled & printed: " + $item.fileName) -ForegroundColor Green
                  } catch {
                    Write-Host ("   [!] Spool engine note: " + $_.Exception.Message) -ForegroundColor DarkGray
                  }
                }

                # Method 2: Image fallback via mspaint /pt
                if (-not $printedThisFile -and ($ext -in @('.jpg', '.jpeg', '.png', '.bmp', '.gif'))) {
                  try {
                    for ($c = 1; $c -le $copies; $c++) {
                      Start-Process -FilePath "mspaint.exe" -ArgumentList @("/pt", $localPath, $pName) -Wait
                    }
                    $printedThisFile = $true
                    Write-Host ("   [+] Dispatched via Windows Paint: " + $item.fileName) -ForegroundColor Green
                  } catch {}
                }

                # Method 3: Plain text file fallback
                if (-not $printedThisFile -and ($ext -eq '.txt')) {
                  try {
                    for ($c = 1; $c -le $copies; $c++) {
                      Get-Content -LiteralPath $localPath | Out-Printer -Name $pName
                    }
                    $printedThisFile = $true
                    Write-Host ("   [+] Dispatched via Out-Printer: " + $item.fileName) -ForegroundColor Green
                  } catch {}
                }

                # Method 4: Shell verb print fallback
                if (-not $printedThisFile) {
                  for ($c = 1; $c -le $copies; $c++) {
                    Start-Process -FilePath $localPath -Verb Print -ErrorAction Stop
                  }
                  $printedThisFile = $true
                  Write-Host ("   [+] Dispatched via Windows Shell Print: " + $item.fileName) -ForegroundColor Green
                }

                if ($printedThisFile) {
                  $filesPrinted++
                }
              } catch {
                Write-Host ("   [!] Print error for " + $item.fileName + ": " + $_.Exception.Message) -ForegroundColor Red
              }
            }
          }

          if ($filesPrinted -eq 0) {
            Write-Host "   [!] No files could be printed, printing order summary slip instead" -ForegroundColor Yellow
            $ticketLines = @(
              "========================================",
              " PRINT CATALYST - ORDER TICKET",
              "========================================",
              " Order ID: #" + $ord.id,
              " Customer: " + $ord.customerName,
              " Phone   : " + $ord.customerPhone,
              " Amount  : Rs. " + $ord.finalAmount,
              " Time    : " + (Get-Date),
              "========================================"
            )
            $ticketLines -join [Environment]::NewLine | Out-Printer -Name "$pName"
          } else {
            Write-Host ("   [SUCCESS] " + $filesPrinted + " document(s) printed on: " + $pName) -ForegroundColor Green
          }
        }
      }
    }
  } catch {
    # Network blip - quietly retry next cycle
  }
  Start-Sleep -Seconds 2
}


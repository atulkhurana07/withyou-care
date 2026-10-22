param([switch]$NavigationOnly, [switch]$RequestsOnly, [switch]$SignInOnly, [string]$Serial = 'emulator-5554', [string]$AdbPath = '')
$ErrorActionPreference = 'Stop'
if (!$AdbPath) {
    $adbCommand = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbCommand) { $AdbPath = $adbCommand.Source }
    else {
        $sdkPath = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
        $AdbPath = Join-Path $sdkPath 'platform-tools/adb.exe'
    }
}
if (!(Test-Path -LiteralPath $AdbPath)) { throw 'Set ANDROID_HOME, add adb to PATH, or pass -AdbPath.' }
$nativeAdb = $AdbPath
$nativeSerial = $Serial
$workspacePath = Split-Path $PSScriptRoot -Parent
$hierarchyPath = Join-Path $workspacePath 'tmp/native-window.xml'
New-Item -ItemType Directory -Force (Join-Path $workspacePath 'tmp'), (Join-Path $workspacePath 'docs/screenshots') | Out-Null
function Get-WithYouHierarchy {
    & $nativeAdb -s $nativeSerial wait-for-device
    & $nativeAdb -s $nativeSerial shell uiautomator dump /sdcard/withyou-window.xml | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Native hierarchy collection failed' }
    & $nativeAdb -s $nativeSerial pull /sdcard/withyou-window.xml $hierarchyPath | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Native hierarchy download failed' }
    [xml]$hierarchy = [IO.File]::ReadAllText($hierarchyPath)
    return $hierarchy
}
function Invoke-WithYouTap([string]$selector) {
    $hierarchy = Get-WithYouHierarchy
    $element = $hierarchy.SelectSingleNode($selector)
    if (!$element) { throw "Required native control unavailable: $selector" }
    $bounds = [regex]::Match($element.bounds, '\[(\d+),(\d+)\]\[(\d+),(\d+)\]')
    $tapX = [int](([int]$bounds.Groups[1].Value + [int]$bounds.Groups[3].Value) / 2)
    $tapY = [int](([int]$bounds.Groups[2].Value + [int]$bounds.Groups[4].Value) / 2)
    & $nativeAdb -s $nativeSerial shell input tap $tapX $tapY
}
# Only the named synthetic fixture is used. Never loads cloud patient data or private provider keys.
if ($RequestsOnly) {
    & $nativeAdb -s $nativeSerial push (Join-Path $workspacePath 'tmp/pdfs/clinical-hindi.pdf') /sdcard/Download/fictional-prescription.pdf | Out-Null
    Invoke-WithYouTap "//node[starts-with(@content-desc,'Requests') and contains(@content-desc,'Tab ')]"
    Invoke-WithYouTap "//node[@content-desc='Choose photo or PDF']"
    $pickerUi = Get-WithYouHierarchy
    if (!$pickerUi.SelectSingleNode("//node[@text='fictional-prescription.pdf']")) {
        Invoke-WithYouTap "//node[@content-desc='Show roots']"
        Invoke-WithYouTap "(//node[@text='Downloads'])[last()]"
    }
    Invoke-WithYouTap "//node[@text='fictional-prescription.pdf']"
    $selected = $false
    for ($attempt = 0; $attempt -lt 8; $attempt++) {
        $uploadUi = Get-WithYouHierarchy
        $selected = $null -ne $uploadUi.SelectSingleNode("//node[@content-desc='fictional-prescription.pdf']")
        if ($selected) { break }
        Start-Sleep -Seconds 1
    }
    if (!$selected) { throw 'Native picker did not preserve the selected file after returning to the app.' }
    Invoke-WithYouTap "//node[@content-desc='This prescription belongs to me.']"
    Invoke-WithYouTap "//node[@content-desc='I consent to my connected clinic reviewing this document.']"
    Invoke-WithYouTap "//node[@content-desc='Submit for review']"
    $submitted = $false
    for ($attempt = 0; $attempt -lt 8; $attempt++) {
        $uploadUi = Get-WithYouHierarchy
        $submitted = $null -ne $uploadUi.SelectSingleNode("//node[@content-desc='Choose photo or PDF']")
        if ($submitted) { break }
        Start-Sleep -Seconds 1
    }
    if (!$submitted) { throw 'Native submission did not finish successfully.' }
    & $nativeAdb -s $nativeSerial shell input swipe 540 1900 540 900 350
    $uploadUi = Get-WithYouHierarchy
    $success = $uploadUi.SelectSingleNode("//node[contains(@content-desc,'Document securely submitted') or contains(@content-desc,'already submitted')]")
    if (!$success) { throw 'Native upload success or duplicate acknowledgement was not visible.' }
    & $nativeAdb -s $nativeSerial shell screencap -p /sdcard/withyou-upload.png
    & $nativeAdb -s $nativeSerial pull /sdcard/withyou-upload.png (Join-Path $workspacePath 'docs/screenshots/android-prescription-uploaded.png') | Out-Null
    Write-Output 'Native Android file picker, consent and authenticated prescription upload passed.'
    exit
}
if (!$NavigationOnly) {
Start-Sleep -Seconds 2
Invoke-WithYouTap "//node[@hint='Email address']"
& $nativeAdb -s $nativeSerial shell input text 'patient@withyou.test'
& $nativeAdb -s $nativeSerial shell input keyevent 4
Invoke-WithYouTap "//node[@hint='Password']"
& $nativeAdb -s $nativeSerial shell input text 'WithYouDemo2026!'
& $nativeAdb -s $nativeSerial shell input keyevent 4
Invoke-WithYouTap "//node[@content-desc='Sign in']"
}
$connected = $false
for ($attempt = 0; $attempt -lt 8; $attempt++) {
    $careUi = Get-WithYouHierarchy
    $connected = $null -ne $careUi.SelectSingleNode("//node[contains(@content-desc,'Hello, Kamla Devi')]")
    if ($connected) { break }
    Start-Sleep -Seconds 1
}
if (!$connected) { throw 'Native patient sign-in did not reach the authenticated care screen.' }
& $nativeAdb -s $nativeSerial shell screencap -p /sdcard/withyou-today.png
& $nativeAdb -s $nativeSerial pull /sdcard/withyou-today.png (Join-Path $workspacePath 'docs/screenshots/android-today.png') | Out-Null
Write-Output 'Native Android patient sign-in and shared care-plan retrieval passed.'
if ($SignInOnly) { exit }
foreach ($screen in @('Schedule', 'Reports', 'Profile')) {
    Invoke-WithYouTap "//node[starts-with(@content-desc,'$screen') and contains(@content-desc,'Tab ')]"
    Start-Sleep -Milliseconds 500
    $screenUi = Get-WithYouHierarchy
    $selectedTab = $screenUi.SelectSingleNode("//node[starts-with(@content-desc,'$screen') and contains(@content-desc,'Tab ') and @selected='true']")
    if (!$selectedTab) { throw "Native navigation did not select $screen" }
    if ($screen -eq 'Profile') {
        if (!$screenUi.SelectSingleNode("//node[@content-desc='Enable care reminders']")) { throw 'Reminder opt-in control missing' }
        Invoke-WithYouTap "//node[@content-desc='Enable care reminders']"
        $permissionUi = Get-WithYouHierarchy
        if ($permissionUi.SelectSingleNode("//node[@resource-id='com.android.permissioncontroller:id/permission_allow_button']")) {
            Invoke-WithYouTap "//node[@resource-id='com.android.permissioncontroller:id/permission_allow_button']"
        }
        $enabled = $false
        for ($attempt = 0; $attempt -lt 8; $attempt++) {
            $screenUi = Get-WithYouHierarchy
            $enabled = $null -ne $screenUi.SelectSingleNode("//node[@content-desc='Turn off care reminders']")
            if ($enabled) { break }
            Start-Sleep -Seconds 1
        }
        if (!$enabled) { throw 'Android reminder opt-in failed' }
        $notificationDump = & $nativeAdb -s $nativeSerial shell dumpsys notification --noredact
        if (($notificationDump -join "`n") -notmatch 'Care reminders enabled') { throw 'Native confirmation notification missing' }
        Write-Output 'Android notification permission and neutral confirmation notification passed.'
    }
    & $nativeAdb -s $nativeSerial shell screencap -p /sdcard/withyou-screen.png
    & $nativeAdb -s $nativeSerial pull /sdcard/withyou-screen.png (Join-Path $workspacePath "docs/screenshots/android-$($screen.ToLower()).png") | Out-Null
}
Invoke-WithYouTap "//node[@content-desc='Turn off care reminders']"
$offUi = Get-WithYouHierarchy
if (!$offUi.SelectSingleNode("//node[@content-desc='Enable care reminders']")) { throw 'Reminder disabling failed' }
$notificationDump = & $nativeAdb -s $nativeSerial shell dumpsys notification --noredact
if (($notificationDump -join "`n") -match 'android.text=String \(Care reminders enabled') { throw 'Reminder notification was not cancelled' }
Write-Output 'All four Android tabs, reminder opt-in and cancellation passed.'

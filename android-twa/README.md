# Android TWA (sideload APK)

Thin Trusted Web Activity wrapper around https://matalot-two.vercel.app.
Website deploys update the app automatically — rebuild the APK only when changing
app identity (name, icon, package id, signing key) in `twa-manifest.json`.

Deliverable: `app-release-signed.apk` (~1.2 MB).

## Prerequisites (same machine setup as WorkDiary)

- JDK 17 + Android SDK under `%USERPROFILE%\.bubblewrap`
- Keystore: `C:\APPS\keys\matalot-twa.keystore` + `matalot-twa-credentials.txt` (BACK UP!)

## Rebuild steps (PowerShell)

```powershell
cd android-twa
npx @bubblewrap/cli update --skipVersionUpgrade
(Get-Content build.gradle) -replace 'jcenter\(\)', 'mavenCentral()' | Set-Content build.gradle
# bubblewrap build is broken on this machine (sdkmanager classpath) — use gradle directly:
$env:JAVA_HOME = "$env:USERPROFILE\.bubblewrap\jdk-17.0.19+10"
$env:ANDROID_HOME = "$env:USERPROFILE\.bubblewrap\android_sdk"
.\gradlew.bat assembleRelease
$bt = "$env:USERPROFILE\.bubblewrap\android_sdk\build-tools\36.0.0"
& "$bt\zipalign.exe" -f -p 4 app\build\outputs\apk\release\app-release-unsigned.apk app-release-aligned.apk
& "$bt\apksigner.bat" sign --ks C:\APPS\keys\matalot-twa.keystore --ks-key-alias matalot --ks-pass "pass:$(((Get-Content C:\APPS\keys\matalot-twa-credentials.txt | Select-String '^password=').Line -replace '^password=',''))" --out app-release-signed.apk app-release-aligned.apk
```

## Signing key — DON'T change

`public/.well-known/assetlinks.json` pins the cert SHA-256. New key ⇒ update
assetlinks AND uninstall/reinstall on every phone.

## Version bumps

Raise `appVersionCode`/`appVersionName` in `twa-manifest.json` before rebuilding.

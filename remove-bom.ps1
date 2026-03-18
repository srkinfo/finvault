$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false

$files = Get-ChildItem -Path "backend/src" -Include "*.java" -Recurse

foreach ($file in $files) {
    # Read file content as bytes
    $fullPath = $file.FullName
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    
    # Check if file starts with UTF-8 BOM (EF BB BF)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        # Remove BOM (first 3 bytes) and write back
        $contentWithoutBOM = $bytes[3..($bytes.Length-1)]
        [System.IO.File]::WriteAllBytes($fullPath, $contentWithoutBOM)
        Write-Host "Removed BOM from: $($file.Name)"
    }
}

Write-Host "BOM removal complete!"

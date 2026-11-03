$content = Get-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Raw
$lines = $content -split "`r`n"
$newContent = $lines[0..1294] -join "`r`n"
$newContent += "`r`n    <script src=""https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2""></script>`r`n    <script src=""app.js""></script>`r`n</body>`r`n</html>"
Set-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Value $newContent -Encoding utf8
Write-Host "Archivo index.html corregido exitosamente"

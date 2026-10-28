$lines = Get-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html'
$newContent = @()
for($i=0; $i -lt 1296; $i++) {
    $newContent += $lines[$i]
}
$newContent += '</body>'
$newContent += '</html>'
$newContent | Set-Content 'C:\Users\quevedo\Desktop\POS NEGOCIO\index_new.html' -Encoding utf8
Move-Item 'C:\Users\quevedo\Desktop\POS NEGOCIO\index_new.html' 'C:\Users\quevedo\Desktop\POS NEGOCIO\index.html' -Force
Write-Host "Archivo index.html corregido exitosamente"

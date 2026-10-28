with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep only first 1295 lines (0-1294)
new_lines = lines[:1295]

# Add the correct script tags
new_lines.append('    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n')
new_lines.append('    <script src="app.js"></script>\n')
new_lines.append('</body>\n')
new_lines.append('</html>\n')

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Archivo index.html corregido exitosamente')

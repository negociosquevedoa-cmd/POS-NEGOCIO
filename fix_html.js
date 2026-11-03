const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
const newContent = lines.slice(0, 1295).join('\n') + '\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    <script src="app.js"></script>\n</body>\n</html>\n';
fs.writeFileSync('index.html', newContent, 'utf8');
console.log('Archivo index.html corregido exitosamente');

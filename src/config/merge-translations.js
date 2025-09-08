const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '../src/translations');
const outputFile = path.join(translationsDir, 'index.json');

function mergeTranslations() {
  const merged = {};
  
  // قراءة جميع ملفات JSON
  const files = fs.readdirSync(translationsDir)
    .filter(file => file.endsWith('.json') && file !== 'index.json');
  
  files.forEach(file => {
    const filePath = path.join(translationsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(merged, content);
  });
  
  // كتابة الملف المدموج
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));
  console.log(`تم دمج ${files.length} ملف ترجمة`);
}

mergeTranslations();
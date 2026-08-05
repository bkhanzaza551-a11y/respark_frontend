const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const regex = /import CustomDropdown from '.*?';\n?/g;
        let match;
        let hadImport = false;
        let importStatement = '';
        
        while ((match = regex.exec(content)) !== null) {
            hadImport = true;
            importStatement = match[0].trim();
        }

        if (hadImport) {
            // Remove ALL occurrences of CustomDropdown import
            content = content.replace(regex, '');
            
            // Add it back cleanly at the top, right after the first line (which is usually import React...)
            const lines = content.split('\n');
            let insertIdx = 0;
            for(let i=0; i<lines.length; i++) {
                if(lines[i].startsWith('import ')) {
                    insertIdx = i;
                }
            }
            // Safer: just insert it at line 1
            lines.splice(1, 0, importStatement);
            
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log("Fixed imports in: " + filePath);
        }
    }
});

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function processFiles() {
    const files = findFiles(srcDir);
    let updatedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf-8');
        
        // Skip the CustomDropdown component itself!
        if (file.includes('CustomDropdown.jsx')) continue;
        
        // Check if the file contains a native select element
        if (content.match(/<select\b/) || content.match(/<\/select>/)) {
            // Replace <select ...> with <CustomDropdown ...>
            let newContent = content.replace(/<select\b/g, '<CustomDropdown');
            // Replace </select> with </CustomDropdown>
            newContent = newContent.replace(/<\/select>/g, '</CustomDropdown>');
            
            // Determine relative path from this file to src/components/common/CustomDropdown
            const fileDir = path.dirname(file);
            const customDropdownPath = path.join(srcDir, 'components', 'common', 'CustomDropdown');
            let relPath = path.relative(fileDir, customDropdownPath).replace(/\\/g, '/');
            if (!relPath.startsWith('.')) relPath = './' + relPath;

            // Add import if not already present
            if (!newContent.includes('CustomDropdown')) {
                // If it replaced successfully, the string 'CustomDropdown' should be present,
                // this check is just a safeguard. 
            }
            
            if (content !== newContent && !content.includes('import CustomDropdown')) {
                // Find the last import statement or the beginning of the file
                const importRegex = /^import\s+.*?;?\s*$/gm;
                let lastImportIndex = 0;
                let match;
                while ((match = importRegex.exec(newContent)) !== null) {
                    lastImportIndex = match.index + match[0].length;
                }
                
                const importStatement = `\nimport CustomDropdown from '${relPath}';\n`;
                if (lastImportIndex > 0) {
                    newContent = newContent.slice(0, lastImportIndex) + importStatement + newContent.slice(lastImportIndex);
                } else {
                    newContent = importStatement + newContent;
                }
            }

            if (content !== newContent) {
                fs.writeFileSync(file, newContent, 'utf-8');
                console.log(`Updated ${file}`);
                updatedCount++;
            }
        }
    }
    
    console.log(`\nFinished replacing select elements. Total files updated: ${updatedCount}`);
}

processFiles();

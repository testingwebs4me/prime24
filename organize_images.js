const fs = require('fs');
const path = require('path');

class ImageOrganizer {
  constructor() {
    this.imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    this.codeExtensions = ['.html', '.css', '.js', '.php', '.jsx', '.tsx', '.vue'];
    this.report = {
      originalFiles: [],
      renamedFiles: [],
      duplicatesRemoved: [],
      codeUpdates: [],
      errors: []
    };
  }

  // Find all image files recursively
  findImageFiles(dir = '.') {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findImageFiles(fullPath));
        } else if (this.imageExtensions.includes(path.extname(item).toLowerCase())) {
          files.push({
            path: fullPath,
            name: item,
            size: stat.size,
            dir: dir
          });
        }
      }
    } catch (err) {
      this.report.errors.push(`Error reading directory ${dir}: ${err.message}`);
    }
    
    return files;
  }

  // Find duplicate files by size and name patterns
  findDuplicates(files) {
    const duplicates = [];
    const sizeGroups = {};
    
    // Group by file size
    files.forEach(file => {
      if (!sizeGroups[file.size]) {
        sizeGroups[file.size] = [];
      }
      sizeGroups[file.size].push(file);
    });
    
    // Find potential duplicates
    Object.values(sizeGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by quality indicators (prefer non-WhatsApp, non-copy files)
        group.sort((a, b) => {
          const aScore = this.getQualityScore(a.name);
          const bScore = this.getQualityScore(b.name);
          return bScore - aScore;
        });
        
        // Mark all but the best as duplicates
        for (let i = 1; i < group.length; i++) {
          duplicates.push(group[i]);
        }
      }
    });
    
    return duplicates;
  }

  // Score file quality (higher is better)
  getQualityScore(filename) {
    let score = 0;
    if (!filename.toLowerCase().includes('whatsapp')) score += 10;
    if (!filename.toLowerCase().includes('copy')) score += 5;
    if (!filename.match(/^\d{4}-\d{2}-\d{2}/)) score += 3; // Not timestamp named
    if (filename.includes('_')) score += 1; // Properly named
    return score;
  }

  // Generate new filename based on content analysis
  generateNewName(file, index) {
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).toLowerCase();
    
    // Analyze filename to determine category
    let category = 'image';
    let description = 'asset';
    
    if (baseName.includes('hero') || baseName.includes('banner')) {
      category = 'hero';
      description = 'main';
    } else if (baseName.includes('catering')) {
      category = 'catering';
      description = 'service';
    } else if (baseName.includes('white') || baseName.includes('label')) {
      category = 'white_label';
      description = 'service';
    } else if (baseName.includes('hotel') || baseName.includes('cafe')) {
      category = 'hotels_cafes';
      description = 'service';
    } else if (baseName.includes('video') || baseName.includes('poster')) {
      category = 'video';
      description = 'poster';
    } else {
      description = `${String(index + 1).padStart(2, '0')}`;
    }
    
    return `${category}_${description}${ext}`;
  }

  // Search and update image references in code files
  updateCodeReferences(oldPath, newPath) {
    const updates = [];
    
    try {
      const items = fs.readdirSync('.');
      for (const item of items) {
        if (this.codeExtensions.includes(path.extname(item).toLowerCase())) {
          try {
            const content = fs.readFileSync(item, 'utf8');
            const oldPathNormalized = oldPath.replace(/\\/g, '/');
            const newPathNormalized = newPath.replace(/\\/g, '/');
            
            if (content.includes(oldPathNormalized)) {
              const updatedContent = content.replace(
                new RegExp(oldPathNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                newPathNormalized
              );
              
              fs.writeFileSync(item, updatedContent, 'utf8');
              updates.push({
                file: item,
                from: oldPathNormalized,
                to: newPathNormalized
              });
            }
          } catch (err) {
            this.report.errors.push(`Error updating ${item}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      this.report.errors.push(`Error scanning for code updates: ${err.message}`);
    }
    
    return updates;
  }

  // Main organization function
  organize() {
    console.log('Starting image organization...');
    
    // Create images directory if it doesn't exist
    if (!fs.existsSync('images')) {
      fs.mkdirSync('images', { recursive: true });
    }
    
    // Create backup directory
    const backupDir = 'images_backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Find all image files
    const allFiles = this.findImageFiles();
    console.log(`Found ${allFiles.length} image files`);
    
    if (allFiles.length === 0) {
      console.log('No image files found to organize');
      return this.report;
    }
    
    // Backup original files
    allFiles.forEach(file => {
      try {
        const backupPath = path.join(backupDir, file.name);
        fs.copyFileSync(file.path, backupPath);
      } catch (err) {
        this.report.errors.push(`Error backing up ${file.path}: ${err.message}`);
      }
    });
    
    // Find and remove duplicates
    const duplicates = this.findDuplicates(allFiles);
    duplicates.forEach(duplicate => {
      try {
        fs.unlinkSync(duplicate.path);
        this.report.duplicatesRemoved.push(duplicate.path);
        console.log(`Removed duplicate: ${duplicate.path}`);
      } catch (err) {
        this.report.errors.push(`Error removing duplicate ${duplicate.path}: ${err.message}`);
      }
    });
    
    // Get remaining files after duplicate removal
    const remainingFiles = allFiles.filter(file => 
      !duplicates.some(dup => dup.path === file.path)
    );
    
    // Rename and organize remaining files
    remainingFiles.forEach((file, index) => {
      const newName = this.generateNewName(file, index);
      const newPath = path.join('images', newName);
      
      try {
        // Move file to images directory with new name
        if (file.path !== newPath) {
          fs.copyFileSync(file.path, newPath);
          
          // Update code references
          const updates = this.updateCodeReferences(file.path, newPath);
          this.report.codeUpdates.push(...updates);
          
          // Remove original if it's not already in the images directory
          if (!file.path.startsWith('images/')) {
            fs.unlinkSync(file.path);
          }
          
          this.report.renamedFiles.push({
            from: file.path,
            to: newPath
          });
          
          console.log(`Renamed: ${file.path} -> ${newPath}`);
        }
      } catch (err) {
        this.report.errors.push(`Error renaming ${file.path}: ${err.message}`);
      }
    });
    
    return this.report;
  }

  // Generate report
  generateReport() {
    const report = [
      '# Image Organization Report',
      '',
      `## Summary`,
      `- Original files found: ${this.report.originalFiles.length}`,
      `- Files renamed: ${this.report.renamedFiles.length}`,
      `- Duplicates removed: ${this.report.duplicatesRemoved.length}`,
      `- Code files updated: ${this.report.codeUpdates.length}`,
      `- Errors encountered: ${this.report.errors.length}`,
      '',
      '## Renamed Files',
      ...this.report.renamedFiles.map(item => `- ${item.from} → ${item.to}`),
      '',
      '## Duplicates Removed',
      ...this.report.duplicatesRemoved.map(item => `- ${item}`),
      '',
      '## Code Updates',
      ...this.report.codeUpdates.map(item => `- ${item.file}: ${item.from} → ${item.to}`),
      ''
    ];
    
    if (this.report.errors.length > 0) {
      report.push('## Errors');
      report.push(...this.report.errors.map(error => `- ${error}`));
    }
    
    return report.join('\n');
  }
}

// Run the organizer
const organizer = new ImageOrganizer();
const report = organizer.organize();

// Save report
const reportContent = organizer.generateReport();
fs.writeFileSync('image_organization_report.md', reportContent);

console.log('\nOrganization complete! Check image_organization_report.md for details.');
console.log(`\nSummary:
- Files renamed: ${report.renamedFiles.length}
- Duplicates removed: ${report.duplicatesRemoved.length}
- Code updates: ${report.codeUpdates.length}
- Errors: ${report.errors.length}`);
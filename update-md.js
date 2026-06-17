const fs = require('fs');
const path = require('path');

function updateVibeUi() {
  const dir = '/Users/mac/Documents/code/vibe-ui/skills/ui-style-library/references';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add cover_image after name or id
    if (content.startsWith('---')) {
      const endIdx = content.indexOf('\n---', 3);
      if (endIdx !== -1) {
        const frontmatter = content.slice(0, endIdx);
        if (!frontmatter.includes('cover_image:')) {
          const updatedFrontmatter = frontmatter.replace(/\nname: (.*)/, '\nname: $1\ncover_image: ""');
          content = updatedFrontmatter + content.slice(endIdx);
          fs.writeFileSync(filePath, content);
        }
      }
    }
  }
}

function updateVibeMotion() {
  const dir = '/Users/mac/Documents/code/vibe-motion/skills/interaction-library/references';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // It uses ````yaml ... ---
    const match = content.match(/^`{3,4}yaml\n([\s\S]*?)\n---/);
    if (match) {
      let yamlContent = match[1];
      let updated = false;
      
      if (!yamlContent.includes('cover_video:')) {
        yamlContent = yamlContent.replace(/\nname: (.*)/, '\nname: $1\ncover_video: ""');
        updated = true;
      }
      if (!yamlContent.includes('components:')) {
        yamlContent += '\ncomponents: []';
        updated = true;
      }
      if (!yamlContent.includes('effects:')) {
        yamlContent += '\neffects: []';
        updated = true;
      }
      
      if (updated) {
        content = content.replace(match[1], yamlContent);
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

updateVibeUi();
updateVibeMotion();
console.log('Done updating markdown files.');

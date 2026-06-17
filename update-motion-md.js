const fs = require('fs');
const path = require('path');

const dir = '/Users/mac/Documents/code/vibe-motion/skills/interaction-library/references';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));

// Simple heuristic mapping for components and effects based on keywords in filename
function guessTags(filename) {
  const components = [];
  const effects = [];
  
  if (filename.includes('button')) components.push('Button');
  if (filename.includes('menu') || filename.includes('sidebar') || filename.includes('nav')) components.push('Navigation');
  if (filename.includes('accordion')) components.push('Accordion');
  if (filename.includes('carousel')) components.push('Carousel');
  if (filename.includes('list')) components.push('List');
  if (filename.includes('card')) components.push('Card');
  if (filename.includes('typography') || filename.includes('text')) components.push('Typography');
  
  if (components.length === 0) components.push('Container'); // fallback
  
  if (filename.includes('elastic') || filename.includes('fluid')) effects.push('Elastic');
  if (filename.includes('magnetic')) effects.push('Magnetic');
  if (filename.includes('reveal')) effects.push('Reveal');
  if (filename.includes('hover')) effects.push('Hover');
  if (filename.includes('scroll')) effects.push('Scroll');
  if (filename.includes('sticky')) effects.push('Sticky');
  if (filename.includes('slide')) effects.push('Slide');
  if (filename.includes('expand')) effects.push('Expand');
  
  if (effects.length === 0) effects.push('Motion'); // fallback
  
  return { components, effects };
}

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const baseName = file.replace('.md', '');
  const { components, effects } = guessTags(baseName);
  
  const match = content.match(/^`{3,4}yaml\n([\s\S]*?)\n---/);
  if (match) {
    let yamlContent = match[1];
    
    // Replace cover_video
    yamlContent = yamlContent.replace(/cover_video: .*/, `cover_video: "../assets/${baseName}.mov"`);
    
    // Replace components
    yamlContent = yamlContent.replace(/components: .*/, `components: ${JSON.stringify(components)}`);
    
    // Replace effects
    yamlContent = yamlContent.replace(/effects: .*/, `effects: ${JSON.stringify(effects)}`);
    
    content = content.replace(match[1], yamlContent);
    fs.writeFileSync(filePath, content);
  }
}

console.log('Updated vibe-motion references successfully.');

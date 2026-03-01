const fs = require('fs');
const path = require('path');
const DIR = 'src/lib/invitation-templates/json';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const fp = path.join(DIR, file);
  const tpl = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  let fixes = 0;

  for (const scene of tpl.scenes) {
    for (const el of scene.elements) {
      if (el.type !== 'text') continue;

      // Determine absolute y pixel position
      let absY;
      if (el.position === 'custom') {
        absY = el.y ?? 540;
      } else {
        // center-center: y is already an offset from 540
        absY = 540 + (el.y ?? 0);
      }

      // Convert back to center-center offset
      const yOffset = Math.round(absY - 540);

      // Apply the ONLY format that works in json2video for text type
      el.position = 'center-center';
      el.y = yOffset;
      el.style = '003';
      delete el.x;
      delete el['fade-in'];
      if (!el.width) el.width = 1700;
      fixes++;
    }
  }

  fs.writeFileSync(fp, JSON.stringify(tpl, null, 2));
  console.log(file + ': ' + fixes + ' text elements fixed');
}

// Now fix anniversary scene 1 - the label and couple name were too close to bottom
// Move them to clearly separated positions in the center area
const anniFp = path.join(DIR, 'anniversary.json');
const anni = JSON.parse(fs.readFileSync(anniFp, 'utf-8'));
const s1 = anni.scenes[0];
for (const el of s1.elements) {
  if (el.id === 'anni-years-label') {
    el.y = -80; // abs 460 - below badge, above couple name
    el.start = 1.5;
    console.log('anni-years-label: y -> -80 (abs 460)');
  }
  if (el.id === 'anni-couple-name') {
    el.y = 70;  // abs 610 - well below label
    el.start = 2.2;
    console.log('anni-couple-name: y -> 70 (abs 610)');
  }
  if (el.id === 'anni-ornament') {
    el.settings.rectangle1.top = '50%';
    console.log('anni-ornament: top -> 50%');
  }
}
fs.writeFileSync(anniFp, JSON.stringify(anni, null, 2));

// Fix wedding scene 1 - invite-sub was at y=930 (offset 390) — way off bottom
const wedFp = path.join(DIR, 'wedding.json');
const wed = JSON.parse(fs.readFileSync(wedFp, 'utf-8'));
for (const el of wed.scenes[0].elements) {
  if (el.id === 'wed-invite-sub') {
    el.y = 340; // abs 880 — bottom of screen but visible
    console.log('wed-invite-sub: y -> 340 (abs 880)');
  }
}
fs.writeFileSync(wedFp, JSON.stringify(wed, null, 2));

// Verify
console.log('\n--- VERIFY ---');
let bad = 0;
for (const file of files) {
  const tpl = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8'));
  for (const scene of tpl.scenes) {
    for (const el of scene.elements) {
      if (el.type === 'text') {
        if (el.position !== 'center-center') { console.log('BAD POS: ' + file + '/' + el.id); bad++; }
        if (el.style !== '003') { console.log('BAD STYLE: ' + file + '/' + el.id); bad++; }
        if (el.x !== undefined) { console.log('HAS X: ' + file + '/' + el.id); bad++; }
      }
    }
  }
}
console.log(bad === 0 ? 'All text elements correct!' : bad + ' issues found');

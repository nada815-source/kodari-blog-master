import fs from 'fs';
import path from 'path';

const logPath = 'd:\\초보프로젝트\\blog-generator\\backups\\20260605_V3_7_9_2_FINAL\\CHAT_LOG_V3_7_9_2.txt';
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (const line of lines) {
  if (line.trim()) {
    try {
      const data = JSON.parse(line);
      if (data.step_index === 552) {
        fs.writeFileSync('d:\\초보프로젝트\\blog-generator\\scratch\\step_552.md', data.content, 'utf8');
        console.log('Saved to scratch/step_552.md');
        break;
      }
    } catch (e) {
      // ignore
    }
  }
}

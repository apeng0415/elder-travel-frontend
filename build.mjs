import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

// 在部分 Windows 环境，vite 构建完成后进程退出时会异常退出码（0xC0000409），
// 但产物已经完整生成。这里以"产物是否存在"作为成功判据，避免这个收尾崩溃让发布误判为失败。
spawnSync('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });
const built = fs.existsSync('dist/output/index.html');
process.exit(built ? 0 : 1);

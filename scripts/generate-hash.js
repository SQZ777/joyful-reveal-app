#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 密碼雜湊產生器');
console.log('================');
console.log('');

rl.question('請輸入您的密碼: ', (password) => {
  if (!password) {
    console.log('❌ 密碼不能為空！');
    rl.close();
    return;
  }
  
  // 產生 SHA-256 雜湊
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  
  console.log('');
  console.log('✅ 雜湊值已生成！');
  console.log('==================');
  console.log(`密碼: ${password}`);
  console.log(`SHA-256: ${hash}`);
  console.log('');
  console.log('📝 請將以下雜湊值複製到 src/main.js 中的 CONFIG.PASS_HASH：');
  console.log('');
  console.log(`PASS_HASH: '${hash}',`);
  console.log('');
  console.log('⚠️  安全提醒：');
  console.log('- 請不要在程式碼中留下明文密碼');
  console.log('- 建議在部署後刪除此腳本');
  console.log('- 密碼建議使用特殊日期或有意義的字詞');
  
  rl.close();
});

rl.on('close', () => {
  console.log('');
  console.log('👋 再見！');
  process.exit(0);
});
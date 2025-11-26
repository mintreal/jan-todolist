const fs = require('fs');
const { execSync } = require('child_process');

// JSON 파일 읽기 (UTF-8 인코딩)
const issues = JSON.parse(fs.readFileSync('github-issues.json', 'utf8'));

console.log(`총 ${issues.length}개의 이슈를 생성합니다...\n`);

let successCount = 0;
let failCount = 0;

// 각 이슈 생성
for (let i = 0; i < issues.length; i++) {
  const issue = issues[i];
  const progress = i + 1;

  try {
    console.log(`[${progress}/${issues.length}] 생성 중: ${issue.title}`);

    // 본문을 임시 파일에 저장
    const tempFile = `temp_body_${i}.md`;
    fs.writeFileSync(tempFile, issue.body, 'utf8');

    // 라벨을 쉼표로 구분
    const labels = issue.labels.join(',');

    // gh CLI로 이슈 생성
    const result = execSync(
      `gh issue create --title "${issue.title}" --body-file "${tempFile}" --label "${labels}"`,
      { encoding: 'utf8' }
    );

    // 임시 파일 삭제
    fs.unlinkSync(tempFile);

    console.log(`✅ 생성 완료: ${result.trim()}\n`);
    successCount++;

    // API rate limit 방지를 위해 1초 대기
    execSync('timeout /t 1 /nobreak >nul 2>&1', { stdio: 'ignore' });

  } catch (error) {
    failCount++;
    console.error(`❌ 생성 실패: ${issue.title}`);
    console.error(`   에러: ${error.message}\n`);
  }
}

console.log('\n======================================');
console.log(`모든 이슈 생성이 완료되었습니다!`);
console.log(`성공: ${successCount}개, 실패: ${failCount}개`);
console.log('======================================\n');

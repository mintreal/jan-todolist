const fs = require('fs');
const { execSync } = require('child_process');

// JSON 파일 읽기
const issues = JSON.parse(fs.readFileSync('github-issues.json', 'utf8'));

console.log(`총 ${issues.length}개의 이슈를 생성합니다...\n`);

// 각 이슈 생성
issues.forEach((issue, index) => {
  try {
    console.log(`[${index + 1}/${issues.length}] 생성 중: ${issue.title}`);

    // 라벨을 ,로 구분된 문자열로 변환
    const labels = issue.labels.join(',');

    // gh CLI로 이슈 생성
    const command = `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --body "${issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --label "${labels}"`;

    execSync(command, { stdio: 'inherit' });

    console.log(`✅ 생성 완료\n`);

    // API rate limit 방지를 위해 잠깐 대기
    execSync('timeout /t 1 /nobreak', { stdio: 'ignore' });
  } catch (error) {
    console.error(`❌ 생성 실패: ${issue.title}`);
    console.error(error.message);
  }
});

console.log('\n모든 이슈 생성이 완료되었습니다!');

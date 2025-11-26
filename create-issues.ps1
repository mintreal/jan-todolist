# GitHub Issues 생성 스크립트 (PowerShell)

$issues = Get-Content -Path "github-issues.json" -Raw | ConvertFrom-Json

Write-Host "총 $($issues.Count)개의 이슈를 생성합니다...`n" -ForegroundColor Green

$createdIssues = @()

foreach ($i in 0..($issues.Count - 1)) {
    $issue = $issues[$i]
    $progress = $i + 1

    Write-Host "[$progress/$($issues.Count)] 생성 중: $($issue.title)" -ForegroundColor Cyan

    try {
        # 라벨을 쉼표로 구분
        $labels = $issue.labels -join ","

        # 본문 내용을 임시 파일에 저장 (특수 문자 처리를 위해)
        $tempFile = "temp_body_$i.txt"
        $issue.body | Out-File -FilePath $tempFile -Encoding UTF8

        # gh CLI로 이슈 생성
        $result = gh issue create --title $issue.title --body-file $tempFile --label $labels

        # 임시 파일 삭제
        Remove-Item $tempFile

        # 생성된 이슈 URL 저장
        $createdIssues += @{
            title = $issue.title
            url = $result
        }

        Write-Host "✅ 생성 완료: $result`n" -ForegroundColor Green

        # API rate limit 방지를 위해 잠깐 대기
        Start-Sleep -Seconds 1

    } catch {
        Write-Host "❌ 생성 실패: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "모든 이슈 생성이 완료되었습니다!" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green

Write-Host "생성된 이슈 목록:" -ForegroundColor Cyan
foreach ($created in $createdIssues) {
    Write-Host "- $($created.title)"
    Write-Host "  $($created.url)`n"
}

const { test, expect } = require('@playwright/test');

/**
 * 시나리오 1: 첫 방문자의 회원가입 및 첫 할일 추가
 * 참조: docs/3-user-scenarios.md
 */

const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'password1234',
  name: '테스트유저',
};

test.describe('시나리오 1: 회원가입 및 첫 할일 추가', () => {
  test('새 사용자가 회원가입하고 첫 할일을 추가할 수 있다', async ({ page }) => {
    // 1. 랜딩 페이지 접속
    await page.goto('/');
    await expect(page).toHaveTitle(/Jan TodoList/);

    // 로그인 화면 확인
    await expect(page.getByText('로그인')).toBeVisible();

    // 2. 회원가입 화면 이동
    await page.getByRole('link', { name: /회원가입/ }).click();
    await expect(page.getByText('회원가입')).toBeVisible();

    // 3. 회원 정보 입력
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="name"]', TEST_USER.name);

    // 4. 가입하기 버튼 클릭
    await page.getByRole('button', { name: /가입하기/ }).click();

    // 5. 할일 목록 화면 진입 확인
    await expect(page).toHaveURL(/\/todos/, { timeout: 10000 });
    await expect(page.getByText(new RegExp(TEST_USER.name))).toBeVisible();

    // 6. 첫 할일 추가
    const todoTitle = '테스트 할일';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await page.fill('input[placeholder*="할일"]', todoTitle);

    // 하루종일 체크 확인
    const isAllDayCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(isAllDayCheckbox).toBeChecked();

    // 날짜 입력
    await page.fill('input[type="date"]#start_date', tomorrowStr);
    await page.fill('input[type="date"]#end_date', tomorrowStr);

    await page.getByRole('button', { name: /추가하기/ }).click();

    // 7. 추가된 할일 확인
    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    console.log('✅ 회원가입 및 첫 할일 추가 테스트 성공');
  });
});

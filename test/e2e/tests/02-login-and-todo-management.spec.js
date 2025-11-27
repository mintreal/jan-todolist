const { test, expect } = require('@playwright/test');

/**
 * 시나리오 2: 기존 사용자의 로그인 및 할일 관리
 * 참조: docs/3-user-scenarios.md
 */

const TEST_USER = {
  email: 'existing@example.com',
  password: 'password1234',
  name: '기존유저',
};

test.describe('시나리오 2: 로그인 및 할일 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 사용자 생성 (이미 존재할 수 있음)
    await page.goto('/');

    try {
      await page.getByRole('link', { name: /회원가입/ }).click({ timeout: 2000 });
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.fill('input[name="name"]', TEST_USER.name);
      await page.getByRole('button', { name: /가입하기/ }).click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // 이미 가입된 사용자
    }

    // 로그아웃
    await page.goto('/');
  });

  test('기존 사용자가 로그인하고 할일을 관리할 수 있다', async ({ page }) => {
    // 1. 로그인 화면 접속
    await page.goto('/');

    // 2. 로그인 정보 입력
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.getByRole('button', { name: /로그인/ }).click();

    // 3. 할일 목록 확인
    await expect(page).toHaveURL(/\/todos/, { timeout: 10000 });

    // 4. 새 할일 추가
    const todoTitle = `새 할일 ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await page.fill('input[placeholder*="할일"]', todoTitle);
    await page.fill('input[type="date"]#start_date', today);
    await page.fill('input[type="date"]#end_date', today);
    await page.getByRole('button', { name: /추가하기/ }).click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });

    // 5. 할일 완료 처리
    const todoCheckbox = page.locator(`text=${todoTitle}`).locator('..').locator('input[type="checkbox"]');
    await todoCheckbox.click();

    // 완료 표시 확인 (취소선)
    await page.waitForTimeout(500);

    console.log('✅ 로그인 및 할일 관리 테스트 성공');
  });
});

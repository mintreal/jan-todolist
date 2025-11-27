const { test, expect } = require('@playwright/test');

/**
 * 시나리오: 하루종일 체크박스 기능 테스트
 * 하루종일 체크 시: 날짜만 입력
 * 하루종일 언체크 시: 날짜+시간 입력
 */

const TEST_USER = {
  email: `allday${Date.now()}@example.com`,
  password: 'password1234',
  name: '하루종일테스트',
};

test.describe('하루종일 체크박스 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 회원가입 및 로그인
    await page.goto('/');
    await page.getByRole('link', { name: /회원가입/ }).click();
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.getByRole('button', { name: /가입하기/ }).click();
    await expect(page).toHaveURL(/\/todos/, { timeout: 10000 });
  });

  test('하루종일 체크 시 날짜만 입력, 언체크 시 날짜+시간 입력', async ({ page }) => {
    // 1. 하루종일 체크 상태 확인 (기본값: 체크됨)
    const isAllDayCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(isAllDayCheckbox).toBeChecked();

    // 날짜 input 타입 확인
    const startDateInput = page.locator('#start_date');
    await expect(startDateInput).toHaveAttribute('type', 'date');
    console.log('✅ 하루종일 체크 시 date type 확인');

    // 2. 하루종일 언체크
    await isAllDayCheckbox.uncheck();
    await page.waitForTimeout(500);

    // datetime-local input 타입 확인
    await expect(startDateInput).toHaveAttribute('type', 'datetime-local');
    console.log('✅ 하루종일 언체크 시 datetime-local type 확인');

    // 3. 다시 체크
    await isAllDayCheckbox.check();
    await page.waitForTimeout(500);

    // date input 타입으로 복귀 확인
    await expect(startDateInput).toHaveAttribute('type', 'date');
    console.log('✅ 하루종일 재체크 시 date type 복귀 확인');

    // 4. 하루종일 할일 추가
    const todoTitle = '하루종일 할일';
    const today = new Date().toISOString().split('T')[0];

    await page.fill('input[placeholder*="할일"]', todoTitle);
    await page.fill('#start_date', today);
    await page.fill('#end_date', today);
    await page.getByRole('button', { name: /추가하기/ }).click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
    console.log('✅ 하루종일 할일 추가 성공');

    // 5. 하루종일이 아닌 할일 추가
    await isAllDayCheckbox.uncheck();
    await page.waitForTimeout(500);

    const todoTitleWithTime = '시간 포함 할일';
    const now = new Date();
    const datetimeStr = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

    await page.fill('input[placeholder*="할일"]', todoTitleWithTime);
    await page.fill('#start_date', datetimeStr);
    await page.fill('#end_date', datetimeStr);
    await page.getByRole('button', { name: /추가하기/ }).click();

    await expect(page.getByText(todoTitleWithTime)).toBeVisible({ timeout: 5000 });
    console.log('✅ 시간 포함 할일 추가 성공');

    console.log('✅ 하루종일 체크박스 기능 전체 테스트 성공');
  });
});

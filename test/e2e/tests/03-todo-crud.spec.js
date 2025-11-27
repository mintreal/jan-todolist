const { test, expect } = require('@playwright/test');

/**
 * 시나리오: 할일 CRUD (생성, 조회, 수정, 삭제) 테스트
 * 참조: docs/3-user-scenarios.md
 */

const TEST_USER = {
  email: `crud${Date.now()}@example.com`,
  password: 'password1234',
  name: 'CRUD테스트',
};

test.describe('할일 CRUD 테스트', () => {
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

  test('할일 CRUD 전체 흐름 테스트', async ({ page }) => {
    const todoTitle = `CRUD 테스트 ${Date.now()}`;
    const updatedTitle = `${todoTitle} (수정됨)`;
    const today = new Date().toISOString().split('T')[0];

    // 1. 생성 (Create)
    await page.fill('input[placeholder*="할일"]', todoTitle);
    await page.fill('input[type="date"]#start_date', today);
    await page.fill('input[type="date"]#end_date', today);
    await page.getByRole('button', { name: /추가하기/ }).click();

    await expect(page.getByText(todoTitle)).toBeVisible({ timeout: 5000 });
    console.log('✅ 생성 (Create) 성공');

    // 2. 조회 (Read)
    await expect(page.getByText(todoTitle)).toBeVisible();
    console.log('✅ 조회 (Read) 성공');

    // 3. 수정 (Update)
    // 할일 클릭하여 편집 모드 진입
    await page.getByText(todoTitle).click();

    // 편집 모드 확인
    await page.waitForTimeout(500);

    // 제목 수정
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // 저장 버튼 클릭
    await page.getByRole('button', { name: /저장/ }).click();

    await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 5000 });
    console.log('✅ 수정 (Update) 성공');

    // 4. 삭제 (Delete)
    // 삭제 버튼 클릭
    const deleteButton = page.locator(`text=${updatedTitle}`).locator('..').getByRole('button', { name: /삭제/ });
    await deleteButton.click();

    // 삭제 확인 (할일이 목록에서 사라짐)
    await expect(page.getByText(updatedTitle)).not.toBeVisible({ timeout: 5000 });
    console.log('✅ 삭제 (Delete) 성공');

    console.log('✅ 할일 CRUD 전체 흐름 테스트 성공');
  });
});

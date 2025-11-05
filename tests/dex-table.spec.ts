import { test, expect } from '@playwright/test';

test.describe('DEX Table E2E Tests', () => {
  test('should display DEX information on Analytics page', async ({ page }) => {
    // アプリケーションを起動
    await page.goto('http://localhost:3003');

    // 「分析」タブをクリック
    await page.click('text=分析');

    // DEX情報のセクションが表示されるまで待つ
    await expect(page.locator('h2:has-text("DEX情報")')).toBeVisible();

    // テーブルが表示されることを確認
    await expect(page.locator('table')).toBeVisible();

    // テーブルヘッダーを確認
    await expect(page.locator('th:has-text("DEX")')).toBeVisible();
    await expect(page.locator('th:has-text("チェーン")')).toBeVisible();
    await expect(page.locator('th:has-text("ペア")')).toBeVisible();
    await expect(page.locator('th:has-text("価格 (USD)")')).toBeVisible();
    await expect(page.locator('th:has-text("取引高 (24h)")')).toBeVisible();
    await expect(page.locator('th:has-text("リンク")')).toBeVisible();

    // データが読み込まれるまで待つ（最大10秒）
    await page.waitForTimeout(2000);

    // テーブルに行が表示されていることを確認（ローディング、エラー、データなしメッセージ以外）
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // データが表示されている場合
      console.log(`Found ${rowCount} DEX entries`);

      // 最初の行のデータを確認
      const firstRow = tableRows.first();
      await expect(firstRow.locator('td').first()).toBeVisible();

      // 取引リンクが存在することを確認
      const tradeLink = firstRow.locator('a:has-text("取引")');
      await expect(tradeLink).toBeVisible();
      await expect(tradeLink).toHaveAttribute('target', '_blank');
    } else {
      // データなしまたはエラーメッセージを確認
      const hasNoData = await page.locator('text=データがありません').isVisible();
      const hasError = await page.locator('text=DEX情報の取得に失敗しました').isVisible();

      expect(hasNoData || hasError).toBeTruthy();
      console.log('No DEX data or error occurred');
    }

    // フッターのデータ提供元が表示されることを確認
    await expect(
      page.locator('text=データ提供: CoinGecko API | 5分ごとに更新')
    ).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // ネットワークリクエストを傍受してエラーを返す
    await page.route('**/api.coingecko.com/**', (route) =>
      route.abort('failed')
    );

    await page.goto('http://localhost:3003');
    await page.click('text=分析');

    // エラーメッセージが表示されることを確認
    await expect(
      page.locator('text=DEX情報の取得に失敗しました')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display loading state initially', async ({ page }) => {
    // ネットワークリクエストを遅延させる
    await page.route('**/api.coingecko.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('http://localhost:3003');
    await page.click('text=分析');

    // 読み込み中メッセージが表示されることを確認
    await expect(page.locator('text=読み込み中...')).toBeVisible({
      timeout: 1000,
    });
  });
});

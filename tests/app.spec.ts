import { test, expect } from '@playwright/test';
import { dogPopulationsTableRow } from './app.spec.ts-data';

test('首頁、資料狀態頁之間導覽', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^圖表頁 目錄/);

  await page.getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: '全國遊蕩犬統計'}) })
    .getByRole('link', { name: '資料狀態'}).click();

  await expect(page).toHaveTitle(/^資料狀態 - 全國遊蕩犬統計/);
  await expect(page).toHaveURL('/dog-populations/resource/');
  await expect(page.getByText('遊蕩犬熱區圖')).toBeVisible();
  await page.getByRole('link', { name: '返回'}).and(page.locator('a.fixed')).click();

  await expect(page).toHaveURL('/');
  await page.getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: '臺南市流浪犬 TNVR 成果'}) })
    .getByRole('link', { name: '資料狀態'}).click();

  await expect(page).toHaveTitle(/^資料狀態 - 臺南市流浪犬 TNVR 成果/);
  await expect(page).toHaveURL('/tainan/resource/');
  await expect(page.getByText('112年臺南市各行政區執行流浪犬TNVR成果表')).toBeVisible();
});

test('全國遊蕩犬統計', async ({ page }) => {
  await page.goto('/dog-populations');
  await expect(page).toHaveTitle(/^全國遊蕩犬統計/);

  // 篩選縣市
  const areaBtn = page.getByRole('group', { name: '縣市' }).getByLabel('雲林縣');
  await areaBtn.click({ force: true });
  await expect(areaBtn).not.toBeChecked();

  // 篩選年度
  const yearsInput = page.getByRole('group', { name: '年度' });
  await yearsInput.getByLabel('88').click({ force: true });
  await yearsInput.getByLabel('91').click({ force: true, modifiers: ['Shift'] });

  // 套用
  await page.getByRole('button', { name: '套用' }).click();

  // 輸出表格
  const tableMenu = page.getByRole('menu', { name:'製作表格' });
  const menuItemByCities = tableMenu.getByLabel('區域逐年詳情');
  const dialog = page.getByLabel('資料表格對話框');

  await page.getByRole('menu', { name: '資料輸出' }).getByLabel('製作表格').hover();
  await expect(tableMenu).toBeVisible();
  await expect(menuItemByCities).toBeVisible();
  await menuItemByCities.click({ force: true });

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '隱藏空欄' }).click();

  await expect(dialog.getByText('雲林縣')).toHaveCount(0);

  await expect(
    await dialog.getByText('臺北市').locator('//following-sibling::td').allTextContents()
  ).toEqual(dogPopulationsTableRow);

  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 640, height: 480 });
  await expect(page.getByLabel('主圖表').locator('canvas')).toHaveScreenshot('dog-populations-chart.png');
});

test('臺南市流浪犬 TNVR 成果', async ({ page }) => {
  await page.goto('/tainan');
  await expect(page).toHaveTitle(/^臺南市流浪犬 TNVR 成果/);

  // 篩選行政區
  const areaBtn = page.getByRole('group', { name: '行政區' }).getByLabel('742 大內區');
  await areaBtn.click({ force: true, position: { x: 5, y: 5 } }); // slight offset to help hit in <label> area
  await expect(areaBtn).not.toBeChecked();

  // 篩選年度
  const yearsInput = page.getByRole('group', { name: '年度' });
  await yearsInput.getByLabel('109').click({ force: true });

  // 套用
  await page.getByRole('button', { name: '套用' }).click();

  // 輸出表格
  const tableMenu = page.getByRole('menu', { name:'製作表格' });
  const menuItemByCities = tableMenu.getByLabel('區域逐年詳情');

  await page.getByRole('menu', { name: '資料輸出' }).getByLabel('製作表格').hover();
  await expect(tableMenu).toBeVisible();
  await expect(menuItemByCities).toBeVisible();
  await menuItemByCities.click({ force: true });

  const dialog = page.getByLabel('資料表格對話框');

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '隱藏空欄' }).click();

  await expect(dialog.getByText('大內區')).toHaveCount(0);

  await expect(await dialog.getByText('麻豆區').locator('//following-sibling::td').allTextContents()).toEqual(
    Array.from(
      [ 34,71,105,41,133,174,52,126,178,166 ]
    ).map((n) => (n ? `${n}` : ''))
  );
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 640, height: 480 });
  await expect(page.getByLabel('主圖表').locator('canvas')).toHaveScreenshot('tainan-chart.png');
});

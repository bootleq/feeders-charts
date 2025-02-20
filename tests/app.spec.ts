import { test, expect } from '@playwright/test';

test('首頁、資料狀態頁之間導覽', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: '遊蕩犬隻估計數量'}) })
    .getByRole('link', { name: '資料狀態'}).click();

  await expect(page).toHaveURL('/dog-populations/resource');
  await expect(page.getByText('遊蕩犬熱區圖')).toBeVisible();
  await page.getByRole('link', { name: '返回'}).click();

  await expect(page).toHaveURL('/');
  await page.getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: '臺南市遊蕩犬調查情形'}) })
    .getByRole('link', { name: '資料狀態'}).click();

  await expect(page).toHaveURL('/tainan/resource');
  await expect(page.getByText('112年臺南市各行政區執行流浪犬TNVR成果表')).toBeVisible();
});

test('遊蕩犬隻估計數量', async ({ page }) => {
  await page.goto('/dog-populations');

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
  const menuItemByCities = tableMenu.getByLabel('縣市逐年詳情');
  const dialog = page.getByLabel('資料表格對話框');

  await page.getByRole('menu', { name: '資料輸出' }).getByLabel('製作表格').hover();
  await expect(tableMenu).toBeVisible();
  await expect(menuItemByCities).toBeVisible();
  await menuItemByCities.click({ force: true });

  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '隱藏空欄' }).click();

  await expect(dialog.getByText('雲林縣')).toHaveCount(0);

  await expect(await dialog.getByText('臺北市').locator('//following-sibling::td').allTextContents()).toEqual(
    Array.from(
      [
        217539,4946,0.18826570968102932,142863,138057,7171,3146,2029,3192,149164,0.12169629074128367,5222,2200,1204,7225,3348,1625,139844,6821,3641,1291,6843,4235,813,154522,6062,3964,273,5163,4251,216,595,2931,148096,0.10846255895408197,3812,3594,39,252,3755,3186,,233,169263,3244,2817,179,168,4660,0.17366953668619892,3057,2761,3,131,,69,140959,2983,2422,3,213,3,81,3259,0.1232117006881935,2536,2215,3,209,,83,126358,2085,1944,,182,,81,2364,0.09364627456976786,2120,1813,,162,,88,118739,2165,1646,,217,,87,8,4,,1908,0.07595886119035657,2147,1883,,255,,86,14,11,''
      ]
    ).map((n) => (n ? `${n}` : ''))
  );
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 640, height: 480 });
  await expect(page.getByLabel('主圖表').locator('canvas')).toHaveScreenshot('dog-populations-chart.png');
});

test('臺南市遊蕩犬調查情形', async ({ page }) => {
  await page.goto('/tainan');

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
  const menuItemByCities = tableMenu.getByLabel('縣市逐年詳情');

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

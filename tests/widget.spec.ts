import { test, expect } from '@playwright/test';
import { EventsWidgetPage } from '../src/pages/EventsWidgetPage';

test.describe('3snet Events Widget Constructor Tests', () => {
  let widgetPage: EventsWidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new EventsWidgetPage(page);
    widgetPage.setupConsoleErrorListener();
  });

  test('TC-01: Страница загружается, форма отображается', async ({ page }) => {
    const response = await widgetPage.goto();
    expect(response?.status()).toBe(200);

    const title = await page.title();
    console.log(`Current Page Title: "${title}"`);
    expect(title).toContain('3Snet');
  });

  test('TC-02: Основные элементы видны пользователю', async () => {
    await widgetPage.goto();    
    await expect(widgetPage.mainHeader).toBeVisible();
    await expect(widgetPage.widthInput).toBeVisible();
    await expect(widgetPage.heightInput).toBeVisible();
    await expect(widgetPage.generateButton).toBeVisible();
  });

  test('TC-03: Генерация кода меняет значения width и height', async () => {
    await widgetPage.goto();

    const testWidth = '455';
    const testHeight = '555';

    await widgetPage.setWidth(testWidth);
    await widgetPage.setHeight(testHeight);
    
    await widgetPage.generatePreview();


    await expect(widgetPage.codeOutputArea).toHaveValue(new RegExp(`width="${testWidth}"`));
    await expect(widgetPage.codeOutputArea).toHaveValue(new RegExp(`height="${testHeight}"`));
  });

  test('TC-04: Кнопка "Скопировать код" работает', async () => {
    await widgetPage.goto();
    
    await expect(widgetPage.copyButton).toBeVisible();
    await widgetPage.copyButton.click();
    await expect(widgetPage.copyButton).toHaveText('Скопировано', { timeout: 5000 });
  });
});
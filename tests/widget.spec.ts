import { test, expect } from '@playwright/test';
import { EventsWidgetPage } from '../src/pages/EventsWidgetPage';

test.describe('3snet Events Widget Constructor Tests', () => {
  let widgetPage: EventsWidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new EventsWidgetPage(page);
    widgetPage.setupConsoleErrorListener();
  });

  test('TC-01: Страница загружается и отвечает 200', async ({ page }) => {
    const response = await widgetPage.goto();
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title).toContain('3Snet');
  });

  test('TC-02: Основные элементы конструктора отображаются', async () => {
    await widgetPage.goto();
    await expect(widgetPage.mainHeader).toBeVisible();
    await expect(widgetPage.widthInput).toBeVisible();
    await expect(widgetPage.heightInput).toBeVisible();
    await expect(widgetPage.generateButton).toBeVisible();
  });

  test('TC-03: Генерация кода учитывает width и height', async () => {
    await widgetPage.goto();

    const testWidth = '455';
    const testHeight = '555';

    await widgetPage.setWidth(testWidth);
    await widgetPage.setHeight(testHeight);

    await widgetPage.generatePreview();

    await expect(widgetPage.codeOutputArea).toHaveValue(
      new RegExp(`width\\s*=\\s*["']?${testWidth}["']?`)
    );
    await expect(widgetPage.codeOutputArea).toHaveValue(
      new RegExp(`height\\s*=\\s*["']?${testHeight}["']?`)
    );
  });

  test('TC-04: Кнопка "Скопировать код" меняет текст', async () => {
    await widgetPage.goto();
    await expect(widgetPage.copyButton).toBeVisible();

    await widgetPage.copyButton.click();

    await expect(widgetPage.copyButton).toHaveText(/скопирован|copied|готово/i, {
      timeout: 5000,
    });
  });

  test('TC-05: На странице нет JavaScript-ошибок', async () => {
    await widgetPage.goto();
    await widgetPage.generatePreview();
    expect(widgetPage.consoleErrors).toHaveLength(0);
  });
});

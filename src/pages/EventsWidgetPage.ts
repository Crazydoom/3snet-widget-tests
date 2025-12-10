import { type Locator, type Page, expect } from '@playwright/test';

export class EventsWidgetPage {
  readonly page: Page;

  readonly mainHeader: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly generateButton: Locator;
  readonly codeOutputArea: Locator;
  readonly copyButton: Locator;

  // Собираем JS-ошибки страницы
  consoleErrors: string[] = [];

  constructor(page: Page) {
    this.page = page;

    this.mainHeader = page.getByRole('heading', { level: 1 });

    this.widthInput = page.locator('input[name="width"]');
    this.heightInput = page.locator('input[name="height"]');

    this.generateButton = page.getByRole('button', { name: /сгенерировать|generate/i });

    this.codeOutputArea = page.locator('#code');
    this.copyButton = page.locator('#code-copy-button');
  }

  async goto() {
    const response = await this.page.goto('/eventswidget/', { waitUntil: 'domcontentloaded' });

    // Страница считается загруженной, когда видны ключевые поля конструктора
    await expect(this.widthInput).toBeVisible({ timeout: 10_000 });
    await expect(this.generateButton).toBeVisible({ timeout: 10_000 });

    return response;
  }

  async setWidth(value: string) {
    await this.widthInput.fill(value);
    await this.widthInput.blur();
  }

  async setHeight(value: string) {
    await this.heightInput.fill(value);
    await this.heightInput.blur();
  }

  async generatePreview() {
    await this.generateButton.click();

    // Признак завершённой генерации — embed-код больше не пустой
    await expect(this.codeOutputArea).not.toHaveValue('', { timeout: 7000 });
  }

  async verifyCodeContains(snippet: string) {
    await expect(this.codeOutputArea).toContainText(snippet);
  }

  setupConsoleErrorListener() {
    this.consoleErrors = [];

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();

        // Фильтруем внешний шум (например, сторонние скрипты)
        if (!text.includes('yandex') && !text.includes('socket')) {
          this.consoleErrors.push(text);
          console.log(`PAGE ERROR: ${text}`);
        }
      }
    });
  }
}

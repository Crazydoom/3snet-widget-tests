import { type Locator, type Page, expect } from '@playwright/test';

export class EventsWidgetPage {
  readonly page: Page;
  
  readonly mainHeader: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly generateButton: Locator;
  readonly codeOutputArea: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Ищем заголовок первого уровня. 
    this.mainHeader = page.getByRole('heading', { level: 1 });

    // Поля ввода по атрибуту name (самый надежный способ для форм)
    this.widthInput = page.locator('input[name="width"]');
    this.heightInput = page.locator('input[name="height"]');

    // Кнопка генерации. Используем частичное совпадение текста.
    this.generateButton = page.locator('button').filter({ hasText: /Сгенерировать/i });

    // Поле вывода кода
    this.codeOutputArea = page.locator('#code');
    
    // Кнопка копирования
    this.copyButton = page.locator('#code-copy-button');
  }

async goto() {
    // Явно указываем путь к странице виджета
    // Playwright склеит baseURL ('https://dev.3snet.info') и путь ('/eventswidget/')
    const response = await this.page.goto('/eventswidget/', { waitUntil: 'domcontentloaded' });
    
    // Ждем появления конструктора, чтобы убедиться, что мы не на главной и не на 404
    try {
        await this.page.waitForSelector('.constructor', { timeout: 15000 });
    } catch (e) {
        console.error('ERROR: Контейнер .constructor не найден. Текущий URL:', this.page.url());
        await this.page.screenshot({ path: 'debug-navigation-error.png' });
        throw e;
    }

    return response;
  }

  async setWidth(value: string) {
    // Ждем, что поле доступно для ввода
    await this.widthInput.waitFor({ state: 'visible' });
    await this.widthInput.fill(value);
    await this.widthInput.blur(); 
  }

  async setHeight(value: string) {
    await this.heightInput.waitFor({ state: 'visible' });
    await this.heightInput.fill(value);
    await this.heightInput.blur();
  }

  async generatePreview() {
    await this.generateButton.click();
    // Ждем обновления состояния (например, поле кода не должно быть пустым)
    // Или просто паузу, если нет явного индикатора завершения
    await this.page.waitForTimeout(1000); 
  }

  async verifyCodeContains(snippet: string) {
    await expect(this.codeOutputArea).toContainText(snippet);
  }

  setupConsoleErrorListener() {
    this.page.on('console', msg => {
      const text = msg.text();
      // Игнорируем мусорные ошибки
      if (msg.type() === 'error' && !text.includes('yandex') && !text.includes('socket')) {
        console.log(`PAGE ERROR: "${text}"`);
      }
    });
  }
}
# Тестирование (Testing Guide)

## Запуск тестов

### Все тесты
```bash
npm test
```

### Конкретный файл
```bash
npm test error-handler
npm test validators
```

### Watch режим (автоматический перезапуск)
```bash
npm run test:watch
```

### С отчетом о покрытии
```bash
npm run test:coverage
```

### Debug режим
```bash
npm run test:debug
```

## Структура тестов

```
__tests__/
├── app/
│   └── actions/          # Тесты для server actions
├── lib/
│   ├── error-handler.test.ts                # Реальные тесты обработчика ошибок
│   ├── error-handler-integration.test.ts    # Интеграционные тесты ошибок
│   ├── validators.test.ts                   # Реальные тесты валидации
│   ├── validators-integration.test.ts       # Интеграционные тесты валидации
│   ├── data-provider.test.ts
│   ├── locale.test.ts
│   ├── logger.test.ts
│   └── monitoring.test.ts
```

## Написание новых тестов

### Структура теста

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Подготовка перед каждым тестом
  })

  afterEach(() => {
    // Очистка после каждого теста
  })

  it('should do something', () => {
    // AAA pattern: Arrange, Act, Assert
    const input = { /* ... */ }
    const result = functionToTest(input)
    expect(result).toBe(expectedValue)
  })

  describe('nested', () => {
    it('should handle edge case', () => {
      // ...
    })
  })
})
```

## Типы тестов

### Unit Tests (Модульные)
- Тестируют отдельные функции
- Быстрые и изолированные
- Пример: `error-handler.test.ts`

### Integration Tests (Интеграционные)
- Тестируют взаимодействие компонентов
- Более медленные
- Пример: `error-handler-integration.test.ts`

### Component Tests (Компонентные)
- Тестируют React компоненты
- Используют React Testing Library
- Пример: тесты в `components/`

## Текущие тесты

### ✅ Обработка ошибок
- `error-handler.test.ts` - базовые функции
- `error-handler-integration.test.ts` - сценарии использования

### ✅ Валидация
- `validators.test.ts` - базовая валидация
- `validators-integration.test.ts` - сложные сценарии

### ✅ Прочее
- `data-provider.test.ts` - провайдер данных
- `locale.test.ts` - локализация
- `logger.test.ts` - логирование
- `monitoring.test.ts` - мониторинг

## Общие команды

```bash
# Запустить тесты для конкретного пути
npm test -- __tests__/lib/

# Запустить только failed тесты
npm test -- --onlyChanged

# Обновить snapshots
npm test -- -u

# Запустить с максимальным количеством worker'ов
npm test -- --maxWorkers=4
```

## Порог покрытия

Текущие требования в `jest.config.js`:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Корректируется в `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

## Советы

1. **Используйте AAA паттерн**: Arrange (подготовка), Act (действие), Assert (проверка)

2. **Пишите понятные тесты**: Имя теста должно описывать что он проверяет

3. **Избегайте flaky тестов**: Не используйте setTimeout, используйте асинхронные утилиты

4. **Тестируйте граничные случаи**: null, undefined, пустые значения

5. **Разделяйте concerns**: Отдельные тесты для разных сценариев

## Отладка

### Запустить один тест
```bash
npm test -- --testNamePattern="should handle validation" 
```

### Запустить с дебаггером
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Затем откройте `chrome://inspect` в браузере Chrome.

## CI/CD

Тесты автоматически запускаются в GitHub Actions при PR. Проверьте `.github/workflows/` для деталей.

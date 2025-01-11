# n8n-nodes-compare-dicts


Этот пакет содержит ноду для n8n для сравнения словарей. Сравнение словарей по ключам и значениям. Возвращает только те поля, которые отличаются.

## Установка

### В существующую установку n8n

```bash
cd /usr/local/lib/node_modules/n8n
npm install n8n-nodes-compare-dicts
```

### Обновление модуля

Для полного обновления модуля выполните следующие команды:

```bash
# 1. Остановить n8n
pm2 stop n8n  # или systemctl stop n8n

# 2. Перейти в директорию n8n
cd /usr/local/lib/node_modules/n8n

# 3. Удалить старую версию модуля
npm uninstall n8n-nodes-compare-dicts

# 4. Очистить кэш npm
npm cache clean --force

# 5. Установить новую версию модуля
npm install n8n-nodes-compare-dicts@latest

# 6. Запустить n8n
pm2 start n8n  # или systemctl start n8n
```

### Для разработки

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Соберите проект: `npm run build`
4. Создайте символическую ссылку: `npm link`
5. В директории n8n: `npm link n8n-nodes-compare-dicts`

## Использование

1. В n8n добавьте ноду "Compare Dictionaries"
2. Выберите режим сравнения "Use Input Connections"
3. Выберите два словаря для сравнения
4. Используйте ноду "Compare Dictionaries" в ваших рабочих процессах

## Разработка

### Сборка
```bash
npm run build
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Линтинг
```bash
npm run lint
```

## Лицензия

[MIT](LICENSE) 
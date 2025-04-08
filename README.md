# VTelegram
Клиент Telegram который представляет мессенджер в виде социальной сети ВКонтакте 2010-х годов.

## Зачем?
Телеграм полностью заменил мне ВК, но иногда хочется поностальгировать по старому дизайну.
Поэтому я решил сделать клиент, который будет представлять мессенджер в виде социальной сети ВКонтакте 2010-х годов.

## Что есть

- [x] Классический дизайн ВК
- [x] Прикрепленный к контакту канал будет выглядеть как микроблог/стена
- [x] Сообщения, разделенные на ЛС, Чаты и Боты
- [x] Сообщества (Каналы)
- [x] Раздел музыки
  - На данный момент музыку берет только из сохраненных сообщений
- [x] Видеоплеер c классическим дизайном
- [x] Музыкальный плеер с классическим дизайном

## Что не сделано
- [ ] Лента
- [ ] Комментарии
- [ ] Реакции
- [ ] Сторис

## Разработка
1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта и добавьте туда следующие переменные окружения:
```env
VITE_TELEGRAM_API_ID=your_api_id
VITE_TELEGRAM_API_HASH=your_api_hash
```

3. Запустите проект:
```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Cборка

Для сборки проекта используйте команду:
```bash
npm run build
```

Вы можете просмотреть сборку в режиме предпросмотра с помощью команды:
```bash
npm run preview
```

## Что для этого нужно?

Установить [NodeJS](https://nodejs.org/en/)

## Старт проекта

```bash
git clone https://github.com/redwon/starter_kit MyProject
cd MyProject
npm install
npm install -g grunt-cli (если не установлен)
Дальше используем доступные команды
```

## Доступные команды

<table>
  <thead>
    <tr>
      <th>Команда</th>
      <th>Выполнение</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="22%"><code>grunt</code></td>
      <td>Запуск проекта для разработки, сервер и слежение за файлами.</td>
    </tr>
    <tr>
      <td><code>grunt build</code></td>
      <td>Сборка проекта, минификация и оптимизация картинок.</td>
    </tr>
    <tr>
      <td><code>grunt sprite</code></td>
      <td>Собрать css спрайт.</td>
    </tr>
  </tbody>
</table>

## Структура проекта

```
.
├── /build/                  # Результат сборки. (Никогда не редактируется).
├── /node_modules/           # Node modules. (Никогда не редактируется).
├── /src/                    # Исходные файлы.
│   ├── /_css_lib/           # Стили из этой папки подключаются автоматически.
│   ├── /_include/           # HTML разметка которая вставляется в другие файлы.
│   ├── /_js_lib/            # Скрипты из этой папки подключаются автоматически.
│   ├── /fonts/              # Шрифты.
│   ├── /img/                # Исходные изображения.
│   │   └── /sprites/        # Изображения для спрайтов.
│   ├── /js/                 # Скрипты проекта.
│   ├── /sass/               # Стили проекта.
│   │   └── /block/          # Стили для повторяющихся блоков.
│   │   └── /elements/       # Стили для элементов.
│   │   └── /pages/          # Стили для страниц.
│   │   └── _base.scss       # Базовые стили. Box sizing.
│   │   └── _mixins.scss     # Миксины.
│   │   └── _sprites.scss    # Спрайты. (Никогда не редактируется).
│   │   └── _typography.scss # Типографика проекта.
│   │   └── _variables.scss  # Переменные.
│   │   └── main.scss        # Компилируемый файл.
└── .editorconfig            # Настройка редактора. http://editorconfig.org
└── .gitignore
└── Gruntfile.js             # Конфигурация для Grunt.
└── package.json             # Пакеты для NPM.
```

## Полезные ссылки

1. [Шпаргалка по работе с консолью](https://github.com/nicothin/web-development/tree/master/bash)
2. [Консоль для Windows](http://nicothin.pro/page/console-windows)
3. [Шпаргалка по Git](https://github.com/nicothin/web-development/tree/master/git)

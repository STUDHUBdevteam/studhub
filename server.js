const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const SOURCE_BASE = 'http://94.72.18.202:8083/';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const DAY_NAMES = { 'Пн': 'Понедельник', 'Вт': 'Вторник', 'Ср': 'Среда', 'Чт': 'Четверг', 'Пт': 'Пятница', 'Сб': 'Суббота', 'Вс': 'Воскресенье' };
const BELLS_MONDAY = { '1': '08:30–09:00 / 15:20–15:50', '2': '09:10–10:30', '3': '10:40–12:00', '4': '12:20–13:40', '5': '13:50–15:10', '6': '16:00–17:20', '7': '17:30–18:50' };
const BELLS_WEEK = { '1': '08:30–10:00', '2': '10:10–11:40', '3': '12:10–13:40', '4': '13:50–15:20', '5': '15:30–17:00', '6': '17:10–18:40', '7': '18:50–20:20' };

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  res.end(type.includes('application/json') ? JSON.stringify(body) : body);
}

function decode(text) {
  return String(text || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function textOf(html) {
  return decode(String(html || '').replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function attrs(tag) {
  const result = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tag))) result[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return result;
}

function classHas(tag, wanted) {
  return (attrs(tag).class || '').split(/\s+/).includes(wanted);
}

function tableByClass(html, cls = 'inf') {
  const re = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (classHas(m[0].slice(0, m[0].indexOf('>') + 1), cls)) return m[0];
  }
  return '';
}

function cellsOf(row) {
  return [...row.matchAll(/<(td|th)\b[^>]*>[\s\S]*?<\/\1>/gi)].map(m => ({
    html: m[0],
    tag: m[0].slice(0, m[0].indexOf('>') + 1),
    text: textOf(m[0]),
    class: (attrs(m[0].slice(0, m[0].indexOf('>') + 1)).class || '')
  }));
}

async function fetchSource(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return await response.text();
}

// === ГЛАВНАЯ ФУНКЦИЯ: парсинг cg.htm ===
async function groupList() {
  const html = await fetchSource(new URL('cg.htm', SOURCE_BASE));
  const table = tableByClass(html, 'inf');
  if (!table) throw new Error('Таблица с классом "inf" не найдена на cg.htm');

  const groups = [];
  const rows = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = cellsOf(row);
    // Ищем строку, где вторая ячейка имеет класс 'ur' (как в твоем HTML)
    if (cells.length >= 2 && cells[1].class.includes('ur')) {
      const anchor = cells[1].html.match(/<a\b[^>]*>[\s\S]*?<\/a>/i)?.[0];
      if (anchor) {
        const openTag = anchor.slice(0, anchor.indexOf('>') + 1);
        const a = attrs(openTag);
        const name = textOf(anchor);
        
        // Проверяем, что это ссылка с классом 'z0'
        if (name && a.href && classHas(openTag, 'z0')) {
          groups.push({ name, href: new URL(a.href, SOURCE_BASE).href });
        }
      }
    }
  }

  const unique = new Map(groups.map(g => [g.name, g]));
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

function lessonFields(cellHtml) {
  const result = { name: '', room: 'Кабинет не указан', lecturer: '' };
  for (const match of cellHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const anchor = match[0];
    const open = anchor.slice(0, anchor.indexOf('>') + 1);
    const cls = attrs(open).class || '';
    const value = textOf(anchor);
    
    if (/\bz1\b/.test(cls)) result.name += (result.name ? ' ' : '') + value;
    if (/\bz2\b/.test(cls)) result.room = result.room === 'Кабинет не указан' ? value : result.room + ' ' + value;
    if (/\bz3\b/.test(cls)) result.lecturer += (result.lecturer ? ' ' : '') + value;
  }
  if (!result.name) result.name = textOf(cellHtml);
  return result;
}

function parseSchedule(html, group) {
  const table = tableByClass(html, 'inf');
  if (!table) throw new Error('Таблица расписания не найдена на странице группы');
  
  const heading = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i) || [])[0];
  const update = (html.match(/<div\b[^>]*class=["'][^"']*\bref\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i) || [])[0];

  let current = null;
  const days = [];
  const rows = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows.slice(2)) {
    const cells = cellsOf(row);
    if (!cells.length || /\bhd0\b/.test(cells[0].class)) continue;
    
    const first = cells[0].text;
    const dateMatch = first.match(/(\d{1,2}\.\d{1,2}\.\d{2,4})\s*(Пн|Вт|Ср|Чт|Пт|Сб|Вс)/i);

    if (dateMatch) {
      current = { date: dateMatch[1], weekday: DAY_NAMES[dateMatch[2]], lessons: [] };
      days.push(current);
      
      const number = cells[1] && cells[1].text.match(/\d+/)?.[0];
      if (number) {
        if (cells.length === 4) {
          addLesson(current, number, cells[2].html, '1');
          addLesson(current, number, cells[3].html, '2');
        } else if (cells.length >= 3) {
          addLesson(current, number, cells[2].html, '0');
        }
      }
      continue;
    }

    if (!current || /пара|предмет|дата/i.test(first)) continue;

    if (cells.length === 3) {
      const number = first.match(/\d+/)?.[0];
      if (number) { addLesson(current, number, cells[1].html, '1'); addLesson(current, number, cells[2].html, '2'); }
    } else if (cells.length === 2) {
      const number = first.match(/\d+/)?.[0];
      if (number) addLesson(current, number, cells[1].html, '0');
    } else if (cells.length === 4) {
      const number = cells[1].text.match(/\d+/)?.[0];
      if (number) { addLesson(current, number, cells[2].html, '1'); addLesson(current, number, cells[3].html, '2'); }
    }
  }

  function addLesson(day, number, cellHtml, subgroup) {
    const fields = lessonFields(cellHtml);
    if (!fields.name || !fields.name.trim()) return;
    const bells = (day.weekday === 'Понедельник' ? BELLS_MONDAY : BELLS_WEEK)[String(number)] || 'Время не указано';
    day.lessons.push({ number: String(number), bells, name: fields.name, room: fields.room, lecturer: fields.lecturer, subgroup });
  }

  return { group, heading: textOf(heading), updatedAt: textOf(update), days };
}

async function handleApi(url, res) {
  if (url.pathname === '/api/health') return send(res, 200, { ok: true, source: SOURCE_BASE });

  if (url.pathname === '/api/groups') {
    try {
      const groups = await groupList();
      return send(res, 200, { groups: groups.map(({ name }) => ({ name })), source: SOURCE_BASE });
    } catch (error) {
      return send(res, 502, { error: 'Ошибка загрузки групп: ' + error.message, source: SOURCE_BASE });
    }
  }

  if (url.pathname === '/api/schedule') {
    const group = (url.searchParams.get('group') || '').trim();
    if (!group) return send(res, 400, { error: 'Не указана группа' });
    
    try {
      const groups = await groupList();
      const found = groups.find(item => item.name === group);
      if (!found) return send(res, 404, { error: 'Группа не найдена' });
      
      const html = await fetchSource(found.href);
      const data = parseSchedule(html, group);
      
      if (!data.days.length) return send(res, 502, { error: 'Расписание не найдено на странице группы' });
      return send(res, 200, data);
    } catch (error) {
      return send(res, 502, { error: 'Ошибка загрузки расписания: ' + error.message });
    }
  }

  return send(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  if (url.pathname.startsWith('/api/')) return handleApi(url, res);

  let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(ROOT, '.' + pathname);

  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden', 'text/plain');

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', 'text/plain');
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ StudHub открыт: http://localhost:${PORT}`);
  console.log(`📡 Источник: ${SOURCE_BASE}\n`);
});
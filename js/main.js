(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var IG_DM = 'https://ig.me/m/hanni_cake_';

  /* header shadow */
  var header = $('.header');
  var fab = $('#fab');
  var builderSec = $('#builder');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 10);
    if (fab && builderSec) {
      var r = builderSec.getBoundingClientRect();
      var inBuilder = r.top < window.innerHeight && r.bottom > 0;
      fab.classList.toggle('is-show', y > 600 && !inBuilder);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* burger */
  var burger = $('#burger'), nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* tabs */
  var tabs = $$('[role="tab"]');
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(n); n.focus();
    });
  });

  /* toast */
  var toast = $('#toast'), toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('is-show'); }, 4200);
  }

  /* box builder */
  var FLAVORS = [
    { n: 'капучино с солёной карамелью', c: '#A86F4C', f: '#E9D3B4' },
    { n: 'баунти', c: '#6B3F2A', f: '#F6F1E6' },
    { n: 'пломбир с малиной', c: '#D9808B', f: '#F4EBD3' },
    { n: 'лаванда — чёрная смородина', c: '#A99CC6', f: '#4A2B48' },
    { n: 'шоколад — клюква', c: '#4E2622', f: '#B3263A' },
    { n: 'яблочный штрудель', c: '#C98B4E', f: '#EFD9A8' },
    { n: 'дорблю — груша', c: '#C9C48E', f: '#F2EAD2' },
    { n: 'бейлис с солёной карамелью', c: '#B98A63', f: '#EBD4B2' },
    { n: 'дубайский', c: '#8D9B3F', f: '#C9A55A' },
    { n: 'лимонный чизкейк', c: '#EBCB5E', f: '#FBF4DC' },
    { n: 'киндер кантри', c: '#E3C79C', f: '#7A4A2E' },
    { n: 'мишка', c: '#8A5A3C', f: '#4A2A1C' }
  ];
  var PRICE = 350;
  var size = 4, box = [];
  var cellsEl = $('#cells'), chipsEl = $('#chips'), sumEl = $('#sum'), countEl = $('#count'), hint = $('#hint');

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
  function macEl(fl) {
    var s = document.createElement('span');
    s.className = 'mac';
    s.style.setProperty('--c', fl.c);
    s.style.setProperty('--f', fl.f);
    return s;
  }

  FLAVORS.forEach(function (fl, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip';
    b.innerHTML = '<i></i>';
    b.querySelector('i').style.setProperty('--c', fl.c);
    b.appendChild(document.createTextNode(fl.n));
    b.setAttribute('aria-label', 'Положить в коробку: ' + fl.n);
    b.addEventListener('click', function () { add(i); });
    chipsEl.appendChild(b);
  });

  function render() {
    cellsEl.innerHTML = '';
    for (var i = 0; i < size; i++) {
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'cell';
      var fl = box[i] != null ? FLAVORS[box[i]] : null;
      if (fl) {
        c.appendChild(macEl(fl));
        c.setAttribute('aria-label', 'Ячейка ' + (i + 1) + ': ' + fl.n + '. Нажмите, чтобы убрать');
        (function (idx) { c.addEventListener('click', function () { box.splice(idx, 1); render(); }); })(i);
      } else {
        c.classList.add('is-empty');
        c.setAttribute('aria-label', 'Ячейка ' + (i + 1) + ' пустая');
        c.tabIndex = -1;
      }
      cellsEl.appendChild(c);
    }
    var full = box.length >= size;
    $$('.chip', chipsEl).forEach(function (b) { b.disabled = full; });
    sumEl.textContent = fmt(size * PRICE);
    countEl.textContent = box.length + ' из ' + size + ' ячеек заполнено';
    hint.textContent = full ? 'коробочка готова — отправляйте заказ!' : 'нажмите на вкус, чтобы положить его в коробку';
  }
  function add(i) {
    if (box.length >= size) { showToast('Коробочка заполнена — выберите размер побольше'); return; }
    box.push(i); render();
  }
  $$('.sizes button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.sizes button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      size = parseInt(b.getAttribute('data-size'), 10);
      box = box.slice(0, size); render();
    });
  });
  $('#randomFill').addEventListener('click', function () {
    box = [];
    var pool = [0, 1, 2, 3];
    for (var i = 0; i < size; i++) box.push(pool[i % pool.length]);
    render();
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', '');
      t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, 99999);
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      document.body.removeChild(t);
    });
  }
  $('#sendOrder').addEventListener('click', function () {
    if (!box.length) { showToast('Сначала положите в коробочку хотя бы один вкус'); return; }
    var counts = {};
    box.forEach(function (i) { counts[FLAVORS[i].n] = (counts[FLAVORS[i].n] || 0) + 1; });
    var lines = Object.keys(counts).map(function (k) { return '— ' + k + ' × ' + counts[k]; });
    var rest = size - box.length;
    var text = 'Здравствуйте! Хочу заказать коробочку макарон на ' + size + ' шт:\n' + lines.join('\n') +
      (rest ? '\n— ещё ' + rest + ' шт на ваш выбор' : '') +
      '\nИтого: ' + fmt(size * PRICE).replace(/ /g, ' ') + '\nДата и способ получения: ';
    copyText(text).then(function () {
      showToast('Заказ скопирован — вставьте его в сообщение в директе');
    }, function () {
      showToast('Откройте директ @hanni_cake_ и опишите заказ');
    });
    var win = window.open(IG_DM, '_blank');
    if (win) { try { win.opener = null; } catch (e) {} }
    else { setTimeout(function () { location.href = IG_DM; }, 900); }
  });
  render();

  /* reviews slider */
  var track = $('#track'), slides = $$('.review', track), dotsEl = $('#dots'), idx = 0;
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button'; d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
    d.addEventListener('click', function () { go(i); });
    dotsEl.appendChild(d);
  });
  function go(i) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
    $$('button', dotsEl).forEach(function (d, j) { d.setAttribute('aria-current', String(j === idx)); });
    slides.forEach(function (s, j) { s.setAttribute('aria-hidden', String(j !== idx)); });
  }
  $('#prev').addEventListener('click', function () { go(idx - 1); });
  $('#next').addEventListener('click', function () { go(idx + 1); });
  var sx = 0, sy = 0, swiping = false;
  track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (!swiping) return; swiping = false;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
  go(0);

  /* videos: play only when visible */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = $$('video[data-autoplay]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === 'none') { v.preload = 'auto'; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { rootMargin: '120px' });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
  }

  /* map on demand (быстрая загрузка страницы) */
  var map = $('#map');
  function loadMap() {
    if (map.classList.contains('is-loaded')) return;
    var f = document.createElement('iframe');
    f.src = map.getAttribute('data-src');
    f.title = 'Карта: Владивосток, район Патрокл — самовывоз макарон';
    f.loading = 'lazy';
    f.setAttribute('allowfullscreen', '');
    map.innerHTML = ''; map.appendChild(f); map.classList.add('is-loaded');
  }
  $('.map__load', map).addEventListener('click', loadMap);
  if ('IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { loadMap(); mo.disconnect(); } }, { rootMargin: '300px' });
    mo.observe(map);
  }

  $('#year').textContent = new Date().getFullYear();
})();

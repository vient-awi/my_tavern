/**
 * 离线自测页的驱动脚本。
 *
 * 单独放一个文件，不写成自测页.html 里的 inline <script>：
 * Live Server 会把自动重载片段插进页面里最后一个 inline 脚本的末尾，
 * 那个插入点落在我们的代码中间，浏览器解析就炸了。放进外部文件能绕开。
 *
 * 它做的事：伪造酒馆助手运行时提供的全局（Vue / lodash / zod / YAML / MVU /
 * getVariables / jQuery），装进一个 iframe，再把编译产物塞进那个 iframe 跑起来。
 */

/** 把伪造的运行时全局注入 iframe。必须在 iframe 里的 module 脚本跑之前完成 */
function 注入环境(win) {
  var 假数据 = JSON.parse(JSON.stringify(假数据_论坛));

  // 这些是酒馆助手运行时本来就会提供的
  win.Vue = window.Vue;
  win._ = window._;
  win.YAML = window.YAML;
  win.toastr = { info: function () {}, success: function () {}, warning: function () {}, error: function () {} };

  // MVU 的假实现：读写都落在这一个对象上（模拟「最新楼层」）
  win.Mvu = {
    _data: { stat_data: 假数据 },
    getMvuData: function () { return win.Mvu._data; },
    replaceMvuData: function (d) {
      win.Mvu._data = d;
      window.dispatchEvent(new CustomEvent('fake-mvu-write', { detail: d }));
    },
    events: { VARIABLE_UPDATE_ENDED: 'mvu:update-ended' },
  };

  win.waitGlobalInitialized = function () { return Promise.resolve(); };

  // 酒馆助手的变量接口，给 ready.ts 的 waitForStatData 用
  win.getVariables = function () { return { stat_data: 假数据 }; };
  win.updateVariablesWith = function () {};

  // jQuery 的最小替身：论坛的 index.ts 只用到 $(() => ...)
  win.$ = function (fn) {
    if (typeof fn === 'function') { setTimeout(fn, 0); return; }
    return { load: function () {} };
  };
  win.errorCatched = function (fn) {
    return function () {
      try { return fn.apply(null, arguments); }
      catch (e) { console.error('[自测页] 前端抛错:', e); }
    };
  };

  win.addEventListener('error', function (e) {
    console.error('[自测页] iframe 内错误:', e.message);
  });
}

/** 手工把 iframe 的文档写出来，好控制注入时机 */
function 启动() {
  var iframe = document.getElementById('论坛');
  var doc = iframe.contentDocument;
  doc.open();
  doc.write('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>论坛</title></head><body></body></html>');
  doc.close();

  注入环境(iframe.contentWindow);

  // 酒馆助手运行时注入的全局库。用 iframe 的 document 加载，保证挂在它的 window 上。
  // 不带 zod：论坛前端不用它（用它的只有 MVU 的 Zod 脚本，那个不在自测范围内）。
  var 库 = [
    'https://testingcf.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js',
    'https://testingcf.jsdelivr.net/npm/lodash@4/lodash.min.js',
    'https://testingcf.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js',
  ];
  var 待加载 = 库.slice();

  function 下一个() {
    if (待加载.length === 0) { 加载前端(); return; }
    var s = doc.createElement('script');
    s.src = 待加载.shift();
    s.onload = 下一个;
    s.onerror = function () { console.warn('[自测页] 库加载失败（离线？）:', s.src); 下一个(); };
    doc.head.appendChild(s);
  }
  下一个();
}

/** 最后加载论坛前端本体 */
function 加载前端() {
  var iframe = document.getElementById('论坛');
  var doc = iframe.contentDocument;
  fetch('/dist/虫族/界面/论坛/index.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      // 产物自带 <head><script type="module">…</script><style>…</style></head><body><div id="app"></div></body>
      // 挂载点 #app 必须一起搬过来，否则 Vue 无处可挂。
      var 临时 = doc.createElement('div');
      临时.innerHTML = html;

      Array.prototype.forEach.call(临时.querySelectorAll('style'), function (el) {
        doc.head.appendChild(el.cloneNode(true));
      });

      var 模块 = 临时.querySelector('script[type="module"]');
      var 脚本文本 = 模块 ? 模块.textContent : '';

      // 先把 body 结构与 #app 铺好，再执行模块
      doc.body.innerHTML = 临时.querySelector('body') ? 临时.querySelector('body').innerHTML : '<div id="app"></div>';

      if (!脚本文本) { console.error('[自测页] 产物里没找到 script[type=module]'); return; }
      var s = doc.createElement('script');
      s.type = 'module';
      s.textContent = 脚本文本;
      doc.body.appendChild(s);
      console.log('[自测页] 论坛前端已装载');
    })
    .catch(function (e) { console.error('[自测页] 取产物失败，先跑 pnpm watch:', e); });
}

/* 写回日志：确认点一下真的存进变量了 */
window.addEventListener('fake-mvu-write', function (e) {
  var f = e.detail.stat_data.论坛;
  var 评论数 = Object.values(f.帖子).reduce(function (s, p) { return s + (p.评论 || []).length; }, 0);
  var 行 = '[写回] 帖 ' + Object.keys(f.帖子).length +
    ' | 评论 ' + 评论数 +
    ' | $帖子计数 ' + f.$帖子计数 +
    ' | 视图 ' + f.$界面状态.视图 + ' @ ' + f.$界面状态.板块 +
    (f.$界面状态.帖子ID ? ' #' + f.$界面状态.帖子ID : '');
  var 区 = document.getElementById('写回');
  区.textContent = 行 + '\n' + 区.textContent.split('\n').slice(0, 6).join('\n');
});

/* 假变量由 假变量.js 以普通 <script> 提供（全局 假数据_论坛），这里只负责启动。 */
(function () {
  if (typeof 假数据_论坛 === 'undefined') {
    document.getElementById('写回').textContent =
      '取不到 假数据_论坛 —— 检查 假变量.js 是否与自测页同目录、是否成功加载。';
    return;
  }
  启动();
})();

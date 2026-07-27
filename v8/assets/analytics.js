/*!
 * Enjin 採用LP 計測タグ（GA4 + Microsoft Clarity）
 * ─────────────────────────────────────────────
 * 本番公開時にやること（詳細は DEPLOY_HANDOVER.md）:
 *   1. GA4 プロパティを作成し、測定ID（G-XXXXXXXXXX）を下の GA4_ID に記入
 *   2. Microsoft Clarity でプロジェクトを作成し、IDを CLARITY_ID に記入
 * IDが空欄の間は一切送信しない（モック運用中も安全に読み込める）。
 * イベントは dataLayer にも積むので、後から GTM に載せ替えることも可能。
 */
(function () {
  var GA4_ID = '';     // 例: 'G-XXXXXXXXXX'（空=無効）
  var CLARITY_ID = ''; // 例: 'abcdefghij'（空=無効）

  // ---- タグ読み込み ----
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }
  if (CLARITY_ID) {
    (function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      var t = l.createElement('script'); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      var y = l.getElementsByTagName('script')[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  // ---- イベント送信（GA4未設定でも dataLayer には積む） ----
  function track(name, params) {
    params = params || {};
    if (GA4_ID) { gtag('event', name, params); }
    else { window.dataLayer.push({ event: name, params: params }); }
  }

  // ---- クリック計測（イベント委譲：スライダー等のJS生成要素にも効く） ----
  document.addEventListener('click', function (e) {
    var t = e.target;

    // CTA（data-cta属性つき要素）
    var cta = t.closest && t.closest('[data-cta]');
    if (cta) track('cta_click', { cta: cta.getAttribute('data-cta') });

    // オープニングSKIP
    if (t.closest && t.closest('.ld-skip')) track('opening_skip', {});

    // 募集職種スライダー操作
    if (t.closest && t.closest('#jsPrev')) track('jobs_slider', { action: 'prev' });
    if (t.closest && t.closest('#jsNext')) track('jobs_slider', { action: 'next' });
    if (t.closest && t.closest('.js-dot')) track('jobs_slider', { action: 'dot' });
    var jm = t.closest && t.closest('.js-more');
    if (jm) track('jobs_view_more', { href: jm.getAttribute('href') || '' });
    var je = t.closest && t.closest('.js-entry');
    if (je) track('jobs_entry_click', {});

    // 360°VR
    if (t.closest && t.closest('#vrOpen')) track('vr_open', {});

    // 外部リンク（別ドメインへの遷移）
    var a = t.closest && t.closest('a[href^="http"]');
    if (a && a.hostname && a.hostname !== location.hostname) {
      track('outbound_click', { url: a.href });
    }
  }, true);

  // ---- オープニング完走（SKIPを押さずに #loader が done になったら） ----
  (function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    var skipped = false;
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.ld-skip')) skipped = true;
    }, true);
    var mo = new MutationObserver(function () {
      if (loader.classList.contains('done')) {
        mo.disconnect();
        if (!skipped) track('opening_complete', {});
      }
    });
    mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
  })();

  // ---- PHILOSOPHYムービー：何シーン目まで見たか（カウンター変化を監視） ----
  (function () {
    var counter = document.getElementById('htCounter');
    if (!counter) return;
    var seen = {};
    var mo = new MutationObserver(function () {
      var v = (counter.textContent || '').trim();
      if (v && !seen[v]) { seen[v] = 1; track('movie_scene', { scene: v }); }
    });
    mo.observe(counter, { childList: true, characterData: true, subtree: true });
  })();

  // ---- スクロール到達率（25/50/75/90%、各1回のみ） ----
  (function () {
    var marks = [25, 50, 75, 90], fired = {};
    function onScroll() {
      var d = document.documentElement;
      var max = d.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      for (var i = 0; i < marks.length; i++) {
        if (pct >= marks[i] && !fired[marks[i]]) {
          fired[marks[i]] = 1;
          track('scroll_depth', { percent: marks[i] });
        }
      }
      if (fired[90]) window.removeEventListener('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  })();
})();

/*!
 * photo-kari.js — 未確定写真に「写真仮」バッジを自動付与
 * 写真素材が確定したら、該当画像ファイル名を CONFIRMED に追加するか、
 * 本スクリプトの読み込みを外してください。
 */
(function () {
  // 確定済みとして扱う画像（バッジを出さない）。確定したらここに追記する。
  var CONFIRMED = ['hero_main', 'honda_ceo'];   // TOPメインビジュアル・代表写真＝確定
  // バッジ対象外（ロゴ・アイコン類）
  var IGNORE = ['logo_enjin', 'favicon'];

  function isTarget(url) {
    if (!url) return false;
    if (url.indexOf('images/') === -1 && url.indexOf('/images/') === -1) return false;
    for (var i = 0; i < IGNORE.length; i++) if (url.indexOf(IGNORE[i]) !== -1) return false;
    for (var j = 0; j < CONFIRMED.length; j++) if (url.indexOf(CONFIRMED[j]) !== -1) return false;
    return true;
  }

  // バッジを載せるホスト要素を決める
  function hostFor(el) {
    // ken-burns の中身(.kb-img)は拡大アニメするので親に載せる
    var p = el.parentElement;
    if (p && p.classList && p.classList.contains('ken-burns')) return p;
    if (el.classList && el.classList.contains('kb-img') && p) return p;
    // 背景画像だけの入れ子divは親を優先（.ph / .gc / .jc-ph など）
    if (p && el.tagName === 'DIV' && !el.className && p.children.length === 1) return p;
    return el;
  }

  function alreadyMarked(host) {
    if (host.getAttribute('data-kari') === '1') return true;
    var t = host.textContent || '';
    return t.indexOf('写真仮') !== -1 || t.indexOf('NOW PRINTING') !== -1;
  }

  function badge() {
    var b = document.createElement('span');
    b.textContent = '写真仮';
    b.setAttribute('aria-hidden', 'true');
    b.style.cssText =
      'position:absolute;top:8px;left:8px;z-index:6;pointer-events:none;' +
      'background:rgba(255,255,255,.9);border:1px solid #d1d5db;color:#6b7280;' +
      'font-size:10px;line-height:1.6;padding:1px 7px;letter-spacing:.08em;' +
      'font-family:"Noto Sans JP",sans-serif;font-weight:500;white-space:nowrap;';
    return b;
  }

  function mark(host) {
    if (!host || alreadyMarked(host)) return;
    var cs = window.getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.setAttribute('data-kari', '1');
    host.appendChild(badge());
  }

  function run() {
    // 1) background-image で指定された写真
    var all = document.querySelectorAll('div,section,span,a,figure');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var inline = el.getAttribute('style') || '';
      var bg = inline.indexOf('images/') !== -1 ? inline : window.getComputedStyle(el).backgroundImage;
      if (isTarget(bg)) mark(hostFor(el));
    }
    // 2) <img> タグの写真
    var imgs = document.querySelectorAll('img');
    for (var k = 0; k < imgs.length; k++) {
      var src = imgs[k].getAttribute('src') || '';
      if (isTarget(src)) {
        var h = imgs[k].parentElement || imgs[k];
        mark(h);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

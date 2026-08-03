/*!
 * photo-kari.js — 未確定写真に「写真仮」バッジを自動付与＋白黒化（grayscale）
 * 写真素材が確定したら、該当画像ファイル名を CONFIRMED に追加するか、
 * 本スクリプトの読み込みを外してください。
 */
(function () {
  // 確定済みとして扱う画像（バッジを出さない）。確定したらここに追記する。
  var CONFIRMED = ['hero_main', 'honda_ceo', 'hero_female', 'office_about', 'interview_0', 'ohana_wall', 'wanted_person', 'business', 'office_lounge', 'hero_hs', 'platform_biz', 'estate_biz', 'finance_biz', 'tourism_biz', 'pr_biz', 'gym_biz', 'company_trip', 'ohana_event', 'senpai_meshi', 'academy', 'sengen', 'oyakoko', 'career_growth', 'fair_review', 'benefit_hub', 'purpose_summit'];   // 確定素材（interview_0 は 01〜06 全部に前方一致）
  // バッジ対象外（ロゴ・アイコン類）
  var IGNORE = ['logo_enjin', 'favicon', 'career_prep'];   // career_prep は「サイト準備中」カバーで別途状態を示すため対象外

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
    b.setAttribute('aria-hidden', 'true');
    b.style.cssText =
      'position:absolute;top:8px;left:8px;z-index:20;pointer-events:none;' +
      'display:inline-flex;align-items:center;gap:4px;' +
      'background:#BF0F0F;color:#fff;' +
      'font-size:11px;line-height:1.8;padding:2px 9px;letter-spacing:.1em;' +
      'font-family:"Noto Sans JP",sans-serif;font-weight:700;white-space:nowrap;' +
      'box-shadow:0 3px 10px -2px rgba(0,0,0,.45);border-radius:2px;';
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">' +
      '<path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/></svg>' +
      '写真仮';
    return b;
  }

  function mark(host) {
    if (!host || alreadyMarked(host)) return;
    var cs = window.getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.setAttribute('data-kari', '1');
    host.appendChild(badge());
  }

  // 仮写真は白黒表示（画像を持つ要素そのものに掛ける。二重適用は防ぐ）
  function gray(el) {
    if (!el) return;
    if ((el.style.filter || '').indexOf('grayscale') !== -1) return;
    el.style.filter = (el.style.filter ? el.style.filter + ' ' : '') + 'grayscale(1)';
  }

  // オープニング演出（#loader）内はバッジ対象外。三角形に写真をマスクしているだけで
  // 「写真そのものを見せる枠」ではないため、バッジが出ると演出が壊れる。
  function inLoader(el) {
    return !!(el && el.closest && el.closest('#loader'));
  }

  function run() {
    // 1) background-image で指定された写真
    var all = document.querySelectorAll('div,section,span,a,figure');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (inLoader(el)) continue;
      var inline = el.getAttribute('style') || '';
      var bg = inline.indexOf('images/') !== -1 ? inline : window.getComputedStyle(el).backgroundImage;
      if (isTarget(bg)) { mark(hostFor(el)); gray(el); }
    }
    // 2) <img> タグの写真
    var imgs = document.querySelectorAll('img');
    for (var k = 0; k < imgs.length; k++) {
      if (inLoader(imgs[k])) continue;
      var src = imgs[k].getAttribute('src') || '';
      if (isTarget(src)) {
        var h = imgs[k].parentElement || imgs[k];
        mark(h);
        gray(imgs[k]);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

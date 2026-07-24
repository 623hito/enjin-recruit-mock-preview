/*!
 * anchor-fix.js — ページ内アンカー（#id）への着地を確実にする
 *
 * 画像の読み込みでページの高さが後から伸びるため、ブラウザ既定のアンカー移動は
 * 「まだ短かった時点の座標」へ飛んでしまい、目的のセクションに届かない。
 * （例: #benefit を指定しても 125px しか進まず、実際の位置は 1800px 先）
 * そこで読み込み完了後に位置を計算し直して合わせる。
 *
 * 併せて、着地先が reveal 演出で透明なままにならないよう即座に表示する。
 */
(function () {
  function target() {
    var h = location.hash;
    if (!h || h.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(h.slice(1))); }
    catch (e) { return null; }
  }

  // 固定ヘッダーがあるぶん上に余白を取る（見出しが隠れないように）
  function headerOffset() {
    var el = document.querySelector('header');
    if (!el) return 0;
    var pos = getComputedStyle(el).position;
    return (pos === 'sticky' || pos === 'fixed') ? el.offsetHeight + 8 : 8;
  }

  // 'auto' はCSSの scroll-behavior:smooth に従ってしまい、着地前に次の処理が
  // 走ってしまうため 'instant' を使う。未対応ブラウザではCSS側を一時的に切る。
  function scrollToY(y) {
    try {
      window.scrollTo({ top: y, behavior: 'instant' });
    } catch (e) {
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = prev;
    }
  }

  function jump() {
    var el = target();
    if (!el) return;
    el.classList.add('in');
    var y = window.scrollY + el.getBoundingClientRect().top - headerOffset();
    scrollToY(y < 0 ? 0 : y);
  }

  if (!target()) return;

  // 読み込み時のみ位置を補正する。ページ内リンクのクリック（hashchange）には
  // 手を出さない＝既存のスムーススクロールの操作感をそのまま残す。
  jump();
  window.addEventListener('load', function () {
    jump();
    // 画像のデコード完了で高さが最終確定した後、もう一度だけ合わせる
    setTimeout(jump, 350);
  });

  // クリック移動では位置は触らず、着地先が透明のままにならないようにだけする
  window.addEventListener('hashchange', function () {
    var el = target();
    if (el) el.classList.add('in');
  });
})();

# Enjin 新卒採用LP（v8）本番公開 引き継ぎ書

最終更新: 2026-07-27 ／ 作成: 伊藤（＋Claude）
対象: `v8/` ディレクトリ一式（静的HTML。ビルド不要、そのまま配置で動く）
現在の確認環境: https://623hito.github.io/enjin-recruit-mock-preview/v8/

---

## 1. 公開前チェックリスト

| # | 項目 | 内容 | 状態 |
|---|---|---|---|
| 1 | 本番URL決定 | **`www.y-enjin.co.jp/recruit/`（パス方式）**。既存の `/career/` `/recruit-hs/` と同じ運用に揃える。※初期の「recruit.y-enjin.co.jp（サブドメイン）案」は不採用。サブドメインにするとDNS設定とATSのCORS登録が増える | 済（方式） |
| 1-2 | ATSのCORS | `www.y-enjin.co.jp` は**登録済み**なのでパス方式なら追加作業なし。CORSはパスを見ないため `/recruit/` でもオリジンは `https://www.y-enjin.co.jp` | 済 |
| 2 | noindex解除 | 全ページの `<meta name="robots" content="noindex,nofollow" />` を削除。privacy-v8.html には逆に**追加**する | 未 |
| 3 | 計測タグの有効化 | 下記「2. アクセス解析」参照。**IDを2つ記入するだけ** | 未 |
| 4 | プライバシーポリシー | 法務レビュー→制定日確定。**計測ツール利用の追記が必要**（下記5.） | 未 |
| 5 | フォーム接続 | 説明会申込フォーム（application-v8.html）を**ATSに接続済み**（2026-08-07）。日程は `GET /api/public-events/open`、送信は `POST /api/join`。日程の正本はATSの「イベント予約管理」 | 済 |
| 6 | ダミーリンク差し替え | マイナビ等のエントリー連携先。接続後、CTA下の「※リンクは仮」注記を削除 | 未 |
| 7 | 残コンテンツ | 給与（データ収集中）・平均年齢・男女比・写真仮 など詰めタスク一覧v5参照 | 未 |
| 8 | 旧サイト | jsupport.info から新URLへのリダイレクト依頼（田原さん） | 未 |

---

## 2. アクセス解析（GA4 + Microsoft Clarity）★今回実装分

### 仕組み
- 全ページが `assets/analytics.js` を読み込み済み。
- ファイル冒頭の **2つのIDが空欄の間は一切送信しない**（現在のモック状態）。
- IDを記入するだけで、ページビュー＋下記イベントの計測が始まる。

### 有効化手順（公開時に管理者がやること）
1. **GA4**: Googleアナリティクスで本サイト用プロパティを作成し、
   測定ID（`G-XXXXXXXXXX`）を取得
2. **Clarity**: https://clarity.microsoft.com でプロジェクトを作成し、
   プロジェクトID（10桁前後の英数字）を取得
3. `assets/analytics.js` の冒頭を編集:
   ```js
   var GA4_ID = 'G-XXXXXXXXXX';   // ← 記入
   var CLARITY_ID = 'xxxxxxxxxx'; // ← 記入
   ```
4. デプロイ後、GA4のリアルタイムレポートとClarityのダッシュボードで受信確認

### 計測しているイベント一覧
| イベント名 | 発火タイミング | パラメータ |
|---|---|---|
| `cta_click` | data-cta属性つきボタン（説明会/LINE/エントリー/ヘッダーSNS等） | `cta`: seminar / line / entry など |
| `opening_skip` | オープニングのSKIP押下 | ― |
| `opening_complete` | オープニングをSKIPせず最後まで視聴 | ― |
| `movie_scene` | PHILOSOPHYムービーの各シーン表示 | `scene`: "01 / 06" 等 |
| `jobs_slider` | 募集職種スライダーの操作 | `action`: prev / next / dot |
| `jobs_view_more` | スライダーのVIEW MORE押下 | `href` |
| `jobs_entry_click` | スライダーのENTRY押下 | ― |
| `vr_open` | 360°VRを開く | ― |
| `outbound_click` | 外部ドメインへのリンククリック | `url` |
| `scroll_depth` | スクロール到達 25/50/75/90%（各1回） | `percent` |

- GA4未設定の間もイベントは `window.dataLayer` に積まれるため、
  後から **Googleタグマネージャー（GTM）運用に載せ替えることも可能**。
- Clarityはタグを入れるだけでヒートマップ・セッション録画が自動で取れる
  （個別のイベント設定不要）。

---

## 3. 構成メモ

- 全14ページ＋career-hub。CSS/JSは `index-v8.html` 等に**インライン**の
  ページと、`assets/site-v8.css` を共有するページが混在。
  **ボタン等の共通UIを変える時は両方の修正が必要**（詰めタスク一覧参照）。
- 文字サイズは `html { font-size:17px }` で全体底上げ済み
  （site-v8.css と self-contained 5ページの両方に記載）。
- オープニング演出は初回訪問とリロード時のみ再生
  （sessionStorage `enjinIntroSeen` ＋ navigation.type で制御）。

## 4. 画像の権利関係（公開前に要対応）

| ファイル | 状態 |
|---|---|
| `purpose_summit.jpg` / `philosophy_triangle.jpg` | **透かし入りスクショの仮切り出し。ライセンス版への差し替え必須** |
| `culture_sky.jpg` | 高解像度差し替え済み（出所の最終確認のみ） |
| `hero_main.jpg` / `honda_ceo.jpg` / `members_20th.jpg` | 実写・確定 |
| その他（写真仮バッジ付き） | AI生成 or 実写で差し替え予定（AI写真プロンプト集シート参照） |

## 5. プライバシーポリシーへの追記文案（計測導入に伴う）

> **アクセス解析ツールについて**
> 当サイトでは、サービス向上のため Google アナリティクス（Google LLC）
> および Microsoft Clarity（Microsoft Corporation）を利用しています。
> これらのツールはCookie等を用いて匿名のトラフィックデータを収集します。
> データは匿名で収集されており、個人を特定するものではありません。
> 収集を望まれない場合は、ブラウザのCookie無効化等により拒否できます。
> （各ツールの利用規約・プライバシーポリシーは各社サイトをご確認ください）

※文面は法務レビュー時に合わせて調整してください。

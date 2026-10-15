/* キャンパス青空ジム：画面の表示と操作 */
(function () {
  "use strict";

  var CATS = window.CATEGORIES, RANGES = window.RANGES, MENUS = window.MENUS;
  var main = document.getElementById("main");
  var backBtn = document.getElementById("backBtn");
  var live = document.getElementById("live");
  var navCount = 0;
  var timer = null;

  /* ---------- 研究用の計測フック ----------
   * この試作版では何も送信・保存しません。
   * 計測を導入するときは、別スクリプトで window.campusGymTrack を定義してください（README参照）。
   */
  function track(event, data) {
    try {
      if (typeof window.campusGymTrack === "function") window.campusGymTrack(event, data || {});
    } catch (e) { /* 計測の失敗で画面を止めない */ }
  }

  /* ---------- ポスター（エレベーター付近）からのアクセス判定 ---------- */
  var fromElevator = /[?&]from=elevator\b/.test(location.search);
  try {
    if (fromElevator) sessionStorage.setItem("fromElevator", "1");
    else fromElevator = sessionStorage.getItem("fromElevator") === "1";
  } catch (e) {}

  /* ---------- イラスト ---------- */
  var INK = "#135E37", ACC = "#EE8A2C", GROUND = "#A9D3BB";
  function svgWrap(inner, label) {
    return '<svg viewBox="0 0 200 140" role="img" aria-label="' + label + '" fill="none" stroke="' + INK +
      '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="20" y1="130" x2="180" y2="130" stroke="' + GROUND + '" stroke-width="4"/>' + inner + "</svg>";
  }
  function head(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="11" fill="#fff"/>'; }
  var FIGURES = {
    walk: function () {
      return svgWrap(head(100, 28) +
        '<path d="M100 40 L96 82 M99 52 L82 72 M99 52 L118 66 M96 82 L80 126 M96 82 L114 112 L112 128"/>' +
        '<path d="M48 56h18 M42 72h20 M50 88h14" stroke="' + ACC + '" stroke-width="4"/>', "歩いている人のイラスト");
    },
    reach: function () {
      return svgWrap(head(100, 40) +
        '<path d="M100 51 L100 94 M100 58 L92 12 M100 58 L108 12 M100 94 L90 128 M100 94 L110 128"/>' +
        '<path d="M146 70 V30 M136 42 L146 30 L156 42" stroke="' + ACC + '" stroke-width="4"/>', "両腕を上に伸ばす人のイラスト");
    },
    shoulder: function () {
      return svgWrap(head(100, 32) +
        '<path d="M100 43 L100 94 M100 52 L84 90 M100 52 L116 90 M100 94 L90 128 M100 94 L110 128"/>' +
        '<path d="M76 40 a14 14 0 1 1 6 22 M70 58 l12 4 -2 -12 M124 40 a14 14 0 1 0 -6 22 M130 58 l-12 4 2 -12" stroke="' + ACC + '" stroke-width="4"/>',
        "肩を回す人のイラスト");
    },
    neck: function () {
      return svgWrap(head(112, 32) +
        '<path d="M100 50 L106 42 M100 50 L100 94 M100 56 L86 90 M100 56 L114 90 M100 94 L90 128 M100 94 L110 128"/>' +
        '<path d="M88 14 Q112 -2 136 18 M128 10 L136 18 L126 22" stroke="' + ACC + '" stroke-width="4"/>', "首を横に傾ける人のイラスト");
    },
    arm: function () {
      return svgWrap(head(100, 32) +
        '<path d="M100 43 L100 94 M100 56 L66 60 M100 58 L116 72 L86 62 M100 94 L90 128 M100 94 L110 128"/>' +
        '<path d="M58 48 L46 60 L58 72" stroke="' + ACC + '" stroke-width="4"/>', "腕を胸の前で伸ばす人のイラスト");
    },
    stairs: function () {
      return svgWrap(
        '<path d="M28 130 V112 H64 V92 H100 V72 H136 V52 H176" stroke="' + ACC + '" stroke-width="5"/>' +
        '<path d="M40 92 L170 26" stroke="#7FB6DE" stroke-width="4"/>' +
        head(108, 22) +
        '<path d="M108 33 L104 62 M106 42 L120 38 M106 42 L94 54 M104 62 L96 72 M96 72 L96 92 M104 62 L120 64 L124 72"/>',
        "手すりを持って階段を上る人のイラスト");
    },
    chair: function () {
      return svgWrap(
        '<path d="M50 92 H92 M54 92 V50 M56 92 V128 M90 92 V128" stroke="#7FB6DE" stroke-width="5"/>' +
        head(124, 30) +
        '<path d="M122 41 L104 80 M116 54 L136 60 M104 80 L128 96 L126 128"/>' +
        '<path d="M160 90 V52 M150 64 L160 52 L170 64" stroke="' + ACC + '" stroke-width="4"/>', "椅子からゆっくり立ち上がる人のイラスト");
    },
    wall: function () {
      return svgWrap(
        '<path d="M166 8 V130" stroke="#7FB6DE" stroke-width="8"/>' +
        head(140, 40) +
        '<path d="M132 50 L82 126 M126 60 L144 78 L160 62"/>' +
        '<path d="M110 30 L124 22 M104 20 L118 12" stroke="' + ACC + '" stroke-width="4"/>', "壁に手をついて腕立てをする人のイラスト");
    },
    heel: function () {
      return svgWrap(head(100, 24) +
        '<path d="M100 35 L100 86 M100 46 L86 82 M100 46 L114 82 M100 86 L94 114 L92 124 M100 86 L106 114 L108 124"/>' +
        '<path d="M60 112 V80 M52 90 L60 80 L68 90 M140 112 V80 M132 90 L140 80 L148 90" stroke="' + ACC + '" stroke-width="4"/>',
        "つま先立ちでかかとを上げる人のイラスト");
    }
  };

  var ICONS = {
    walk: '<svg viewBox="0 0 32 32"><circle cx="17" cy="6" r="2.5"/><path d="M16 10l-2 9 M15 13l-4 4 M15 12l5 3 M14 19l-4 9 M14 19l5 4v5"/></svg>',
    stretch: '<svg viewBox="0 0 32 32"><circle cx="16" cy="9" r="2.5"/><path d="M16 12v9 M16 14l-5-10 M16 14l5-10 M16 21l-3 8 M16 21l3 8"/></svg>',
    stairs: '<svg viewBox="0 0 32 32"><path d="M4 28h6v-6h6v-6h6v-6h6"/></svg>',
    strength: '<svg viewBox="0 0 32 32"><path d="M5 12v8 M9 9v14 M9 16h14 M23 9v14 M27 12v8"/></svg>',
    clock: '<svg viewBox="0 0 32 32"><circle cx="16" cy="17" r="11"/><path d="M16 11v6l4 3 M13 3h6"/></svg>'
  };

  /* ---------- 共通 ---------- */
  function catOf(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; }
  function rangeOf(id) { for (var i = 0; i < RANGES.length; i++) if (RANGES[i].id === id) return RANGES[i]; return null; }
  function menuOf(id) { for (var i = 0; i < MENUS.length; i++) if (MENUS[i].id === id) return MENUS[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function say(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 50); }

  function menuItem(m) {
    var c = catOf(m.category);
    return '<li><a class="menu-item" href="#/menu/' + m.id + '">' +
      '<span class="thumb" aria-hidden="true">' + FIGURES[m.figure]() + "</span>" +
      '<span><span class="t">' + esc(m.title) + '</span>' +
      '<span class="s" style="display:block">' + esc(m.summary) + "</span>" +
      '<span class="chips"><span class="chip time">' + esc(m.time) + '</span><span class="chip' + (m.category === "stairs" ? " stairs" : "") + '">' + esc(c.name) + "</span></span>" +
      "</span></a></li>";
  }

  var STAIRS_NOTE = '<div class="msg warm"><strong>移動に支障がある人や、体調が優れない人は、エレベーターを使ってください。</strong>階段は無理のない範囲で、走らず手すりを使って。</div>';

  /* ---------- 画面：トップ ---------- */
  function viewHome() {
    var spot = fromElevator ?
      '<section class="spot" aria-labelledby="spot-h">' +
        '<h2 id="spot-h">エレベーターの前にいるあなたへ</h2>' +
        "<p>1フロアだけ、階段にしてみませんか？ 体調が優れないときや移動がつらいときは、エレベーターで大丈夫です。</p>" +
        '<a class="btn orange" href="#/menu/one-floor">1フロアだけ階段を使う</a>' +
      "</section>" : "";

    var timeBtns = RANGES.map(function (r) {
      return '<a class="choice" href="#/time/' + r.id + '"><span class="big">' + r.name + '</span><span class="small">' + r.lead + "</span></a>";
    }).join("");

    var order = fromElevator ? ["stairs", "walk", "stretch", "strength"] : ["walk", "stretch", "stairs", "strength"];
    var catBtns = order.map(function (id) {
      var c = catOf(id);
      return '<a class="choice cat" href="#/cat/' + c.id + '"><span class="ico ' + c.color + '" aria-hidden="true">' + ICONS[c.id] +
        '</span><span><span class="big" style="display:block">' + c.name + '</span><span class="small">' + c.lead + "</span></span></a>";
    }).join("");

    main.innerHTML =
      '<section class="hero">' +
        '<svg class="sun" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="13" fill="#FFC27A"/><g stroke="#FFC27A" stroke-width="4" stroke-linecap="round"><path d="M30 4v7M30 49v7M4 30h7M49 30h7M11.6 11.6l5 5M43.4 43.4l5 5M11.6 48.4l5-5M43.4 16.6l5-5"/></g></svg>' +
        "<h1>キャンパス<br>青空ジム</h1>" +
        '<p class="tag">いつもの大学生活に、ちょっとした運動を。</p>' +
        '<p class="lead">運動のために、特別な時間をつくらなくても大丈夫。授業の合間や移動のついでに、1〜5分から身体を動かしてみませんか？</p>' +
        '<svg class="steps" viewBox="0 0 400 72" preserveAspectRatio="none" aria-hidden="true"><path d="M0 72 V56 H80 V44 H160 V32 H240 V20 H320 V8 H400 V72 Z" fill="#1F8F55"/><path d="M0 72 V62 H100 V52 H200 V42 H300 V32 H400 V72 Z" fill="#2FA866"/></svg>' +
      "</section>" +
      spot +
      '<section class="sec" aria-labelledby="t-h"><h2 id="t-h">時間から選ぶ</h2><p class="note">いま使える時間はどれくらい？</p><div class="grid two">' + timeBtns + "</div></section>" +
      '<section class="sec" aria-labelledby="c-h"><h2 id="c-h">運動の種類から選ぶ</h2><p class="note">やってみたいものをひとつ。</p><div class="grid cats">' + catBtns + "</div></section>";
  }

  /* ---------- 画面：時間別一覧 ---------- */
  function viewTime(rangeId) {
    var r = rangeOf(rangeId);
    if (!r) return viewNotFound();
    var list = MENUS.filter(function (m) { return m.range === r.id; });
    if (fromElevator) list.sort(function (a, b) { return (b.category === "stairs") - (a.category === "stairs"); });
    main.innerHTML =
      '<div class="page-head"><h1>' + r.name + "でできる運動</h1><p>" + r.lead + "。気になるものを選んでください。</p></div>" +
      '<nav class="filter" aria-label="時間の切り替え">' + RANGES.map(function (x) {
        return '<a href="#/time/' + x.id + '" aria-current="' + (x.id === r.id) + '">' + x.name + "</a>";
      }).join("") + "</nav>" +
      '<ul class="menu-list">' + list.map(menuItem).join("") + "</ul>";
  }

  /* ---------- 画面：種類別一覧 ---------- */
  function viewCat(catId, rangeId) {
    var c = catOf(catId);
    if (!c) return viewNotFound();
    var list = MENUS.filter(function (m) { return m.category === c.id && (!rangeId || m.range === rangeId); });
    var tabs = [{ id: "", name: "すべて" }].concat(RANGES).map(function (x) {
      return '<a href="#/cat/' + c.id + (x.id ? "?t=" + x.id : "") + '" aria-current="' + ((rangeId || "") === x.id) + '">' + x.name + "</a>";
    }).join("");
    var extra = c.id === "stairs" ?
      '<div class="msg"><strong>階段を使うことも、身体活動のひとつ。</strong>1フロアだけでも、上りでも下りでもOKです。</div>' + STAIRS_NOTE : "";
    main.innerHTML =
      '<div class="page-head"><h1>' + c.name + "</h1><p>" + c.lead + "</p></div>" + extra +
      '<nav class="filter" aria-label="時間で絞り込む">' + tabs + "</nav>" +
      (list.length ? '<ul class="menu-list">' + list.map(menuItem).join("") + "</ul>"
        : '<p class="msg">この時間のメニューはまだありません。「すべて」から選んでください。</p>');
    track("category_view", { category: c.id });
  }

  /* ---------- 画面：詳細 ---------- */
  function viewMenu(id) {
    var m = menuOf(id);
    if (!m) return viewNotFound();
    var c = catOf(m.category);
    main.innerHTML =
      '<div class="page-head"><h1>' + esc(m.title) + "</h1><p>" + esc(m.summary) + "</p></div>" +
      '<figure class="figure">' + FIGURES[m.figure]() + "<figcaption>動きのイメージ</figcaption></figure>" +
      '<dl class="facts">' +
        '<div class="fact"><dt>所要時間</dt><dd>' + esc(m.time) + "</dd></div>" +
        '<div class="fact"><dt>難易度</dt><dd>' + esc(m.level) + "</dd></div>" +
        '<div class="fact"><dt>目安</dt><dd>' + esc(m.reps || c.name) + "</dd></div>" +
      "</dl>" +
      (m.category === "stairs" ? '<div class="msg"><strong>階段を使うことも、身体活動のひとつ。</strong></div>' : "") +
      '<section class="block"><h2>やり方</h2><ol class="how">' + m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></section>" +
      '<section class="block"><h2>安全のために</h2><ul class="care">' + m.cautions.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
        "<li>痛みや気分の悪さを感じたら、すぐに中止してください。</li></ul>" +
        (m.category === "stairs" ? STAIRS_NOTE : "") + "</section>" +
      '<div id="action"></div>' +
      '<div class="btn-col">' +
        '<button class="btn primary" id="tryBtn" type="button">やってみる</button>' +
        '<button class="btn ghost" id="doneBtn" type="button">完了した</button>' +
        '<a class="btn quiet" href="#/">別の運動を探す</a>' +
      "</div>";

    track("menu_view", { menu: m.id, category: m.category });
    document.getElementById("tryBtn").addEventListener("click", function () { startTry(m); });
    document.getElementById("doneBtn").addEventListener("click", function () { finish(m); });
  }

  function fmt(sec) { var mm = Math.floor(sec / 60), ss = sec % 60; return mm + ":" + (ss < 10 ? "0" : "") + ss; }

  function startTry(m) {
    track("try_click", { menu: m.id, category: m.category });
    var box = document.getElementById("action");
    var tryBtn = document.getElementById("tryBtn");
    tryBtn.hidden = true;
    if (!m.seconds) {
      box.innerHTML = '<div class="timer"><p style="margin:0;font-weight:900;font-size:1.15rem">自分のペースでどうぞ。</p>' +
        '<p class="hint">終わったら「完了した」を押してください。</p></div>';
      box.scrollIntoView({ block: "center", behavior: "smooth" });
      say("自分のペースでどうぞ。終わったら完了したを押してください。");
      return;
    }
    box.innerHTML =
      '<div class="timer" role="timer" aria-label="カウントダウンタイマー">' +
        '<div class="clock" id="clock">' + fmt(m.seconds) + "</div>" +
        '<div class="ring" aria-hidden="true"><span id="tBar"></span></div>' +
        '<div class="row"><button class="btn primary" id="tStart" type="button">スタート</button>' +
        '<button class="btn quiet" id="tReset" type="button">リセット</button></div>' +
        '<p class="hint" id="tHint">目安の時間です。途中でやめても、延長しても大丈夫。</p>' +
      "</div>";
    box.scrollIntoView({ block: "center", behavior: "smooth" });

    var total = m.seconds, left = total, end = 0, running = false;
    var clock = document.getElementById("clock"), bar = document.getElementById("tBar");
    var bStart = document.getElementById("tStart"), bReset = document.getElementById("tReset"), hint = document.getElementById("tHint");

    function draw() { clock.textContent = fmt(left); bar.style.width = ((total - left) / total * 100) + "%"; }
    function tick() {
      left = Math.max(0, Math.round((end - Date.now()) / 1000));
      draw();
      if (left === 0) {
        stop();
        bStart.textContent = "もう一度";
        hint.textContent = "時間になりました。終わったら「完了した」を押してください。";
        say("時間になりました。");
        if (navigator.vibrate) { try { navigator.vibrate(200); } catch (e) {} }
      }
    }
    function stop() { running = false; clearInterval(timer); timer = null; }
    bStart.addEventListener("click", function () {
      if (running) { stop(); bStart.textContent = "再開"; say("一時停止しました"); return; }
      if (left === 0) left = total;
      end = Date.now() + left * 1000; running = true;
      bStart.textContent = "一時停止";
      clearInterval(timer); timer = setInterval(tick, 250);
      say("スタートしました");
    });
    bReset.addEventListener("click", function () { stop(); left = total; draw(); bStart.textContent = "スタート"; });
  }

  function finish(m) {
    if (timer) { clearInterval(timer); timer = null; }
    track("done_click", { menu: m.id, category: m.category });
    var others = MENUS.filter(function (x) { return x.id !== m.id && x.range === "short"; });
    var next = others[Math.floor(Math.random() * others.length)];
    var box = document.getElementById("action");
    document.getElementById("tryBtn").hidden = true;
    document.getElementById("doneBtn").hidden = true;
    box.innerHTML =
      '<div class="done" tabindex="-1" id="doneBox">' +
        '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26" fill="#fff"/><path d="M18 31l8 8 16-17" fill="none" stroke="#1F8F55" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<p class="big">おつかれさま！<br>今日もちょっと身体を動かせましたね。</p>' +
        '<p class="sub">次の空き時間にも、ひとつどうですか？</p>' +
      "</div>" +
      (next ? '<div class="btn-col"><a class="btn ghost" href="#/menu/' + next.id + '">次は「' + esc(next.title) + "」</a></div>" : "");
    var d = document.getElementById("doneBox");
    d.focus({ preventScroll: true });
    d.scrollIntoView({ block: "center", behavior: "smooth" });
    say("おつかれさま！今日もちょっと身体を動かせましたね。");
  }

  /* ---------- 画面：このサイトについて ---------- */
  function viewAbout() {
    main.innerHTML =
      '<div class="page-head"><h1>このサイトについて</h1></div>' +
      '<div class="prose">' +
      "<p>キャンパス青空ジムは、大学生の日常に運動のきっかけをつくることを目的に、研究活動の一環として制作した試作サイトです。身体活動を増やす効果は、まだ検証されていません。</p>" +
      "<h2>安全について</h2>" +
      "<p>紹介している運動は、医療的な指導や治療の代わりではありません。痛みや体調の変化を感じたらすぐに中止し、持病やけががある人は無理をしないでください。階段は、移動に支障がある人や体調が優れない人はエレベーターを使ってください。</p>" +
      "<h2>プライバシーについて</h2>" +
      "<ul><li>会員登録・ログイン・個人情報の入力は必要ありません。</li>" +
      "<li>この試作版では、閲覧数やボタンの押下数などの利用データを<strong>収集していません</strong>。</li>" +
      "<li>文字の表示にGoogle Fontsを使用しているため、フォント読み込み時に通常のWebアクセスと同様の通信情報（IPアドレス等）がGoogleに送られます。</li>" +
      "<li>今後、研究のために利用状況を計測する場合は、個人を特定しない形で行い、収集する内容をこのページでお知らせします。計測されるのはサイト上の操作記録であり、実際に運動したことを示すものではありません。</li></ul>" +
      "</div>" +
      '<div class="btn-col"><a class="btn primary" href="#/">運動を選ぶ</a></div>';
  }

  function viewNotFound() {
    main.innerHTML = '<div class="page-head"><h1>ページが見つかりません</h1><p>URLが変わったか、メニューが削除された可能性があります。</p></div>' +
      '<div class="btn-col"><a class="btn primary" href="#/">トップから運動を選ぶ</a></div>';
  }

  /* ---------- ルーティング ---------- */
  function route() {
    if (timer) { clearInterval(timer); timer = null; }
    var h = location.hash.replace(/^#/, "") || "/";
    var q = {}, qi = h.indexOf("?");
    if (qi >= 0) { h.slice(qi + 1).split("&").forEach(function (p) { var kv = p.split("="); q[kv[0]] = decodeURIComponent(kv[1] || ""); }); h = h.slice(0, qi); }
    var parts = h.split("/").filter(Boolean);

    if (!parts.length) viewHome();
    else if (parts[0] === "time") viewTime(parts[1]);
    else if (parts[0] === "cat") viewCat(parts[1], q.t);
    else if (parts[0] === "menu") viewMenu(parts[1]);
    else if (parts[0] === "about") viewAbout();
    else viewNotFound();

    backBtn.hidden = !parts.length;
    var h1 = main.querySelector("h1");
    document.title = (parts.length && h1 ? h1.textContent + "｜" : "") + "キャンパス青空ジム";
    window.scrollTo(0, 0);
    if (navCount > 0) main.focus({ preventScroll: true });
    navCount++;
  }

  backBtn.addEventListener("click", function () {
    if (navCount > 1 && history.length > 1) history.back();
    else location.hash = "#/";
  });

  window.addEventListener("hashchange", route);
  route();
})();

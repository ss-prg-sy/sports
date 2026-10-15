/* キャンパス青空ジム */
(function () {
  "use strict";

  /* ============================================================
   * 運動メニュー（表示順＝トップの並び順）
   * 文言を変えたいときは、ここを編集してください。
   * calorie: true のメニューだけ消費カロリーの目安を表示します。
   * ============================================================ */
  var MENUS = [
    {
      id: "stairs",
      name: "階段利用",
      icon: "stairs",
      cardText: "エレベーターの代わりに、1フロアだけ階段で。",
      title: "1フロアだけ階段を使ってみよう！",
      description: "いつもの移動で、エレベーターの代わりに1フロアだけ階段を使ってみよう。",
      steps: [
        "次の移動で階段を選ぶ。",
        "無理のないペースで1フロア上る。",
        "残りの階はエレベーターでもOK。"
      ],
      caution: "走らず、自分のペースで。体調や身体状況に合わせてエレベーターを利用してください。",
      calorie: false
    },
    {
      id: "walking",
      name: "ウォーキング",
      icon: "walk",
      cardText: "授業の合間や空き時間に、3〜5分歩いてみよう。",
      title: "3〜5分、歩いてみよう！",
      description: "授業の合間や空き時間に、大学構内を少し歩いてみよう。",
      steps: [
        "安全に歩ける場所を選ぶ。",
        "自分のペースで3〜5分歩く。",
        "普段の移動でも歩く機会を増やしてみる。"
      ],
      caution: "周囲に注意し、歩きながらスマートフォンを操作しないでください。",
      calorie: true
    },
    {
      id: "stretch",
      name: "ストレッチ",
      icon: "stretch",
      cardText: "椅子に座ったまま、上半身をゆっくりほぐそう。",
      title: "座ったまま、体をほぐそう！",
      description: "授業の合間や休憩中に、椅子に座ったままできる簡単なストレッチ。",
      steps: [
        "安定した椅子に背筋を伸ばして座り、両足を床につける。",
        "腕を胸の前で組み、上半身を左にゆっくりひねって5秒保つ。",
        "右側も同じように行う。",
        "左右それぞれ5回を目安に繰り返す。"
      ],
      caution: "痛みのない範囲で行い、無理に体をひねらないでください。",
      calorie: false
    }
  ];

  /* 消費カロリー計算の設定 */
  var CAL = {
    mets: 3.0,          // 普通の速さの歩行
    factor: 1.05,
    minutes: [3, 5],
    weightDefault: 60,  // 計算用の仮設定
    weightMin: 40,
    weightMax: 100
  };

  /* 消費カロリー（kcal）＝ METs × 体重(kg) × 時間(分) ÷ 60 × 1.05 */
  function kcal(weight, minutes) {
    return CAL.mets * weight * minutes / 60 * CAL.factor;
  }
  /* 小数第1位に四捨五入（浮動小数点の誤差対策つき） */
  function round1(x) {
    return (Math.round((x + 1e-9) * 10) / 10).toFixed(1);
  }

  /* アイコン */
  var ICONS = {
    stairs: '<svg viewBox="0 0 40 40"><path d="M6 34h8v-8h8v-8h8v-8h5"/></svg>',
    walk: '<svg viewBox="0 0 40 40"><circle cx="22" cy="7" r="3.2"/><path d="M21 12l-3 11 M20 15l-6 5 M20 14l7 4 M18 23l-6 12 M18 23l7 5v7"/></svg>',
    stretch: '<svg viewBox="0 0 40 40"><circle cx="20" cy="7" r="3.2"/><path d="M20 12v12 M13 16h14 M10 24h20 M12 24v10 M28 24v10 M15 20c-3-2-3-6 0-7 M25 20c3-2 3-6 0-7"/></svg>'
  };
  var ARROW = '<svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  var main = document.getElementById("main");
  var backBtn = document.getElementById("backBtn");
  var live = document.getElementById("live");
  var moved = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function findMenu(id) {
    for (var i = 0; i < MENUS.length; i++) if (MENUS[i].id === id) return MENUS[i];
    return null;
  }

  /* ---------- トップ ---------- */
  function renderHome() {
    var cards = MENUS.map(function (m, i) {
      return '<li><a class="card' + (i === 0 ? " first" : "") + '" href="#/' + m.id + '">' +
        '<span class="ico" aria-hidden="true">' + ICONS[m.icon] + "</span>" +
        '<span><span class="name">' + esc(m.name) + '</span><span class="desc">' + esc(m.cardText) + "</span></span>" +
        ARROW + "</a></li>";
    }).join("");

    main.innerHTML =
      '<section class="hero">' +
        "<h1>キャンパス青空ジム</h1>" +
        '<p class="copy">いつもの大学生活に、<br>ちょっとした運動を。</p>' +
        '<p class="lead">授業の合間や移動のついでに、無理なく体を動かしてみよう！</p>' +
      "</section>" +
      '<nav aria-label="運動メニュー"><ul class="cards">' + cards + "</ul></nav>";
    document.title = "キャンパス青空ジム";
  }

  /* ---------- 詳細 ---------- */
  function renderDetail(m) {
    var html =
      '<div class="detail-head">' +
        '<span class="ico" aria-hidden="true">' + ICONS[m.icon] + "</span>" +
        '<div><p class="cat">' + esc(m.name) + "</p><h1>" + esc(m.title) + "</h1></div>" +
      "</div>" +
      '<p class="desc-text">' + esc(m.description) + "</p>" +
      '<section class="block"><h2>実践方法</h2><ol class="how">' +
        m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
      "</ol></section>" +
      '<section class="block"><p class="caution"><strong>注意</strong>' + esc(m.caution) + "</p></section>";

    if (m.calorie) html += calorieBlock();

    html += '<a class="btn-home" href="#/">ほかの運動を見る</a>';
    main.innerHTML = html;
    document.title = m.name + "｜キャンパス青空ジム";

    if (m.calorie) setupCalorie();
  }

  function calorieBlock() {
    var results = CAL.minutes.map(function (min) {
      return '<div class="result"><dt>' + min + '分間</dt><dd>約<span class="num" id="kcal' + min + '">' +
        round1(kcal(CAL.weightDefault, min)) + "</span>kcal</dd></div>";
    }).join("");
    return '<section class="block" aria-labelledby="calH"><h2 id="calH">消費カロリーの目安</h2>' +
      '<div class="calc">' +
        '<label for="weight"><span>体重</span><span class="weight"><output id="weightOut" for="weight">' +
          CAL.weightDefault + "</output><small>kg</small></span></label>" +
        '<p class="tmp">初期値の' + CAL.weightDefault + 'kgは計算用の仮設定です。体重は保存・送信されません。</p>' +
        '<input type="range" id="weight" min="' + CAL.weightMin + '" max="' + CAL.weightMax + '" step="1" value="' +
          CAL.weightDefault + '" aria-valuetext="' + CAL.weightDefault + 'キログラム">' +
        '<div class="scale" aria-hidden="true"><span>' + CAL.weightMin + "kg</span><span>" + CAL.weightMax + "kg</span></div>" +
        '<dl class="results">' + results + "</dl>" +
        '<p class="note">※普通の速さで歩いた場合の推定値です。安静時の消費を含み、実際の消費量には個人差があります。</p>' +
      "</div></section>";
  }

  function setupCalorie() {
    var slider = document.getElementById("weight");
    var out = document.getElementById("weightOut");
    var timer = null;
    slider.addEventListener("input", function () {
      var w = parseInt(slider.value, 10);
      out.textContent = w;
      slider.setAttribute("aria-valuetext", w + "キログラム");
      CAL.minutes.forEach(function (min) {
        document.getElementById("kcal" + min).textContent = round1(kcal(w, min));
      });
      clearTimeout(timer);
      timer = setTimeout(function () {
        live.textContent = "体重" + w + "キログラム：" + CAL.minutes.map(function (min) {
          return min + "分間 約" + round1(kcal(w, min)) + "キロカロリー";
        }).join("、");
      }, 400);
    });
  }

  /* ---------- 画面切り替え ---------- */
  function route() {
    var id = location.hash.replace(/^#\/?/, "").split(/[?/]/)[0];
    var m = id ? findMenu(id) : null;
    if (m) renderDetail(m); else renderHome();
    backBtn.hidden = !m;
    window.scrollTo(0, 0);
    if (moved) main.focus({ preventScroll: true });
    moved = true;
  }

  backBtn.addEventListener("click", function () {
    location.hash = "#/";
  });

  window.addEventListener("hashchange", route);
  route();
})();

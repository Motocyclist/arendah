(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function formatUAH(n) {
    if (n === null || n === undefined) return "—";
    if (typeof n !== "number" || !isFinite(n)) return "—";

    var sign = n < 0 ? "-" : "";
    var abs = Math.abs(Math.round(n));
    var s = String(abs);
    var out = "";
    while (s.length > 3) {
      out = "\u202F" + s.slice(-3) + out; // narrow no-break space
      s = s.slice(0, -3);
    }
    out = s + out;
    return sign + out;
  }

  function showMoneyWithPrefix(prefix, n) {
    // prefix like "Д." or "В.В."
    var v = (n === null || n === undefined) ? "—" : formatUAH(n);
    return prefix + " " + v;
  }

  function safeIntOrNull(x) {
    if (x === null || x === undefined || x === "") return null;
    var n = Number(x);
    if (!isFinite(n)) return null;
    return Math.round(n);
  }

  function computeSum(d, vv, elektro) {
    if (d === null || vv === null || elektro === null) return null;
    return d + vv + elektro;
  }

  function buildMonthBlock(targetEl, monthData) {
    targetEl.innerHTML = "";

    var d = safeIntOrNull(monthData && monthData.d);
    var vv = safeIntOrNull(monthData && monthData.vv);
    var elektro = safeIntOrNull(monthData && monthData.elektro);
    var sum = computeSum(d, vv, elektro);

    // row with two squares
    var row2 = document.createElement("div");
    row2.className = "row2";

    var sq1 = document.createElement("div");
    sq1.className = "square";
    var sq1l = document.createElement("div");
    sq1l.className = "square__label";
    sq1l.textContent = "платіж";
    var sq1v = document.createElement("div");
    sq1v.className = "square__value";
    sq1v.textContent = showMoneyWithPrefix("Д.", d);
    sq1.appendChild(sq1l);
    sq1.appendChild(sq1v);

    var sq2 = document.createElement("div");
    sq2.className = "square";
    var sq2l = document.createElement("div");
    sq2l.className = "square__label";
    sq2l.textContent = "платіж";
    var sq2v = document.createElement("div");
    sq2v.className = "square__value";
    sq2v.textContent = showMoneyWithPrefix("В.В.", vv);
    sq2.appendChild(sq2l);
    sq2.appendChild(sq2v);

    row2.appendChild(sq1);
    row2.appendChild(sq2);

    // elektro rect
    var elektroTile = document.createElement("div");
    elektroTile.className = "tile";
    var elLabel = document.createElement("div");
    elLabel.className = "tile__label";
    elLabel.textContent = "електро";
    var elValue = document.createElement("div");
    elValue.className = "tile__value";
    if (elektro === null) {
      elValue.textContent = "—";
      elValue.classList.add("dim");
    } else {
      var s = formatUAH(elektro);
      elValue.textContent = "(" + (elektro < 0 ? "" : "+") + s + " електро)";
      if (elektro < 0) elValue.classList.add("neg");
    }
    elektroTile.appendChild(elLabel);
    elektroTile.appendChild(elValue);

    // sum rect
    var sumTile = document.createElement("div");
    sumTile.className = "tile tile--soft";
    var sumLabel = document.createElement("div");
    sumLabel.className = "tile__label";
    sumLabel.textContent = "сумарно";
    var sumValue = document.createElement("div");
    sumValue.className = "tile__value";
    if (sum === null) {
      sumValue.textContent = "—";
      sumValue.classList.add("dim");
    } else {
      sumValue.textContent = formatUAH(sum);
    }
    sumTile.appendChild(sumLabel);
    sumTile.appendChild(sumValue);

    // optional note
    if (monthData && typeof monthData.note === "string" && monthData.note.trim()) {
      var noteTile = document.createElement("div");
      noteTile.className = "tile";
      var nL = document.createElement("div");
      nL.className = "tile__label";
      nL.textContent = "примітка";
      var nV = document.createElement("div");
      nV.className = "tile__value";
      nV.style.fontSize = "22px";
      nV.style.fontWeight = "900";
      nV.textContent = monthData.note.trim();
      noteTile.appendChild(nL);
      noteTile.appendChild(nV);
      targetEl.appendChild(noteTile);
    }

    targetEl.appendChild(row2);
    targetEl.appendChild(elektroTile);
    targetEl.appendChild(sumTile);
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function load() {
    fetch("./data.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Не вдалося завантажити data.json (" + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        var deposit = safeIntOrNull(data.deposit);
        var piggy = safeIntOrNull(data.piggy);

        setText("depositValue", deposit === null ? "—" : (formatUAH(deposit) + " ₴"));
        setText("piggyValue", piggy === null ? "—" : (formatUAH(piggy) + " ₴"));

        var jan = data.months && data.months.jan ? data.months.jan : null;
        var feb = data.months && data.months.feb ? data.months.feb : null;

        buildMonthBlock($("month-jan"), jan);
        buildMonthBlock($("month-feb"), feb);
      })
      .catch(function (e) {
        // покажем хотя бы прочерки
        setText("depositValue", "—");
        setText("piggyValue", "—");
        buildMonthBlock($("month-jan"), null);
        buildMonthBlock($("month-feb"), null);

        // В консоль — подробности (на телефоне не мешаем)
        try { console.error(e); } catch (_) {}
      });
  }

  document.addEventListener("DOMContentLoaded", load);
})();

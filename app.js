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

  function cardItemSquare(labelText, valueText, valueClass) {
    var sq = document.createElement("div");
    sq.className = "square";

    var l = document.createElement("div");
    l.className = "square__label";
    l.textContent = labelText;

    var v = document.createElement("div");
    v.className = "square__value";
    if (valueClass) v.classList.add(valueClass);
    v.textContent = valueText;

    sq.appendChild(l);
    sq.appendChild(v);
    return sq;
  }

  function tileBlock(labelText, valueText, valueClass, tileClass) {
    var tile = document.createElement("div");
    tile.className = "tile" + (tileClass ? (" " + tileClass) : "");

    var l = document.createElement("div");
    l.className = "tile__label";
    l.textContent = labelText;

    var v = document.createElement("div");
    v.className = "tile__value";
    if (valueClass) v.classList.add(valueClass);
    v.textContent = valueText;

    tile.appendChild(l);
    tile.appendChild(v);
    return tile;
  }

  function buildMonthBlock(targetEl, monthData) {
    targetEl.innerHTML = "";

    var d = safeIntOrNull(monthData && monthData.d);
    var vv = safeIntOrNull(monthData && monthData.vv);
    var elektro = safeIntOrNull(monthData && monthData.elektro);
    var sum = computeSum(d, vv, elektro);

    var piggyMonth = safeIntOrNull(monthData && monthData.piggyMonth);

    // row with two squares (values must be RED)
    var row2 = document.createElement("div");
    row2.className = "row2";

    row2.appendChild(
      cardItemSquare("платіж", showMoneyWithPrefix("Д.", d), "red")
    );
    row2.appendChild(
      cardItemSquare("платіж", showMoneyWithPrefix("В.В.", vv), "red")
    );

    // elektro rect (GREEN always, even if negative)
    var elektroText;
    if (elektro === null) {
      elektroText = "—";
    } else {
      elektroText = "(" + (elektro < 0 ? "" : "+") + formatUAH(elektro) + " електро)";
    }
    var elektroTile = tileBlock("електро", elektroText, (elektro === null ? "dim" : "green"), "");

    // sum rect (RED value)
    var sumText = (sum === null) ? "—" : formatUAH(sum);
    var sumTile = tileBlock("сумарно", sumText, (sum === null ? "dim" : "red"), "tile--soft");

    // piggy rect per month (BLACK value)
    var piggyText = (piggyMonth === null) ? "—" : formatUAH(piggyMonth);
    var piggyTile = tileBlock("копілка", piggyText, (piggyMonth === null ? "dim" : "black"), "");

    // optional note
    if (monthData && typeof monthData.note === "string" && monthData.note.trim()) {
      var noteTile = tileBlock("примітка", monthData.note.trim(), "black", "");
      noteTile.querySelector(".tile__value").style.fontSize = "22px";
      noteTile.querySelector(".tile__value").style.fontWeight = "900";
      targetEl.appendChild(noteTile);
    }

    targetEl.appendChild(row2);
    targetEl.appendChild(elektroTile);
    targetEl.appendChild(sumTile);
    targetEl.appendChild(piggyTile);
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
        setText("depositValue", "—");
        setText("piggyValue", "—");
        buildMonthBlock($("month-jan"), null);
        buildMonthBlock($("month-feb"), null);
        try { console.error(e); } catch (_) {}
      });
  }

  document.addEventListener("DOMContentLoaded", load);
})();



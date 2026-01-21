(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function formatUAH(n) {
    if (n === null || n === undefined) return "—";
    if (typeof n !== "number" || !isFinite(n)) return "—";

    var abs = Math.abs(Math.round(n));
    var s = String(abs);
    var out = "";
    while (s.length > 3) {
      out = "\u202F" + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    out = s + out;
    return out;
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

  function squareBlock(labelText, valueNumber) {
    var sq = document.createElement("div");
    sq.className = "square";

    var l = document.createElement("div");
    l.className = "square__label";
    l.textContent = labelText;

    var v = document.createElement("div");
    v.className = "square__value red";
    v.textContent = (valueNumber === null ? "—" : formatUAH(valueNumber));

    if (valueNumber === null) v.classList.add("dim");

    sq.appendChild(l);
    sq.appendChild(v);
    return sq;
  }

  function tileBlock(labelText, valueText, valueClass, soft) {
    var tile = document.createElement("div");
    tile.className = "tile" + (soft ? " tile--soft" : "");

    var l = document.createElement("div");
    l.className = "tile__label";
    l.textContent = labelText;

    var v = document.createElement("div");
    v.className = "tile__value " + valueClass;
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

    var row2 = document.createElement("div");
    row2.className = "row2";

    row2.appendChild(squareBlock("Дахн.", d));
    row2.appendChild(squareBlock("В.Вел", vv));

    var elektroText = (elektro === null)
      ? "—"
      : "(" + (elektro < 0 ? "" : "+") + formatUAH(elektro) + " електро)";

    var elektroTile = tileBlock("електро", elektroText, (elektro === null ? "dim" : "green"), false);

    var sumText = (sum === null) ? "—" : formatUAH(sum);
    var sumTile = tileBlock("сумарно", sumText, (sum === null ? "dim" : "red"), true);

    var piggyText = (piggyMonth === null) ? "—" : formatUAH(piggyMonth);
    var piggyTile = tileBlock("копілка", piggyText, (piggyMonth === null ? "dim" : "black"), false);

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
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var deposit = safeIntOrNull(data.deposit);
        var piggy = safeIntOrNull(data.piggy);

        setText("depositValue", deposit === null ? "—" : (formatUAH(deposit) + " ₴"));
        setText("piggyValue", piggy === null ? "—" : (formatUAH(piggy) + " ₴"));

        buildMonthBlock($("month-jan"), data.months.jan || null);
        buildMonthBlock($("month-feb"), data.months.feb || null);
      });
  }

  document.addEventListener("DOMContentLoaded", load);
})();




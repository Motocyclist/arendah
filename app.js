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
    v.className = "tile


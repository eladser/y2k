// Style switcher, after Paul Sowden's "Alternative Style" (A List Apart, 2001).
// Every <link> with a title is a style; turn them all off, then turn on the one asked for.

function setActiveStyleSheet(title) {
  var i, a;
  for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {
    if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
      a.disabled = true;
      if (a.getAttribute("title") == title) a.disabled = false;
    }
  }
  createCookie("style", title, 365);
}

function createCookie(name, value, days) {
  var date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + escape(value) + "; expires=" + date.toGMTString() + "; path=/";
}

function readCookie(name) {
  var parts = document.cookie.split(";");
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i].replace(/^\s+/, "");
    if (c.indexOf(name + "=") == 0) return unescape(c.substring(name.length + 1));
  }
  return null;
}

window.onload = function () {
  var title = readCookie("style");
  setActiveStyleSheet(title ? title : "Default");
};

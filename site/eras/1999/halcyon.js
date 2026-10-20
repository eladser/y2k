// Halcyon Airways - site scripts
// webmaster@halcyonair.com, last modified 03/14/99

var swapped = null;

// load the "on" states early so the first rollover doesn't flash
function preloadImages() {
  if (!document.images) return;
  if (!document.preload) document.preload = new Array();
  for (var i = 0; i < preloadImages.arguments.length; i++) {
    document.preload[i] = new Image();
    document.preload[i].src = preloadImages.arguments[i];
  }
}

function swapImage(name, src) {
  if (!document.images) return;
  var img = document.images[name];
  if (!img) return;
  img.oldSrc = img.src;
  img.src = src;
  swapped = img;
}

function restoreImage() {
  if (swapped && swapped.oldSrc) swapped.src = swapped.oldSrc;
  swapped = null;
}

// DHTML menus: Netscape 4 has layers, IE 4 has document.all, IE 5 knows getElementById
var menuTimer = null;

function getLayer(id) {
  if (document.getElementById) return document.getElementById(id).style;
  if (document.all) return document.all[id].style;
  if (document.layers) return document.layers[id];
  return null;
}

function showMenu(id) {
  clearTimeout(menuTimer);
  hideMenus();
  var m = getLayer(id);
  if (m) m.visibility = document.layers ? "show" : "visible";
}

function hideSoon() {
  menuTimer = setTimeout("hideMenus()", 400);
}

function hideMenus() {
  for (var i = 1; i <= 3; i++) {
    var m = getLayer("menu" + i);
    if (m) m.visibility = document.layers ? "hide" : "hidden";
  }
}

// the booking form
function checkForm(f) {
  if (f.from.selectedIndex == f.to.selectedIndex) {
    alert("Please choose two different cities.");
    f.to.focus();
    return false;
  }
  if (f.ret.selectedIndex > 0 && f.retday.selectedIndex == 0) {
    alert("Please choose a return day.");
    return false;
  }
  return true;
}

function clubLogin(f) {
  if (f.member.value == "" || f.pin.value == "") {
    alert("Please enter your Halcyon Club number and PIN.");
    return false;
  }
  alert("We're sorry, Halcyon Club online is temporarily unavailable. Please call 1-800-555-0199.");
  return false;
}

// pop-up windows
function openWin(url, title, w, h) {
  // the only line in this file that isn't from 1999: a real window.open would leave this
  // page, so the pop-up is drawn on the desktop around it instead
  if (top != self && top.postMessage) {
    top.postMessage({ popup: { src: url, title: title, w: w, h: h } }, location.protocol + "//" + location.host);
    return;
  }
  window.open(url, "halcyon", "width=" + w + ",height=" + h + ",toolbar=no,location=no,scrollbars=yes,resizable=no");
}

// two-digit years, like everyone else's. see the Y2K statement
function today() {
  var d = new Date();
  return (d.getMonth() + 1) + "/" + d.getDate() + "/" + (d.getYear() % 100);
}

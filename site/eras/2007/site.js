// halcyon v2 (beta). needs jQuery 1.2
var AIRPORTS = [];
var typing = null;

function findAirport(q) {
  q = jQuery.trim(q).toLowerCase();
  for (var i = 0; i < AIRPORTS.length; i++) {
    var a = AIRPORTS[i];
    if (a.city.toLowerCase() == q || a.code.toLowerCase() == q) return a;
  }
  return null;
}

// AJAX autocomplete. in 2007 this hit /ajax/airports.php?q=lo on every keystroke
function suggest(input) {
  var q = jQuery.trim(input.value).toLowerCase();
  var list = $("#suggest-" + input.id);
  if (q.length < 2) { list.hide(); return; }
  $("#spin-" + input.id).show();
  $.getJSON("data/airports.json", function (data) {
    AIRPORTS = data;
    $("#spin-" + input.id).hide();
    var html = "";
    $.each(data, function (i, a) {
      if (a.city.toLowerCase().indexOf(q) == 0 || a.code.toLowerCase() == q)
        html += '<li title="' + a.city + '"><b>' + a.code + "</b> " + a.city + ", " + a.country + "</li>";
    });
    if (html) list.html(html).show(); else list.hide();
  });
}

$(document).ready(function () {
  $.getJSON("data/airports.json", function (data) { AIRPORTS = data; });

  $("#from, #to").attr("autocomplete", "off").keyup(function () {
    var input = this;
    clearTimeout(typing);
    typing = setTimeout(function () { suggest(input); }, 250);
  }).blur(function () {
    var list = $("#suggest-" + this.id);
    setTimeout(function () { list.hide(); }, 200);
  });

  $(".suggest").click(function (e) {
    var li = e.target.nodeName == "LI" ? e.target : e.target.parentNode;
    $("#" + this.id.replace("suggest-", "")).val(li.title);
    $(this).hide();
  });

  // search without leaving the page
  $("#search").submit(function () {
    var from = findAirport($("#from").val()) || AIRPORTS[0];
    var to = findAirport($("#to").val());
    var out = $("#results");
    if (!to) {
      out.html('<p class="loading">Start typing a city under <b>To</b>, then pick one from the list.</p>');
      $("#to").focus();
      return false;
    }
    out.html('<p class="loading"><img src="img/spinner.gif" width="16" height="16" alt="" />Searching 38 cities...</p>');
    // a 2007 server took a moment to answer; this one is a static file, so wait like one
    setTimeout(function () {
      $.getJSON("data/fares.json", function (fares) {
        var f = fares[to.code], times = [["07:10", 0], ["13:45", 40], ["22:30", -30]], rows = "";
        for (var i = 0; i < times.length; i++)
          rows += "<tr><td>HA " + (300 + i * 2) + "</td><td>" + from.code + " &rarr; " + to.code + "</td><td>" + times[i][0] + "</td><td>" + f.hours + '</td><td class="fare">$' + (f.fare + times[i][1]) + "</td></tr>";
        out.hide().html("<table><tr><th>Flight</th><th>Route</th><th>Departs</th><th>Flight time</th><th>Fare</th></tr>" + rows +
          '</table><p class="updated">Updated just now. No page reload!</p>').fadeIn(400);
        // the yellow fade: flash what changed, then let it settle
        var cheapest = out.find("tr:last");
        cheapest.addClass("yellow");
        setTimeout(function () { cheapest.removeClass("yellow"); }, 1500);
      });
    }, 700);
    return false;
  });

  // lightbox
  $("#dests a").click(function () {
    $("#lb-img").attr("src", this.href);
    $("#lb-caption").text(this.title);
    $("#lb-overlay").css("opacity", 0).show().fadeTo(250, 0.8);
    $("#lb").fadeIn(300);
    return false;
  });
  $("#lb-overlay, #lb-close").click(function () {
    $("#lb, #lb-overlay").fadeOut(200);
    return false;
  });
  $(document).keyup(function (e) {
    if (e.keyCode == 27) $("#lb, #lb-overlay").fadeOut(200);
  });
});

// Halcyon 2012. jQuery 1.8 + Bootstrap 2.2
$(function () {
  $('#slides').carousel({ interval: 5000 });

  // two weeks out. The clock on this desk says 2012
  var d = new Date();
  d.setFullYear(2012);
  d.setDate(d.getDate() + 14);
  var pad = function (n) { return n < 10 ? '0' + n : n; };
  $('#search [name=depart]').val(d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()));

  var CODES = { 'Athens': 'ATH', 'Barcelona': 'BCN', 'Berlin': 'BER', 'Lisbon': 'LIS', 'London': 'LHR', 'New York': 'JFK',
    'Paris': 'CDG', 'Prague': 'PRG', 'Reykjavik': 'KEF', 'Rome': 'FCO', 'Tokyo': 'NRT', 'Vienna': 'VIE' };

  $('#search').on('submit', function (e) {
    e.preventDefault();
    var city = $.trim($(this).find('[name=to]').val());
    var pax = parseInt($(this).find('[name=pax]').val(), 10) || 1;
    var code = CODES[city];
    var body = $('#results .modal-body').empty();
    if (!code) {
      $('#results-title').text('Where to?');
      body.append($('<p>').text('Start typing a city in "Where to?" and pick one from the list.'));
      $('#results').modal('show');
      return;
    }
    $('#results-title').text('Tel Aviv to ' + city);
    body.append('<p class="muted">Searching...</p>');
    $('#results').modal('show');

    $.getJSON('data/fares.json').done(function (fares) {
      var f = fares[code], times = [['07:10', 0], ['13:45', 40], ['22:30', -30]];
      var table = $('<table class="table table-striped table-hover"><thead><tr><th>Flight</th><th>Departs</th><th>Duration</th><th>Total</th></tr></thead><tbody></tbody></table>');
      $.each(times, function (i, t) {
        var row = $('<tr>');
        row.append($('<td>').text('HA ' + (500 + i * 2)), $('<td>').text(t[0]), $('<td>').text(f.hours));
        var price = $('<td>').append($('<strong>').text('$' + (f.fare + t[1]) * pax));
        if (i === 2) price.append(' ', $('<span class="label label-success">').text('Lowest fare'));
        table.find('tbody').append(row.append(price));
      });
      body.empty().append(table);
    }).fail(function () {
      body.empty().append($('<div class="alert alert-error">').text('Something went wrong loading fares. Please try again.'));
    });
  });
});

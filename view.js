function renderCell(m, r, c) {
  var id = m.idFromPos(r, c);
  var cell = m.at(id);
  var td = $('<input></input>', {id: cell.id, type: 'text', maxlength: 1, readonly: 'readonly'});

  m.isValid(id) || td.addClass('bad');
  m.isSelected(id) && td.css('background-color', 'lightgrey');

  td.addClass('scell');
  if (r % 3 === 0)
    td.addClass('btop');
  if (r % 3 === 2)
    td.addClass('bbot');
  if (c % 3 === 0)
    td.addClass('bleft');
  if (c % 3 === 2)
    td.addClass('bright');
  td.click(function() {
    m.select(this.id);
  });
  td.keyup(function(event) {
  });

  td.val(cell.v);
  return td;
}

function render(m) {
  var h = $('<div></div>');
  m.getLast(10).forEach(function(curr) {
    var item = $('<div></div>');
    item.text(curr.displayName + ' ' + moment(curr.at).fromNow());
    h.append(item);
  });
  $('#history').html(h);
  var t = $('<div></div>');
  t.addClass('sudoku');
  for (var r = 0; r < 9; ++r) {
    for (var c = 0; c < 9; ++c) {
      t.append(renderCell(m, r, c));
    }
  }
  t.keyup(function(event) {
    if (event.which < 49 || event.which > 57)
      return;

    var n = event.which - 48;
    m.makeMove(n);
    console.log('keyup on table: ' + event.which);
  });
  $('#game').html(t);
}


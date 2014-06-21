function renderCell(controller, r, c) {
  var id = controller.idFromPos(r, c);
  var cell = controller.at(id);
  var td = $('<input></input>', {id: cell.id, type: 'text', maxlength: 1, readonly: 'readonly'});

  controller.isValid(id) || td.addClass('bad');
  controller.isSelected(id) && td.css('background-color', 'lightgrey');

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
    controller.select(this.id);
  });
  td.keyup(function(event) {
  });

  td.val(cell.v);
  return td;
}

function render(controller) {
  var t = $('<div></div>');
  t.addClass('sudoku');
  for (var r = 0; r < 9; ++r) {
    for (var c = 0; c < 9; ++c) {
      t.append(renderCell(controller, r, c));
    }
  }
  t.keyup(function(event) {
    if (event.which < 49 || event.which > 57)
      return;

    var n = event.which - 48;
    controller.makeMove(n);
    console.log('keyup on table: ' + event.which);
  });
  $('#game').html(t);
}


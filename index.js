

(function() {
  function Model(m) {
    this.toString = function() {
      return JSON.stringify(m, null, '  ');
    }
    this.at = function(r, c) {
      var temp = m.filter(function(curr) { return curr.r === r && curr.c == c });
      if (temp.length !== 1)
        throw new Error('bad location ' + r + ', ' + c);
      return temp[0];
    }
  }

  function buildModel() {
    var res = [];
    var i, j;
    for (i = 0; i < 81; ++i) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      res.push({id: 'cell_' + i, r: r, c: c, z: Math.floor(r / 3) * 3 + Math.floor(c / 3), v: '?'});
    }

    return new Model(res);
  }

  function render(m) {
    var t = $('<div></div>');
    t.addClass('sudoku');
    for (var r = 0; r < 9; ++r) {
//      var tr = $('<div></div>');
      for (var c = 0; c < 9; ++c) {
        var cell = m.at(r, c);
        var td = $('<input></input>', {id: cell.id, type: 'text', maxlength: 1});
 //       td.css('width', '250px');
        if (r % 3 === 0)
          td.addClass('btop');
        if (r % 3 === 2)
          td.addClass('bbot');
        if (c % 3 === 0)
          td.addClass('bleft');
        if (c % 3 === 2)
          td.addClass('bright');

        td.text(cell.v);
        t.append(td);
      }

//      t.append(tr);
    }
    $('#game').html(t);
  }

  $(document).ready(function() {
    var m = buildModel();
    render(m);
  });
})();

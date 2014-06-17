

(function() {
  function idFromPos(r, c) {
    return 'cell_' + (r * 9 + c);
  }

  function Model(m) {
    var moves = [];
    this.toString = function() {
      return JSON.stringify(m, null, '  ');
    }
    this.at = function(r, c) {
      var id = idFromPos(r, c);
      var res = m[id];
      if (res)
        return res;
      throw new Error('No cell found for ' + id);
    }

    this.ok = function(r, c) {
      var cell = m[idFromPos(r,c)];
      var all = Object.keys(m).map(function(k) { return m[k] });
      var effectiveZone = all.filter(function(o) {
        return o.r === cell.r || o.c === cell.c || o.z === cell.z;
      });
      if (effectiveZone.length != 21)
        throw new Error('unexpected zone size. len=' + effectiveZone.length);

      var conflicting = effectiveZone.filter(function(o) {
        return (o.v === cell.v) && (cell.v != '');
      });

      return conflicting.length === 1;
    };

    this.step = function(id, v) {
      moves.push({id: id, v: v});
      m[id].v = v;
      render(this);
    }
  }

  function buildModel() {
    var res = {};
    var i, j;
    for (i = 0; i < 81; ++i) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var id = 'cell_' + i;
      res[id] = {id: 'cell_' + i, r: r, c: c, z: Math.floor(r / 3) * 3 + Math.floor(c / 3), v: ''};
    }

    return new Model(res);
  }

  function render(m) {
    var t = $('<div></div>');
    t.addClass('sudoku');
    for (var r = 0; r < 9; ++r) {
      for (var c = 0; c < 9; ++c) {
        var cell = m.at(r, c);
        var td = $('<input></input>', {id: cell.id, type: 'text', maxlength: 1, readonly: 'readonly'});
        td.addClass('scell');
        if (r % 3 === 0)
          td.addClass('btop');
        if (r % 3 === 2)
          td.addClass('bbot');
        if (c % 3 === 0)
          td.addClass('bleft');
        if (c % 3 === 2)
          td.addClass('bright');
        td.keyup(function(event) {
          if (event.which < 49 || event.which > 57)
            return;

          var n = event.which - 48;
          m.step(this.id, n);
        });

        td.val(cell.v);
        m.ok(r, c) || td.addClass('bad');
        t.append(td);
      }
    }
    $('#game').html(t);
  }

  $(document).ready(function() {
    var m = buildModel();
    render(m);
  });
})();



(function() {
  function idFromPos(r, c) {
    return 'cell_' + (r * 9 + c);
  }

  function Model(cellById, moves, doc) {
    console.log('cellById=' + JSON.stringify(cellById));
    this.toString = function() {
      return JSON.stringify(cellById, null, '  ');
    }

    this.at = function(id) {
      var res = cellById[id];
      if (res)
        return res;
      throw new Error('No cell found for ' + id + ' ' + JSON.stringify(cellById));
    }

    this.select = function(id) {
      if (this.selected) {
        $('#' + this.selected).css('background-color', 'white');
      }
      this.selected = id;
      $('#' + this.selected).css('background-color', 'lightgrey');
    }

    this.isSelected = function(id) {
      return this.selected === id;
    }

    this.ok = function(id) {
      var cell = cellById[id];
      var all = Object.keys(cellById).map(function(k) { return cellById[k] });
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

    this.changeSelectionTo = function(v) {
      if (!this.selected)
        return;

      var id = this.selected;
      moves.push({
        id: id, v: v,
        displayName: $('#nameField').val(),
        at: new Date().getTime() });
      this.flush();
    }

    this.flush = function() {
      fill(cellById);
      moves.asArray().forEach(function(curr) {
        cellById[curr.id].v = curr.v;
      });
      render(this);
    }

    this.getLast = function(n) {
      var arr = moves.asArray();
      var begin = Math.max(0, arr.length - n);

      collabById = {};
      doc.getCollaborators().forEach(function(curr) {
        collabById[curr.userId] = curr;
      });
      return arr.slice(begin).map(function(curr) {
        return curr;
      }).reverse();
    };
    this.clear = function() {
      moves.clear();
    }
  }

  function buildModel(moves, userById, doc) {
    var model = new Model(fill({}), moves, userById, doc);
    moves.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function(event) {
      try {
        model.flush();
      } catch (e) {
        console.log('err=' + e.stack);
        throw e;
      }
    });
    return model;
  }

  function fill(cellById) {
    var i, j;
    for (i = 0; i < 81; ++i) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var id = 'cell_' + i;
      cellById[id] = {id: id, r: r, c: c, z: Math.floor(r / 3) * 3 + Math.floor(c / 3), v: ''};
    }

    return cellById;
  }

  function renderCell(m, r, c) {
    var id = idFromPos(r, c);
    var cell = m.at(id);
    var td = $('<input></input>', {id: cell.id, type: 'text', maxlength: 1, readonly: 'readonly'});

    m.ok(id) || td.addClass('bad');
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
//      if (curr.collaborator)
//        item.css('color', curr.collaborator.color);
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
      m.changeSelectionTo(n);
      console.log('keyup on table: ' + event.which);
    });
    $('#game').html(t);
  }

  var CLIENT_ID = '498879331099-gs0q4drp0b7l098iu0pigk2jrlthl7bq.apps.googleusercontent.com';
  var FILE_ID = '0B7w8hD8aAtTHSVFGaDkzanpkN28';

  $(document).ready(function() {
    initRealtimeApi(CLIENT_ID, function() {
      gapi.drive.realtime.load(FILE_ID,
        function(doc) {
          console.log('doc loaded');
          var root = doc.getModel().getRoot();
          var m = buildModel(root.get('moves'), doc);
          $('#clearButton').click(function() { m.clear() });
          m.flush();
        },
        function(model) {
          model.getRoot().set('moves', model.createList());
        },
        function(error) {
          console.log('error=' + error);
          console.error(error);
        }
      );
    });
  });
})();

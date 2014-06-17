

(function() {
  function idFromPos(r, c) {
    return 'cell_' + (r * 9 + c);
  }

  function Model(cellById, moves, idBySession, userById, doc) {
    console.log('cellById=' + JSON.stringify(cellById));
    this.toString = function() {
      return JSON.stringify(cellById, null, '  ');
    }

    this.setName = function(name) {
      var who = this.whoAmI();
      var uid = who && who.userId;

      if (!uid) {
        console.log('uid is nothing. who=' + JSON.stringify(who));
        throw new Error('Stopped');
      }


      userById.set(who.userId, name);
    }
    this.at = function(id) {
      var res = cellById[id];
      if (res)
        return res;
      throw new Error('No cell found for ' + id + ' ' + JSON.stringify(cellById));
    }

    this.whoAmI = function() {
      var me = doc.getCollaborators().filter(function(curr) {
        return curr.isMe;
      });
      if (me.length !== 1)
        throw new Error('#me-s is not 1: ' + me.length);
      return me[0];
    };

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
        by: this.whoAmI().userId,
        byName: this.whoAmI().displayName,
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
        var displayName = 'Unknown User';
        if (curr.by)
          displayName = userById.get(curr.by) || displayName;
        return { move: curr, displayName: displayName };
      }).reverse();
    };
  }

  function buildModel(moves, idBySession, userById, doc) {
    var model = new Model(fill({}), moves, idBySession, userById, doc);
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
      item.text(curr.displayName + ' ' + moment(curr.move.at).fromNow());
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

  $(document).ready(function() {
    startRealtime(
      function(model) {
        model.getRoot().set('moves', model.createList());
        model.getRoot().set('idBySession', model.createMap());
        model.getRoot().set('userById', model.createMap());
      },
      function(doc) {
        console.log('doc loaded');
        var root = doc.getModel().getRoot();
        var m = buildModel(root.get('moves'), root.get('idBySession'), root.get('userById'), doc);
        $('#nameField').keyup(function() {
          m.setName($(this).val());
        });
        m.flush();
      }
    );
  });
})();

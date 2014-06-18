

(function() {
  function Model(moves, doc) {
    var cellById = reset({});
    this.toString = function() {
      return JSON.stringify(cellById, null, '  ');
    }

    this.idFromPos = function(r,c) {
      return 'cell_' + (r * 9 + c);
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
      var conflicting = effectiveZone.filter(function(o) {
        return (o.v === cell.v) && (cell.v != '');
      });

      return conflicting.length === 1;
    };

    this.makeMove = function(v) {
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
      reset(cellById);
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

  function buildModel(moves, doc) {
    var model = new Model(moves, doc);
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

  function reset(cellById) {
    var i, j;
    for (i = 0; i < 81; ++i) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var id = 'cell_' + i;
      cellById[id] = {id: id, r: r, c: c, z: Math.floor(r / 3) * 3 + Math.floor(c / 3), v: ''};
    }

    return cellById;
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

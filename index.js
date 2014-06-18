

(function() {
  function Controller(board, moves) {
    this.idFromPos = function(r, c) { return board.idFromPos(r, c) };

    this.at = function(id) {
      return board.getCell(id);
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

    this.isValid = function(id) {
      var cell = board.getCell(id);
      var all = board.getAllCells();
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
      board.resetBoard();
      moves.asArray().forEach(function(curr) {
        board.getCell(curr.id).v = curr.v;
      });
      render(this);
    }

    this.getLast = function(n) {
      var arr = moves.asArray();
      var begin = Math.max(0, arr.length - n);
      return arr.slice(begin).reverse();
    };

    this.clear = function() {
      moves.clear();
    }
  }


  var CLIENT_ID = '498879331099-gs0q4drp0b7l098iu0pigk2jrlthl7bq.apps.googleusercontent.com';
  var FILE_ID = '0B7w8hD8aAtTHSVFGaDkzanpkN28';

  $(document).ready(function() {
    initRealtimeApi(CLIENT_ID, function() {
      gapi.drive.realtime.load(FILE_ID,
        function(doc) {
          console.log('doc loaded');
          var root = doc.getModel().getRoot();
          var controller = new Controller(new Board(), root.get('moves'));
          root.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, function() {
            try {
              controller.flush();
            } catch (e) {
              console.log('err=' + e.stack);
              throw e;
            }
          });
          $('#clearButton').click(function() { controller.clear() });
          controller.flush();
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

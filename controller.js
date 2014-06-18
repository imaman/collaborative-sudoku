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
    moves.forEach(function(curr) {
      board.getCell(curr.id).v = curr.v;
    });
    render(this);
  }

  this.getLast = function(n) {
    return moves.slice(0).reverse().slice(0, n);
  };

  this.clear = function() {
    moves.splice(0, moves.length);
  }
}



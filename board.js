function Board() {
  var cellById = {};

  this.idFromPos = function(r, c) {
    return 'cell_' + (r * 9 + c);
  }

  this.resetBoard = function() {
    board = cellById;
    var i, j;
    for (i = 0; i < 81; ++i) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var id = 'cell_' + i;
      board[id] = {id: id, r: r, c: c, z: Math.floor(r / 3) * 3 + Math.floor(c / 3), v: ''};
    }
  }

  this.getCell = function(id) {
    var res = cellById[id];
    if (res)
      return res;
    throw new Error('No cell found for ' + id + ' ' + JSON.stringify(cellById));
  }

  this.getAllCells = function() {
    var result = [];
    var r, c;
    for (r = 0; r < 9; ++r)
      for (c = 0; c < 9; ++c)
        result.push(this.getCell(this.idFromPos(r, c)));
    return result;
  }

  this.resetBoard();
}




(function() {
  var CLIENT_ID = '498879331099-gs0q4drp0b7l098iu0pigk2jrlthl7bq.apps.googleusercontent.com';
  var FILE_ID = '0B7w8hD8aAtTHSVFGaDkzanpkN28';

  $(document).ready(function() {
    var controller = new Controller(new Board(), []);
    controller.flush();
    $('#clearButton').click(function() { controller.clear(); controller.flush(); });
    $('#undoButton').click(function() { controller.undo() });
    $('#redoButton').click(function() { controller.redo() });
  });
})();



(function() {
  var CLIENT_ID = '498879331099-gs0q4drp0b7l098iu0pigk2jrlthl7bq.apps.googleusercontent.com';
  var FILE_ID = '0B7w8hD8aAtTHSVFGaDkzanpkN28';

  $(document).ready(function() {
    initRealtimeApi(CLIENT_ID, function() {
      gapi.drive.realtime.load(FILE_ID,
        function(doc) {
          var model = doc.getModel();
          var root = model.getRoot();
          var controller = new Controller(new Board(), root.get('moves'));
          root.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, function() {
            controller.flush();
          });
          controller.flush();
          $('#clearButton').click(function() { controller.clear(); });
          $('#undoButton').click(function() { model.undo() });
          $('#redoButton').click(function() { model.redo() });
        });
      });
  });
})();

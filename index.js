

(function() {
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

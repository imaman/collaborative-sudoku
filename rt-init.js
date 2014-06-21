function initRealtimeApi(clientId, done) {
  var n = 0;
  var authRequest = {
    client_id: clientId,
    scope: [
      'https://www.googleapis.com/auth/drive.file',
    ],
    user_id: '',
  };

  function authDone(n, authResult) {
    if (authResult && !authResult.error)
      return done();

    authRequest.immediate = (n === 0);
    gapi.auth.authorize(authRequest, authDone.bind(null, n + 1));
  }
  gapi.load('auth:client,drive-realtime,drive-share', authDone.bind(null, 0));
}



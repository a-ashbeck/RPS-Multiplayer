$(document).ready(function() {
	// Initialize Firebase
	var config = {
	  apiKey: 'AIzaSyCNn-3ZVQgyuRuibr3xTrPPPaLlMR2PHiE',
	  authDomain: 'rps-multiplayer-60afb.firebaseapp.com',
	  databaseURL: 'https://rps-multiplayer-60afb.firebaseio.com',
	  storageBucket: 'rps-multiplayer-60afb.appspot.com',
	  messagingSenderId: '829762563884'
	};

	firebase.initializeApp(config);

	// Create a variable to reference the database.
	var database = firebase.database();
	var usersRef = database.ref('users/');
	var connectedRef = database.ref('.info/connected');
	var userObj = {
			username: '',
			hand: '',
			wins: 0,
			losses: 0
		};
	var userID;
	var otherUser = {
			username: '',
			hand: '',
			wins: 0,
			losses: 0
		};
	var otherUserID;
	var winner = '';
	var numUsers = 0;

	$('#container-1').show();
	$('#container-2').hide();

	// When the client's connection state changes...
	connectedRef.on('value', function(snapshot) {
	  // If they are connected...
	  if (snapshot.val()) {
	  	firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					userID = user.uid;

					usersRef.child(userID).set(userObj);

			    // Remove user from the connection list when they disconnect.
			    usersRef.child(userID).onDisconnect().remove();

			    usersRef.once('value', function(snapshot) {
						numUsers = snapshot.numChildren();
					
				    usersRef.on('child_added', function(childSnapshot) {
				    	if (numUsers > 2) {
				    		$('#container-1').hide();
				    		$('#container-2').show();
							} else if (userID !== childSnapshot.key) {
								otherUserID = childSnapshot.key;
								otherUser.username = childSnapshot.val().username;
								otherUser.hand = childSnapshot.val().hand;
								database.ref('users/' + otherUserID).on('value', function(snap) {
									otherUser.username = snap.val().username;
									otherUser.hand = snap.val().hand;

									$('#opponent').html(otherUser.username);
									evaluateHands();
								});
							} else if (userID === childSnapshot.key) {
								database.ref('users/' + userID).on('value', function(snap) {
									userObj.username = snap.val().username;
									userObj.hand = snap.val().hand;
									evaluateHands();
								});
							}
						});
					});

					$('#message-btn').on('click', function() {

					  // Grabs user input
					  var messageInput = $('#message-input').val().trim();


					  // Creates local object for holding message data
					  var message = {
					  	timestamp: firebase.database.ServerValue.TIMESTAMP,
					    user: userObj.username,
					    message: messageInput,
					  };

					  if (messageInput !== '') {

						  // Uploads message data to the database
						  database.ref().child('messenger').push(message);

						  // Clears the text-box
						  $('#message-input').val('');
						}

					  // Prevents moving to new page
					  return false;
					});

					// Sets messenger updates to DOM GOOD
					database.ref('messenger').on('child_added', function(childSnapshot, prevChildKey) {

					  // Store everything into a variable.
					  var screenname = childSnapshot.val().user;
					  var messageInput = childSnapshot.val().message;
					  var time = moment(childSnapshot.val().timestamp).format('M/D/YY h:mm:s a');

					  // Add message to chat room
					  $('#chat-room').append('<p>' + screenname + ' - ' + time + ': ' + messageInput + '<p>');
					  $('#chat-room').scrollTop($('#chat-room')[0].scrollHeight);
					});


		    	// Sets username GOOD
					$('#set-username').on('click', function() {
						usersRef.child(userID).update({
							username: $('#username').val().trim()
						});

						$('#username').val('');
					});

					// Sets your hand
					$('.hand-btn').on('click', function() {
						usersRef.child(userID).update({
							hand: $(this).text()
						});

						$('.hand-btn').hide();
					});
				} else {

					$('#container-1').hide();
					$('#container-2').show();

					// Logs Firebase error to the console if an anon login issue occurred
					firebase.auth().signInAnonymously().catch(function(error) {
						console.log( error.code + ": " + error.message );
					})
				}
			});
	  }
	});

	function endGameAndRestart() {
		$('#winner').html(winner);
		$('#opponent-hand').html(otherUser.hand);
		$('#wins').html(userObj.wins);
		$('#losses').html(otherUser.wins);
		$('#ties').html(userObj.ties);

		setTimeout(function(){
			usersRef.child(userID).update({
				hand: '',
				wins: userObj.wins,
				losses: otherUser.wins
			});

			winner = '';
			userObj.hand = '';
			otherUser.hand = '';
			$('#winner').html(winner);
			$('#opponent-hand').html(otherUser.hand);
			$('.hand-btn').show();
		}, 5000);
	}

	function evaluateHands() {
		if (userObj.hand && otherUser.hand !== null) {
			if (
				(userObj.hand === 'Rock') && (otherUser.hand === 'Scissors') ||
				(userObj.hand === 'Scissors') && (otherUser.hand === 'Paper') ||
				(userObj.hand === 'Paper') && (otherUser.hand === 'Rock')
			) {
				userObj.wins++;
				winner = userObj.username;
				endGameAndRestart();
			} else if (
				(userObj.hand === 'Rock') && (otherUser.hand === 'Paper') ||
				(userObj.hand === 'Scissors') && (otherUser.hand === 'Rock') ||
				(userObj.hand === 'Paper') && (otherUser.hand === 'Scissors')
			){
				otherUser.wins++;
				winner = otherUser.username;
				endGameAndRestart();
			} else if (userObj.hand === otherUser.hand){
				winner = 'TIED! No Winner'
				endGameAndRestart();
			}
		} else {
			return;
		}
	};
});

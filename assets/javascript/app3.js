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
	var turnCounterRef = database.ref('turn')
	var userObj = {
			username: '',
			hand: '',
			wins: 0,
			losses: 0,
			timestamp: firebase.database.ServerValue.TIMESTAMP
		};
	var userID;
	var otherUser = {};
	var otherUserID;
	var winner = '';
	var userWins = 0;
	var otherUserWins = 0;
	var ties = 0;
	var turn;
	var numUsers = 0;
	var usersArray = [];
	var order = [];

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

			    // usersRef.once('value', function(bill) {
			    // 	bill.forEach(function(hop) {
			    // 		usersArray.push(hop);
			    // 	});
			    // });
			    // console.log(usersArray.length);

			    usersRef.once('value', function(snapshot) {
						numUsers = snapshot.numChildren();
						console.log(numUsers);
					

			    usersRef.on('child_added', function(childSnapshot) {
			    	// console.log(childSnapshot.val());
			    	

			    	// console.log(usersArray.length);
			    	// console.log(prevChildKey);


			    	


			    	if (numUsers > 2) {
			    		$('.container').hide();
						} else if (userID !== childSnapshot.key) {
							otherUserID = childSnapshot.key;
							otherUser.username = childSnapshot.val().username;
							otherUser.hand = childSnapshot.val().hand;
							database.ref('users/' + otherUserID).on('value', function(snap) {
								otherUser.username = snap.val().username;
								otherUser.hand = snap.val().hand;
								otherUser.timestamp = snap.val().timestamp;
								$('#opponent').html(otherUser.username);
								evaluateHands();
							});
						} else if (userID === childSnapshot.key) {
							database.ref('users/' + userID).on('value', function(snap) {
								userObj.username = snap.val().username;
								userObj.hand = snap.val().hand;
								userObj.timestamp = snap.val().timestamp;
								evaluateHands();
							});
						}
						usersArray = [];

			      determineOrder();
					});
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

						turnCounterRef.set(otherUserID);
						$('.hand-btn').hide();
					});
				} else {
					// // User is signed out
					console.log("Player is signed out");
					$('.container').hide();

					firebase.auth().signInAnonymously().catch(function(error) {
						console.log( error.code + ": " + error.message );
					})
				}
			});
	  }
	});

	function determineOrder() {
		// Determine which user was in the game first
	  if ((otherUser.timestamp > userObj.timestamp)) {
	  	turnCounterRef.set(userID);
	  } else if (otherUser.timestamp < userObj.timestamp) {
	  	turnCounterRef.set(otherUserID);
	  } else {
	  	turnCounterRef.set(userID);
	  }

	  turnCounterRef.on('value', function(snapshot) {
	  	turn = snapshot.val();
	  });
	}

	function endGameAndRestart() {
		$('#winner').html(winner);
		$('#opponent-hand').html(otherUser.hand);

		setTimeout(function(){
			usersRef.child(userID).update({
				hand: ''
			});
			usersRef.child(userID).update({
				wins: userWins
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
			console.log('evaluateHands= ' + userObj.hand + ' + ' + otherUser.hand);
			if (
				(userObj.hand === 'Rock') && (otherUser.hand === 'Scissors') ||
				(userObj.hand === 'Scissors') && (otherUser.hand === 'Paper') ||
				(userObj.hand === 'Paper') && (otherUser.hand === 'Rock')
			) {
				userWins++;
				winner = userObj.username;
				endGameAndRestart();
			} else if (
				(userObj.hand === 'Rock') && (otherUser.hand === 'Paper') ||
				(userObj.hand === 'Scissors') && (otherUser.hand === 'Rock') ||
				(userObj.hand === 'Paper') && (otherUser.hand === 'Scissors')
			){
				otherUserWins++;
				winner = otherUser.username;
				endGameAndRestart();
			} else if (userObj.hand === otherUser.hand){
				ties++;
				winner = 'No Winner'
				endGameAndRestart();
			}
		} else {
			return;
		}
		console.log(winner);
	};
});

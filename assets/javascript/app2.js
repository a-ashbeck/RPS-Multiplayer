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

	// prototype object for users
	var User = function() {
		this.username = '';
		this.hand = '';
		this.wins = 0;
		this.losses = 0;
	};

	var otherUser;
	var userID;
	var otherUserID;
	var user;
	var userWins;
	var otherUserWins;
	var winner;

	function loadGame() {
		// load the board
		loadBoard();
		// load the user
		initMainUser();

		listenForOtherUser();
	}

	function listenForOtherUser() {
		// when a user is added, do something
		database.ref('users').on('child_added', function(childSnapshot) {
			if (childSnapshot.val()) {
				if (userID !== childSnapshot.key) {
					otherUser = new User(childSnapshot.key);
					database.ref('users/' + childSnapshot.key).on('value', function(childSnapshot) {
						if (childSnapshot.val()) {
							otherUser.hand = childSnapshot.val().hand;
							evaluateHands();
						}
					});
				} else if (userID !== childSnapshot.key && !otherUser[childSnapshot.key]) {
					// show error and ask to wait patiently for user to leave
				}
			}
		});

		// when a user is removed, do something
		// database.ref('users').on('child_removed', function(childSnapshot) {
		// 	if (childSnapshot.val()) {
		// 		database.ref('users/' + childSnapshot.key).off('value', listenToUser);
		// 		delete otherUser[childSnapshot.key];
		// 	}
		// });
	}




	var connectionsRef = database.ref('/users/');
	var connectedRef = database.ref('.info/connected');

	// When the client's connection state changes...
	connectedRef.on('value', function(snapshot) {

	  // If they are connected..
	  if (snapshot.val()) {

	    // Add user to the connections list.
	    var connection = connectionsRef.push(true);
	    database.ref('users/' + userID).set({
				hand: ''
			});

			user = new User();


	    // Remove user from the connection list when they disconnect.
	    connection.onDisconnect().remove();

	  }
	});

	function initMainUser() {
		database.ref('users/' + userID).set({
			hand: ''
		});

		user = new User();
	}

	// When first loaded or when the connections list changes...
	connectionsRef.on('value', function(snapshot) {
		if (snapshot.numChildren >= 2) {
			$('.container').hide();
		}
	});






	// Sets username GOOD
	$('#set-username').on('click', function() {
		userID = $('#username').val().trim();
		initMainUser();

		$('#username').val('');
	});

	// Sets your hand
	$('.hand-btn').on('click', function() {
		database.ref('users/' + userID).update({
			hand: $(this).text()
		});
	});




	function evaluateHands() {
		if (user.hand && otherUser.hand !== '') {
			if (
				(user.hand === 'Rock') && (otherUser.hand === 'Scissors') ||
				(user.hand === 'Scissors') && (otherUser.hand === 'Paper') ||
				(user.hand === 'Paper') && (otherUser.hand === 'Rock')
			) {
				userWins++;
				winner = userID;
			} else if (
				(user.hand === 'Rock') && (otherUser.hand === 'Paper') ||
				(user.hand === 'Scissors') && (otherUser.hand === 'Rock') ||
				(user.hand === 'Paper') && (otherUser.hand === 'Scissors')
			){
				otherUserWins++;
				winner = otherUserID;
			} else if (user.hand === otherUser.hand){
				ties++;
				winner = 'No Winner'
			}
		}
		console.log(winner);
	};


	

	listenForOtherUser();


	
});


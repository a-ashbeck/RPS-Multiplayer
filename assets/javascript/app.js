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

	var localUsername = '';
	var yourWins = 0;
	var opponentsWins;
	var localLosses = 0;
	var ties = 0;
	var opponent = '';
	var yourHand = '';
	var winner = '';
	var opponentsHand;
	var gameFree;
	var userOne;
	var userTwo;


	// Update DOM with DB changes
	database.ref().on('value', function(snapshot) {
		if (localUsername === database.ref().userOneUsername) {
			opponent = snapshot.val().userTwoUsername;
			yourHand = snapshot.val().userOneHand;
			opponentsHand = snapshot.val().userTwoHand
			yourWins = snapshot.val().userOneWins;
			opponentsWins = snapshot.val().userTwoWins
		} else if (localUsername === snapshot.val().userTwoUsername) {
			opponent = snapshot.val().userOneUsername;
			yourHand = snapshot.val().userTwoHand;
			opponentsHand = snapshot.val().userOneHand
			yourWins = snapshot.val().userTwoWins;
			opponentsWins = snapshot.val().userOneWins
		}

		userOne = snapshot.val().userOneUsername;
		userTwo = snapshot.val().userTwoUsername;
		ties = snapshot.val().ties;

		$('#opponent').html(opponent);
		$('#opponent-hand').html(opponentsHand);
		$('#winner').html(winner);
		$('#wins').html(yourWins);
		$('#losses').html(opponentsWins);
		$('#ties').html(ties);
		// $('.hand-btn').disable();
	});

	// // This function determines how many players exist when starting a game, and sets the gameboard accordingly
	// function determineIfThereAreTwoPlayers() {
	// 	if (snapshot.val().userOneUsername && snapshot.val().userTwoUsername === '') {
	// 		database.ref('userOneUsername').update(localUsername);
	// 		// lock additional users from clicking buttons to start game
	// 		// pop-up modal will give warning and ask to please wait until a player leaves the game
	// 	} else if ((snapshot.val().userOneUsername !== '') && 
	// 						 (snapshot.val().userTwoUsername === '')) {
	// 		database.ref('userTwoUsername').update(localUsername);
	// 		gameFree = false;
	// 	} else if ((gameFree === false) &&
	// 						 (localUsername !== snapshot.val().userOneUsername || snapshot.val().userTwoUsername)) {
	// 		// Placeholder alert
	// 		alert('This game is full. Please wait until a player leaves before trying again'); 
	// 		// toggle container to display error/modal/whatever
	// 	}


	// Sets username GOOD
	$('#set-username').on('click', function() {
		localUsername = $('#username').val().trim();
		console.log(userOne);

		if (userOne === '') {
			database.ref().update({
				userOneUsername: localUsername
			});
		} else {
			database.ref().update({
				userTwoUsername: localUsername
			});
		}

		$('#username').val('');
	});

	// On a value change from setHand, this will calculate the game outcome and update the results in the database
	$('.hand-btn').on('click', function() {
		console.log($(this).text());
		if (localUsername === userOne) {
			database.ref().update({
				userOneHand: $(this).text()
			});
		} else if (localUsername === userTwo) {
			database.ref().update({
				userTwoHand: $(this).text()
			});
		}

		if (yourHand && opponentsHand !== '') {
			if (
				(yourHand === 'Rock') && (opponentsHand === 'Scissors') ||
				(yourHand === 'Scissors') && (opponentsHand === 'Paper') ||
				(yourHand === 'Paper') && (opponentsHand === 'Rock')
			) {
				yourWins++;
				winner = localUsername;
			} else if (
				(yourHand === 'Rock') && (opponentsHand === 'Paper') ||
				(yourHand === 'Scissors') && (opponentsHand === 'Rock') ||
				(yourHand === 'Paper') && (opponentsHand === 'Scissors')
			){
				opponentsWins++;
				winner = opponent;
			} else if (yourHand === opponentsHand){
				ties++;
				winner = 'No Winner'
			}

			if (localUsername === userOne) {
				database.ref().update({
					userOneHand: yourHand
				});
				database.ref().update({
					userTwoHand: opponentsHand
				});
				database.ref().update({
					userOneWins: yourWins
				});
				database.ref().update({
					userTwoWins: opponentsWins
				});
			} else if (localUsername === userTwo) {
				database.ref().update({
					userTwoHand: yourHand
				});
				database.ref().update({
					userOneHand: opponentsHand
				});
				database.ref().update({
					userTwoWins: yourWins
				});
				database.ref().update({
					userOneWins: opponentsWins
				});
			}

			database.ref().update({
				ties: ties
			});
		}
	});



	function startNewRound() {
		$('#start-new-round').on('click', function() {
			database.ref('userOneHand').update('');
			database.ref('userTwoHand').update('');
		});
	}

	// Disconnect event
	$('#leave-game').on('click', function() {
		if (localUsername === snapshot.val().userOneUsername) {
			database.ref().update({
				userOneHand: ''
			});
			database.ref().update({
				userOneWins: winsOne
			});
			database.ref().update({
				userTwoWins: winsTwo
			});
			database.ref().update({
				userOneLosses: 0
			});
			database.ref().update({
				userTwoLosses: 0
			});
			database.ref().update({
				ties: 0
			});
		} else if (localUsername === snapshot.val().userTwoUsername) {
			database.ref().update({
				userTwoHand: ''
			});
			database.ref().update({
				userOneWins: winsOne
			});
			database.ref().update({
				userTwoWins: winsTwo
			});
			database.ref().update({
				userOneLosses: 0
			});
			database.ref().update({
				userTwoLosses: 0
			});
			database.ref().update({
				ties: 0
			});
		}

		// determineIfThereAreTwoPlayers();
	});








	// Messenger functions GOOD
	$('#message-btn').on('click', function() {

	  // Grabs user input
	  var messageInput = $('#message-input').val().trim();


	  // Creates local object for holding message data
	  var message = {
	    user: localUsername,
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

	  // Add message to chat room
	  $('#chat-room').append('<tr><td>' + screenname + '</td><td>: :</td><td>' + messageInput + '</td></tr>');
	  $('#chat-room').scrollTop($('#chat-room')[0].scrollHeight);
	});
});



























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
	var username;

	$('#set-username').on('click', function() {
		username = $('#username').val().trim();
		$('#username').val('');
	});


	// Messenger functions
	$('#message-btn').on('click', function() {

	  // Grabs user input
	  var messageInput = $('#message-input').val().trim();


	  // Creates local object for holding message data
	  var message = {
	    user: username,
	    message: messageInput,
	  };

	  if (messageInput !== '') {

		  // Uploads message data to the database
		  database.ref().push(message);

		  // Logs everything to console
		  console.log(message.user);
		  console.log(message.message);

		  // Clears the text-box
		  $('#message-input').val('');
		}

	  // Prevents moving to new page
	  return false;
	});

	database.ref().on('child_added', function(childSnapshot, prevChildKey) {

	  console.log(childSnapshot.val());

	  // Store everything into a variable.
	  var username = childSnapshot.val().user;
	  var messageInput = childSnapshot.val().message;

	  // log info
	  console.log(username);
	  console.log(messageInput);

	  // Add message to chat room
	  $('#chat-room').append('<tr><td>' + username + '</td><td>: :</td><td>' + messageInput + '</td></tr>');
	  $('#chat-room').scrollTop($('#chat-room')[0].scrollHeight);
	});
});


// // Sets the computer choices 
// var computerChoices = ['r', 'p', 's'];

// // Declares the tallies to 0 
// var wins = 0;
// var losses = 0;
// var ties = 0;

// // When the user presses the key it records the keypress and then sets it to userguess
// document.onkeyup = function(event) {
// 	var userGuess = String.fromCharCode(event.keyCode).toLowerCase();

// 	// This sets the computer guess equal to the random.
// 	var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

// 	// Making sure the user chooses r, p, or s
// 	if ((userGuess == 'r') || (userGuess == 'p') || (userGuess == 's')){

// 		// It tests to determine if the computer or the user won the round and then increments 
// 		if ((userGuess == 'r') && (computerGuess == 's')){
// 			wins++;
// 		}else if ((userGuess == 'r') && (computerGuess == 'p')){
// 			losses++;
// 		}else if ((userGuess == 's') && (computerGuess == 'r')){
// 			losses++;
// 		}else if ((userGuess == 's') && (computerGuess == 'p')){
// 			wins++;
// 		}else if ((userGuess == 'p') && (computerGuess == 'r')){
// 			wins++;
// 		}else if ((userGuess == 'p') && (computerGuess == 's')){
// 			losses++;
// 		}else if (userGuess == computerGuess){
// 			ties++;
// 		}  

// 		// Taking the tallies and displaying them in HTML
// 		var html = '<p>Press r, p or s to start playing</p>' +
// 		'<p>wins: ' + 
// 		wins + 
// 		'</p>' +
// 		'<p>losses: ' + 
// 		losses + 
// 		'</p>' +
// 		'<p>ties: ' + 
// 		ties + 
// 		'</p>';

// 		// Placing the html into the game ID
// 		document.querySelector('#game').innerHTML = html;

// 	}
// }
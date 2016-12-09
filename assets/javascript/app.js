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
    var otherUserObj = {
        username: '',
        hand: '',
        wins: 0,
        losses: 0
    };
    var otherUserID;
    var winner = '';
    var numUsers = 0;

    // Shows the game board
    function showGameBoard() {
        $('#container-1').show();
        $('#container-2').hide();
    }

    // Hides the game board in case of error or interloper
    function hideGameBoard() {
        $('#container-1').hide();
        $('#container-2').show();
    }

    // Sets your hand in firebase
    function setHand() {
        $('.hand-btn').on('click', function() {
            // sets user hand in firebase
            usersRef.child(userID).update({
                hand: $(this).text()
            });

            // hides hand btn choices
            $('.hand-btn').hide();
        });
    }

    // Sets username and sends to firebase
    function setUsername() {
        $('#set-username').on('click', function() {
            // sets username in firebase
            usersRef.child(userID).update({
                username: $('#username').val().trim()
            });

            // hides username field and btn
            $('#set-username').hide();
            $('#username').hide();
        });
    }

    // Sends messenger message to firebase
    function sendMessage() {
        $('#message-btn').on('click', function() {
            // Grabs user input
            var messageInput = $('#message-input').val().trim();
            // Creates local object for holding message data
            var message = {
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                user: userObj.username,
                message: messageInput,
            };

            // only if the message has content...
            if (messageInput !== '') {
                // Uploads message data to the database
                database.ref().child('messenger').push(message);
                // Clears the text-box
                $('#message-input').val('');
            }

            return false;
        });
    }

    // Grab messages from Firebase and append to DOM
    function showMessage(childSnapshot) {
        var screenname = childSnapshot.val().user;
        var messageInput = childSnapshot.val().message;
        var time = moment(childSnapshot.val().timestamp).format('M/D/YY h:mm:s a');

        // Add message to chat room
        $('#chat-room').append('<p>' + screenname + ' - ' + time + ': ' + messageInput + '<p>');
        // keeps the freshest messages in sight
        $('#chat-room').scrollTop($('#chat-room')[0].scrollHeight);
    }

    // Determines if user is elligible to play and if it is the
    // local user, opponent, or some interloper, and then directs
    // game play
    function rpsGameAction(childSnapshot) {
        // Hides game board from interloper if 3 or more player
        if (numUsers > 2) {
            hideGameBoard();
            // if the most recent snapshot was not the local user...
        } else if (userID !== childSnapshot.key) {
            // set "other user" variables with data
            otherUserID = childSnapshot.key;
            otherUserObj.username = childSnapshot.val().username;
            otherUserObj.hand = childSnapshot.val().hand;
            // If the other user does something...
            database.ref('users/' + otherUserID).on('value', function(snap) {
                // update their stats locally
                otherUserObj.username = snap.val().username;
                otherUserObj.hand = snap.val().hand;
                // Display their username to the local DOM
                $('#opponent').html(otherUserObj.username);
                // evaluate the change in data
                evaluateHands();
            });
            // if the most recent snapshot was the local user...
        } else if (userID === childSnapshot.key) {
            // and if the local user does something....
            database.ref('users/' + userID).on('value', function(snap) {
                // update local variables to insist on staying accurate to Firebase
                userObj.username = snap.val().username;
                userObj.hand = snap.val().hand;
                // evaluate the change in data
                evaluateHands();
            });
        }
    }

    // updates stats on the DOM then refreshes on timeout
    function endGameAndRestart() {
        // Update the DOM
        $('#winner').html(winner);
        $('#opponent-hand').html(otherUserObj.hand);
        $('#wins').html(userObj.wins);
        $('#losses').html(otherUserObj.wins);
        $('#ties').html(userObj.ties);

        // Timeout to flash winner and what not for 5 secs
        setTimeout(function() {
            usersRef.child(userID).update({
                hand: '',
                wins: userObj.wins,
                losses: otherUserObj.wins
            });

            winner = '';
            userObj.hand = '';
            otherUserObj.hand = '';
            $('#winner').html(winner);
            $('#opponent-hand').html(otherUserObj.hand);
            // shows the hand selection btns again
            $('.hand-btn').show();
        }, 5000);
    }

    // This evaluates the chosen hands and decides outcome
    function evaluateHands() {
        if (userObj.hand && otherUserObj.hand !== null) {
            if (
                (userObj.hand === 'Rock') && (otherUserObj.hand === 'Scissors') ||
                (userObj.hand === 'Scissors') && (otherUserObj.hand === 'Paper') ||
                (userObj.hand === 'Paper') && (otherUserObj.hand === 'Rock')
            ) {
                userObj.wins++;
                winner = userObj.username;
                endGameAndRestart();
            } else if (
                (userObj.hand === 'Rock') && (otherUserObj.hand === 'Paper') ||
                (userObj.hand === 'Scissors') && (otherUserObj.hand === 'Rock') ||
                (userObj.hand === 'Paper') && (otherUserObj.hand === 'Scissors')
            ) {
                otherUserObj.wins++;
                winner = otherUserObj.username;
                endGameAndRestart();
            } else if (userObj.hand === otherUserObj.hand) {
                winner = 'TIED! No Winner'
                endGameAndRestart();
            }
        } else {
            return;
        }
    };

    showGameBoard();

    // Users Firebase magic to detect when a new user joins
    connectedRef.on('value', function(snapshot) {
        // If they are connected...
        if (snapshot.val()) {
            // User is set with an anonymous Firebase authentification ID
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // Firebase ID is the same as the child key for the object
                    // setting it to the userID variable
                    userID = user.uid;

                    // Sets the local user object to the object created by firebase upon auth
                    usersRef.child(userID).set(userObj);

                    // Remove user from the connection list when they disconnect.
                    usersRef.child(userID).onDisconnect().remove();

                    // The first time a user is established, check ONCE for the number of users
                    usersRef.once('value', function(snapshot) {
                        numUsers = snapshot.numChildren();

                        // When a user is added, evaluate the game action
                        usersRef.on('child_added', function(childSnapshot) {
                            rpsGameAction(childSnapshot);
                        });
                    });

                    sendMessage();

                    // Sets messenger updates to DOM
                    database.ref('messenger').on('child_added', function(childSnapshot) {
                        showMessage(childSnapshot);
                    });

                    setUsername();
                    setHand();
                } else {
                    hideGameBoard();

                    // Logs Firebase error to the console if an anon login issue occurred
                    firebase.auth().signInAnonymously().catch(function(error) {
                        console.log(error.code + ": " + error.message);
                    })
                }
            });
        }
    });
});

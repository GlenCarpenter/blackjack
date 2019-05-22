/* Global variables */
const deck = [];
const playerHand = [];
const dealerHand = [];
let playerScore, dealerScore;
let gameIsRunning = false;


/* Game initialization */
// Function to initialize state of new game, may want to refactor using Vue.js or React for state management
function startGame() {
    gameIsRunning = true;
    deck = [];

    // Will need to re-render hands and scores to screen as state changes
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;

    // Build the deck, shuffle it, and deal two cards to each player.  Check to see if anyone got a blackjack.
    createDeckOfCards();
    shuffleDeck(deck);
    dealCards();
    checkBlackjack();

    /*
    Player will now be able to click on 'Stay', 'Hit', or 'Deal' buttons to play game in browser.
    STAY and HIT buttons should only be visible when gameIsRunning = true
    DEAL button should only be visible when gameIsRunning = false

    STAY onclick=playerStays()
    HIT onclick=playerHits()
    DEAL onclick=startGame() 
    */
}

// Create a deck of cards
function createDeckOfCards() {
    const suites = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let i = 0; i < suites.length; i++) {
        for (let j = 0; j < values.length; j++) {
            // Cards are objects containing suite and value
            const card = {
                suite: suites[i],
                value: values[j]
            }

            deck.push(card);
        }
    }
}

// Shuffle the deck by switching random cards with one another 520 times
function shuffleDeck(deckOfCards) {
    for (let i = 0; i < 520; i++) {
        let placeHolderCard;

        let randomIndex1 = Math.floor(Math.random() * deckOfCards.length);
        let randomIndex2 = Math.floor(Math.random() * deckOfCards.length);

        placeHolderCard = deckOfCards[randomIndex1];
        deckOfCards[randomIndex1] = deckOfCards[randomIndex2];
        deckOfCards[randomIndex2] = placeHolderCard;
    }
}


/* Gameplay methods for playing game */

// Deal first two cards to player and dealer
function dealCards() {
    drawCard(playerHand);
    drawCard(dealerHand);
    drawCard(playerHand);
    drawCard(dealerHand);
}

// Function to draw a card and add it to the current hand
// Shifts first item from deck array and pushes to  current hand array
function drawCard(currentHand) {
    currentHand = currentHand.push(deck.shift());
}

// Function to calculate the amount of points to add to score
function calculatePoints(currentHand) {

    let points = 0;
    let acesCount = 0;

    // First we count all cards exept Aces to get the score without Aces
    for (let i = 0; i < currentHand.length; i++) {
        if (currentHand[i].value == 'J' || currentHand[i].value == 'Q' || currentHand[i].value == 'K') {
            points += 10;
        } else if (currentHand[i].value == 'A') {
            // We are not counting Aces until the next step
            // Here we are just keeping a running total of Aces
            acesCount++;
        } else {
            points += parseInt(currentHand[i].value);
        }
    }

    // Now we examine the number of Aces in the hand to determine the total score
    if (acesCount == 0) {
        // If there are no Aces simply return the total without Aces
        return points;
    } else {
        /*
        There may be instances of multiple aces in the hand where it makes sense to have 
        one Ace equal 11 points and the other Aces equal 1 point. There will never be
        an instance where more than one Ace would be worth 11 points, since this causes the 
        player to lose. 
        */
        if (points + 11 + acesCount - 1 <= 21) {
            return points + 11 + acesCount - 1;
        } else {
            // The second case: All Aces might need to equal 1 point, such as K 7 A A A (20pts)
            return points + acesCount;
        }
    }
}

// Player can 'stay' or keep current cards, at which point dealer will take their turn.
// When dealer has finished drawing cards, check to see who won.
function playerStays() {
    dealerDraw();
    checkWin();
}

// Player can draw one card at a time until they 'stay' or bust
function playerHits() {
    drawCard(playerHand);
    playerScore = calculatePoints(playerHand);
    checkBust();
}

// Dealer will draw until they have 17 points or bust
function dealerDraw() {
    while (dealerScore <= 17) {
        drawCard(dealerHand);
        dealerScore = calculatePoints(dealerHand);
        checkBust();
    }
}

/* Checker methods to see if game was won or lost */

// Check bust to see if player or dealer busted
// Should be called each time a new card is drawn

// Created win/lose methods to avoid duplication
function playerWin() {
    gameIsRunning = false;
    if (confirm('You win! New game?')) {
        startGame();
    }
}

function playerLose() {
    gameIsRunning = false;
    if (confirm('You win! New game?')) {
        startGame();
    }
}

function checkBust() {
    if (playerScore > 21) {
        // Player busts
        playerLose();
    } else if (dealerScore > 21) {
        // Dealer busts
        playerWin();
    }
}

// Check for blackjack (21 on first two cards)
function checkBlackjack() {
    if (playerScore === 21 && dealerScore < 21) {
        // Player wins
        playerWin();
    } else if (playerScore < 21 && dealerScore === 21) {
        // Dealer wins
        playerLose();
    }
}

// Check win function to determine if player or dealer won
function checkWin() {
    if (playerScore <= 21 && playerScore > dealerScore) {
        // Player wins
        playerWin();
    } else {
        // Dealer wins
        playerLose();
    }
}
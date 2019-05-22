new Vue({
  el: "#app",
  data: {
    // Game initialization
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    gameIsRunning: false,
    playerWonGame: false,
    playerLostGame: false
  },
  methods: {
    // Function to initialize state of new game
    startGame: function() {
      this.gameIsRunning = true;
      this.playerWonGame = false;
      this.playerLostGame = false;
      this.deck = [];

      // Will need to re-render hands and scores to screen as state changes
      // This will clear any values from previous game
      this.playerHand = [];
      this.dealerHand = [];
      this.playerScore = 0;
      this.dealerScore = 0;

      // Build the deck, shuffle it, and deal two cards to each player.  Check to see if anyone got a blackjack.
      this.createDeckOfCards();
      this.shuffleDeck(this.deck);
      this.dealCards();
      this.checkBlackjack();

      /*
            Player will now be able to click on 'Stay', 'Hit', or 'Deal' buttons to play game in browser.
            STAY and HIT buttons should only be visible when gameIsRunning = true
            DEAL button should only be visible when gameIsRunning = false
            */
    },
    // Create a deck of cards
    createDeckOfCards: function() {
      const suites = ["Hearts", "Diamonds", "Clubs", "Spades"];
      const values = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "Jack",
        "Queen",
        "King",
        "Ace"
      ];

      for (let i = 0; i < suites.length; i++) {
        for (let j = 0; j < values.length; j++) {
          // Cards are objects containing suite and value
          const card = {
            suite: suites[i],
            value: values[j]
          };
          this.deck.push(card);
        }
      }
    },
    // Shuffle the deck by switching cards at random indexes 520 times to simulate 10x shuffle
    shuffleDeck: function(deckOfCards) {
      for (let i = 0; i < 520; i++) {
        let placeHolderCard;

        let randomIndex1 = Math.floor(Math.random() * deckOfCards.length);
        let randomIndex2 = Math.floor(Math.random() * deckOfCards.length);

        placeHolderCard = deckOfCards[randomIndex1];
        deckOfCards[randomIndex1] = deckOfCards[randomIndex2];
        deckOfCards[randomIndex2] = placeHolderCard;
      }
    },
    /* Gameplay methods for playing game */

    // Deal first two cards to player and dealer
    dealCards: function() {
      this.drawCard(this.playerHand);
      this.drawCard(this.dealerHand);
      this.drawCard(this.playerHand);
      this.drawCard(this.dealerHand);
      this.playerScore = this.calculatePoints(this.playerHand);
      this.dealerScore = this.calculatePoints(this.dealerHand);
    },
    // Function to draw a card and add it to the current hand (player or dealer)
    // Shifts first item from deck array and pushes to  current hand array
    drawCard: function(currentHand) {
      currentHand = currentHand.push(this.deck.shift());
    },
    // Function to calculate the amount of points to add to score
    calculatePoints: function(currentHand) {
      let points = 0;
      let acesCount = 0;

      // First we count all cards exept Aces to get the score without Aces
      for (let i = 0; i < currentHand.length; i++) {
        if (
          currentHand[i].value == "Jack" ||
          currentHand[i].value == "Queen" ||
          currentHand[i].value == "King"
        ) {
          points += 10;
        } else if (currentHand[i].value == "Ace") {
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
                one Ace equal 11 points and the other Aces equal 1 point. There will never be an 
                instance where more than one Ace would be worth 11 points, since this causes a bust
                */
        if (points + 11 + acesCount - 1 <= 21) {
          return points + 11 + acesCount - 1;
        } else {
          // The second case: All Aces might need to equal 1 point, such as K 7 A A A (20pts)
          return points + acesCount;
        }
      }
    },
    // Player can 'stay' or keep current cards, at which point dealer will take their turn.
    // When dealer has finished drawing cards, check to see who won.
    playerStays: function() {
      this.dealerDraw();
      this.checkWin();
    },
    // Player can draw one card at a time until they 'stay' or bust
    playerHits: function() {
      this.drawCard(this.playerHand);
      this.playerScore = this.calculatePoints(this.playerHand);
      this.checkBust();
    },
    // Dealer will draw until they have 17 points or bust
    dealerDraw: function() {
      while (this.dealerScore < 17) {
        this.drawCard(this.dealerHand);
        this.dealerScore = this.calculatePoints(this.dealerHand);
        this.checkBust();
      }
    },
    /* Checker methods to see if game was won or lost */

    // Check bust to see if player or dealer busted
    // Should be called each time a new card is drawn

    // Created win/lose methods to avoid duplication
    playerWin: function() {
      this.gameIsRunning = false;
      this.playerWonGame = true;
    },
    playerLose: function() {
      this.gameIsRunning = false;
      this.playerLostGame = true;
    },
    checkBust: function() {
      if (this.playerScore > 21) {
        // Player busts
        this.playerLose();
      } else if (this.dealerScore > 21) {
        // Dealer busts
        this.playerWin();
      }
    },
    checkBlackjack: function() {
      if (this.playerScore === 21 && this.dealerScore < 21) {
        // Player wins
        this.playerWin();
      } else if (this.playerScore < 21 && this.dealerScore === 21) {
        // Dealer wins
        this.playerLose();
      } else if (this.playerScore === 21 && this.dealerScore === 21) {
        // Dealer wins if both hands are 21
        this.playerLose();
      }
    },
    checkWin: function() {
      if (this.playerScore <= 21 && this.playerScore > this.dealerScore) {
        // Player wins
        this.playerWin();
      } else if (
        this.dealerScore <= 21 &&
        this.dealerScore > this.playerScore
      ) {
        // Dealer wins
        this.playerLose();
      } else if (this.playerScore == this.dealerScore) {
        // Dealer wins in event of tie
        this.playerLose();
      }
    }
  }
});

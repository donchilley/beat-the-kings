import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useReducer, useState } from 'react'
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';

const FacedownCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardBack} />
    </View>
  );
};

function Card(props) {
  const { rank, suit } = props

  return (
    <View style={styles.card}>
      <View style={styles.cornerLabel}>
        <Text style={styles.cornerText}>{rank}</Text>
      </View>
      <Text style={{ fontSize: 32, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' }}>{suit}</Text>
      <View style={[styles.cornerLabel, styles.bottomRight]}>
        <Text style={styles.cornerText}>{rank}</Text>
      </View>
    </View>


  )
}

const SelectBetView = (props) => {
  const { selectPlayerBet } = props



  return (
    <View style={styles.selectBet}>
      <View ><Text style={styles.selectBetText}>Select Bet Size</Text></View>
      <View style={styles.selectBetButtons}>
        <TouchableOpacity style={styles.action} onPress={() => selectPlayerBet(1)} title='1x Bet'><Text style={styles.buttonText}>1x</Text></TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => selectPlayerBet(2)} title='2x Bet'><Text style={styles.buttonText}>2x</Text></TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => selectPlayerBet(3)} title='3x Bet'><Text style={styles.buttonText}>3x</Text></TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => selectPlayerBet(4)} title='4x Bet'><Text style={styles.buttonText}>4x</Text></TouchableOpacity>

      </View>

    </View>
  )
}

const ResultView = (props) => {
  const {result} = props

  return(
    <View style={styles.resultView}>
      <Text style={{padding: 5, backgroundColor: 'black', color: 'white', fontSize: 30, fontWeight: 200}}>{result}</Text>
    </View>
  )
}

function reducer(state, action){
  if (action.type === 'starting-bet'){
    return {...state, bet: action.value};
  }
  if (action.type === 'start-game'){
    return state.dealer.turn = false;
  }
}

export default function App() {

  function createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return deck;
  }

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }



  function calculateHandValue(hand) {
    let sum = 0;
    let numAces = 0;

    for (const card of hand) {
      if (card.rank === 'A') {
        numAces++;
        sum += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        sum += 10;
      } else {
        sum += parseInt(card.rank, 10);
      }
    }

    // Adjust for aces
    while (sum > 21 && numAces > 0) {
      sum -= 10;
      numAces--;
    }

    return sum;
  }

  const [prevRunningCount, setPrevRunningCount] = useState(0)
  const [runningCount, setRunningCount] = useState(0)

  function adjustCount(hand) {
    for (const card of hand) {
      if (['6', '5', '4', '3', '2'].includes(card.rank)) {
        setRunningCount((count) => count + 1)
      } else if (['A', 'K', 'Q', 'J', '10'].includes(card.rank)) {
        setRunningCount((count) => count - 1)
      }
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    turn: 'player',
    bet: 0,
    stackSize: 0,
    gameover: false,
    deck: [],
    player: {
      hands: [],
    },
    dealer: {
      hand: []
    },
  })

  const [stackSize, setStackSize] = useState(0)
  const [standardBet, setStandardBet] = useState(10);
  const [playerBet, setPlayerBet] = useState(0);

  const [playersTurn, setPlayersTurn] = useState(false)
  const [dealersTurn, setDealersTurn] = useState(false)

  const selectPlayerBet = (multiplier) => {
    setPlayerBet(standardBet * multiplier)
    dispatch({type: 'starting-bet', value: standardBet * multiplier})
  }

  useEffect(() => {
    console.log(state)
    if (state.bet !== 0){
      dispatch({ type: 'start-game' })
    }
  }, [state.bet])

  //todo: when to shuffle?
  //todo: chips/stack.
  //todo: keep track of current running count, but only show prev count.
  //todo: show when its good to bet bigger.
  //todo: splitting/doubling down.
  //todo: when we bust the dealer shouldn't take more cards.
  //todo: see recent screenshot - bug where i have hit and reached 21 dealer has 17 and nothing happens

  useEffect(() => {
    //player has placed bet, time to play blackjack.
    console.log("New hand...")
    if (playerBet !== 0) {
      setDealersTurn(false)
      setGameover(false)
      setResult("")
      const firstCard = getCard();
      const secondCard = getCard();
      const thirdCard = getCard();
      const fourthCard = getCard();
      setPlayerCards([firstCard, thirdCard])
      setDealerCards([secondCard, fourthCard])
      //where to check if dealer has blackjack???
      if (calculateHandValue([firstCard, thirdCard]) < 21) {
        if (calculateHandValue([secondCard, fourthCard]) === 21){
          setDealersTurn(true)
          setResult('Dealer wins - Blackjack')
          setPlayerBet(0)
        } else {
          setPlayersTurn(true)
        }
      } else {
        //dealt blackjack
        if (calculateHandValue([secondCard, fourthCard]) === 21) {
          setResult("Push")
          setPlayerBet(0)
        } else {
          setResult("Blackjack $ Player Wins")
          setPlayerBet(0)
        }
      }
    }
  }, [playerBet])

  const [deck, setDeck] = useState([])

  useEffect(() => {
    //shuffle deck at sod
    let newDeck = createDeck();
    shuffleDeck(newDeck)
    setDeck(newDeck)
  }, [])

  const [dealerCards, setDealerCards] = useState([])
  const [playerCards, setPlayerCards] = useState([])
  const [result, setResult] = useState("")
  // const [dealerCards, setDealerCards] = useState([{ value: '5', suit: '♥' }, { value: '10', suit: '♠' }])
  // const [playerCards, setPlayerCards] = useState([{ value: 'A', suit: '♥' }, { value: 'K', suit: '♠' }])

  useEffect(() => {
    console.log(playerCards)
  }, [playerCards])

  function getCard() {
    let card = deck.pop()
    adjustCount([card])
    return card;
  }

  function hit() {
    if (playersTurn) {
      let card = getCard();
      setPlayerCards([...playerCards, card])
      const handValue = calculateHandValue([...playerCards, card])
      if (handValue > 21) {
        //bust
        setGameover(true)
        setPlayersTurn(false)
        setDealersTurn(true) //we do this so the card flips over.
      }
    }
  }

  function stand() {
    setPlayersTurn(false)
    setDealersTurn(true)
  }

  const [gameover, setGameover] = useState(false)

  useEffect(() => {
    if (dealersTurn && calculateHandValue(playerCards) <= 21) { // we do this to prevent the dealer from hitting when we bust.
      let cards = [...dealerCards]
      while (calculateHandValue(cards) < 17) {
        let card = getCard();
        cards.push(card)
      }
      setDealerCards(cards)
      setGameover(true)
    }
  }, [dealersTurn])

  useEffect(() => {
    if (gameover) {
      const playerValue = calculateHandValue(playerCards)
      const dealerValue = calculateHandValue(dealerCards)

      if (playerValue > 21) {
        setResult("Bust")
      } else if (dealerValue <= 21 && dealerValue > playerValue) {
        setResult("Dealer wins")
      } else if (dealerValue <= 21 && dealerValue === playerValue) {
        setResult("Push")
      } else {
        setResult("Player wins")
      }

      setPlayerBet(0)
    }
  }, [gameover])

  return (
    <View style={styles.container}>
      <View style={styles.countContainer}><Text style={styles.count}>{runningCount}</Text></View>
      <View style={styles.dealer}>
        {dealerCards.map((card, index) => {
          return (
            <View key={index} style={{ position: 'absolute', left: index * 30 }}>
              {/** TODO: if dealer gets dealt blackjack need to flip it over as well */}
              {(index === 1 && !dealersTurn) ? <FacedownCard></FacedownCard> : <Card rank={card.rank} suit={card.suit}></Card>}
            </View>
          )

        })}
      </View>
      <View style={styles.player}>
        {playerCards.map((card, index) => {
          return (
            <View key={index} style={{ position: 'absolute', bottom: index * 30, left: index * 30 }}>
              <Card rank={card.rank} suit={card.suit}></Card>
            </View>
          )

        })}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => hit()} title='Stand'><Text style={styles.buttonText}>Hit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => stand()} title='Stand'><Text style={styles.buttonText}>Stand</Text></TouchableOpacity>
      </View>
      <StatusBar style="auto" />
      {(playerBet === 0) && <SelectBetView selectPlayerBet={selectPlayerBet} />}
      {result !== '' && <ResultView result={result}></ResultView>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35654d',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  count: {
    color: 'white',
    fontSize: 50,
    fontWeight: 300,
  },
  countContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '15%',
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dealer: {
    position: 'relative',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    height: 150,
    width: 100
  },
  player: {
    position: 'relative',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    height: 150,
    width: 100
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  action: {
    color: 'white',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: 'white',
    marginRight: 40,
    marginLeft: 40,
    height: 50,
    width: 70,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  card: {
    position: 'relative',
    width: 96,
    height: 145,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cornerLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cornerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suit: {
    fontSize: 32,
  },
  bottomRight: {
    top: 'auto',
    bottom: 10,
    left: 'auto',
    right: 10,
    transform: [{ rotate: '180deg' }],
  },
  cardBack: {
    width: '90%',
    height: '90%',
    backgroundColor: '#999',
    borderRadius: 5,
  },
  selectBet: {
    position: 'absolute',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 33,
    bottom: 0,
    left: 0,
    height: '20%',
    width: '100%',
    backgroundColor: 'black',
    opacity: '0.75'
  },
  selectBetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  selectBetText: {
    color: 'white'
  },
  resultView: {
    position: 'absolute',
    bottom: '22%',
    left: 0,
    height: '10%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

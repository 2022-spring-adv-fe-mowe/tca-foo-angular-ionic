import { Injectable } from '@angular/core';


export interface Player {
  name: string;
  order: number;
}

interface GameResult {
  start: string;
  end: string;
  winner: string;
  players: Player[];
}

interface CurrentGame {
  start: string;
  availablePlayers: Player[];
}

const game1: GameResult = {
  start: "2022-02-14T15:14:30"
  , end: "2022-02-14T15:20:00"
  , winner: "Me"
  , players: [{ name: "Me", order: 1}, { name: "Taylor", order: 2}, {name: "Jack", order: 3}]
};

const game2: GameResult = {
  start: "2022-02-14T21:00:30"
  , end: "2022-02-14T21:30:30"
  , winner: "Stephanie"
  , players: [{ name: "Me", order: 1}, { name: "Stephanie", order: 2}, {name: "Jack", order: 3}]
};


@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameResults = [
      game1
      , game2
  ];

  addGameResult = (r: GameResult) => {
    
    this.gameResults = [
      ...this.gameResults
      , r
    ];

  };  

  getUniquePlayers = () => (
    [... new Set(this.gameResults.flatMap(x => x.players.map(y => y.name)))]
  );

  currentGame: CurrentGame = {
    start: ""
    , availablePlayers: [] 
  };

  setCurrentGame = (g: CurrentGame) => {
    this.currentGame = g;
  };

  calculateShortestGame = () => (
    Math.min(
        ...this.gameResults.map(x => Date.parse(x.end) - Date.parse(x.start))
    )
  );
  
  calculateLeaderboard = () => {

    return this.getUniquePlayers()
        .map(x => {

            const userGamesPlayed = this.gameResults.filter(y => y.players.some(z => z.name === x));
            const userGamesWon = userGamesPlayed.filter(y => y.winner === x);

            return {
                name: x
                , wins: userGamesWon.length
                , losses: userGamesPlayed.length - userGamesWon.length
                , winningPercent: (userGamesWon.length / userGamesPlayed.length).toFixed(3)
            };
        })
        .sort((a, b) => `${b.winningPercent}${(b.wins + b.losses).toString().padStart(3, '0')}`.localeCompare(`${a.winningPercent}${(a.wins + a.losses).toString().padStart(3, '0')}`))
    ;
  };

  constructor() { }
}

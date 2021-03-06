import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { saveGameToCloud, loadGamesFromCloud } from './TcaCloudApi';

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

@Injectable({
  providedIn: 'root'
})
export class GameService {

  gameResults = [];

  addGameResult = async (r: GameResult) => {
    
    this.gameResults = [
      ...this.gameResults
      , r
    ];

    // await this.storage.set("gameResults", this.gameResults);
    await saveGameToCloud(
      this.emailAddress
      , "tca-foo-angular-ionic"
      , r.end
      , r
    );
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

    return this.getUniquePlayers().map(x => {

        const userGamesPlayed = this.gameResults.filter(y => y.players.some(z => z.name === x));
        const userGamesWon = userGamesPlayed.filter(y => y.winner === x);

        return {
            name: x
            , wins: userGamesWon.length
            , losses: userGamesPlayed.length - userGamesWon.length
            , winningPercent: (userGamesWon.length / userGamesPlayed.length).toFixed(3)
        };
    }).sort(
      (a, b) => a.winningPercent > b.winningPercent ? -1 : 1
    );
};

  constructor(
    private storageSvc: Storage
  ) { 
    this.init();
  }

  private storage: Storage = undefined;

  init = async () => {
    this.storage = await this.storageSvc.create();
    this.emailAddress = await this.storage.get("email") ?? "";

    if (this.emailAddress.length > 0) {
      this.gameResults = await loadGamesFromCloud(this.emailAddress, "tca-foo-angular-ionic") ?? [];
    }
  };

  emailAddress = "";

  updateEmail = async (newEmailAddress) => {
    this.emailAddress = await this.storage.set('email', newEmailAddress);
    this.init();
  };
}

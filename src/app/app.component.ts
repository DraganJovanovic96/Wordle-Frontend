import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import { HttpClient } from '@angular/common/http';
import { WinRateDialogComponent } from './win-rate-dialogue/win-rate-dialogue.component';
import { environment } from '../environments/environment';

const BASIC_URL = environment.apiUrl;

interface GuessedWord {
  guessedWord: string;
  characters: { [key: string]: 'CORRECT' | 'PRESENT_BUT_MISPLACED' | 'NOT_PRESENT' };
}

interface GameData {
  gameStatus: 'IN_PROGRESS' | 'WIN' | 'LOSE';
  numberOfTries: number;
  playerId: string;
  guessedWordsDto: GuessedWord[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Wordle-Frontend';

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  keyboardMapping: { [key: string]: string } = {
    q: 'Љ', w: 'Њ', e: 'Е', r: 'Р', t: 'Т', y: 'З', u: 'У', i: 'И',
    o: 'О', p: 'П', a: 'А', s: 'С', d: 'Д', f: 'Ф', g: 'Г', h: 'Х',
    j: 'Ј', k: 'К', l: 'Л', x: 'Џ', c: 'Ц', v: 'В', b: 'Б', n: 'Н', m: 'М',
    '[': 'Ш', ';': 'Ч', "'": 'Ћ', ']': 'Ђ', '\\': 'Ж',
  };

  grid: string[][] = Array.from({ length: 6 }, () => Array(5).fill(''));
  colors: string[][] = Array.from({ length: 6 }, () => Array(5).fill(''));
  animateBox: boolean[][] = Array.from({ length: 6 }, () => Array(5).fill(false));
  keyboardColors: { [key: string]: string } = {};
  currentRow = 0;
  currentCol = 0;

  notificationMessage: string | null = null;
  notificationType: string = 'success';
  isGameOver: boolean = false;

  gameStatus: 'IN_PROGRESS' | 'WIN' | 'LOSE' = 'IN_PROGRESS';
  numberOfTries: number = 0;
  playerId: string = '';
  guessedWordsDto: GuessedWord[] = [];

  ngOnInit(): void {
    this.startGame();
  }

  showWinRate(): void {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      console.log('Player ID not found in localStorage');
      return;
    }
  
    this.http.post(`${BASIC_URL}win-rate`, { playerId }).subscribe(
      (response: any) => {
        this.openWinRateDialog(response.winRate, response.numberOfWins, response.numberOfLoses);
      },
      (error) => {
        console.error('Error fetching win rate:', error);
      }
    );
  }
  
  openWinRateDialog(winRate: number, numberOfWins: number, numberOfLoses: number): void {
    const dialogRef = this.dialog.open(WinRateDialogComponent, {
      width: '350px',
      data: { winRate, numberOfWins, numberOfLoses }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  typeCharacter(char: string) {
    if (this.isGameOver) {
      return;
    }
  
    if (this.currentRow < 6 && this.currentCol < 5) {
      this.grid[this.currentRow][this.currentCol] = char;
      this.triggerAnimation(this.currentRow, this.currentCol);
      this.currentCol++;
    }
  }

  triggerAnimation(rowIndex: number, colIndex: number) {
    this.animateBox[rowIndex][colIndex] = true;
    setTimeout(() => {
      this.animateBox[rowIndex][colIndex] = false;
    }, 500);
  }

  deleteCharacter() {
    if (this.currentCol > 0) {
      this.currentCol--;

      this.grid[this.currentRow][this.currentCol] = '';

      this.triggerAnimation(this.currentRow, this.currentCol);
    }
  }

  getKeyboardKeyColor(letter: string): string {
    letter = letter.toLowerCase();
    return this.keyboardColors[letter] || '#818384';
  }

  submit(): void {
    if (this.currentCol === 5) {
      const guessedWord = this.grid[this.currentRow].join('');
      const playerId = localStorage.getItem('playerId');
  
      const payload = {
        playerId,
        guessedWord,
      };
  
      this.http.put(`${BASIC_URL}game/submit-guess`, payload).subscribe({
        next: (data: any) => {
          const characters = data.guessedWordsDto[data.guessedWordsDto.length - 1].characters;
          const updatedRowColors = Array(5).fill('');
  
          Object.entries(characters).forEach(([index, status], i) => {
            const idx = parseInt(index, 10);
            const letter = guessedWord[idx];
  
            const cellElement = document.querySelector(`#row-${this.currentRow}-col-${idx}`);
            if (cellElement) {
              cellElement.classList.add('flip-animation');
              setTimeout(() => {
                cellElement.classList.remove('flip-animation');
              }, 500);
            }
  
            setTimeout(() => {
              if (status === 'CORRECT') {
                updatedRowColors[idx] = '#568c52'; 
              } else if (status === 'PRESENT_BUT_MISPLACED') {
                updatedRowColors[idx] = '#b49e45'; 
              } else {
                updatedRowColors[idx] = '#3a3a3c'; 
              }
            }, i * 300);
  
            setTimeout(() => {
              if (status === 'CORRECT') {
                this.updateKeyboardColor(letter.toLowerCase(), '#568c52');
              } else if (status === 'PRESENT_BUT_MISPLACED') {
                this.updateKeyboardColor(letter.toLowerCase(), '#b49e45');
              } else {
                this.updateKeyboardColor(letter.toLowerCase(), '#3a3a3c');
              }
            }, 1500); 
          });

          const gameStatus = data.gameStatus;
          const correctWord = data.correctWord;
  
          if (gameStatus === 'WIN') {
            this.isGameOver = true;
            setTimeout(() => {
              this.showWinRate();
            }, 1600); 
          }
  
          if (gameStatus === 'LOSE') {
            this.openNotificationDialog(correctWord.toUpperCase());
            setTimeout(() => {
              this.showWinRate();
            }, 1000); 
          }
  
          this.colors[this.currentRow] = updatedRowColors;
          this.currentRow++;
          this.currentCol = 0;
        },
        error: (error) => {
          if (error.status === 400) {
            this.openNotificationDialog(error.error || 'Лош захтев.');
          } else if (error.status === 404) {
            this.openNotificationDialog('Дата реч није у нашој бази!');
          } else if (error.status === 409) {
            this.openNotificationDialog('Реч је већ искоришћена.');
          } else {
            this.openNotificationDialog(`Неочекивана грешка: ${error.message}`);
          }
  
          this.grid[this.currentRow] = Array(5).fill('');
          this.colors[this.currentRow] = Array(5).fill('');
          this.currentCol = 0;
        },
      });
    }
  }
  
  

  startGame(): void {
    const body = { playerId: localStorage.getItem("playerId") };
    const headers = { "Content-Type": "application/json" };
  
    this.http.post<GameData>(`${BASIC_URL}game/start`, body, { headers }).subscribe({
      next: (data) => {
        this.restoreGameState(data);
        this.keyboardColors = {};
  
        data.guessedWordsDto.forEach((word) => {
          
          Object.entries(word.characters).forEach(([index, status]) => {
            const idx = parseInt(index, 10);
            const letter = word.guessedWord[idx];
  
            if (!this.keyboardColors[letter]) {
              if (status === 'CORRECT') {
                this.keyboardColors[letter] = '#568c52'; // Green
              } else if (status === 'PRESENT_BUT_MISPLACED') {
                this.keyboardColors[letter] = '#b49e45'; // Yellow
              } else if (status === 'NOT_PRESENT') {
                this.keyboardColors[letter] = '#3a3a3c'; // Gray
              }
            }
          });
        });
  
        Object.entries(this.keyboardColors).forEach(([letter, color]) => {
          this.updateKeyboardColor(letter, color);
        });
  
        if (data.playerId) {
          localStorage.setItem("playerId", data.playerId);
        }
      },
      error: (error) => {
        console.error('Error starting the game:', error);
      },
    });
  }

  restoreGameState(gameData: GameData) {
    this.gameStatus = gameData.gameStatus;
    this.numberOfTries = gameData.numberOfTries;
    this.playerId = gameData.playerId;
    this.guessedWordsDto = gameData.guessedWordsDto;

    this.guessedWordsDto.forEach((guessedWordData, rowIndex) => {
      const guessedWord = guessedWordData.guessedWord;
      const characters = guessedWordData.characters;

      for (let colIndex = 0; colIndex < 5; colIndex++) {
        this.grid[rowIndex][colIndex] = guessedWord[colIndex];
        this.updateRowColor(rowIndex, colIndex, characters[colIndex]);

        const letter = guessedWord[colIndex];
      }
    });

    this.currentRow = this.guessedWordsDto.length;
    this.currentCol = this.grid[this.currentRow].findIndex(cell => cell === '');
  }


  updateRowColor(rowIndex: number, colIndex: number, status: 'CORRECT' | 'PRESENT_BUT_MISPLACED' | 'NOT_PRESENT') {
    let color = '';

    if (status === 'CORRECT') {
      color = '#568c52'; 
    } else if (status === 'PRESENT_BUT_MISPLACED') {
      color = '#b49e45'; 
    } else {
      color = '#3a3a3c'; 
    }

    this.colors[rowIndex][colIndex] = color;
  }


  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key in this.keyboardMapping) {
      event.preventDefault();
      this.typeCharacter(this.keyboardMapping[key]);
    } else if (key === 'backspace') {
      event.preventDefault();
      this.deleteCharacter();
    } else if (key === 'enter') {
      event.preventDefault();
      this.submit();
    }
  }

  updateKeyboardColor(letter: string, newColor: string) {
    const currentColor = this.keyboardColors[letter];
    if (!currentColor || this.getColorPriority(newColor) > this.getColorPriority(currentColor)) {
      this.keyboardColors[letter] = newColor;
    }
  }


  getColorPriority(color: string): number {
    if (color === '#568c52') return 3; 
    if (color === '#b49e45') return 2; 
    if (color === '#3a3a3c') return 1; 
    return 0; 
  }

  getColorForStatus(status: 'CORRECT' | 'PRESENT_BUT_MISPLACED' | 'NOT_PRESENT'): string {

    if (status === 'CORRECT') {

      return '#568c52'; 

    } else if (status === 'PRESENT_BUT_MISPLACED') {

      return '#b49e45'; 

    } else {

      return '#3a3a3c'; 
    }
  }

  openNotificationDialog(message: string): void {
    this.dialog.open(NotificationDialogComponent, {
      data: { message },
      panelClass: 'custom-dialog-container',
      hasBackdrop: false,
      position: { top: '5%' },
    });
  }
}

import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Wordle-Frontend';

  keyboardMapping: { [key: string]: string } = {
    q: 'Љ', w: 'Њ', e: 'Е', r: 'Р', t: 'Т', y: 'З', u: 'У', i: 'И',
    o: 'О', p: 'П', a: 'А', s: 'С', d: 'Д', f: 'Ф', g: 'Г', h: 'Х',
    j: 'Ј', k: 'К', l: 'Л', x: 'Џ', c: 'Ц', v: 'В', b: 'Б', n: 'Н', m: 'М',
    '[': 'Ш', ';': 'Ч', "'": 'Ћ', ']': 'Ђ', '\\': 'Ж',
  };

  grid: string[][] = Array.from({ length: 6 }, () => Array(5).fill(''));
  colors: string[][] = Array.from({ length: 6 }, () => Array(5).fill(''));
  keyboardColors: { [key: string]: string } = {};
  currentRow = 0;
  currentCol = 0;

  typeCharacter(char: string) {
    if (this.currentRow < 6 && this.currentCol < 5) {
      this.grid[this.currentRow][this.currentCol] = char;
      this.currentCol++;
    }
  }

  deleteCharacter() {
    if (this.currentCol > 0) {
      this.currentCol--;
      this.grid[this.currentRow][this.currentCol] = '';
    }
  }

  getKeyboardKeyColor(letter: string): string {
    return this.keyboardColors[letter] || '#818384'; 
  }

  submit() {
    if (this.currentCol === 5) {
      const guessedWord = this.grid[this.currentRow].join('');
      const playerId = 'd339d64b-b29a-4f11-8b59-f6f71f521310';

      const payload = {
        playerId,
        guessedWord,
      };

      fetch('http://localhost:8080/api/v1/game/submit-guess', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Server response:', data);

          const characters = data.guessedWordsDto[data.guessedWordsDto.length - 1].characters;

          const updatedRowColors = Array(5).fill('');
          Object.entries(characters).forEach(([index, status]) => {
            const idx = parseInt(index, 10); 
            const letter = guessedWord[idx]; 

            if (status === 'CORRECT') {
              updatedRowColors[idx] = '#568c52';
              this.updateKeyboardColor(letter, '#568c52'); 
            } else if (status === 'PRESENT_BUT_MISPLACED') {
              updatedRowColors[idx] = '#b49e45';
              this.updateKeyboardColor(letter, '#b49e45'); 
            } else {
              updatedRowColors[idx] = '#3a3a3c';
              this.updateKeyboardColor(letter, '#3a3a3c'); 
            }
          });

          this.colors[this.currentRow] = updatedRowColors;

          this.currentRow++;
          this.currentCol = 0;
        })
        .catch((error) => {
          console.error('Error submitting guess:', error);

          this.grid[this.currentRow] = Array(5).fill('');
          this.colors[this.currentRow] = Array(5).fill('');
          this.currentCol = 0;
        });
    }
  }

  startGame() {
    const playerId = "d339d64b-b29a-4f11-8b59-f6f71f521310";
    const payload = {
      playerId: playerId
    };

    fetch("http://localhost:8080/api/v1/game/start", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
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
    if (color === '#568c52') return 3; // Green
    if (color === '#b49e45') return 2; // Yellow
    if (color === '#3a3a3c') return 1; // Gray
    return 0; // Default
  }
}

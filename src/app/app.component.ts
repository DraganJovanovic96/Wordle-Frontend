import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Wordle-Frontend';

  keyboardMapping: { [key: string]: string } = {
    q: 'Љ',
    w: 'Њ',
    e: 'Е',
    r: 'Р',
    t: 'Т',
    y: 'З',
    u: 'У',
    i: 'И',
    o: 'О',
    p: 'П',
    a: 'А',
    s: 'С',
    d: 'Д',
    f: 'Ф',
    g: 'Г',
    h: 'Х',
    j: 'Ј',
    k: 'К',
    l: 'Л',
    x: 'Џ',
    c: 'Ц',
    v: 'В',
    b: 'Б',
    n: 'Н',
    m: 'М',
    '[': 'Ш',
    ';': 'Ч',
    "'": "Ћ",
    ']': 'Ђ',
    '\\': 'Ж',
  };

  grid: string[][] = Array(6).fill(null).map(() => Array(5).fill(''));
  currentRow: number = 0;
  currentCol: number = 0;

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

  submit() {
    if (this.currentCol === 5) {
      this.currentRow++; 
      this.currentCol = 0; 
    }
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
}

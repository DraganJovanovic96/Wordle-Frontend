import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser, NgFor } from '@angular/common';

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

  gridWidth: string = '100%';
  gridHeight: string = '60vh'; 
  isBrowser: boolean; 

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId); 
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.updateGridDimensions();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isBrowser) {
      this.updateGridDimensions();
    }
  }

  updateGridDimensions() {
    // const viewportHeight = window.innerHeight;
    // const viewportWidth = window.innerWidth;
  

    // const gridHeight = viewportHeight * 0.5; 
    // const keyboardHeight = viewportHeight * 0.4; 
  
    // this.gridHeight = `${gridHeight}px`;
    // this.gridWidth = Math.min(viewportWidth * 0.9, 500) + 'px'; 

    // document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
  }

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

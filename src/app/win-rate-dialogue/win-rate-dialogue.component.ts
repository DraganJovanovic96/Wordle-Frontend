import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-win-rate-dialogue',
  templateUrl: './win-rate-dialogue.component.html',
  styleUrls: ['./win-rate-dialogue.component.scss']
})
export class WinRateDialogueComponent {
  constructor(
    public dialogRef: MatDialogRef<WinRateDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      played: number;
      winPercentage: number;
      numberOfWins: number;
      numberOfLoses: number;
    }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}

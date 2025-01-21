import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-win-rate-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Статистика</h2>
    <mat-dialog-content>
      <p><strong>Проценат победа: </strong>{{ data.winRate }}%</p>
      <p><strong>Укупно победа: </strong>{{ data.numberOfWins }}</p>
      <p><strong>Укупно пораза: </strong>{{ data.numberOfLoses }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./win-rate-dialogue.component.scss'],
  imports: [
    MatDialogModule, 
    MatButtonModule,
  ],
})
export class WinRateDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

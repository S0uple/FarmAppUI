import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import { AnimalService } from '../../services/animal.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Animal } from '../../models/animal';

@Component({
  selector: 'app-delete-animal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './delete-animal-modal.component.html',
  styleUrl: './delete-animal-modal.component.scss',
})
export class DeleteAnimalModalComponent {
  constructor(
    private readonly animalService: AnimalService,
    private readonly toastrService: ToastrService,
  ) {}

  public animal!: Animal;
  public dialogRef?: MatDialogRef<DeleteAnimalModalComponent>;

  public loading: WritableSignal<boolean> = signal<boolean>(false);

  public delete(): void {
    this.loading.set(true);
    this.animalService.deleteAnimal(this.animal.id).subscribe({
      next: () => {
        this.toastrService.success('Animal deleted successfully');
        this.dialogRef?.close(true);
      },
      error: () => {
        this.toastrService.error('Failed to delete animal');
        this.loading.set(false);
      },
    });
  }

  public cancel(): void {
    this.dialogRef?.close(false);
  }
}

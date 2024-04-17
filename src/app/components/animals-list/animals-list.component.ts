import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  WritableSignal,
  signal,
} from '@angular/core';
import { AnimalService } from '../../services/animal.service';
import { Subscription } from 'rxjs';
import { Animal } from '../../models/animal';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddAnimalModalComponent } from '../add-animal-modal/add-animal-modal.component';
import { ToastrService } from 'ngx-toastr';
import { DeleteAnimalModalComponent } from '../delete-animal-modal/delete-animal-modal.component';

@Component({
  selector: 'animals-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './animals-list.component.html',
  styleUrl: './animals-list.component.scss',
})
export class AnimalsListComponent implements OnInit, OnDestroy {
  constructor(
    private readonly service: AnimalService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService,
  ) {}

  private subscription: Subscription = new Subscription();

  public animals: WritableSignal<Animal[]> = signal<Animal[]>([]);
  public loading: WritableSignal<boolean> = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadAnimals();
  }

  private loadAnimals(): void {
    this.loading.set(true);
    let sub = this.service.getAnimals().subscribe({
      next: (result) => {
        this.animals.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.toastrService.error('Failed to load animals');
        this.loading.set(false);
      },
    });

    this.subscription.add(sub);
  }

  public openAddModal(): void {
    let dialog = this.dialog.open(AddAnimalModalComponent);
    dialog.componentInstance.dialogRef = dialog;
    dialog.afterClosed().subscribe((result) => this.reloadIfUpdated(result));
  }

  public openDeleteModal(animal: Animal): void {
    let dialog = this.dialog.open(DeleteAnimalModalComponent);
    dialog.componentInstance.animal = animal;
    dialog.componentInstance.dialogRef = dialog;
    dialog.afterClosed().subscribe((result) => this.reloadIfUpdated(result));
  }

  private reloadIfUpdated(result: boolean): void {
    if (!result) {
      return;
    }
    this.loadAnimals();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
  AsyncValidatorFn,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AnimalService } from '../../services/animal.service';
import { MatInputModule } from '@angular/material/input';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-animal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './add-animal-modal.component.html',
  styleUrl: './add-animal-modal.component.scss',
})
export class AddAnimalModalComponent {
  constructor(
    private readonly animalService: AnimalService,
    private readonly toastrService: ToastrService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.nameControl = new FormControl('', {
      validators: [Validators.required, Validators.maxLength(50)],
      asyncValidators: [this.animalNameUniqueValidatorFn()],
    });
    this.formGroup = new FormGroup({
      name: this.nameControl,
    });
  }

  public formGroup: FormGroup;
  public nameControl: FormControl;
  public dialogRef?: MatDialogRef<AddAnimalModalComponent>;

  public loading: WritableSignal<boolean> = signal<boolean>(false);

  public getNameErrorMessage(): string {
    if (this.nameControl.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.nameControl.hasError('maxlength')) {
      return 'Name must be at most 50 characters';
    }
    if (this.nameControl.hasError('nameIsNotUnique')) {
      return 'Name must be unique';
    }
    return '';
  }

  private animalNameUniqueValidatorFn(): AsyncValidatorFn {
    return (control) =>
      control.valueChanges.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((value) =>
          value
            ? this.animalService.checkIfAnimalNameIsUnique(value)
            : Promise.resolve(true)
        ),
        map((unique: boolean) => (unique ? null : { nameIsNotUnique: true })),
        tap(() => this.changeDetectorRef.markForCheck()),
        first()
      );
  }

  public save(): void {
    if (this.formGroup.invalid) {
      return;
    }
    this.loading.set(true);
    this.animalService
      .createAnimal({ name: this.nameControl.value })
      .subscribe({
        next: () => {
          this.toastrService.success('Animal created successfully');
          this.dialogRef?.close(true);
        },
        error: () => {
          this.toastrService.error('Failed to create animal');
          this.loading.set(false);
        },
      });
  }

  public cancel(): void {
    this.dialogRef?.close(false);
  }
}

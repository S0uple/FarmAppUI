import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Animal } from '../models/animal';
import { Observable } from 'rxjs';
import { CreateAnimalModel } from '../models/create-animal-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private baseUrl: string = environment.apiUrl + 'animals';

  constructor(private http: HttpClient) {}

  getAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.baseUrl);
  }

  createAnimal(createAnimalModel: CreateAnimalModel): Observable<void> {
    let form = new FormData();
    form.append('name', createAnimalModel.name);
    return this.http.post<void>(this.baseUrl, form);
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  checkIfAnimalNameIsUnique(name: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/checkIfNameIsUnique?name=${name}`,
    );
  }
}

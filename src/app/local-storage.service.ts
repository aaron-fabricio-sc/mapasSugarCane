import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private centroides = localforage.createInstance({
    name: 'centroides',
  });

  private poligons = localforage.createInstance({
    name: 'poligons',
  });

  constructor() {}

  // Métodos para acceder a los almacenes
  getCentroides() {
    return this.centroides;
  }

  getPoligons() {
    return this.poligons;
  }
}

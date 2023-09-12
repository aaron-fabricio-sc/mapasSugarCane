import { Component, OnInit } from '@angular/core';
import * as localforage from 'localforage';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '../local-storage.service';
import { Feature, FeatureCollection } from '../interfaces/poligons';
@Component({
  selector: 'app-poligons',
  templateUrl: './poligons.component.html',
  styleUrls: ['./poligons.component.scss'],
})
export class PoligonsComponent implements OnInit {
  constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService
  ) {}
  poligons: any = [];
  ngOnInit(): void {
    this.httpClient
      .get('assets/poligonos/Cane_Layer_PE_2022_2023_Jason.geojson')
      .subscribe((data) => {
        this.poligons = data;
      });
  }

  savePoligons() {
    const poligonos = this.localStorageService.getPoligons();

    const features = this.poligons.features;

    if (features) {
      for (let i of features) {
        let id: string = '';

        id = i.properties.FIELD_ID || 'vacio';

        poligonos
          .setItem(id, {
            coordinates: i.geometry.coordinates,
          })
          .then(() => {
            console.log('Poligonos  guardados con éxito');
          })
          .catch((err: any) => {
            console.error('Error al guardar nombres:', err);
          });
      }
    }
  }
}

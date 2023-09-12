import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { AddScriptService } from './add-script.service';
import { HttpClientModule } from '@angular/common/http';

import * as localforage from 'localforage';
import { PoligonsComponent } from './poligons/poligons.component';
import { ReactiveFormsModule } from '@angular/forms';
localforage.config({
  driver: localforage.INDEXEDDB, // Usar IndexedDB
  name: 'myApp',
  version: 1.0,
  storeName: 'myStore',
  description: 'My IndexedDB storage',
});
@NgModule({
  declarations: [AppComponent, PoligonsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [AddScriptService],
  bootstrap: [AppComponent],
})
export class AppModule {}

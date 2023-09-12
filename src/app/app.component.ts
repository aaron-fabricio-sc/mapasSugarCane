import { Component, OnInit } from '@angular/core';
import { AddScriptService } from './add-script.service';
import * as localforage from 'localforage';
import { HttpClient } from '@angular/common/http';
import { MyData } from './interfaces/collection';
import * as turf from '@turf/turf';
import { LocalStorageService } from './local-storage.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // Variables para verificar si existen bases de datos (Variables to check if databases exist)
  existCentroids: any = true;
  existPoligons: any = true;
  selection: any = new FormControl('kilometers');
  // Constructor del componente (Component constructor)
  constructor(
    private addScriptService: AddScriptService,
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    // Verificar si existe la base de datos "centroides" (Check if the "centroides" database exists)
    let cen = this.localStorageService.getCentroides();
    cen.keys().then((value) => {
      if (value.length !== 0) {
        console.log('existe la base de datos centroides'); // Database exists
        this.existCentroids = true;
      } else {
        this.existCentroids = false;
      }
    });

    // Verificar si existe la base de datos "polígonos" (Check if the "polígonos" database exists)
    let pol = this.localStorageService.getPoligons();
    pol.keys().then((value) => {
      if (value.length !== 0) {
        console.log('existe la base de datos polígonos'); // Database exists
        this.existPoligons = true;
      } else {
        this.existPoligons = false;
      }
    });
  }

  // Variables para configurar la búsqueda de puntos cercanos (Variables to configure nearby points search)
  distance: any = new FormControl(10);
  longitude: any = new FormControl(-88.6942109374484);
  latitude: any = new FormControl(18.0066415093998);
  radio: any = new FormControl(0.5);
  circlePoints: any = new FormControl(50);

  // Datos de centroides y polígonos (Centroid and polygon data)
  centroides: MyData = {};
  poligons: any = [];

  // Método que se ejecuta al inicializar el componente (Method executed when the component is initialized)
  ngOnInit(): void {
    // Cargar datos de centroides desde un archivo JSON (Load centroid data from a JSON file)
    this.httpClient
      .get('assets/centroides/Cane_Layer_Centroid_Features.json')
      .subscribe((data) => {
        this.centroides = data;
      });

    // Cargar datos de polígonos desde un archivo GeoJSON (Load polygon data from a GeoJSON file)
    this.httpClient
      .get('assets/poligonos/Cane_Layer_PE_2022_2023_Jason.geojson')
      .subscribe((data) => {
        this.poligons = data;
      });
  }

  // Método para guardar datos de centroides en la base de datos local (Method to save centroid data in local database)
  saveCentroids() {
    const centroides = this.localStorageService.getCentroides();
    const features = this.centroides.features;

    if (features) {
      for (let i of features) {
        centroides
          .setItem(i.attributes?.FIELD_ID, {
            longitude: i.attributes?.Longitude,
            latitude: i.attributes?.Latitude,
          })
          .then(() => {
            console.log('Nombres guardados con éxito'); // Names saved successfully
          })
          .catch((err: any) => {
            console.error('Error al guardar nombres:', err); // Error saving names
          });
      }
    }
  }

  // Método para guardar datos de polígonos en la base de datos local (Method to save polygon data in local database)
  savePoligons() {
    const poligonos = this.localStorageService.getPoligons();
    const features = this.poligons.features;

    if (features) {
      for (let i of features) {
        let id: string = '';

        id = i.properties.FIELD_ID || 'vacio';

        console.log(i.properties);

        poligonos
          .setItem(id, {
            coordinates: i.geometry.coordinates,
            PRODUCTION_OWNER: i.properties.PRODUCTION_OWNER,
            STATUS: i.properties.STATUS,
            CROP_CLASS: i.properties.CROP_CLASS,

            BSI_CODE: i.properties.BSI_CODE,
            PARCEL_LOCATION: i.properties.PARCEL_LOCATION,
            CreationDate: i.properties.CreationDate,
            EditDate: i.properties.EditDate,
            ACREAGE: i.properties.ACREAGE,
            GlobalID: i.properties.GlobalID,
            OBJECTID: i.properties.OBJECTID,
            TERRAIN: i.properties.TERRAIN,
            DATE_PLANTED: i.properties.DATE_PLANTED,
            GEOGRAPHICAL_ZONE: i.properties.GEOGRAPHICAL_ZONE,
          })
          .then(() => {
            console.log('Poligonos guardados con éxito'); // Polygons saved successfully
          })
          .catch((err: any) => {
            console.error('Error al guardar nombres:', err); // Error saving names
          });
      }
    }
  }

  dataArray: any = [];
  isNear: any = false;
  fieldId: any = [];
  initCentroide: any = 0;

  // Método para verificar centroides cercanos
  // Method to check nearby centroids
  checkCentroids() {
    this.fieldId = [];
    this.dataArray = [];
    this.isNear = false;
    this.initCentroide = 0;
    const startTime = performance.now(); // Registrar el tiempo de inicio (Record start time)
    // Obtener la base de datos de centroides desde el servicio de almacenamiento local
    // Get the centroids database from the local storage service
    const centroides = this.localStorageService.getCentroides();

    // Obtener las claves de la base de datos de centroides
    // Get the keys from the centroids database
    centroides
      .keys()
      .then((keys) => {
        // Mapear cada clave para obtener la información correspondiente
        // Map each key to get the corresponding information
        const promises = keys.map((key) => {
          return centroides.getItem(key).then((value) => {
            // Almacenar la información en un arreglo
            // Store the information in an array
            this.dataArray.push({ key, value });
          });
        });

        // Esperar a que todas las promesas se resuelvan
        // Wait for all promises to resolve
        return Promise.all(promises);
      })
      .then(() => {
        // Crear un punto de verificación con las coordenadas proporcionadas
        // Create a checkpoint with the provided coordinates
        const pointToCheck = turf.point([
          this.longitude.value,
          this.latitude.value,
        ]);

        // Obtener la distancia máxima permitida desde el formulario
        // Get the maximum allowed distance from the form
        const maxDistance = this.distance.value;

        // Iterar a través de los datos de los centroides
        // Iterate through the centroid data
        for (const polygonData of this.dataArray) {
          // Obtener las coordenadas del centroide
          // Get the centroid coordinates
          const centroide = [
            polygonData.value.longitude,
            polygonData.value.latitude,
          ];

          // Calcular la distancia entre el punto de verificación y el centroide
          // Calculate the distance between the checkpoint and centroid
          const distance = turf.distance(pointToCheck, centroide, {
            units: this.selection.value,
          });

          // Verificar si la distancia es menor o igual a la distancia máxima permitida
          // Check if the distance is less than or equal to the maximum allowed distance
          if (distance <= maxDistance) {
            // Establecer una bandera indicando que está cerca
            // Set a flag indicating it's nearby
            this.isNear = true;

            // Agregar la clave del polígono a un arreglo
            // Add the polygon key to an array
            this.fieldId.push(polygonData.key);
          }
        }

        const endTime = performance.now(); // Registrar el tiempo de finalización (Record end time)
        const executionTimeInSeconds = (endTime - startTime) / 1000; // Convertir a segundos (Convert to seconds)

        // Obtener una referencia al elemento HTML con el id 'centroids' (Get a reference to the HTML element with id 'centroids')
        const $containerCentroides: any = document.getElementById('centroids');

        // Crear un objeto con datos formateados que incluye el total de elementos en 'fieldId' (Create an object with formatted data that includes the total number of elements in 'fieldId')
        const formattedData = {
          Total: this.fieldId.length,
          centroidesFieldId: this.fieldId,
        };

        // Obtener una referencia al elemento HTML con el id 'timeCentroids' (Get a reference to the HTML element with id 'timeCentroids')
        const $time: any = document.getElementById('timeCentroids');

        // Actualizar el contenido del elemento HTML 'timeCentroids' con el tiempo de ejecución en segundos (Update the content of the HTML element 'timeCentroids' with the execution time in seconds)
        $time.textContent = `Total time: ${executionTimeInSeconds} seconds`;

        // Convertir el objeto 'formattedData' a una cadena JSON con formato legible y establecerlo como contenido del elemento 'centroids' (Convert the 'formattedData' object to a JSON string with readable format and set it as the content of the 'centroids' element)
        $containerCentroides.textContent = JSON.stringify(
          formattedData,
          null,
          2
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }

  isInside = false;
  insidePolygon: any = [];
  polygonArray: any = [];

  otherPolygons: any = [];
  poligonsNulls: any = [];

  strangePolygons: any = [];
  nearbyPolygons: any = [];

  // Método para verificar si un punto está dentro de un polígono
  // Method to check if a point is inside a polygon
  insideThePolygon() {
    this.isInside = false;
    this.insidePolygon = [];
    this.polygonArray = [];

    this.otherPolygons = [];
    this.poligonsNulls = [];

    this.strangePolygons = [];
    this.nearbyPolygons = [];
    const startTime = performance.now(); // Registrar el tiempo de inicio (Record start time)

    const poligons = this.localStorageService.getPoligons();
    const data = this.fieldId;

    // Buscar el valor por clave (Find value by key)
    const promises = data.map((key: any) => poligons.getItem(key));

    const pointToCheck = turf.point([
      this.longitude.value,
      this.latitude.value,
    ]);
    Promise.all(promises)
      .then((values) => {
        console.log('total values. ', values.length); // Imprime la cantidad total de valores (Prints the total number of values)
        values.forEach((value, index) => {
          if (value !== null) {
            // Verifica si el valor no es nulo (Checks if the value is not null)
            if (value.coordinates.length == 1) {
              // Verifica si la longitud de las coordenadas es igual a 1 (Checks if the coordinates length is equal to 1)
              const key = data[index]; // Obtiene la clave correspondiente (Gets the corresponding key)
              this.polygonArray.push({
                // Agrega un objeto al arreglo polygonArray (Pushes an object to the polygonArray)
                fieldId: key,
                coordinates: value.coordinates,
                PRODUCTION_OWNER: value.PRODUCTION_OWNER,
                STATUS: value.STATUS,
                CROP_CLASS: value.CROP_CLASS,
                ACREAGE: value.ACREAGE,
                BSI_CODE: value.BSI_CODE,
                PARCEL_LOCATION: value.PARCEL_LOCATION,
                CreationDate: value.CreationDate,
                EditDate: value.EditDate,

                GlobalID: value.GlobalID,
                OBJECTID: value.OBJECTID,
                TERRAIN: value.TERRAIN,
                DATE_PLANTED: value.DATE_PLANTED,
                GEOGRAPHICAL_ZONE: value.GEOGRAPHICAL_ZONE,
              });
            }
            if (value.coordinates.length > 1) {
              // Verifica si la longitud de las coordenadas es mayor a 1 (Checks if the coordinates length is greater than 1)
              const key = data[index]; // Obtiene la clave correspondiente (Gets the corresponding key)
              for (let polygon of value.coordinates) {
                if (polygon.length === 1) {
                  // Verifica si la longitud del polígono es igual a 1 (Checks if the polygon length is equal to 1)
                  this.otherPolygons.push({
                    // Agrega un objeto al arreglo otherPolygons (Pushes an object to the otherPolygons array)
                    fieldId: key,
                    coordinates: polygon,
                    PRODUCTION_OWNER: value.PRODUCTION_OWNER,
                    STATUS: value.STATUS,
                    CROP_CLASS: value.CROP_CLASS,
                    ACREAGE: value.ACREAGE,
                    BSI_CODE: value.BSI_CODE,
                    PARCEL_LOCATION: value.PARCEL_LOCATION,
                    CreationDate: value.CreationDate,
                    EditDate: value.EditDate,

                    GlobalID: value.GlobalID,
                    OBJECTID: value.OBJECTID,
                    TERRAIN: value.TERRAIN,
                    DATE_PLANTED: value.DATE_PLANTED,
                    GEOGRAPHICAL_ZONE: value.GEOGRAPHICAL_ZONE,
                  });
                } else {
                  this.strangePolygons.push({
                    // Agrega un objeto al arreglo strangePolygons (Pushes an object to the strangePolygons array)
                    fieldId: key,
                    coordinates: [polygon],
                    PRODUCTION_OWNER: value.PRODUCTION_OWNER,
                    STATUS: value.STATUS,
                    CROP_CLASS: value.CROP_CLASS,
                    ACREAGE: value.ACREAGE,
                    BSI_CODE: value.BSI_CODE,
                    PARCEL_LOCATION: value.PARCEL_LOCATION,
                    CreationDate: value.CreationDate,
                    EditDate: value.EditDate,

                    GlobalID: value.GlobalID,
                    OBJECTID: value.OBJECTID,
                    TERRAIN: value.TERRAIN,
                    DATE_PLANTED: value.DATE_PLANTED,
                    GEOGRAPHICAL_ZONE: value.GEOGRAPHICAL_ZONE,
                  });
                }
              }
            }
          } else if (value === null) {
            // Si el valor es nulo (If the value is null)
            const key = data[index]; // Obtiene la clave correspondiente (Gets the corresponding key)
            this.poligonsNulls.push(key); // Agrega la clave al arreglo poligonsNulls (Pushes the key to the poligonsNulls array)
          }
        });
      })

      .then(() => {
        let radius = this.radio.value; // Obtiene el valor del radio desde la variable radio (Gets the radius value from the radio variable)
        let options: any = {
          steps: this.circlePoints.value, // Obtiene el valor de los pasos desde la variable circlePoints (Gets the steps value from the circlePoints variable)
          units: this.selection.value,
          properties: { radioPoint: 'radioPoint' },
        };
        let circle: any = turf.circle(pointToCheck, radius, options); // Crea un círculo de Turf.js con las opciones especificadas (Creates a Turf.js circle with the specified options)

        for (let point of circle.geometry.coordinates[0]) {
          for (let i of this.polygonArray) {
            let polygon = turf.polygon(i.coordinates);

            if (turf.booleanPointInPolygon(point, polygon)) {
              this.nearbyPolygons.push({
                fieldId: i.fieldId,
                PRODUCTION_OWNER: i.PRODUCTION_OWNER,
                STATUS: i.STATUS,
                CROP_CLASS: i.CROP_CLASS,
                ACREAGE: i.ACREAGE,
                BSI_CODE: i.BSI_CODE,
                PARCEL_LOCATION: i.PARCEL_LOCATION,
                CreationDate: i.CreationDate,
                EditDate: i.EditDate,

                GlobalID: i.GlobalID,
                OBJECTID: i.OBJECTID,
                TERRAIN: i.TERRAIN,
                DATE_PLANTED: i.DATE_PLANTED,
                GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
              }); // Agrega el ID del polígono cercano al arreglo nearbyPolygons (Pushes the ID of the nearby polygon to the nearbyPolygons array)
            }
          }
          for (let i of this.otherPolygons) {
            let polygon = turf.polygon(i.coordinates);

            if (turf.booleanPointInPolygon(point, polygon)) {
              this.nearbyPolygons.push({
                fieldId: i.fieldId,
                PRODUCTION_OWNER: i.PRODUCTION_OWNER,
                STATUS: i.STATUS,
                CROP_CLASS: i.CROP_CLASS,
                ACREAGE: i.ACREAGE,
                BSI_CODE: i.BSI_CODE,
                PARCEL_LOCATION: i.PARCEL_LOCATION,
                CreationDate: i.CreationDate,
                EditDate: i.EditDate,

                GlobalID: i.GlobalID,
                OBJECTID: i.OBJECTID,
                TERRAIN: i.TERRAIN,
                DATE_PLANTED: i.DATE_PLANTED,
                GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
              }); // Agrega el ID del otro polígono cercano al arreglo nearbyPolygons (Pushes the ID of the other nearby polygon to the nearbyPolygons array)
            }
          }
          for (let i of this.strangePolygons) {
            let polygon = turf.polygon(i.coordinates);

            if (turf.booleanPointInPolygon(point, polygon)) {
              this.nearbyPolygons.push({
                fieldId: i.fieldId,
                PRODUCTION_OWNER: i.PRODUCTION_OWNER,
                STATUS: i.STATUS,
                CROP_CLASS: i.CROP_CLASS,
                ACREAGE: i.ACREAGE,
                BSI_CODE: i.BSI_CODE,
                PARCEL_LOCATION: i.PARCEL_LOCATION,
                CreationDate: i.CreationDate,
                EditDate: i.EditDate,

                GlobalID: i.GlobalID,
                OBJECTID: i.OBJECTID,
                TERRAIN: i.TERRAIN,
                DATE_PLANTED: i.DATE_PLANTED,
                GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
              }); // Agrega el ID del polígono extraño cercano al arreglo nearbyPolygons (Pushes the ID of the strange nearby polygon to the nearbyPolygons array)
            }
          }
        }

        for (let i of this.polygonArray) {
          let polygon = turf.polygon(i.coordinates);

          if (turf.booleanPointInPolygon(pointToCheck, polygon)) {
            this.isInside = true;
            this.insidePolygon.push({
              fieldId: i.fieldId,
              PRODUCTION_OWNER: i.PRODUCTION_OWNER,
              STATUS: i.STATUS,
              CROP_CLASS: i.CROP_CLASS,
              ACREAGE: i.ACREAGE,
              BSI_CODE: i.BSI_CODE,
              PARCEL_LOCATION: i.PARCEL_LOCATION,
              CreationDate: i.CreationDate,
              EditDate: i.EditDate,

              GlobalID: i.GlobalID,
              OBJECTID: i.OBJECTID,
              TERRAIN: i.TERRAIN,
              DATE_PLANTED: i.DATE_PLANTED,
              GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
            }); // Agrega el ID del polígono interno al arreglo insidePolygon (Pushes the ID of the internal polygon to the insidePolygon array)
          }
        }

        for (let i of this.otherPolygons) {
          let polygon = turf.polygon(i.coordinates);

          if (turf.booleanPointInPolygon(pointToCheck, polygon)) {
            this.isInside = true;
            this.insidePolygon.push({
              fieldId: i.fieldId,
              PRODUCTION_OWNER: i.PRODUCTION_OWNER,
              STATUS: i.STATUS,
              CROP_CLASS: i.CROP_CLASS,
              ACREAGE: i.ACREAGE,
              BSI_CODE: i.BSI_CODE,
              PARCEL_LOCATION: i.PARCEL_LOCATION,
              CreationDate: i.CreationDate,
              EditDate: i.EditDate,

              GlobalID: i.GlobalID,
              OBJECTID: i.OBJECTID,
              TERRAIN: i.TERRAIN,
              DATE_PLANTED: i.DATE_PLANTED,
              GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
            }); // Agrega el ID del otro polígono interno al arreglo insidePolygon (Pushes the ID of the other internal polygon to the insidePolygon array)
          }
        }
        for (let i of this.strangePolygons) {
          let polygon = turf.polygon(i.coordinates);

          if (turf.booleanPointInPolygon(pointToCheck, polygon)) {
            this.isInside = true;
            this.insidePolygon.push({
              fieldId: i.fieldId,
              PRODUCTION_OWNER: i.PRODUCTION_OWNER,
              STATUS: i.STATUS,
              CROP_CLASS: i.CROP_CLASS,
              ACREAGE: i.ACREAGE,
              BSI_CODE: i.BSI_CODE,
              PARCEL_LOCATION: i.PARCEL_LOCATION,
              CreationDate: i.CreationDate,
              EditDate: i.EditDate,

              GlobalID: i.GlobalID,
              OBJECTID: i.OBJECTID,
              TERRAIN: i.TERRAIN,
              DATE_PLANTED: i.DATE_PLANTED,
              GEOGRAPHICAL_ZONE: i.GEOGRAPHICAL_ZONE,
            }); // Agrega el ID del polígono extraño interno al arreglo insidePolygon (Pushes the ID of the strange internal polygon to the insidePolygon array)
          }
        }
        const endTime = performance.now(); // Registrar el tiempo de finalización (Record end time)
        const executionTimeInSeconds = (endTime - startTime) / 1000; // Convertir a segundos (Convert to seconds)
        // Crear un array vacío para almacenar los objetos sin duplicados.
        // Create an empty array to store objects without duplicates.
        const noRepeat = [];
        // Crear un conjunto (Set) para realizar un seguimiento de los identificadores (IDs) vistos.
        // Create a Set to keep track of seen IDs.
        const idsVistos = new Set();

        // Iterar a través de los objetos en "this.nearbyPolygons".
        // Iterate through the objects in "this.nearbyPolygons".
        for (const obj of this.nearbyPolygons) {
          // Supongamos que deseas verificar la unicidad en función de la propiedad "fieldId".
          // Assume you want to check uniqueness based on the "fieldId" property.
          const id = obj.fieldId;

          // Verificar si el identificador (ID) ya ha sido visto.
          // Check if the ID has already been seen.
          if (!idsVistos.has(id)) {
            // Si el ID no se ha visto antes, agrega el objeto al resultado "noRepeat".
            // If the ID hasn't been seen before, add the object to the "noRepeat" result.
            noRepeat.push(obj);
            // Agregar el ID al conjunto (Set) de IDs vistos para llevar un registro.
            // Add the ID to the Set of seen IDs to keep track.
            idsVistos.add(id);
          }
        }

        // Obtener una referencia al elemento HTML con el id 'timePoligons' (Get a reference to the HTML element with id 'timePoligons')
        const $time: any = document.getElementById('timePoligons');

        // Obtener referencias a elementos HTML con los IDs 'poligons', 'poligon', 'normalPolygons', 'morePolygons', 'strangePolygons', 'nullPolygons' (Get references to HTML elements with the IDs 'poligons', 'poligon', 'normalPolygons', 'morePolygons', 'strangePolygons', 'nullPolygons')
        const $containerPolygons: any = document.getElementById('poligons');
        const $containerPolygon: any = document.getElementById('poligon');
        const normalPolygons: any = document.getElementById('normalPolygons');
        const morePolygons: any = document.getElementById('morePolygons');
        const strangePolygons: any = document.getElementById('strangePolygons');
        const nullPolygons: any = document.getElementById('nullPolygons');

        // Crear un objeto 'formattedDataPolygon' con información formateada sobre polígonos internos (Create a 'formattedDataPolygon' object with formatted information about inside polygons)
        const formattedDataPolygon = {
          total: this.insidePolygon.length,
          insidePolygon: this.insidePolygon,
        };

        // Crear un objeto 'formattedDataPolygons' con información formateada sobre polígonos cercanos sin duplicados (Create a 'formattedDataPolygons' object with formatted information about nearby polygons without duplicates)
        const formattedDataPolygons = {
          total: noRepeat.length,
          nearbyPolygons: noRepeat,
        };

        // Actualizar el contenido del elemento HTML 'timePoligons' con el tiempo de ejecución en segundos (Update the content of the HTML element 'timePoligons' with the execution time in seconds)
        $time.textContent = `Total time: ${executionTimeInSeconds} seconds`;

        // Convertir el objeto 'formattedDataPolygon' a una cadena JSON con formato legible y establecerlo como contenido del elemento 'poligon' (Convert the 'formattedDataPolygon' object to a JSON string with readable format and set it as the content of the 'poligon' element)
        $containerPolygon.textContent = JSON.stringify(
          formattedDataPolygon,
          null,
          2
        );

        // Convertir el objeto 'formattedDataPolygons' a una cadena JSON con formato legible y establecerlo como contenido del elemento 'poligons' (Convert the 'formattedDataPolygons' object to a JSON string with readable format and set it as the content of the 'poligons' element)
        $containerPolygons.textContent = JSON.stringify(
          formattedDataPolygons,
          null,
          2
        );

        normalPolygons.textContent = `Normal Poligons: ${this.polygonArray.length}`; // Imprime la cantidad total de polígonos (Prints the total number of polygons)
        morePolygons.textContent = `More than one polygon: ${this.otherPolygons.length}`; // Imprime la cantidad total de otros polígonos (Prints the total number of other polygons)
        strangePolygons.textContent = `Strange Poligons: ${this.strangePolygons.length}`; // Imprime la cantidad total de polígonos extraños (Prints the total number of strange polygons)
        nullPolygons.textContent = `Null polygons: ${this.poligonsNulls.length}`; // Imprime la cantidad total de valores nulos (Prints the total number of null values)
      })

      .catch((error) => {
        console.error('Error al buscar claves:', error); // Error searching keys
      });
  }

  // Método para verificar y mostrar resultados (Method to verify and display results)
  verificarPunto() {
    if (this.isInside) {
      console.log(
        `El punto está dentro de los polígonos: ${this.insidePolygon.join(
          ', '
        )}.`
      ); // El punto está dentro de los polígonos (The point is inside the polygons)
    } else {
      console.log('El punto no está dentro de ninguna ciudad.'); // El punto no está dentro de ninguna ciudad (The point is not inside any city)
    }

    if (this.nearbyPolygons !== 0) {
      let data = new Set(this.nearbyPolygons);

      let noRepeat = [...data];
      console.log('Los Polígonos cercanos son: ', noRepeat); // Los Polígonos cercanos son (Nearby polygons are)
    }
  }
}

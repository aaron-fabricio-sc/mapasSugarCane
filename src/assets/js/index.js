import * as localforage from "localforage";
// DB with single table "friends" with primary key "id" and
// indexes on properties "name" and "age"

localforage.config({
  driver: localforage.INDEXEDDB, // Usar IndexedDB
  name: "dataaaaa",
  version: 1.0,
  storeName: "myStore",
  description: "My IndexedDB storage",
});

names = ["Alice", "Bob"];
ages = [25, 30];

localforage
  .setItem("names", this.names)
  .then(() => {
    console.log("Nombres guardados con éxito");
  })
  .catch((err) => {
    console.error("Error al guardar nombres:", err);
  });

localforage
  .setItem("agessssssssss", this.ages)
  .then(() => {
    console.log("Edades guardadas con éxito");
  })
  .catch((err) => {
    console.error("Error al guardar edades:", err);
  });

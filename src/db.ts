import Dexie, { Table } from 'dexie';

export interface TodoList {
  id?: number | any;
  title: string;
}
export interface TodoItem {
  id?: number;
  todoListId: number;
  title: string;
  done?: boolean;
}
export interface Coordenadas {
  id?: number;
  attributes: {};
  geometry: {};
}

export class AppDB extends Dexie {
  todoItems!: Table<TodoItem, number>;
  todoLists!: Table<TodoList, number>;
  coordenadas!: Table<Coordenadas, number>;
  prueba!: Table<string>;

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      todoLists: '++id',
      todoItems: '++id, todoListId',
      coordenadas: '++id',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    const centros = await fetch(
      './assets/centroides/Cane_Layer_Centroid_Features.json'
    );
    if (centros.ok) {
      db.version(3).stores({
        friends: `
        ++id,
        attributes,
        geometry`,
      });
    }
    const todoListId = await db.todoLists.add({
      title: 'To Do Today',
    });

    const coordenadas = await db.coordenadas.add({
      attributes: {
        OBJECTID: 1,
        ACREAGE: 2.9224970157848795,
        Longitude: -88.357803478944234,
        Latitude: 18.458828657657804,
        FIELD_ID: '003-0001',
      },
      geometry: { x: 356624.89279999956, y: 2041487.7425999995 },
    });

    await db.todoItems.bulkAdd([
      {
        todoListId,
        title: 'Feed the birds',
      },
      {
        todoListId,
        title: 'Watch a movie',
      },
      {
        todoListId,
        title: 'Have some sleep',
      },
    ]);
  }
}

export const db = new AppDB();

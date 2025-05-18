import db from '../config/database';

// SELECT que retorna um único registro
export function getAsync<T>(query: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row as T | undefined);
    });
  });
}

// SELECT que retorna vários registros
export function getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows as T[]);
    });
  });
}

// INSERT / UPDATE / DELETE
export function runAsync(query: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

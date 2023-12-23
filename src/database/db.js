

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('images.db');

export const init = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY NOT NULL, url TEXT NOT NULL, comment TEXT, isLiked INTEGER DEFAULT 0, created_at TEXT NOT NULL)',
        [],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const insertImage = (url, comment, isLiked, created_at) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO images (url, comment, isLiked, created_at) VALUES (?, ?, ?, ?)',
        [url, comment, isLiked, created_at],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const fetchImages = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM images',
        [],
        (_, result) => {
          resolve(result.rows._array);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const updateImageLikedStatus = (id, isLiked) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE images SET isLiked = ? WHERE id = ?',
        [isLiked , id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};
export const updateComment = (id, comment) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE images SET comment = ? WHERE id = ?',
        [comment , id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const deleteImage = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM images WHERE id = ?',
        [id],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const insertBulkImages = (images) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const placeholders = images.map(() => '(?, ?, ?, ?)').join(', ');

      const values = images.flatMap((image) => [
        image.url,
        image.comment,
        image.isLiked,
        image.created_at,
      ]);

      tx.executeSql(
        `INSERT INTO images (url, comment, isLiked, created_at) VALUES ${placeholders}`,
        values,
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};



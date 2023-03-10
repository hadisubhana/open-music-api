/* eslint-disable camelcase */

exports.up = (pgm) => {
  // menambahkan coverurl pada tabel albums
  pgm.addColumn('albums', {
    cover: {
      type: 'VARCHAR(255) ',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
};

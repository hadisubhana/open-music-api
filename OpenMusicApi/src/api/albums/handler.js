const config = require('../../utils/config');

class AlbumsHandler {
  constructor(albumsService, songService, storageService, validator) {
    this._albumsService = albumsService;
    this._songService = songService;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler({ payload }, h) {
    this._validator.validateAlbumPayload(payload);

    const albumId = await this._albumsService.addAlbum(payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler({ params }) {
    const { id } = params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songService.getSongsByAlbumId(id);

    if (songs.length > 0) {
      album.songs = songs;
    }

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler({ payload, params }) {
    this._validator.validateAlbumPayload(payload);

    const { id } = params;

    await this._albumsService.editAlbumById(id, payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler({ params }) {
    const { id } = params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler({ payload, params }, h) {
    const { id: albumId } = params;
    const { cover } = payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const coverPath = `http://${config.app.host}:${config.app.port}/albums/images/${filename}`;

    await this._albumsService.addCoverAlbum(albumId, coverPath);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',

    });
    response.code(201);
    return response;
  }

  async postAlbumLikesHandler({ params, auth }, h) {
    const { id: albumId } = params;
    const { userId } = auth.credentials;

    await this._albumsService.getAlbumById(albumId);

    const albumLike = await this._albumsService.addAlbumLike(userId, albumId);

    const message = (!albumLike) ? 'Dihapus dari album yang di sukai' : 'Berhasil ditambahkan ke album yang di sukai';

    const response = h.response({
      status: 'success',
      message,
    });

    response.code(201);
    return response;
  }

  async getAlbumLikesHandler({ params }, h) {
    const { id: albumId } = params;

    const { likes, isCache = 0 } = await this._albumsService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: likes.rowCount,
      },
    });

    if (isCache) response.header('X-Data-Source', 'cache');
    response.code(200);

    return response;
  }
}

module.exports = AlbumsHandler;

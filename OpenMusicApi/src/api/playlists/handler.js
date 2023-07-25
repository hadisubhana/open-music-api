class PlaylistsHandler {
  constructor(playlistService, songsService, validator) {
    this._playlistService = playlistService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsInPlaylistHandler = this.getSongsInPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    this.getSongPlaylistHandler = this.getSongPlaylistHandler.bind(this);
  }

  async postPlaylistHandler({ payload, auth }, h) {
    this._validator.validatePlaylistPayload(payload);

    const { name } = payload;
    const { userId } = auth.credentials;

    const playlistId = await this._playlistService.addPlaylist({
      name, owner: userId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler({ auth }) {
    const { userId } = auth.credentials;
    const playlists = await this._playlistService.getPlaylists(userId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId } = auth.credentials;
    await this._playlistService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  // playlist song
  async postSongToPlaylistHandler({ payload, params, auth }, h) {
    this._validator.validatePlaylistSongsPayload(payload);

    const { songId } = payload;
    const { id: playlistId } = params;
    const { userId } = auth.credentials;
    const createdAt = new Date().toISOString();
    const action = "add";

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.getSongById(songId);
    await this._playlistService.addSongToPlaylist(playlistId, songId);
    await this._playlistService.addPlaylistSongsActivity({
      playlistId, songId, userId, action, time: createdAt,
    });

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambah ke playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId } = auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    const playlists = await this._playlistService.getPlaylistById(playlistId);
    const songs = await this._songsService.getSongsByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlists,
          songs,
        },
      },
    };
  }

  async getSongPlaylistHandler({ params, auth }) {
    const { id: playlistId } = params;
    const { userId } = auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    const activities = await this._playlistService.getPlaylistSongsActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }

  async deleteSongFromPlaylistHandler({ payload, params, auth }) {
    const { userId } = auth.credentials;
    const { id: playlistId } = params;
    const { songId } = payload;
    const createdAt = new Date().toISOString();
    const action = "delete";

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistService.deleteSongFromPlaylistBySongId(songId);
    await this._playlistService.addPlaylistSongsActivity({
      playlistId, songId, userId, action, time: createdAt,
    });

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;

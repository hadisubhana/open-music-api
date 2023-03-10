class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler({ payload, params, auth }, h) {
    this._validator.validateExportPlaylistsPayload(payload);

    const { userId } = auth.credentials;
    const { playlistId } = params;
    const message = {
      playlistId,
      targetEmail: payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;

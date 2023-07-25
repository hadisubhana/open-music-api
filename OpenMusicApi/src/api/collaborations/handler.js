class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler({ payload, auth }, h) {
    this._validator.validateCollaborationPayload(payload);

    const { userId: credentialId } = auth.credentials;
    const { playlistId, userId } = payload;

    await this._usersService.verifyExistUserId(userId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const collaborationId = await this._collaborationsService
      .addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler({ payload, auth }) {
    this._validator.validateCollaborationPayload(payload);

    const { userId: credentialId } = auth.credentials;
    const { playlistId, userId } = payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;

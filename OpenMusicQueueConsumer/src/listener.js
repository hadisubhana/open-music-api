class Listener {
  constructor(playlistsService, songsService, mailSender) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlists = await this._playlistsService.getPlaylistById(playlistId);
      const songs = await this._songsService.getSongsByPlaylistId(playlistId);

      const data = {
        playlist: {
          ...playlists,
          songs,
        },
      };

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(data));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;

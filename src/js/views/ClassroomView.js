import { $, showSnackbar } from '../utils/DOM.js';
import { getSavedVideoTemplate } from './layout/storedVideo.js';
import { CLASS_NAME, SNACKBAR_SHOW_TIME } from '../constants.js';

const { WATCHING_SECTION, WATCHED_SECTION, WATCHING, WATCHED, NO_WATCHING, NO_WATCHED } = CLASS_NAME;

export default class ClassroomView {
  constructor() {
    this.selectDOMs();
  }

  selectDOMs() {
    this.$watchingMenuButton = $('.js-watching-menu-button');
    this.$watchedMenuButton = $('.js-watched-menu-button');
    this.$savedVideosWrapper = $('.js-saved-videos-wrapper');
    this.$noVideoFound = $('.js-no-video-found');
    this.$snackbar = $('.js-snackbar');
    this.$removalConfirm = $('.js-confirm');
  }

  renderVideosToPrepare(videos) {
    const videosHTML = videos
      .map((video) => getSavedVideoTemplate(video, video.isWatching ? WATCHING : WATCHED))
      .join('');

    this.$savedVideosWrapper.innerHTML = videosHTML;
  }

  renderSavedVideo(video) {
    this.$savedVideosWrapper.insertAdjacentHTML('beforeEnd', getSavedVideoTemplate(video, WATCHING));
  }

  renderImageNoWatchingVideo() {
    this.$noVideoFound.classList.add(NO_WATCHING);
  }

  renderImageNoWatchedVideo() {
    this.$noVideoFound.classList.add(NO_WATCHED);
  }

  renderOnlyWatchingVideos() {
    this.$watchingMenuButton.classList.add('bg-cyan-100');
    this.$watchedMenuButton.classList.remove('bg-cyan-100');
    this.$noVideoFound.classList.remove(NO_WATCHING, NO_WATCHED);
    this.$savedVideosWrapper.classList.replace(WATCHED_SECTION, WATCHING_SECTION);
  }

  renderOnlyWatchedVideos() {
    this.$watchedMenuButton.classList.add('bg-cyan-100');
    this.$watchingMenuButton.classList.remove('bg-cyan-100');
    this.$noVideoFound.classList.remove(NO_WATCHING, NO_WATCHED);
    this.$savedVideosWrapper.classList.replace(WATCHING_SECTION, WATCHED_SECTION);
  }

  renderMovedVideo($video, wasWatching) {
    $video.querySelector('.js-check-button').classList.toggle('checked');
    if (wasWatching) {
      $video.classList.remove(WATCHING);
      $video.classList.add(WATCHED);
    } else {
      $video.classList.remove(WATCHED);
      $video.classList.add(WATCHING);
    }
  }

  removeVideo($video) {
    $video.remove();
  }

  renderNotification(message) {
    showSnackbar({ messenger: this.$snackbar, message, showtime: SNACKBAR_SHOW_TIME });
  }

  renderVisibleRemovalConfirm(message) {
    this.$removalConfirm.classList.add('show');
    this.$removalConfirm.querySelector('h1').innerText = message;
  }

  renderInvisibleRemovalConfirm() {
    this.$removalConfirm.classList.remove('show');
    this.$removalConfirm.querySelector('h1').innerText = '';
  }
}
import {
  $searchButton,
  $modalCloseButton,
  $searchForm,
  $searchFormInput,
  $searchResultIntersector,
  $modal,
  $searchResultVideoWrapper,
} from '../elements.js';
import { getVideosByKeyword } from '../apis/youtube.js';
import controllerUtil from './controllerUtil.js';
import {
  prevSearchResultStorage,
  searchQueryStorage,
  watchedVideoStorage,
  watchingVideoStorage,
} from '../store.js';
import modalService from '../service/modalService.js';
import {
  layoutView,
  modalView,
  watchedVideoView,
  watchingVideoView,
} from '../view/index.js';
import {
  BROWSER_HASH,
  SELECTOR_CLASS,
  SELECTOR_ID,
  SNACKBAR_MESSAGE,
} from '../constants.js';
import watchingVideoService from '../service/watchingVideoService.js';
import hashController from './hashController.js';

const modalController = {
  initEventListeners() {
    controllerUtil.setObserver(
      $searchResultIntersector,
      onAdditionalVideosLoad
    );
    $searchButton.addEventListener('click', onModalOpen);
    $modalCloseButton.addEventListener('click', onModalClose);
    $searchForm.addEventListener('submit', onVideoSearch);
    $searchResultVideoWrapper.addEventListener('click', onSelectedVideoSave);
    $modal.addEventListener('click', event => {
      if (event.target.id === SELECTOR_ID.MODAL) {
        onModalClose();
      }
    });
  },

  initSearchQueries() {
    modalView.renderSearchQueries(searchQueryStorage.getItem());
  },
};

function onSelectedVideoSave({ target }) {
  if (!target.classList.contains(SELECTOR_CLASS.SEARCHED_CLIP_SAVE_BUTTON)) {
    return;
  }

  if (!watchingVideoService.isVideoCountUnderLimit()) {
    layoutView.showSnackbar(SNACKBAR_MESSAGE.SAVE_LIMIT_EXCEEDED, false);
    return;
  }

  if (watchingVideoService.isVideosEmpty()) {
    watchingVideoView.hideEmptyVideoImage();
    watchedVideoView.hideEmptyVideoImage();
  }
  watchingVideoService.pushNewVideo(target.dataset);

  if (controllerUtil.parseHash(location.hash) === BROWSER_HASH.WATCHING) {
    watchingVideoView.renderVideos(watchingVideoStorage.getItem());
  }

  modalView.hideVideoSaveButton(target);
  layoutView.showSnackbar(SNACKBAR_MESSAGE.WATCHING_VIDEO_SAVE_SUCCESS, true);
}

function onModalOpen() {
  layoutView.highlightNavButton(BROWSER_HASH.SEARCH);
  const allVideoCount =
    watchingVideoStorage.getItem().length +
    watchedVideoStorage.getItem().length;
  const videos = prevSearchResultStorage.getItem().prevSearchedVideos;
  const processedVideos = modalService.getProcessedVideos(videos);

  modalView.openModal();
  modalView.renderSavedVideoCount(allVideoCount);
  modalView.focusElement($searchFormInput);

  if (videos.length === 0) {
    return;
  }

  modalView.renderSearchedVideos(processedVideos);
  modalView.showSearchResultIntersector();
}

function onModalClose() {
  hashController.routeByHash();
  modalView.closeModal();
}

async function onVideoSearch(event) {
  event.preventDefault();
  const input = event.target[`${SELECTOR_ID.SEARCH_FORM_INPUT}`].value.trim();

  if (input === prevSearchResultStorage.getItem().lastQuery) {
    return;
  }
  if (input === '') {
    return;
  }

  modalView.initSearchEnv();
  const { videos, nextPageToken } = await getVideosByKeyword(input);

  if (videos.length === 0) {
    modalView.showNotFoundImage();
    return;
  }

  modalService.saveSearchQuery(input);
  modalService.savePrevSearchInfo({ lastQuery: input, nextPageToken });
  modalService.savePrevSearchedVideos(videos);
  modalView.hideSkeletons();
  modalView.renderSearchQueries(searchQueryStorage.getItem());
  modalView.renderSearchedVideos(modalService.getProcessedVideos(videos));
}

async function onAdditionalVideosLoad() {
  const { lastQuery, pageToken } = modalService.getPrevSearchInfo();
  const { videos, nextPageToken } = await getVideosByKeyword(
    lastQuery,
    pageToken
  );

  modalView.insertSearchedVideos(videos);
  modalService.savePrevSearchInfo({ nextPageToken });
}

export default modalController;
import view from '../view/view.js';
import prevSearchResult from '../storage/prevSearchResult.js';
import searchQuery from '../storage/searchQuery.js';
import videoToWatch from '../storage/videoToWatch.js';
import { SELECTOR_CLASS, SETTINGS, STYLE_CLASS } from '../constants.js';
import { $ } from '../utils/querySelector.js';
import viewUtil from '../view/viewUtil.js';

const controllerUtil = {
  setObserver($element, callback) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          callback();
        }
      });
    });
    observer.observe($element);
  },

  getProcessedVideos(videos) {
    return videos.map(video => ({
      ...video,
      isSaved: controllerUtil.isVideoToWatch(video.videoId),
    }));
  },

  getNewVideo(dataset) {
    return {
      title: dataset.title,
      channelTitle: dataset.channelTitle,
      publishedAt: dataset.publishedAt,
      videoId: dataset.videoId,
      isSaved: true,
    };
  },

  savePrevSearchInfo(lastQuery, nextPageToken) {
    prevSearchResult.setLastQuery(lastQuery);
    prevSearchResult.setNextPageToken(nextPageToken);
  },

  pushSearchQuery(input) {
    const filteredQueries = searchQuery
      .getQueries()
      .filter(query => input !== query);
    filteredQueries.push(input);

    if (filteredQueries.length > SETTINGS.MAX_SAVED_SEARCH_QUERY_COUNT) {
      filteredQueries.shift();
    }
    searchQuery.setQueries(filteredQueries);
  },

  loadAdditionalVideos(videos) {
    view.insertVideoItems(videos);
    if (videos.length === 0) {
      view.showNotFoundContent();
      return;
    }
  },

  loadSearchResult(videos) {
    view.renderSearchQueries(searchQuery.getQueries());
    view.renderSearchedVideos(controllerUtil.getProcessedVideos(videos));
  },

  loadPrevSearchedVideos(videos) {
    const processedVideos = controllerUtil.getProcessedVideos(videos);
    view.insertVideoItems(processedVideos);
    view.showSearchResultIntersector();
  },

  highlightNavButton($target) {
    $(`.${SELECTOR_CLASS.NAV_BUTTON}`).forEach(($button) => {
      viewUtil.removeStyleClass($button, STYLE_CLASS.CLICKED);
    });
    viewUtil.addStyleClass($target, STYLE_CLASS.CLICKED);
  },

  isVideoToWatch(videoId) {
    return videoToWatch.getVideos().some(video => video.videoId === videoId);
  },

};

export default controllerUtil;
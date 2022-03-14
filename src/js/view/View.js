import {
  formatDateString,
  isBlankValue,
  removeElementList,
  selectDom,
  scrollToTop,
} from '../util/util';
import { MAX_SEARCH_RESULT } from '../constants/constants';
import '../../assets/images/not_found.png';

class View {
  constructor() {
    this.searchModalButton = selectDom('#search-modal-button');
    this.modalContainer = selectDom('.modal-container');
    this.searchInputKeyword = selectDom('#search-input-keyword');
    this.searchForm = selectDom('#search-form');
    this.searchResult = selectDom('.search-result');
    this.videoList = selectDom('.video-list');
    this.requestMoreResult = this.#handleScrollToLastItem();

    this.searchModalButton.addEventListener('click', this.#openModal);
    this.searchForm.addEventListener('submit', this.#handleSearch);
    this.sendSearchRequest = () => {};
    this.sendLoadMoreRequest = () => {};
    this.sendSaveRequest = () => {};
  }

  attachRequestSender(sendSearchRequest, sendLoadMoreRequest, sendSaveRequest) {
    this.sendSearchRequest = sendSearchRequest;
    this.sendLoadMoreRequest = sendLoadMoreRequest;
    this.sendSaveRequest = sendSaveRequest;
  }

  #openModal = () => {
    this.modalContainer.classList.remove('hide');
  };

  #handleSearch = async (event) => {
    event.preventDefault();
    this.#clearNoResult();
    scrollToTop(this.videoList);
    const { value: keyword } = this.searchInputKeyword;
    if (isBlankValue(keyword)) {
      return;
    }
    removeElementList([...this.videoList.childNodes]);
    this.#loadSkeleton();
    const searchResultArray = await this.sendSearchRequest(keyword);
    this.#renderSearchResult(searchResultArray);
  };

  #handleScrollToLastItem() {
    return new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          this.requestMoreResult.unobserve(this.videoList.lastChild);
          this.#loadSkeleton();
          const moreResult = await this.sendLoadMoreRequest();
          this.#renderSearchResult(moreResult);
        }
      },
      { threshold: 0.5 }
    );
  }

  #handleVideoSaveClick = (event) => {
    try {
      this.sendSaveRequest(event.target.dataset.videoId);
      event.target.disabled = true;
    } catch (error) {
      alert(error.message);
    }
  };

  #renderSearchResult(searchResultArray) {
    const skeletonList = this.videoList.querySelectorAll('.skeleton');
    removeElementList(skeletonList);

    if (this.#isEndOfResult(searchResultArray)) return;
    if (this.#isNoResult(searchResultArray)) {
      this.#renderNoResult();
      return;
    }

    const resultElementArray = this.#createElementFromObject(searchResultArray);
    this.videoList.append(...resultElementArray);
    this.requestMoreResult.observe(this.videoList.lastChild);
  }

  #isEndOfResult(searchResultArray) {
    return searchResultArray === null;
  }

  #isNoResult(searchResultArray) {
    return searchResultArray.length === 0;
  }

  #createElementFromObject(searchResultArray) {
    return searchResultArray.map((resultItem) => this.#createVideoElement(resultItem));
  }

  #createVideoElement(resultItem) {
    const videoElement = document.createElement('li');
    videoElement.className = 'video-item';
    videoElement.insertAdjacentHTML('beforeend', this.#videoElementTemplate(resultItem));
    selectDom('.video-item__save-button', videoElement).addEventListener(
      'click',
      this.#handleVideoSaveClick
    );
    return videoElement;
  }

  #videoElementTemplate({ thumbnail, title, channelTitle, publishedAt, videoId, isSaved }) {
    return `
      <img src="${thumbnail}" alt="video-item-thumbnail" class="video-item__thumbnail">
      <h4 class="video-item__title">${title}</h4>
      <p class="video-item__channel-name">${channelTitle}</p>
      <p class="video-item__published-date">${formatDateString(publishedAt)}</p>
      <button 
        ${isSaved && 'disabled'}
        class="video-item__save-button button"
        data-video-id="${videoId}"
      >
        ⬇ 저장
      </button>
    `;
  }

  #loadSkeleton() {
    this.videoList.insertAdjacentHTML('beforeend', this.#skeletonTemplate());
  }

  #skeletonTemplate() {
    return `
      <div class="skeleton">
        <div class="image"></div>
        <p class="line"></p>
        <p class="line"></p>
      </div>
    `.repeat(MAX_SEARCH_RESULT);
  }

  #renderNoResult() {
    this.videoList.classList.add('hide');
    this.searchResult.classList.add('search-result--no-result');
    this.searchResult.insertAdjacentHTML(
      'beforeend',
      `<div class="no-result">
        <img src="./not_found.png" alt="no result image" class="no-result__image">
        <p class= "no-result__description">
          검색 결과가 없습니다<br />
          다른 키워드로 검색해보세요
        </p>
      </div>`
    );
  }

  #clearNoResult() {
    const noResult = selectDom('.no-result');
    if (noResult) {
      this.videoList.classList.remove('hide');
      this.searchResult.classList.remove('search-result--no-result');
      noResult.remove();
    }
  }
}

export default View;
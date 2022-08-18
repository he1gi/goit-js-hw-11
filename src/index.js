import { fetchPictures } from './js/fetchPictures';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';
// import './sass/index.scss';

const refs = {
  searchForm: document.querySelector('.search-form'),
  inputEl: document.querySelector('#search-form input'),
  galleryEl: document.querySelector('.gallery'),
  guardEl: document.querySelector('.js-guard'),
  buttonEl: document.querySelector('.btn-submit'),
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoomFactor: false,
});

let inputValue;
let page = 1;
let perPage = 40;

function onSearch(event) {
  event.preventDefault();
  refs.buttonEl.disabled = true;
  inputValue = refs.inputEl.value.trim();
  clearMarkup(refs.galleryEl);
  if (!inputValue) return;
  fetchPictures(inputValue, page, perPage).then(
    ({ data: { hits, totalHits } }) => {
      if (!hits.length) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderMarkup(hits);
      observer.observe(refs.guardEl);
    }
  );
}

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1,
};

const observer = new IntersectionObserver(updateList, options);

function updateList(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      fetchPictures(inputValue, page).then(data => {
        if (data.data.totalHits < page * 40) {
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(refs.guardEl);
        }
        renderMarkup(data.data.hits);
      });
    }
  });
}
function renderMarkup(data) {
  refs.galleryEl.insertAdjacentHTML('beforeend', createMarkUp(data));
  lightbox.refresh();
}

const clearMarkup = element => (element.innerHTML = '');

function createMarkUp(data) {
  return data
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `
        <a class="gallery__link" href="${largeImageURL}">
          <div class="gallery__item">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="gallery-item__info">
              <p class="info__value"><b>Likes</b>${likes}</p>
              <p class="info__value"><b>Views</b>${views}</p>
              <p class="info__value"><b>Comments</b>${comments}</p>
              <p class="info__value"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
        `
    )
    .join('');
}

refs.searchForm.addEventListener('submit', onSearch);
refs.inputEl.addEventListener('input', () => (refs.buttonEl.disabled = false));

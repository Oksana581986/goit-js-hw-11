import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '40580008-174d380b9c70d9faabd5ad5fa';
const PER_PAGE = 40;

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.photo-card', {
  disableScroll: false,
  history: false,
  nextOnImageClick: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
 });

let currentPage = 1;
let currentQuery = '';

const fetchData = async (query, page = 1) => {
      const response = await axios.get(BASE_URL, {
        params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: PER_PAGE,
      },
    });
    return response.data;
 };

const renderGallery = (images) => {
  if (images.length === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }

  const galleryMarkup = images
    .map((image) => {
      return `
        <a href="${image.largeImageURL}" class="photo-card">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${image.likes}</p>
            <p class="info-item"><b>Views:</b> ${image.views}</p>
            <p class="info-item"><b>Comments:</b> ${image.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
          </div>
        </a>
      `;
    })
    .join('');

   if (currentPage === 1) {
    galleryContainer.innerHTML = galleryMarkup;
  } else {
    galleryContainer.innerHTML += galleryMarkup;
  }

  const { height: cardHeight } = galleryContainer.firstElementChild.getBoundingClientRect();
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });

  lightbox.refresh();
};

const handleFormSubmit = async (event) => {
  event.preventDefault();
  try {
  currentQuery = event.target.elements.searchQuery.value.trim();

  if (!currentQuery) {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  currentPage = 1; 
  loadMoreBtn.style.display = 'none'; 

  const data = await fetchData(currentQuery, currentPage);

    if (data && data.hits.length > 0) {
    renderGallery(data.hits);
    if (data.hits.length < PER_PAGE) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } else {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
} catch (error) {
  console.error('Error fetching data:', error);
  return null;
}
};

const handleLoadMoreClick = async () => {
  try {
  currentPage++;
  loadMoreBtn.disabled = true;
 
  const data = await fetchData(currentQuery, currentPage);

  if (data && data.hits.length > 0) {
    renderGallery(data.hits);
  } else {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
  }

  loadMoreBtn.disabled = false;

} catch (error) {
  console.error('Error fetching data:', error);
  return null;
}
};

searchForm.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreClick);


import axios from 'axios';

const KEY = '29341335-b9d8b4c451f4a87d12ab142f3';

export async function fetchPictures(inputValue, page, perPage) {
  return await axios.get(
    `https://pixabay.com/api/?key=${KEY}&q=${inputValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
}

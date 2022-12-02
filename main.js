import "./style.css";

import {
  resetContent,
  enableOperators,
  disableOperators,
  hasError,
  searchTabs,
} from "./src/functions.js";

import {
  fetchTabs,
  renderTabs,
  previousPage,
  nextPage,
} from "./src/operators.js";

const contentType = document.getElementById("contenttype");
const searchBar = document.getElementById("searchbar");
const noResultsNextPage = document.getElementById("noresultsnextpage");
const previousPageButton = document.getElementById("previousbtn");
const nextPageButton = document.getElementById("nextbtn");

let PAGE_NUMBER = 1;
let RANGE = 10;

function fetchNewPostsByRange(newPosts, range = 1){
  if (!newPosts) {
    throw new Error('Você precisa de passar um array como primeiro argumento dessa função pra funcionar. Lembre de salvar o array em uma variavel.')
  }

  const timeOutPromise = new Promise(function(resolve) {
    setTimeout(resolve, 500, 'Timeout Done');
  });

  const posts = fetchTabs(contentType.value, PAGE_NUMBER).then(data => {
    newPosts.push(...data)
  });

  return Promise.all(
  [posts, timeOutPromise]).then(()=> {
    if (PAGE_NUMBER < range-1) {
      PAGE_NUMBER++
      console.log('promisses', newPosts.flat())
      return fetchNewPostsByRange(newPosts, range);
    } else {
      console.log('elsed')
      return newPosts.flat()
    }
  })

}


contentType.addEventListener("change", (e) => {
  resetContent(async () => {
    disableOperators();

    PAGE_NUMBER = 1; // Reset PAGE_NUMBER when change the category.

    let postsArray = []
    let range = PAGE_NUMBER + RANGE

    const newPosts = await fetchNewPostsByRange(postsArray, range).then(data => data)

    renderTabs(newPosts, () => {
      if (searchBar.value.length != 0) {
        searchTabs(searchBar.value);
      }

      enableOperators();
    });
  });
});

searchBar.addEventListener("input", (e) => {
  searchTabs(e.target.value);
});

noResultsNextPage.addEventListener("click", goToNextPage);

previousPageButton.addEventListener("click", goToPreviousPage);

nextPageButton.addEventListener("click", goToNextPage);

function goToPreviousPage() {
  if (PAGE_NUMBER > 1) {
    previousPage(PAGE_NUMBER, () => {
      PAGE_NUMBER--;

      resetContent(async () => {
        disableOperators();

        const newPosts = await fetchTabs(contentType.value, PAGE_NUMBER);

        renderTabs(newPosts, () => {
          if (searchBar.value.length != 0) {
            searchTabs(searchBar.value);
          }

          enableOperators();
        });
      });
    });
  }
}

function goToNextPage() {
  nextPage(PAGE_NUMBER, () => {
    PAGE_NUMBER++;

    resetContent(async () => {
      disableOperators();

      let postsArray = []
      let range = PAGE_NUMBER + RANGE

      const newPosts = await fetchNewPostsByRange(postsArray, range).then(data => data)

        renderTabs(newPosts, () => {
          if (searchBar.value.length != 0) {
            searchTabs(searchBar.value);
          }

          enableOperators();
      });
    });
  });
}

async function setup() {
  try {
    disableOperators();

    const posts = await fetchTabs(contentType.value, PAGE_NUMBER);

    renderTabs(posts, () => {
      enableOperators();
    });
  } catch (e) {
    hasError(e);
  }
}

document.addEventListener("DOMContentLoaded", setup);
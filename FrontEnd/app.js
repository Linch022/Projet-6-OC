const portfolio = document.getElementById("portfolio");
const galleryContainer = document.querySelector("#portfolio .gallery");
const loginNav = document.getElementById("login-nav");
const adminMode = document.querySelectorAll(".admin-mode");
const body = document.querySelector("body");
let token = window.localStorage.getItem("token");
let activeFilter;
let worksData;
let worksDatalength;
let categoriesData;
const filtersContainer = document.getElementById("filters-container");


const filters = new Set();

function isLog() {
    
    if (token) {
        loginNav.textContent = "log out";
        adminMode.forEach((e) => e.style.display = "flex");
        filtersContainer.style.display = "none";
        body.style.paddingTop = "60px";
    } else {
        loginNav.textContent = "log in";
        adminMode.forEach((e) => e.style.display = "none");
        filtersContainer.style.display = "flex";
        
    }
}

isLog();

loginNav.addEventListener("click", () => {
    if(token) {        
        window.localStorage.removeItem("token")
        loginNav.textContent = "log in";
        adminMode.forEach((e) => e.style.display = "none");
        body.style.paddingTop = "0";
        filtersContainer.style.display = "flex";
        token = null;
    }
    else {
        window.location.href = 'login.html';
    }

})

// Fonction de récupération des données works de l'api
async function fetchWorksData() {
    const response = await fetch(`http://localhost:5678/api/works`);
    const data = await response.json();
    worksData = data;
    worksDatalength = data.length
        
};

// Fonction de récupération des catégories de works de l'api
async function fetchCategoriesData() {
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    categoriesData = data;
};

// Fonction création du bloc contenant les filtres dans le portfolio
async function displayCategories() {
    await fetchCategoriesData();
    filtersContainer.classList = "filters-container";
    const baseFilter = {name : "Tous", id : "all"};

    //Fonction pour la création d'un bouton de filtre dans le portfolio
    function createFilter(filter) {
    filters.add(filter.id)
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = filter.name;
    button.id = `categoryId-${filter.id}`;
    button.classList = filter.id === "all" ? "filter-button active-filter" : "filter-button";
    button.addEventListener('click', () => {
        changeFilter(button, filter.id);
    })
    li.appendChild(button);
    filtersContainer.appendChild(li);
}
createFilter(baseFilter)
categoriesData.map((item) => {
    createFilter(item);
});

portfolio.appendChild(filtersContainer);
activeFilter = document.querySelector("#portfolio .active-filter");
};

function changeFilter(button, filterId) {
    activeFilter.classList.remove("active-filter");
    button.classList.add("active-filter");
    activeFilter = document.querySelector("#portfolio .active-filter");
    filters.clear();
    if (filterId === "all") {
        filters.add('all');
        categoriesData.forEach((item) => {
            filters.add(item.id)
        });
    } else {
        filters.add(filterId)
    }
    filterGallery();
};

displayCategories();
// Fonction permettant l'affichage et le filtrage des works
function filterGallery() {

    galleryContainer.replaceChildren();
    for (i = 0 ; i < worksDatalength; i++) {
        const imageUrl = worksData[i].imageUrl;
        const title = worksData[i].title;

        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figCaption = document.createElement("figcaption");

        img.src = imageUrl;
        img.alt = title;
        figCaption.textContent = title;
        
        figure.appendChild(img);
        figure.appendChild(figCaption);
        galleryContainer.appendChild(figure);
        figure.classList = "visible-work";

        if (filters.has(worksData[i].categoryId)) {
        } else {
            figure.classList = "hidden-work";
        }
    }
}

//Fonction permettant l'injection des works dans le html
async function displayGallery() {
    await fetchWorksData();
    filterGallery();
}

displayGallery()
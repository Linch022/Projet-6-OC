const WORKSAPI = "http://localhost:5678/api/works";
const CATEGORIESAPI = "http://localhost:5678/api/categories";
let userToken = window.sessionStorage.getItem("token");
const adminOption = document.querySelectorAll(".admin-option");
let worksData;
let categoriesData;

const filters = new Set();

async function fetchData(
  url,
  { method = "GET", headers = {}, body = null } = {}
) {
  try {
    console.log(url);
    console.log(method);
    console.log(headers);

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = body;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`Erreur HTTP : ${response.status} ${response.statusText}`);
      return null;
    }

    try {
      const data = await response.json();
      console.log("Réponse JSON :", data);
      return data;
    } catch (error) {
      console.log("Réponse sans JSON.");
      return response;
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw error;
  }
}

function isLog() {
  if (userToken) {
    adminOption.forEach((e) => e.classList.add("admin-mode"));
  }
}
isLog();

document.getElementById("logout-button").addEventListener("click", () => {
  window.sessionStorage.removeItem("token");
  userToken = null;
  adminOption.forEach((e) => e.classList.remove("admin-mode"));
});

async function displayCategories() {
  categoriesData = await fetchData(CATEGORIESAPI);
  const baseFilter = { name: "Tous", id: 0 };
  createFilter(baseFilter);
  categoriesData.map((item) => {
    createFilter(item);
  });
  console.log(filters);
}

displayCategories();

//Fonction permettant l'injection des works dans le html
async function displayGallery() {
  const galleryContainer = document.querySelector("#portfolio .gallery");
  worksData = await fetchData(WORKSAPI);
  galleryContainer.replaceChildren();
  for (let i = 0; i < worksData.length; i++) {
    if (filters.has(worksData[i].categoryId)) {
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
    }
  }
}
displayGallery();

function createFilter(filter) {
  filters.add(filter.id);
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = filter.name;
  button.id = `categoryId-${filter.id}`;
  button.classList =
    filter.id === 0 ? "filter-button active-filter" : "filter-button";
  button.addEventListener("click", () => {
    changeFilter(button, filter.id);
  });
  li.appendChild(button);
  document.getElementById("filters-container").appendChild(li);
}

function changeFilter(button, filterId) {
  document
    .querySelector("#portfolio .active-filter")
    .classList.remove("active-filter");
  button.classList.add("active-filter");
  filters.clear();
  if (filterId === 0) {
    filters.add(0);
    categoriesData.forEach((item) => {
      filters.add(item.id);
    });
  } else {
    filters.add(filterId);
  }
  displayGallery();
}

document
  .querySelector("#portfolio .admin-works-button")
  .addEventListener("click", () => {
    displayModal();
  });

function displayModal() {
  const modal = document.getElementById("modal");
  const galleryModal = document.querySelector(
    "#modal-gallery-container .modal-gallery"
  );
  modal.classList.add("modal-open");
  document.getElementById("modal-overlay").classList.add("modal-open");
  modal.ariaHidden = false;
  galleryModal.replaceChildren();
  document.getElementById("photo-category").replaceChildren();
  for (let i = 0; i < worksData.length; i++) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const icone = document.createElement("i");
    icone.classList.add("fa-solid", "fa-trash-can");
    icone.addEventListener("click", () => {
      fetchData(`${WORKSAPI}/${worksData[i].id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      worksData = worksData.filter((work) => work.id !== worksData[i].id);
      displayModal();
    });
    img.src = worksData[i].imageUrl;
    figure.appendChild(icone);
    figure.appendChild(img);
    galleryModal.appendChild(figure);
  }
  for (let j = 0; j < categoriesData.length; j++) {
    const option = document.createElement("option");
    option.value = categoriesData[j].name;
    option.textContent = categoriesData[j].name;
    option.setAttribute("data-id", categoriesData[j].id);
    document.getElementById("photo-category").appendChild(option);
  }
  console.log(worksData);
}

const photoInput = document.getElementById("photo-input");

photoInput.addEventListener("change", (e) => {
  console.log(e.target.files[0]);
  const preview = document.getElementById("image-preview");
  const file = e.target.files[0];
  const maxSize = 4 * 1024 * 1024;
  const filesTypes = ["image/jpeg", "image/png"];

  if (filesTypes.includes(file.type) && file.size < maxSize) {
    const imageURL = URL.createObjectURL(file);
    preview.src = imageURL;
    preview.classList.add("image-loaded");
    document
      .getElementById("photo-upload-button")
      .classList.add("image-loaded");
  } else {
    alert("L'image n'est pas du bon type ou trop grosse");
  }
});

document.querySelectorAll(".close-modal").forEach((e) => {
  e.addEventListener("click", () => {
    document.querySelectorAll(".modal-open").forEach((item) => {
      item.classList.remove("modal-open");
    });
  });
});

document.getElementById("open-upload-modal").addEventListener("click", () => {
  document
    .getElementById("modal-gallery-container")
    .classList.add("upload-open");
  document.getElementById("modal-photo-upload").classList.add("upload-open");
});

document.getElementById("modal-back-btn").addEventListener("click", () => {
  document
    .getElementById("modal-gallery-container")
    .classList.remove("upload-open");
  document.getElementById("modal-photo-upload").classList.remove("upload-open");
});

const inputs = document.querySelectorAll(".upload-inputs");
function checkInputs() {
  const allFilled = Array.from(inputs).every((input) => input.value);
  document.getElementById("submit-upload").disabled = !allFilled;
}

inputs.forEach((e) => {
  e.addEventListener("change", checkInputs);
});

document
  .getElementById("photo-upload-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", inputs[1].value);
    formData.append("image", inputs[0].files[0]);
    formData.append(
      "category",
      inputs[2].selectedOptions[0].getAttribute("data-id")
    );
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    const result = await fetchData(WORKSAPI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });
    if (result) {
      console.log(result);

      displayGallery();
      displayModal();
      const preview = document.getElementById("image-preview");
      preview.src = "";
      preview.classList.remove("image-loaded");
      document
        .getElementById("photo-upload-button")
        .classList.remove("image-loaded");
      inputs.forEach((item) => {
        item.value = "";
      });
    }
  });

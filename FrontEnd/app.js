const galleryContainer = document.querySelector("#portfolio .gallery");
let worksData;
let worksDatalength;

async function fetchData() {
    const response = await fetch(`http://localhost:5678/api/works`);
    const data = await response.json();
    worksData = data;
    worksDatalength = data.length
        
}

async function displayGallery() {
    await fetchData();
    console.log(worksData);
    console.log(worksDatalength);

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
    }
    

}

displayGallery()
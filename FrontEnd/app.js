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
    

}

displayGallery()
const loginNav = document.getElementById("login-nav");
const projectNav = document.getElementById("project-nav");
const submitLogin = document.getElementById("submit-login");
const formLogin = document.querySelector("#login-form form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const textLogin = document.getElementById("login-text-error");
let token = window.localStorage.getItem("token");

function isLog() {
    if (token) {
        loginNav.textContent = "log out";
    } else {
        loginNav.textContent = "log in";
    }
    
}
isLog();

projectNav.addEventListener("click", () => {
    window.location.href = 'index.html';
})

async function testLogin(user) {
    console.log(JSON.stringify(user));
    
    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        })

        if (!response.ok) {
            throw new Error (`Erreur HTTP : ${response.status} ${response.statusText}`)
        }
        
    
        const data = await response.json();
        window.localStorage.setItem("token", data.token);
        window.location.href = 'index.html';
        
    } catch (error) {
        emailInput.classList.add("login-error");
        emailInput.value = "";
        passwordInput.classList.add("login-error");
        passwordInput.value = "";
        textLogin.style.opacity = 1;
    }
    
    
    
}

formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = {
        email : emailInput.value,
        password : passwordInput.value
    }

    testLogin(user);
    
});
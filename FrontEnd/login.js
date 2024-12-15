const logsInput = {email : document.getElementById("email"), password : document.getElementById("password") }
const textLogin = document.getElementById("login-text-error");
let userToken = window.sessionStorage.getItem("token");

if (userToken)  {
    window.location.href = 'index.html';
}

async function testLogin(user) {
    
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
        window.sessionStorage.setItem("token", data.token);
        window.location.href = 'index.html';
        
    } catch (error) {
        Object.values(logsInput).forEach((input) => {
            input.classList.add("login-error");
            input.value = "";
        })
        textLogin.classList.add("login-error")
    }
}

document.querySelector("#login-form form").addEventListener("submit", (e) => {
    e.preventDefault();

    const user = {
        email : logsInput.email.value,
        password : logsInput.password.value
    }
    testLogin(user);
    
});

Object.values(logsInput).forEach((input) => {
    input.addEventListener("click", () => {
        Object.values(logsInput).forEach((element)=> {
            element.classList.remove("login-error");
        })
        textLogin.classList.remove("login-error")
    })
})

const username1 = document.querySelector(".username");
const password1 = document.querySelector(".password");
const email1 = document.querySelector(".email");
const submit = document.querySelector(".submit");
const container = document.querySelector(".container");
const register = document.querySelector(".register");
const login = document.querySelector(".login");
const registration = document.querySelector(".registration");
const registration_username = document.querySelector(".registration_username");
const registration_password = document.querySelector(".registration_password");
const firstname1 = document.querySelector(".firstname");
const lastname1 = document.querySelector(".lastname");
const registration_submit = document.querySelector(".registration_submit");

  // Logout function
function logout() {
    chrome.storage.session.remove('token', () => {
        if (chrome.runtime.lastError) {
            console.error('Error removing token:', chrome.runtime.lastError);
        } else {
            console.log('Logged out successfully');
            commentList.textContent = 'Please log in to view comments';
        }
        });
    }

submit.addEventListener('click', function(e){
    e.preventDefault();
    const url = "https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/login";
    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            username : username1.value,
            password : password1.value
        }),
    };
    fetch(url, options)
    .then(res => {
        if(res.ok){
        return res.json();
        }else{
        console.log("Not Successful")
        }
    })
    .then(data => {
        try{
            chrome.storage.session.set({"ID": data.id});
            chrome.storage.session.set({"Token": data.token});
        }
        catch(error){
            console.log(error)
        }
        })
    .catch(err => {
        console.log(err);
    })

    
});

register.addEventListener('click', function(e){
    e.preventDefault();
        registration.style.display="flex";
        container.style.display="none";
});

login.addEventListener('click', function(e){
    e.preventDefault();
        registration.style.display="none";
        container.style.display="flex";
        window.location.reload()
});

registration_submit.addEventListener('click', function(e){
    e.preventDefault();
    const url = "https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/register"
    const options = {
       method : "POST",
       headers : {
        "Content-Type" : "application/json"
       },
       body: JSON.stringify({
            username : registration_username.value,
            password : registration_password.value,
            firstname: firstname1.value,
            lastname: lastname1.value,
            email : email1.value
      })
    }
    fetch(url, options)
    .then(res => {
    if(res.ok){
        console.log("Success")
        return res.json();
    }else{
        console.log("Not Successful")
    }
})
    .then(data => {
        chrome.storage.session.set('Token', data.token)
        chrome.storage.session.set('ID', data.ID)
    })
    .catch(err =>
        console.log(err));
});
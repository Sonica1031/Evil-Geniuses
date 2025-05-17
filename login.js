const loginContainer = document.querySelector(".loginContainer");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotPassForm = document.getElementById("forgotpassword-form");
const fgPassBtn = document.getElementById("forgotPassword");
const loginBtn = document.getElementById("login-btn");
const signUpAccount = document.getElementById("signUpAccount");
const signInAccount = document.getElementById("signInAccount");
const dynamicFormContainer = document.getElementById("dynamic-form-container");
const backBtn = document.querySelector(".backBtn");
const flashScreen = document.querySelector(".flashScreen");
const fsLoginBtn = document.querySelector(".loginBtn");
const fsSignUpBtn = document.querySelector(".signUpBtn");
const forgotPassBtn = document.querySelector(".forgotpassword-btn");
const screenTitle = document.querySelector(".screenTitle");

backBtn.addEventListener("click", function () {
  loginContainer.style.display = "none";
  loginForm.style.display = "none";
  signupForm.style.display = "none";
  flashScreen.style.display = "block";
  screenTitle.textContent = "";
  screenTitle.style.margin = "none";
  document.querySelector("body").style.background = "white";
  backBtn.style.display = "none";
});

fsLoginBtn.addEventListener("click", function () {
  loginContainer.style.display = "block";
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  flashScreen.style.display = "none";
  screenTitle.textContent = "Sign In!";
  screenTitle.style.margin = "70px 30px 10px 30px";
  document.querySelector("body").style.background =
    "linear-gradient(45deg, #b983ff, #4D2A7C)";
  backBtn.style.display = "flex";
});

signInAccount.addEventListener("click", function () {
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  screenTitle.textContent = "Sign In!";
});

signUpAccount.addEventListener("click", function () {
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  screenTitle.textContent = "Create Your Account";
});

fsSignUpBtn.addEventListener("click", function () {
  loginContainer.style.display = "block";
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  flashScreen.style.display = "none";
  screenTitle.textContent = "Create Your Account";
  screenTitle.style.margin = "70px 30px 10px 30px";
  document.querySelector("body").style.background =
    "linear-gradient(45deg, #b983ff, #4D2A7C)";
  backBtn.style.display = "flex";
});

// Request OTP
//will add later

// Verify OTP
//will add later

// Reset Password
//will add later

// Forgot Password form submission
// will add later

document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    document.querySelector("#loginLoader").style.display = "inline-block";
    const username = document.getElementById("loginUserName").value;
    const password = document.getElementById("loginPassword").value;
    e.preventDefault();
    const url =
      "https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };
    fetch(url, options)
      .then((res) => {
        if (res.ok) {
          document.getElementById("login-form").innerHTML = `
                <h1>Login Successful!</h1>
                <p>You have successfully logged in.</p>
            `;
          return res.json();
        } else {
          document.getElementById("login-form").innerHTML = `
            <h1>Login Failed</h1>
            <p>Invalid email or password. Please try again.</p>
            `;
          console.log("Not Successful");
        }
      })
      .then((data) => {
        try {
          // chrome.storage.session.set({"ID": data.id});
          // chrome.storage.session.set({"Token": data.token});
          chrome.storage.session.set({ ID: data.id, Token: data.token });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

// Sign-up button handler
document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("signupEmail").value;
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;
    document.querySelector("#signUpLoader").style.display = "inline-block";

    e.preventDefault();
    const url =
      "https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/register";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        firstname: firstname,
        lastname: lastname,
        email: email,
      }),
    };

    if (username.length > 3 && password.length > 6) {
      fetch(url, options)
        .then((res) => {
          if (res.ok) {
            console.log("Success");
            document.getElementById("signup-form").innerHTML = `
                <h1>Sign-Up Successful!</h1>
                <p>Account created successfully. You can now log in.</p>
            `;
            return res.json();
          } else if ((res.errorMessage = "Username or email already exists")) {
            document.getElementById("signup-form").innerHTML = `
                <h1>Sign-Up Failed!</h1>
                <p>"Username or e-mail is already in use. Please try again."</p>
            `;
            // alert("Username or e-mail is already in use. Please try again.")
          } else {
            document.getElementById("signup-form").innerHTML = `
                <h1>Sign-Up Failed</h1>
                <p>${data.message}</p>
            `;
          }
        })
        .then((data) => {
          // chrome.storage.session.set('Token', data.token)
          // chrome.storage.session.set('ID', data.ID)
          chrome.storage.session.set({ ID: data.id, Token: data.token });
        })
        .catch((err) => console.log(err));
    } else {
      alert(
        "Password must be at least 6 characters and username must be at least 3 characters!"
      );
    }
  });

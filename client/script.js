document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".password-field").forEach(field => {

    const input = field.querySelector("input");
    const icon = field.querySelector("i");

    icon.addEventListener("click", () => {

      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";

      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });

  });

});






// ================= SIGN UP =================
async function signup(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        email,
        password
      })
    });

    const text = await res.text();

    if (!res.ok) {
      alert("❌ " + text);
      return;
    }

    alert("✅ Signup successful! Please login.");
    window.location.href = "login.html";   // ✅ safer flow

  } catch (err) {
    console.error(err);
    alert("Server error!");
  }
}



// ================= LOGIN =================
async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed!");
      return;
    }

    const user = data.data.user;

    // ✅ Store session data
    localStorage.setItem("loggedInUser", user.email);
    localStorage.setItem(`username_${user.email}`, user.fullName || user.email);

    // ✅ Store token if backend sends
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    alert("Login successful 🎉");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Server error!");
  }
}



// ================= PROFILE REDIRECT =================
function editProfile() {
  window.location.href = "editprofile.html";
}

function goBack() {
  window.history.back();
}



// ============================
// Detect which page is loaded
// ============================
document.addEventListener("DOMContentLoaded", () => {

  if (document.querySelector(".profile-card")) {
    loadProfile();
  }

  if (document.querySelector(".edit-form")) {
    loadEditProfile();
  }

});



// ============================
// LOAD PROFILE PAGE DATA
// ============================
async function loadProfile() {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await fetch("http://localhost:4000/get-profile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    const user = data.user;

    document.querySelector(".username").innerText =
      user.firstName || "User";

    document.querySelectorAll(".stat h3")[0].innerText =
      user.weight ? `${user.weight} kg` : "Not Set";

    document.querySelectorAll(".stat h3")[1].innerText =
      user.height ? `${user.height} ft` : "Not Set";

    // BMI
    let bmiText = "Not Set";

    if (user.height && user.weight) {
      const heightMeters = user.height * 0.3048;
      const bmi = (user.weight / (heightMeters * heightMeters)).toFixed(1);
      bmiText = bmi;
    }

    document.querySelectorAll(".stat h3")[2].innerText = bmiText;

    document.querySelectorAll(".stat h3")[3].innerText =
      user.age || "Not Set";

    document.querySelector(".info-card p:nth-child(2)").innerHTML =
      `<strong>Email:</strong> ${user.email || "Not Set"}`;

    document.querySelector(".info-card p:nth-child(3)").innerHTML =
      `<strong>Gender:</strong> ${user.gender || "Not Set"}`;

    document.querySelector(".info-card p:nth-child(4)").innerHTML =
      `<strong>Target:</strong> ${user.target || "Not Set"}`;

  } catch (err) {
    console.log("Profile Load Error", err);
  }
}



// ============================
// LOAD EDIT PROFILE DATA
// ============================
async function loadEditProfile() {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await fetch("http://localhost:4000/get-profile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    const user = data.user;

    document.getElementById("name").value =
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    document.getElementById("email").value = user.email || "";
    document.getElementById("age").value = user.age || "";
    document.getElementById("height").value = user.height || "";
    document.getElementById("weight").value = user.weight || "";
    document.getElementById("goal").value = user.target || "";

  } catch (err) {
    console.log("Edit Profile Load Error", err);
  }
}



// ============================
// SAVE PROFILE DATA
// ============================
async function saveProfile() {

  const token = localStorage.getItem("token");

  if (!token) return false;

  try {

    const fullName = document.getElementById("name").value.trim();

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const email = document.getElementById("email").value;
    const age = document.getElementById("age").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const target = document.getElementById("goal").value;

    await fetch("http://localhost:4000/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        age,
        height,
        weight,
        target
      })
    });

    alert("Profile Updated Successfully");
    window.location.href = "profile.html";

    return false;

  } catch (err) {
    console.log("Save Error", err);
    return false;
  }
}



// ============================
// PROFILE IMAGE PREVIEW
// ============================
function previewImage(event) {
  const preview = document.getElementById("preview");
  preview.src = URL.createObjectURL(event.target.files[0]);
}

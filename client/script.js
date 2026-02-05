// ==================================================
// CONFIG & HELPERS
// ==================================================
const BASE_URL = "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ================= SIGN UP =================
async function signup(event) {
  event.preventDefault();

  const fullName = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!fullName || !email || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    alert("✅ Signup successful! Please login.");
    window.location.href = "login.html";   // ✅ safer flow

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// ==================================================
// LOGIN
// ==================================================
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
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
  if (!requireAuth()) return;

  try {
    const res = await fetch(`${BASE_URL}/get-profile`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error();

    const user = data.data.user;

    // Update avatar image
    const profilePic = document.querySelector(".profile-pic");
    if (profilePic) {
      profilePic.src = user.avatar || "images/userimage.jpg";
    }

    document.querySelector(".username").innerText =
      user.firstName || localStorage.getItem(`username_${user.email}`) || "User";

    document.querySelectorAll(".stat h3")[0].innerText =
      user.weight ? `${user.weight} kg` : "Not Set";

    document.querySelectorAll(".stat h3")[1].innerText =
      user.height ? `${user.height} ft` : "Not Set";

    // BMI
    let bmiText = "Not Set";

    if (user.height && user.weight) {
      const heightM = user.height * 0.3048;
      bmiText = (user.weight / (heightM * heightM)).toFixed(1);
    }

    document.querySelectorAll(".stat h3")[2].innerText = bmiText;
    document.querySelectorAll(".stat h3")[3].innerText =
      user.age || "Not Set";

    document.querySelector(".info-card p:nth-child(2)").innerHTML =
      `<strong>Email:</strong> ${user.email || "Not Set"}`;

    document.querySelector(".info-card p:nth-child(3)").innerHTML =
      `<strong>Gender:</strong> ${user.gender || "Not Set"}`;

    document.querySelector(".info-card p:nth-child(4)").innerHTML =
      `<strong>Goal:</strong> ${user.target || "Not Set"}`;

  } catch (err) {
    console.error("Profile load error", err);
    alert("Failed to load profile");
  }
}

// ============================
// LOAD EDIT PROFILE DATA
// ============================
async function loadEditProfile() {
  if (!requireAuth()) return;

  try {
    const res = await fetch(`${BASE_URL}/get-profile`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error();

    const user = data.data.user;

    // Update avatar preview
    const preview = document.getElementById("preview");
    if (preview && user.avatar) {
      preview.src = user.avatar;
    }

    document.getElementById("name").value =
      `${user.firstName || ""} ${user.lastName || ""}`.trim();
    document.getElementById("email").value = user.email || "";
    document.getElementById("age").value = user.age || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("height").value = user.height || "";
    document.getElementById("weight").value = user.weight || "";
    document.getElementById("goal").value = user.target || "";

  } catch (err) {
    console.error("Edit profile load error", err);
    alert("Failed to load edit profile");
  }
}

// ============================
// SAVE PROFILE DATA
// ============================
async function saveProfile(event) {
  event.preventDefault();

  if (!requireAuth()) return;

  try {
    const fullName = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const target = document.getElementById("goal").value;
    const avatarFile = document.getElementById("upload").files[0];

    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // Always use FormData (multer expects multipart/form-data)
    const formData = new FormData();
    
    // Only append avatar if a file is selected
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    
    // Append all other fields
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("height", height);
    formData.append("weight", weight);
    formData.append("goal", target);

    const res = await fetch(`${BASE_URL}/edit-profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Update failed");
      return;
    }

    alert("Profile updated successfully ✅");
    window.location.href = "profile.html";

  } catch (err) {
    console.error("Update error", err);
    alert("Server error");
  }
}

// ============================
// PROFILE IMAGE PREVIEW
// ============================
function previewImage(event) {
  const preview = document.getElementById("preview");
  if (event.target.files[0]) {
    preview.src = URL.createObjectURL(event.target.files[0]);
  }
}

// ==================================================
// NAVIGATE TO EDIT PROFILE PAGE
// ==================================================
function editProfile() {
  window.location.href = "editProfile.html";
}

// ==================================================
// PAGE DETECTOR
// ==================================================
document.addEventListener("DOMContentLoaded", () => {

  if (document.querySelector(".profile-card")) {
    loadProfile();
  }

  if (document.querySelector(".edit-form")) {
    loadEditProfile();
  }

});

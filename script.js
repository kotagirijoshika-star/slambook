document.addEventListener("DOMContentLoaded", () => {
let adminLoginPanel;
let adminDashboard;
let filledPages;
let allAnswers;
let allPageColors;
let allAnswersBackup;
let allPagePhotos;

adminLoginPanel = document.getElementById("adminLoginPanel");
adminDashboard = document.getElementById("adminDashboard");

filledPages = JSON.parse(localStorage.getItem("filledPages")) || [];
allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || {};
allPageColors = JSON.parse(localStorage.getItem("allPageColors")) || {};
allAnswersBackup = JSON.parse(localStorage.getItem("allAnswersBackup")) || {};

firebase.database().ref("pages").on("value", (snapshot) => {
  const data = snapshot.val();
  filledPages = [];
  allAnswers = {};
  allPageColors = {};
  allPagePhotos = {};   // ✅ added

  if(data){
    Object.keys(data).forEach(pageNum => {
      filledPages.push(parseInt(pageNum));
      allAnswers[pageNum] = data[pageNum].answers;
      allPageColors[pageNum] = data[pageNum].color;
      allPagePhotos[pageNum] = data[pageNum].photo || null; // ✅ added
    });
  }

  generatePages();
});
  
// ✅ SOUNDS — preloaded and ready
const clickSound = document.getElementById("clickSound");
const flipSound = document.getElementById("flipSound");
const submitSound = document.getElementById("submitSound");
const wrongSound = document.getElementById("wrongSound");
const laughSound = document.getElementById("laughSound");

if(clickSound) clickSound.volume = 0.5;
if(flipSound) flipSound.volume = 0.5;
if(submitSound) submitSound.volume = 0.6;
if(wrongSound) wrongSound.volume = 0.6;
if(laughSound) laughSound.volume = 0.7;

// ✅ Mobile-safe audio unlock
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  const tempAudio = new Audio(clickSound.src);
  tempAudio.volume = 0;

  tempAudio.play().then(() => {
    tempAudio.pause();
    audioUnlocked = true;
  }).catch(() => {});
}

document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });



// ✅ Play any sound by element id
function playSound(id) {
  const original = document.getElementById(id);
  if (!original) return;

  // Clone prevents mobile overlap lag
  const sound = original.cloneNode(true);
  sound.volume = original.volume;

  sound.play().catch(() => {});
}
  
// ✅ Click sound on every button with small delay to avoid lag
  
const startBtn = document.getElementById("startBtn");
const adminBtn = document.getElementById("adminLoginBtn");

if(adminBtn){
  adminBtn.addEventListener("click", () => {
    adminLoginPanel.style.display = "block";
    adminDashboard.style.display = "none";
  });
}

const slamForm = document.getElementById("slamForm");
console.log("slamForm is:", slamForm);

const photoUpload = document.getElementById('photoUpload');
if(photoUpload){
  photoUpload.addEventListener("change", (e) => {
    const existingPreview = document.getElementById('imagePreview');
    if(existingPreview) existingPreview.remove();
    const file = e.target.files[0];
    if(file){
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.id = 'imagePreview';
      img.style.cssText = 'max-width:100px; border-radius:8px; margin:10px 0;';
      document.getElementById('photoUploadContainer').appendChild(img);
    }
  });
}

const backBtn = document.getElementById("backBtn");
const formBackBtn = document.getElementById("formBackBtn");
const welcomeContainer = document.querySelector(".welcome-container");
const pagesContainer = document.querySelector(".pages-container");
const formContainer = document.querySelector(".form-container");
const pagesGrid = document.getElementById("pagesGrid");
const pageMessage = document.getElementById("pageMessage");
const formTitle = document.getElementById("formTitle");
  /* ---------------- ADMIN LOGIN BUTTON ---------------- */

  if(!flipSound){
 console.error("Flip sound element missing in HTML");
}
else{
 flipSound.volume = 0.5;
}
let currentPage = null;

const questions = [
"Name",
"Nickname (or the one only your mom calls you)",
"Birthday",
"Age (or the number you lie about)",
"Where do you see yourself in 10 years",
"Fav book",
"Fav quote (or something you found on Instagram)",
"Fav school memory",
"Fav food (the one you’d fight for)",
"Fav meme of all time",
"Fav hobby (Even if it’s just scrolling Instagram or pretending to draw)",
"Fav movie/tv show",
"Fav Singer / Band (the one you blast on repeat)",
"Celebrity crush",
"The most random thing that makes you happy",
"One thing you can’t live without",
"Pet Peeve (the thing that instantly ruins your day)",
"The most random thing that makes you laugh uncontrollably",
"Weird talent or skill you have",
"Your superpower if you could have one",
"Your dream vacation spot",
"If you were an animal, which one would you be?",
"Message for Joshika (optional)"
];

/* ---------------- START BUTTON ---------------- */

startBtn.addEventListener("click", () => {
  generatePages();
  switchScreen(welcomeContainer, pagesContainer);
  // hide entire welcome wrapper including admin button
  document.querySelector(".welcome-wrapper").classList.add("hidden");
  window.scrollTo(0, 0);
});

backBtn.addEventListener("click", () => {
  pageMessage.innerText = "";
  switchScreen(pagesContainer, welcomeContainer);
  // show welcome wrapper again
  document.querySelector(".welcome-wrapper").classList.remove("hidden");
});

formBackBtn.addEventListener("click", () => {
pageMessage.innerText = "";
switchScreen(formContainer, pagesContainer);
});

function switchScreen(hideEl, showEl) {
hideEl.classList.remove("visible");
hideEl.classList.add("hidden");
showEl.classList.remove("hidden");
showEl.classList.add("visible");
}

/* ---------------- PAGE GENERATION ---------------- */

function generatePages() {

  pagesGrid.innerHTML = "";

  for (let i = 1; i <= 40; i++) {

    const page = document.createElement("div");
    page.classList.add("page-box");

if (filledPages.includes(i)) {

  page.classList.add("filled");

  let pageLabel = "Page " + i + " 🔒";

  if(isAdmin && allAnswers[i]){
    const name = allAnswers[i]["q0"]?.answer;
    if(name){
      pageLabel = `Page ${i} - ${name} 🔒`;
    }
  }

  page.innerText = pageLabel; // ✅ only set once, with correct label

  page.addEventListener("click", () => {
  playSound("wrongSound");
  pageMessage.innerText = "This page is already filled and locked.";
  setTimeout(() => {
    page.classList.add("shake");
    setTimeout(() => page.classList.remove("shake"), 400);
  }, 400);
});

      if (isAdmin) {

  // Switch to admin-friendly layout
  page.classList.add("admin-filled");
  page.innerText = ""; // clear the plain text label

  // Name label
  const label = document.createElement("span");
  label.classList.add("page-label");
  const name = allAnswers[i]?.["q0"]?.answer;
  label.innerText = name ? `Page ${i}\n${name}` : `Page ${i}`;

  // Buttons wrapper
  const btnWrapper = document.createElement("div");
  btnWrapper.classList.add("admin-btns");

  const resetBtn = document.createElement("button");
  resetBtn.innerText = "Reset";
  resetBtn.classList.add("reset-btn");
  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm(`Reset Page ${i}? User can fill it again.`)) {
      resetPage(i);
    }
  });

  const viewBtn = document.createElement("button");
  viewBtn.innerText = "👁 View";
  viewBtn.classList.add("view-btn");
  viewBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openViewOnly(i);
  });

  btnWrapper.appendChild(resetBtn);
  btnWrapper.appendChild(viewBtn);

  page.appendChild(label);
  page.appendChild(btnWrapper);
}
    } else {

      page.classList.add("available");
      page.innerText = "Page " + i;

      page.addEventListener("click", () => {
        playSound("flipSound");
  page.classList.add("flipped");
  setTimeout(() => page.classList.remove("flipped"), 600);
  currentPage = i;
  openForm(i);
});
    }

    pagesGrid.appendChild(page);
  }
}

/* ---------------- FORM ---------------- */

function openForm(pageNumber) {
    // ✅ ADD THESE TWO LINES
  document.getElementById("formBackBtn").style.display = "block";
  document.getElementById("formTitle").style.display = "block";
  
window.scrollTo(0,0);

formTitle.innerText = "Slam Book - Page " + pageNumber;
switchScreen(pagesContainer, formContainer);

const questionsContainer = document.getElementById("questionsContainer");
questionsContainer.innerHTML = "";

questions.forEach((q, index) => {

const fieldWrapper = document.createElement("div");
fieldWrapper.classList.add("form-field");

const label = document.createElement("label");
label.innerText = q;

fieldWrapper.appendChild(label);

let input;

if (
q.toLowerCase().includes("message") ||
q.toLowerCase().includes("memory") ||
q.toLowerCase().includes("where") ||
q.toLowerCase().includes("meme")
) {
input = document.createElement("textarea");
input.rows = 2;
} else {
input = document.createElement("input");
input.type = "text";
}

input.id = "q" + index;

if (allAnswers[pageNumber] && allAnswers[pageNumber][q]) {
input.value = allAnswers[pageNumber][q];
}

input.addEventListener("input", () => {
input.style.border = "1px solid #ccc";
});

fieldWrapper.appendChild(input);
questionsContainer.appendChild(fieldWrapper);

});

const colorSwatches = document.querySelectorAll(".color-swatch");

colorSwatches.forEach((swatch) => {

swatch.classList.remove("selected");

if (
allPageColors[pageNumber] &&
allPageColors[pageNumber] === swatch.dataset.color
) {
swatch.classList.add("selected");
formContainer.style.backgroundColor = swatch.dataset.color;
}

swatch.onclick = () => {
colorSwatches.forEach((s) => s.classList.remove("selected"));
swatch.classList.add("selected");
formContainer.style.backgroundColor = swatch.dataset.color;
};

});
}

/* ---------------- SUBMIT ---------------- */
slamForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("SUBMIT CLICKED ✅");
  
const answers = {};

questions.forEach((q, index) => {
  answers["q" + index] = {
    question: q,
    answer: document.getElementById("q" + index).value
  };
});

const color =
document.querySelector(".color-swatch.selected")?.dataset.color || "#ffffff";
 


questions.forEach((q, index) => {
if (q !== "Message for Joshika (optional)") {

const inputEl = document.getElementById("q" + index);

if (!inputEl.value.trim()) {
inputEl.style.border = "2px solid red";
inputEl.classList.add("shake");
setTimeout(() => inputEl.classList.remove("shake"), 400);
} else {
inputEl.style.border = "1px solid #ccc";
}

}
});

const firstEmpty = questions.slice(0, -1).findIndex(
  (q, idx) => !document.getElementById("q" + idx).value.trim()
);

if (firstEmpty !== -1) {
  const emptyEl = document.getElementById("q" + firstEmpty);
  emptyEl.scrollIntoView({ behavior: "smooth", block: "center" });
  emptyEl.focus();
  return;
}

playSound("submitSound");

allAnswersBackup[currentPage] = answers;

localStorage.setItem(
"allAnswersBackup",
JSON.stringify(allAnswersBackup)
);

const photoFile = document.getElementById("photoUpload").files[0];

function saveToFirebase(photoBase64 = null) {
  firebase.database().ref("pages/" + currentPage).set({
    answers: answers,
    color: color,
    photo: photoBase64,
    filledAt: Date.now()
  }).then(() => {

  console.log("Saved to Firebase ✅");

  if (!filledPages.includes(currentPage)) {
    filledPages.push(currentPage);
  }

  allAnswers[currentPage] = answers;
  allPageColors[currentPage] = color;

  localStorage.setItem("filledPages", JSON.stringify(filledPages));
  localStorage.setItem("allAnswers", JSON.stringify(allAnswers));
  localStorage.setItem("allPageColors", JSON.stringify(allPageColors));

  // ✅ SHOW THANK YOU ONLY AFTER SAVE
  slamForm.innerHTML = `
  <div class="thank-you-message">
    <h3>
      Thank you! Your response has been recorded. Your page is now locked.
    </h3>
  </div>
  `;

  document.getElementById("formBackBtn").style.display = "none";
  document.getElementById("formTitle").style.display = "none";

  formContainer.style.backgroundColor = color;

  launchConfetti(color);
  generatePages();

}).catch((error) => {
  console.error("Firebase error:", error);
});
/* ---------------- CONFETTI ---------------- */

function launchConfetti(selectedColor) {

const count = 25;

for (let i = 0; i < count; i++) {

const conf = document.createElement("div");
conf.classList.add("confetti");

conf.style.position = "fixed";
conf.style.width = "8px";
conf.style.height = "8px";
conf.style.borderRadius = "50%";
conf.style.backgroundColor = selectedColor;
conf.style.opacity = "0.8";
conf.style.top = "-10px";
conf.style.left = Math.random() * window.innerWidth + "px";
conf.style.zIndex = "9999";
conf.style.pointerEvents = "none";

document.body.appendChild(conf);

let fallSpeed = Math.random() * 1.5 + 1;
let drift = Math.random() * 1 - 0.5;

const falling = setInterval(() => {

let top = parseFloat(conf.style.top);
top += fallSpeed;

conf.style.top = top + "px";
conf.style.left =
parseFloat(conf.style.left) + drift + "px";

conf.style.opacity -= 0.005;

if (
top > window.innerHeight ||
conf.style.opacity <= 0
) {
clearInterval(falling);
conf.remove();
}

}, 16);

}
}

/* ---------------- RESET ---------------- */

function resetPage(pageNumber) {

  firebase.database().ref("pages/" + pageNumber).remove()
    .then(() => {

      filledPages = filledPages.filter((p) => p !== pageNumber);
      delete allAnswers[pageNumber];
      delete allPageColors[pageNumber];

      localStorage.setItem("filledPages", JSON.stringify(filledPages));
      localStorage.setItem("allAnswers", JSON.stringify(allAnswers));
      localStorage.setItem("allPageColors", JSON.stringify(allPageColors));

      generatePages();
      alert(`Page ${pageNumber} has been reset. User can now fill it again.`);

    })
    .catch((error) => {
      console.error("Reset failed:", error);
      alert("Reset failed. Check console for details.");
    });

}
  


let isAdmin = false;
  
function adminLogin(){

  const passInput = document.getElementById("adminPass");

  if(!passInput || !passInput.value){
    alert("Enter password");
    return;
  }

  const hashedInput = btoa(passInput.value);
  const correctHash = "Y2hhdGdwdGRpZGFsbHRoaXM=";

  if(hashedInput === correctHash){

    isAdmin = true;

    adminLoginPanel.style.display="none";
    adminDashboard.style.display="block";

    alert("Admin Login Successful ✅");

    generatePages();

  } else {
  // ✅ ADD THIS
  playSound("laughSound");
  alert("Dont act smart!");
}
}

// VERY IMPORTANT
window.adminLogin = adminLogin;
function logoutAdmin(){

 isAdmin = false;

 if(adminDashboard)
 adminDashboard.style.display = "none";

 if(adminLoginPanel)
 adminLoginPanel.style.display = "block";

 updateAdminUI();
 generatePages();

}

function viewAllResponses() {
console.log(allAnswers);
}

function downloadPDF() {

if(!isAdmin){
 alert("Admin only access");
 return;
}

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.setFont("helvetica");

let y = 20;

doc.setFontSize(22);
doc.text("💚 Joshika's Slam Book", 20, y);
y += 15;

doc.setFontSize(12);
doc.text("Exported Responses", 20, y);
y += 20;

Object.entries(allAnswers).forEach(([pageNum, answers]) => {

 if(y > 260){
  doc.addPage();
  y = 20;
 }

 doc.setFontSize(16);
 doc.text(`📘 Page ${pageNum}`, 20, y);
 y += 10;

// ✅ FIXED
Object.entries(answers).forEach(([key, obj]) => {

  const question = obj?.question || key;
  const answer = obj?.answer?.trim() || "(no answer)";

  let textLines = doc.splitTextToSize(
    `${question}: ${answer}`,
    170
  );

  doc.setFontSize(11);
  doc.text(textLines, 20, y);
  y += textLines.length * 6 + 4;

  if(y > 260){
    doc.addPage();
    y = 20;
  }

});

// Add photo if available
  const savedPhoto = allPagePhotos[parseInt(pageNum)];
  if (savedPhoto) {
    try {
      if(y > 220){ doc.addPage(); y = 20; }
      doc.addImage(savedPhoto, "JPEG", 20, y, 60, 60);
      y += 70;
    } catch(e) {
      console.warn("Could not add photo for page " + pageNum);
    }
  }

  y += 10; // space between pages

}); // ← closes Object.entries(allAnswers).forEach

doc.save("Joshika-SlamBook.pdf"); // ← moved OUTSIDE the loop

} // ← this closes the downloadPDF function
function shareLink(){
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}

function updateAdminUI(){

 if(isAdmin){

  if(adminDashboard) adminDashboard.style.display = "block";
  if(adminLoginPanel) adminLoginPanel.style.display = "none";

 } else {

  if(adminDashboard) adminDashboard.style.display = "none";
  if(adminLoginPanel) adminLoginPanel.style.display = "block";

 }

}
function showAdminLogin(){

 if(adminLoginPanel){
  adminLoginPanel.style.display = "block";
 }

 if(adminDashboard){
  adminDashboard.style.display = "none";
 }

}


function playClick() {
  const sound = document.getElementById("clickSound");
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}


function downloadData() {
  if(!isAdmin) return alert("Admin only!");
  const data = {
    filledPages,
    allAnswers,
    allPageColors
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "slam-book-backup.json";
  link.click();
}

window.downloadPDF = downloadPDF;
window.openViewOnly = openViewOnly;
window.logoutAdmin = logoutAdmin;
window.shareLink = shareLink;
window.downloadData = downloadData;

function openViewOnly(pageNumber) {
  const answers = allAnswers[pageNumber];
  const color = allPageColors[pageNumber] || "#ffffff";
  const viewOnlyContainer = document.getElementById("viewOnlyContainer");
  const viewOnlyTitle = document.getElementById("viewOnlyTitle");
  const viewOnlyContent = document.getElementById("viewOnlyContent");
  viewOnlyTitle.innerText = `Page ${pageNumber} — ${answers?.["q0"]?.answer || "Unknown"}`;
  viewOnlyContent.innerHTML = "";
  viewOnlyContainer.style.backgroundColor = color;
  if (!answers) {
    viewOnlyContent.innerHTML = "<p>No answers found.</p>";
  } else {
    Object.entries(answers).forEach(([key, obj]) => {
      const question = obj?.question || key;
      const answer = obj?.answer?.trim() || "(no answer)";
      const block = document.createElement("div");
      block.style.marginBottom = "14px";
      const q = document.createElement("p");
      q.style.fontWeight = "700";
      q.style.marginBottom = "2px";
      q.innerText = question;
      const a = document.createElement("p");
      a.style.margin = "0";
      a.style.color = "#444";
      a.innerText = answer;
      block.appendChild(q);
      block.appendChild(a);
      viewOnlyContent.appendChild(block);
    });
    const savedPhoto = allPagePhotos[parseInt(pageNumber)];
    if (savedPhoto) {
      const img = document.createElement("img");
      img.src = savedPhoto;
      img.style.cssText = "max-width:150px; border-radius:8px; margin-top:10px;";
      viewOnlyContent.appendChild(img);
    }
  }
  switchScreen(pagesContainer, viewOnlyContainer);
  window.scrollTo(0, 0);
}

document.getElementById("viewOnlyBackBtn").addEventListener("click", () => {
  const viewOnlyContainer = document.getElementById("viewOnlyContainer");
  switchScreen(viewOnlyContainer, pagesContainer);
});
// Pre-buffer all sounds so they're ready instantly
});

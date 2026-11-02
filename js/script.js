"use strict";

/* 2. Back to top button */
const topBtn = document.createElement("button");
topBtn.id = "back-to-top";
topBtn.textContent = "Top";
topBtn.setAttribute("aria-label", "Back to top");
document.body.append(topBtn);
window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 300));
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* 3. Lightbox: click any project image to enlarge it */
const box = document.createElement("div");
box.id = "lightbox";
box.innerHTML = '<button id="lightbox-close" aria-label="Close image">&times;</button><img alt="">';
document.body.append(box);
document.addEventListener("click", (e) => {
  if (e.target.matches("img.project-image")) {
    const big = box.querySelector("img");
    big.src = e.target.src;
    big.alt = e.target.alt;
    box.classList.add("show");
  } else if (e.target === box || e.target.id === "lightbox-close") {
    box.classList.remove("show");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") box.classList.remove("show");
});

/* 4. Projects page: content loaded from an array, with search, filter and sort */
const projects = [
  { title: "Meals for the Needy", status: "Ongoing", img: "images/images-project.jpg",
    alt: "Volunteers and community members at a Love from Above NPO project",
    text: "Providing basic meals to people in need and raising awareness in the surrounding communities." },
  { title: "Back to School Programme", status: "Ongoing", img: "images/Soapforgoodiebag_62720-e1745037344107.jpg",
    alt: "Goodie bag with soap prepared for a school programme",
    text: "Supporting learners with school essentials and care packs at the start of each year." },
  { title: "Blanket Distribution", status: "Ongoing", img: "images/images-project.jpg",
    alt: "Volunteers handing out blankets to community members",
    text: "Keeping families warm through winter with blanket drives across the community." },
  { title: "Infrastructure Support", status: "Ongoing", img: "images/images-project.jpg",
    alt: "Community members at an infrastructure support project",
    text: "Helping to repair and improve shared community spaces." },
  { title: "Educational Workshops", status: "Completed", img: "images/images-completed.jpg",
    alt: "Volunteers celebrating a completed workshop",
    text: "Educational workshops that gave community members new skills and confidence." },
  { title: "Holiday Gift Campaign", status: "Completed", img: "images/images-completed.jpg",
    alt: "Volunteers celebrating a completed holiday gift campaign",
    text: "Holiday gifts for the needy. Changing lives one step at a time." }
];

const list = document.getElementById("project-list");
if (list) {
  const search = document.getElementById("project-search");
  const filter = document.getElementById("project-filter");
  const sort = document.getElementById("project-sort");

  function renderProjects() {
    const q = search.value.trim().toLowerCase();
    const shown = projects.filter((p) =>
      (filter.value === "all" || p.status === filter.value) &&
      (p.title + " " + p.text).toLowerCase().includes(q));
    if (sort.value === "az") shown.sort((a, b) => a.title.localeCompare(b.title));
    list.innerHTML = shown.length
      ? shown.map((p) => `
        <article class="project-card reveal">
          <img src="${p.img}" alt="${p.alt}" class="project-image" loading="lazy">
          <h3>${p.title} <small>(${p.status})</small></h3>
          <p>${p.text}</p>
        </article>`).join("")
      : "<p>No projects match your search. Try a different word.</p>";
    // a small fade-in each time the list changes
    requestAnimationFrame(() => list.querySelectorAll(".reveal").forEach((c) => c.classList.add("visible")));
  }
  [search, filter, sort].forEach((el) => el.addEventListener("input", renderProjects));
  renderProjects();
}

/* 5. Accordion (FAQ on the enquiries page) */
document.querySelectorAll(".accordion-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    btn.nextElementSibling.hidden = open;
  });
});

/* 6. Interactive map (Leaflet) on the contact page */
if (document.getElementById("map") && window.L) {
  const pos = [-26.25, 28.03]; 
  const map = L.map("map").setView(pos, 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.marker(pos).addTo(map)
    .bindPopup("<strong>Love from Above NPO</strong><br>23 Vivienne St, Chrisville")
    .openPopup();
}

/* 7. Form validation + AJAX submission */
const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
const needsChoice = (v) => (v ? "" : "Please choose an option.");
const longText = (v) => (v.trim().length >= 10 && v.trim().length <= 500 ? "" : "Please write between 10 and 500 characters.");
const checks = {
  name: (v) => (/^[A-Za-z][A-Za-z\s'-]{1,49}$/.test(v.trim()) ? "" : "Enter your name (2 to 50 letters)."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email, e.g. name@example.com."),
  phone: (v) => (/^(\+27|0)[1-9][0-9]{8}$/.test(v.replace(/[\s-]/g, "")) ? "" : "Enter a valid SA number, e.g. 069 118 1425."),
  date: (v) => (!v || v >= today ? "" : "Choose today or a future date."),
  "message-type": needsChoice,
  "enquiry-type": needsChoice,
  message: longText,
  enquiry: longText
};

function showError(input, msg) {
  let span = input.parentElement.querySelector(".error-msg");
  if (!span) {
    span = document.createElement("span");
    span.className = "error-msg";
    input.parentElement.append(span);
  }
  span.textContent = msg;
  input.classList.toggle("invalid", msg !== "");
}

function validateForm(form) {
  let ok = true;
  form.querySelectorAll("input, select, textarea").forEach((f) => {
    if (checks[f.id]) {
      const msg = checks[f.id](f.value);
      showError(f, msg);
      if (msg) ok = false;
    }
  });
  return ok;
}

// Replies shown after a valid enquiry
const enquiryReplies = {
  general: "Thank you! Our team will answer your question within 2 working days.",
  volunteering: "Volunteering is free and spots are open. We will email you the next available date.",
  donations: "Thank you for your support! We will send our banking details and sponsorship options within 2 working days.",
  partnerships: "Thank you! A team member will contact you to talk about working together."
};

["enquiry-form", "contact-form"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;
  form.noValidate = true; // we show our own error messages
  const result = document.getElementById("form-result");

  form.querySelectorAll("input, select, textarea").forEach((f) =>
    f.addEventListener("blur", () => checks[f.id] && showError(f, checks[f.id](f.value))));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      form.querySelector(".invalid").focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    result.textContent = "Sending...";
    try {
      // AJAX: sends the data without reloading the page.
      // Swap this test URL for your own form service (e.g. Formspree) later.
      const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Server error");
    } catch (err) {
      result.textContent = "Sorry, something went wrong. Please try again.";
      return;
    }

    if (id === "enquiry-form") {
      result.textContent = enquiryReplies[data["enquiry-type"]];
    } else {
      // Compile the validated details into an email the visitor can send
      const subject = encodeURIComponent(data["message-type"] + " - " + data.name);
      const body = encodeURIComponent(
        "Name: " + data.name + "\nEmail: " + data.email + "\nPhone: " + data.phone +
        "\nType: " + data["message-type"] + "\n\n" + data.message);
      const link = document.createElement("a");
      link.className = "btn";
      link.href = "mailto:donate@lovefromabove.co.za?subject=" + subject + "&body=" + body;
      link.textContent = "Open my email to send";
      result.textContent = "Thank you, " + data.name + "! Your message is ready to send.";
      result.append(document.createElement("br"), link);
    }
    form.reset();
  });
});
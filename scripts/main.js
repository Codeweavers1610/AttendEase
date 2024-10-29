// Unsplash and Quotes API
const unsplashApiKey = "c_XkgSCIgq34agYtWGjpx-33g5-UuBLT5awrCmguk2g";
const quoteApiUrl = "https://type.fit/api/quotes";

async function fetchMotivationalQuote() {
  try {
    // Fetch motivational quote
    let response = await fetch(quoteApiUrl);
    let quotes = await response.json();
    let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Fetch motivational image
    response = await fetch(`https://api.unsplash.com/search/photos?query=motivational&client_id=${unsplashApiKey}`);
    let data = await response.json();
    let randomImage = data.results[Math.floor(Math.random() * data.results.length)];

    // Display quote and image
    return `
      <div class="moti_title">Here's a quote to keep you motivated:</div>
      <div class="moti_quote">
        <p>${randomQuote.text} - <em>${randomQuote.author || "Unknown"}</em></p>
        <img src="${randomImage.urls.small}" alt="Motivational Image" />
      </div>
    `;
  } catch (error) {
    console.error("Error fetching motivational content:", error);
    return "<p>Could not fetch motivational content. Please try again later.</p>";
  }
}

// Custom Site Addition
async function saAddSite() {
  const { value: formValues } = await Swal.fire({
    title: "Add Custom Site",
    html: `
      <input id="inputSiteName" class="swal2-input" placeholder="Name" required>
      <input type="url" id="inputSiteLink" class="swal2-input" placeholder="Link" required>
    `,
    background: "#353535",
    color: "white",
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById("inputSiteName").value.trim();
      const link = document.getElementById("inputSiteLink").value.trim();

      if (!name) {
        Swal.showValidationMessage("Please enter the site name.");
        return;
      }
      if (!isValidUrl(link)) {
        Swal.showValidationMessage("Invalid URL format.");
        return;
      }
      return [name, link];
    }
  });

  if (formValues) {
    const [siteName, siteLink] = formValues;
    Lockr.sadd("customSites", [siteName, siteLink]);
    addGridElement(siteName, siteLink);
  }
}

// Helper Function to Validate URL
function isValidUrl(url) {
  const urlPattern = /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}(\b[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/;
  return urlPattern.test(url);
}

// Initialize and display quotes
(async function init() {
  const content = await fetchMotivationalQuote();
  document.getElementById("motivationalContent").innerHTML = content;
})();
$(document).ready(function () {
  let isVisible, count = 0, run = 0, flag1 = 0, flag2 = 0, windowCount = 0, complete = false;
  let windows = [];

  function showAlert(title, message, icon = "info") {
    Swal.fire({
      title,
      html: `<p style='font-family:Product Sans; letter-spacing:1px;'>${message}</p>`,
      background: "#353535",
      icon,
      color: "white",
    });
  }

  function isUrlValid() {
    const url = $('#url-input').val();
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    return regex.test(url);
  }

  $("body").keyup((e) => {
    if (e.key === "Enter" && $('.content').hasClass('visible')) {
      if (isUrlValid()) {
        if (count === 0) {
          customUrl1();
          count = 1;
        }
      } else {
        showAlert("Invalid URL", "Please enter a valid website URL!", "error");
      }
    }
  });

  $('.time-button').click(function () {
    $(".time-button").removeClass("clicked");
    $(this).addClass("clicked");
  });

  if (screen.width <= 480) {
    $('#background, #notification, #logo').hide();
  }

  if (Lockr.get('pastUser') === undefined) {
    Lockr.set('pastUser', 'yes');
    showAlert("Welcome!", "Select a break time, go to your favorite website, and when time's up, your tab will self-destruct!");
  }

  function toggleDisplay(id, flag) {
    document.getElementById(id).style.display = flag ? "block" : "none";
  }

  $("#notification").click(() => Lockr.set('notificationAlert', flag1 === 1));
  $("#audioAlert").click(() => Lockr.set('audioAlert', flag2 === 1));

  function Custom(e) {
    $('.content').removeClass('visible');
    Swal.fire({
      title: "Custom Time",
      html: "<p style='font-family:Product Sans; letter-spacing:1px;'>How long do you want a break?</p>",
      input: 'text',
      confirmButtonText: "Let's go!",
      background: "#353535",
      color: "white",
      preConfirm: (inputValue) => {
        if (!inputValue) {
          showAlert("Error", "You need to write something!", "error");
          return false;
        }

        let convertIntoMinVal = parseTimeInput(inputValue);
        if (convertIntoMinVal > 0) {
          choice(e, convertIntoMinVal);
          $("#btn_end").text(`${convertIntoMinVal.toFixed(2)} min`);
          $(".content").fadeIn().addClass('visible');
          return true;
        } else {
          showAlert("Error", "Please enter a valid number!", "error");
          return false;
        }
      }
    });
  }

  function parseTimeInput(input) {
    let minutes = 0, hrsFlag = input.includes("h"), minFlag = input.includes("m"), secFlag = input.includes("s");

    if (hrsFlag && minFlag) {
      minutes = parseInt(input.split("h")[0]) * 60 + parseInt(input.split("h")[1]);
    } else if (hrsFlag) {
      minutes = parseInt(input) * 60;
    } else if (secFlag) {
      minutes = parseInt(input) / 60;
    } else {
      minutes = parseInt(input);
    }
    return isNaN(minutes) || minutes <= 0 ? -1 : minutes;
  }

  function choice(e, minutes) {
    $(".time-button").css({ backgroundColor: "rgb(140, 179, 238)", color: "#000" });
    $(e).css({ backgroundColor: "rgb(89, 151, 245)", color: "black" });
    run = 1;
    Swal.close();

    const offset = $(".custom-url").offset().top + 80;
    $(window).animate({ scrollTop: offset }, 500);
  }

  function OpenInNew(min, tab, type) {
    if (type !== "video") {
      const win = window.open('loading.html', '_blank');
      setTimeout(() => { win.location = tab; }, 6500);
      windows[windowCount++] = win;
    }

    if (count === 0) {
      startBreakTimer(min);
      count = 1;
    }

    const intervalID = setInterval(() => manageWindowArray(intervalID), 1000);
  }

  function startBreakTimer(min) {
    const duration = min * 60;
    const halfTime = duration / 2;
    const ninetyPercentTime = duration * 0.9;

    let timeDisplay = $("#time");
    setTimeout(() => playAlertAudio("audio1"), halfTime);
    setTimeout(() => playAlertAudio("audio2"), ninetyPercentTime);

    startTimer(duration, timeDisplay);
  }

  function playAlertAudio(audioId) {
    if (flag2 === 1) {
      document.getElementById(audioId).play();
    }
  }

  function manageWindowArray(intervalID) {
    windows = windows.filter(win => !win.closed);
    windowCount = windows.length;

    if (windowCount === 0 && !complete) {
      clearInterval(intervalID);
      onCloseEarly();
    }
  }

  function onCloseEarly() {
    Swal.fire({
      title: "You closed out early!",
      showCancelButton: true,
      confirmButtonText: "Keep Browsing!",
      cancelButtonText: "I'm done!",
    }).then(result => {
      if (!result.isConfirmed) window.location = "./index.html";
    });
  }
});


const TIMER_EXTENSION = 6;
let timer, setInt;
let increase = 0;
let count = 0;
let first = true;
let complete = false;
let num = 360;
const display = document.querySelector("#display");
const container = document.querySelector(".container");
const secEle = document.querySelector("#seconds");
const minEle = document.querySelector("#minutes");
const extraBtn = document.querySelector("#extraBtn");
const pauseBtn = document.querySelector("#pauseBtn");

// Function to start the timer
function startTimer(duration) {
  extraBtn.classList.add("active");
  let start = Date.now();

  timer = () => {
    let diff = duration + TIMER_EXTENSION - increase++; // Calculate remaining time
    let minutes = Math.floor(diff / 60);
    let seconds = diff % 60;

    minutes = minutes < 10 ? +minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    updateDisplay(minutes, seconds, diff);
    updateBackground(diff, duration);

    if (diff <= 0) {
      complete = true;
      clearInterval(setInt);
      return;
    }
  };

  setInt = setInterval(timer, 1000);
}

function updateDisplay(minutes, seconds, diff) {
  // Update the display and document title
  if (diff === 60) {
    display.textContent = "1 minute";
    document.title = "1 minute";
  } else if (diff < 60) {
    display.textContent = `${seconds} seconds`;
    document.title = `${seconds} seconds`;
  } else {
    display.textContent = `${minutes}:${seconds} minutes`;
    document.title = `${minutes}:${seconds} minutes`;
  }

  secEle.textContent = seconds;
  minEle.textContent = minutes;

  if (diff === duration * 0.5) showNotification("50% of your break is over");
  if (diff === duration * 0.1) showNotification("90% of your break is over");
}

function updateBackground(diff, duration) {
  container.style.setProperty("--a", num + "deg");
  container.style.background = `conic-gradient(#8cb3ee var(--a), #8cb3ee 0deg, #585862d5 0deg, #585862d5 360deg)`;
  num -= num / diff;
}

function showNotification(message) {
  if (!("Notification" in window)) return;
  const notification = new Notification("Take a Break!", {
    body: message,
    icon: "assets/banner.png",
  });
  setTimeout(() => notification.close(), 10000);
}

// Pause/Resume Button Handler
pauseBtn.addEventListener("click", (e) => {
  if (e.target.textContent === "Pause") {
    e.target.textContent = "Resume";
    clearInterval(setInt);
  } else {
    e.target.textContent = "Pause";
    setInt = setInterval(timer, 1000);
  }
});

// Open a custom URL in a new tab
function openCustomUrl() {
  if (count === 0) {
    let customSite = formatUrl(document.getElementById("enterUrl").value);
    openInNewTab(customSite);
    count = 1;
  }
}

function formatUrl(url) {
  return url.startsWith("http") ? url : "http://" + url;
}

function openInNewTab(url) {
  window.open(url, "_blank");
}

// Update site list with grid elements
function updateSites() {
  $(".rig.columns-6.websites").append(
    "<a data-toggle='modal1' onclick='saAddSite()' data-target='#mm1' class='addCustom'><li class='outbound-link'><img id='Add Site' src='assets/plus.png' onclick='saAddSite()'><p>Add Site</p></li></a>"
  );

  sites.forEach(([siteName, siteLabel]) => {
    let imgSrc = getSiteImageSrc(siteName);
    appendSiteElement(siteName, siteLabel, imgSrc);
    Lockr.sadd("siteData", [siteName, siteLabel]);
  });

  const customSites = Lockr.get("customSites") || [];
  customSites.forEach(([customLink, customLabel]) => {
    addGridElement(customLink, customLabel);
  });
}

function getSiteImageSrc(siteName) {
  const images = {
    Youtube: "assets/youtube.png",
    Netflix: "assets/netflix.png",
    Facebook: "assets/facebook.png",
    Instagram: "assets/instagram.png",
    Reddit: "assets/reddit.png",
  };
  return images[siteName] || `https://logo.clearbit.com/${siteName.toLowerCase()}.com`;
}

function appendSiteElement(siteName, siteLabel, imgSrc) {
  $(".rig.columns-6.websites").append(`
    <a class='siteLink' data-link='http://${siteName.toLowerCase()}.com' target='_blank'>
      <li class='outbound-link'>
        <img id='${siteName}' src='${imgSrc}'>
        <p>${siteLabel}</p>
      </li>
    </a>
  `);
}

// About section alert
document.getElementById("aboutcorner").addEventListener("click", () => {
  Swal.fire({
    html: "<p style='font-family:Product Sans; letter-spacing:1px;'>Welcome! Select a break time, go to your favorite website and when the time's up, your tab will self-destruct!</p>",
    background: "#353535",
    color: "white",
    icon: "info",
  });
});

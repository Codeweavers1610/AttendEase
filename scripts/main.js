// Random quote generator function
let quote = "";
const apiUrl = "https://type.fit/api/quotes";
const apiKey = "c_XkgSCIgq34agYtWGjpx-33g5-UuBLT5awrCmguk2g";

// Fetch a random quote and a motivational image
async function getJson() {
    const randomQuoteIndex = Math.floor(Math.random() * 10);
    const imageResponse = await fetch(`https://api.unsplash.com/search/photos?query=motivational&client_id=${apiKey}`);
    const imageData = await imageResponse.json();
    const image = imageData.results[randomQuoteIndex];

    quote = `
        <div>
            <div class='moti_title'>Here's a quote to keep you motivated:</div>
            <span class='moti_quote'>
                <img src="${image.urls.small}" alt="">
            </span>
        </div>`;
}

async function DailyQuotes() {
    await getJson();
}

DailyQuotes();

// Lockr utility for localStorage management
(function (root, factory) {
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = factory(root, exports);
        }
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], function (exports) {
            root.Lockr = factory(root, exports);
        });
    } else {
        root.Lockr = factory(root, {});
    }
}(this, function (root, Lockr) {
    'use strict';

    Lockr.prefix = "";

    Lockr._getPrefixedKey = function (key, options = {}) {
        return options.noPrefix ? key : this.prefix + key;
    };

    Lockr.set = function (key, value, options) {
        const queryKey = this._getPrefixedKey(key, options);
        try {
            localStorage.setItem(queryKey, JSON.stringify({ "data": value }));
        } catch (e) {
            console.warn(`Lockr didn't successfully save the '${key}: ${value}' pair, because localStorage is full.`);
        }
    };

    Lockr.get = function (key, missing, options) {
        const queryKey = this._getPrefixedKey(key, options);
        let value;

        try {
            value = JSON.parse(localStorage.getItem(queryKey));
        } catch (e) {
            value = localStorage[queryKey] ? { data: localStorage.getItem(queryKey) } : null;
        }

        return value === null ? missing : (value.data !== undefined ? value.data : missing);
    };

    Lockr.sadd = function (key, value, options) {
        const queryKey = this._getPrefixedKey(key, options);
        const values = Lockr.smembers(key);

        if (values.indexOf(value) > -1) return null;

        try {
            values.push(value);
            localStorage.setItem(queryKey, JSON.stringify({ "data": values }));
        } catch (e) {
            console.warn(`Lockr didn't successfully add the ${value} to ${key} set, because localStorage is full.`);
        }
    };

    Lockr.smembers = function (key, options) {
        const queryKey = this._getPrefixedKey(key, options);
        let value;

        try {
            value = JSON.parse(localStorage.getItem(queryKey));
        } catch (e) {
            value = null;
        }

        return value === null ? [] : (value.data || []);
    };

    Lockr.srem = function (key, value, options) {
        const queryKey = this._getPrefixedKey(key, options);
        const values = Lockr.smembers(key);
        const index = values.indexOf(value);

        if (index > -1) values.splice(index, 1);

        try {
            localStorage.setItem(queryKey, JSON.stringify({ "data": values }));
        } catch (e) {
            console.warn(`Lockr couldn't remove the ${value} from the set ${key}`);
        }
    };

    Lockr.keys = function () {
        return Object.keys(localStorage).filter(key => key.startsWith(Lockr.prefix)).map(key => key.replace(Lockr.prefix, ''));
    };

    Lockr.getAll = function () {
        return Lockr.keys().map(key => Lockr.get(key));
    };

    Lockr.flush = function () {
        if (Lockr.prefix.length) {
            Lockr.keys().forEach(key => localStorage.removeItem(Lockr.prefix + key));
        } else {
            localStorage.clear();
        }
    };

    return Lockr;
}));

// Function to add a custom site
const saAddSite = async () => {
    const { value: formValues } = await Swal.fire({
        title: "Add Custom Site",
        html: `
            <div style="font-family:Product Sans; letter-spacing:1px; margin:0;">
                <input id="inputSiteName" class="swal2-input" placeholder="Name" autofocus>
                <p style="display: none; margin-top: 4px; margin-left: 3px;" id="erro"></p>
                <br/>
                <input type="url" id="inputSiteLink" class="swal2-input" placeholder="Link">
                <p style="display: none; margin-top: 4px; margin-left: 3px;" id="error"></p>
            </div>`,
        background: "#353535",
        color: "white",
        focusConfirm: false,
        preConfirm: () => {
            const siteName = document.getElementById("inputSiteName").value;
            const siteLink = document.getElementById("inputSiteLink").value;

            if (!siteLink.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
                Swal.showValidationMessage('<i class="fa fa-info-circle"></i> Invalid URL');
            }
            if (!siteName) {
                Swal.showValidationMessage('<i class="fa fa-info-circle"></i> Please Enter the Site Name');
            }
            return [siteName, siteLink];
        },
    });

    if (formValues) {
        addSite(formValues);
    }
};

const addSite = (formValues) => {
    const [site, siteLink] = formValues;

    if (!site.trim() || !siteLink.trim()) {
        displayErrorMessages(site, siteLink);
        return;
    }

    if (!siteLink.startsWith("http")) {
        siteLink = "http://" + siteLink;
    }

    if (isValidUrl(siteLink)) {
        Lockr.sadd("customSites", [site, siteLink]);
        addGridElement(site, siteLink);
        clearInputFields();
        $("#mm1").modal("toggle");
    } else {
        displayErrorMessages(site, siteLink);
    }
};

const displayErrorMessages = (site, siteLink) => {
    if (!site) {
        document.getElementById("erro").innerHTML = "<p style='color:#FF0000;'>ERROR: No label provided</p>";
        document.getElementById("erro").style.display = "block";
    }
    if (!isValidUrl(siteLink)) {
        document.getElementById("error").innerHTML = "<p style='color:#FF0000;'>ERROR: Incorrect website URL</p>";
        document.getElementById("error").style.display = "block";
    }
};

const isValidUrl = (url) => {
    return url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
};

const clearInputFields = () => {
    document.getElementById("inputSiteLink").value = "";
    document.getElementById("inputSiteName").value = "";
    document.getElementById("error").innerHTML = "";
    document.getElementById("erro").innerHTML = "";
};

// Document ready function
$(document).ready(function () {
    $('.total-container').fadeIn();
    initializeSettings();
    updateSites();
    setupEventListeners();
});

// Initialize settings based on Lockr data
const initializeSettings = () => {
    document.getElementById("notification").checked = Lockr.get('notificationAlert') || false;
    document.getElementById("audioAlert").checked = Lockr.get('audioAlert') || false;
};

// Setup event listeners for buttons and other elements
const setupEventListeners = () => {
    $("#modalClose").click(clearInputFields);
    
    $("#addSiteButton").click((event) => {
        event.preventDefault();
        saAddSite();
    });

    $('.content').on('click', '.delete', handleDelete);
    $('.content').on('click', 'a.siteLink', handleSiteLinkClick);
    $('#video-gallery').click(handleVideoGalleryClick);
    $('#urlClick').click(handleUrlClick);
    $('.time-button').click(handleTimeButtonClick);
    $("#notification").click(handleNotificationClick);
    $("#audioAlert").click(handleAudioAlertClick);
};

// Handle delete button click
const handleDelete = function () {
    const tabLink = $(this).attr('data-name');
    const tab = $(this).attr('data-tab');
    
    Swal.fire({
        html: "<p style='font-family:Product Sans; letter-spacing:1px;'>Are you sure to delete this website?</p>",
        background: "#353535",
        color: "white",
        confirmButtonText: "Delete",
        showCancelButton: true,
        animation: "slide-from-top",
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            $(this).remove();
            deleteTab(tab, tabLink);
        }
    });
};

// Handle site link click
const handleSiteLinkClick = function () {
    const tab = $(this).attr('data-link');
    OpenInNew(min, tab);
};

// Handle video gallery click
const handleVideoGalleryClick = function () {
    if (count == 0) {
        OpenInNew(min, tab, "video");
        count = 1;
    }
};

// Handle URL click
const handleUrlClick = function () {
    if (isUrlValid()) {
        if (count == 0) {
            customUrl();
            count = 1;
        }
    } else {
        Swal.fire({
            html: "<p style='font-family:Product Sans; letter-spacing:1px;'>Please enter a valid website URL!</p>",
            background: "#353535",
            color: "white",
            icon: "error",
        });
    }
};

// Handle time button click
const handleTimeButtonClick = function () {
    $(".time-button").removeClass("clicked");
    $(this).addClass("clicked");
};

// Handle notification click
const handleNotificationClick = function () {
    Lockr.set('notificationAlert', $(this).is(':checked'));
};

// Handle audio alert click
const handleAudioAlertClick = function () {
    Lockr.set('audioAlert', $(this).is(':checked'));
};

// Function to update sites
const updateSites = () => {
    $(".rig.columns-6.websites").append(`
        <a data-toggle='modal1' onclick='saAddSite()' data-target='#mm1' class='addCustom'>
            <li class='outbound-link'>
                <img id='Add Site' src='assets/plus.png' onclick='saAddSite()'>
                <p>Add Site</p>
            </li>
        </a>`);

    // Add default sites
    const sites = [
        ["Reddit", "Reddit"],
        ["Facebook", "Facebook"],
        ["YouTube", "YouTube"],
        ["Instagram", "Instagram"],
        ["Netflix", "Netflix"]
    ];

    sites.forEach(([siteName, siteLabel]) => {
        const imgSrc = getSiteImage(siteName);

        $.ajax({
            type: 'HEAD',
            url: imgSrc,
            success: function () {
                $('.rig.columns-6.websites').append(`
                    <a class='siteLink' data-link='http://${siteName.toLowerCase()}.com' target='_blank'>
                        <li class='outbound-link'>
                            <img id='${siteName}' src='${imgSrc}'>
                            <p>${siteLabel}</p>
                        </li>
                    </a>`);
            },
            error: function () {
                $('.rig.columns-6.websites').append(`
                    <a class='siteLink' data-link='http://${siteName.toLowerCase()}.com' target='_blank'>
                        <li class='outbound-link'>
                            <img id='${siteName}' src='assets/web.png'>
                            <p>${siteLabel}</p>
                        </li>
                    </a>`);
            }
        });
    });

    // Add custom sites from Lockr
    if (Lockr.get('customSites')) {
        Lockr.get('customSites').forEach(([siteName, siteLink]) => {
            addGridElement(siteName, siteLink);
        });
    }
};

// Function to get site image
const getSiteImage = (siteName) => {
    switch (siteName) {
        case 'YouTube': return 'assets/youtube.png';
        case 'Netflix': return 'assets/netflix.png';
        case 'Facebook': return 'assets/facebook.png';
        case 'Instagram': return 'assets/instagram.png';
        case 'Reddit': return 'assets/reddit.png';
        default: return `https://logo.clearbit.com/${siteName.toLowerCase()}.com`;
    }
};

// Function to add grid element
const addGridElement = (siteLabel, siteLink) => {
    let newLabel = siteLabel.replace(/\s+/g, '').toLowerCase();
    let newSiteLabel = siteLabel.substring(0, 14).replace(/\s/g, '&nbsp;');

    $.ajax({
        type: 'HEAD',
        url: `https://logo.clearbit.com/${newLabel}.com`,
        success: function () {
            $('.rig.columns-6.websites').append(`
                <a class='siteLink' data-link='${siteLink}' target='_blank'>
                    <li class='outbound-link'>
                        <img id='${siteLabel}' src='https://logo.clearbit.com/${newLabel}.com'>
                        <p>${newSiteLabel}</p>
                    </li>
                </a>`);
        },
        error: function () {
            $('.rig.columns-6.websites').append(`
                <a class='siteLink' data-link='${siteLink}' target='_blank'>
                    <li class='outbound-link'>
                        <img id='${siteLabel}' src='assets/web.png'>
                        <p>${newSiteLabel}</p>
                    </li>
                </a>`);
        }
    });
};

// Function to delete tab
const deleteTab = (tab, tabLink) => {
    $("[data-link='" + tabLink + "']").hide();
    Lockr.srem('customSites', [tab, tabLink]);

    const items = Lockr.get('customSites');
    const index = items.findIndex(item => item[0] === tab);
    if (index > -1) {
        items.splice(index, 1);
        Lockr.set('customSites', items);
    }
};

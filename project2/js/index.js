



/*       gif-finder below for reference to get started
// 1
window.onload = (e) => { document.querySelector("#search").onclick = searchButtonClicked };

// 2
let displayTerm = "";

// 3
function searchButtonClicked() {
    console.log("searchButtonClicked() called");

    // Set URL and API key.
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
    const GIPHY_KEY = "dc6zaTOxFJmzC";
    let url = GIPHY_URL + "api_key=" + GIPHY_KEY;

    // Get and format the search term.
    let term = document.querySelector("#searchterm").value.trim();
    displayTerm = term;
    term = encodeURIComponent(term);
    if (term.length < 1) return;

    // Get the limit and put it all in the url.
    let limit = document.querySelector("#limit").value;
    url += "&q=" + term + "&limit=" + limit;

    // Update UI.
    document.querySelector("#status").style.display = 'block';
    console.log(url);

    getData(url);
}

function getData(url) {
    // Setup an XMLHTTPRequest.
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;

    // Connect and send request.
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    let xhr = e.target;
    console.log(xhr.responseText);

    // Parse response.
    let obj = JSON.parse(xhr.responseText);

    // Return early if no results found.
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#content").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return;
    }

    // Start interpreting results.
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "<p><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";

    // Loop through and interpret result entries.
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        // Get URLs to GIF.
        let smallURL = result.images.fixed_width_downsampled.url;
        if (!smallURL) smallURL = "images/no-image-found.png";
        let url = result.url;

        // Make a div for this result.
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}'/><span><a target='_blank' href='${url}'>View on Giphy</a></span>Rating: ${result.rating.toUpperCase()}</div>`;

        // Add it to bigString.
        bigString += line;
    }

    // Add the results to the html.
    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#status").style.display = 'none';
}

function dataError(e) {
    console.log("An error occurred");
}
*/
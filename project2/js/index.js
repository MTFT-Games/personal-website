// Yes, this is here for anyone to take or mess with and it should be in a backend app not exposed in the frontend. Thats not doable at the moment so for now just dont screw with it please.
const personalKey = 'pk_3POMJ8BNYN8ZH0IXBEIUS1VJ9W8FZWXV';

let tasksSection;
let apiCounter;
let settings;
let currentRequest;
let loadedTasks = [];

// On page load, set references to various elements.
window.onload = (e) => {
    tasksSection = document.querySelector('#tasks');
    apiCounter = document.querySelector('#apiremaining');
    settings = {
        view:document.querySelector('#view'),
        subtasks:document.querySelector('#subtasks'),
        group:document.querySelector('#group'),
        sort:document.querySelector('#sort')
    }
}

// Configures and sends a request for all tasks from the workspace the event source is in.
function GetWorkspaceTasks(target) {
    // Show loading bar.
    tasksSection.innerHTML = '<img class="loading" src="media/acurate-loading-bar.gif" alt="loading">';

    // Configure request.
    currentRequest = {
        page:0,
        type:'workspaceTasks',
        id:target.parentNode.dataset.id
    }

    // Clear stored tasks to make way for those requested.
    loadedTasks = [];

    Request();
}


// Sends a request according to the configured currentRequest.
function Request() {
    let url;
    let callback;

    // Determine request type and assemble url from currentRequest.
    switch (currentRequest.type) {
        case 'workspaceTasks':
            url = 'team/' + currentRequest.id + '/task?page=' + currentRequest.page + '&reverse=true&subtasks=true';
            callback = TasksLoaded;
            break;
    
        // TODO: Other request types when needed.

        default:
            let errormsg = "Invalid request type " + currentRequest.type + " encountered.";
            console.error(errormsg);
            ErrorPopup(errormsg);
            break;
    }

    // Create and send request.
    let xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.open("GET", 'https://noahemke.com/cors-anywhere/api.clickup.com/api/v2/' + url);
    xhr.setRequestHeader('Authorization', personalKey);
    xhr.send();
}

// Callback for a request for tasks being ready. 
// Handles the requested tasks and requests more if paged.
function TasksLoaded(e) {
    // Parse requested tasks.
    let tasks = JSON.parse(e.target.responseText)["tasks"];
    loadedTasks.push.apply(loadedTasks, tasks);

    // Request the next page if the response was a full page.
    if (tasks.length == 100) {
        currentRequest.page++;
        Request();
    }else { // Otherwise start displaying them.
        DisplayTasks();
    }

    // Get and show remaining api limit.
    apiCounter.innerHTML = "API usage left this minute: " + e.target.getResponseHeader('x-ratelimit-remaining') + "/100";
}

// Formats tasks and displays them according to settings.
function DisplayTasks() {
    // DEBUG: console.log(loadedTasks);
    
    // Sort out subtasks for later formatting if necessary.
    let subtasks;
    let tasks;
    if (settings.subtasks.value != "separate") {
        subtasks = loadedTasks.filter(e => e.parent != null);
        tasks = loadedTasks.filter(e => e.parent == null)
    }else {
        tasks = loadedTasks;
    }
    
    // for status sort by status and find biggest status index to know how many groups to filter out. then sort by sort, then filter
    // for priority sort by sort then filter into 5 priorities
    // for tag sort by sort then add each to its group 1 by 1 creating it if its not made
    // for due date sort by sort then filter for each date range

    // Sort and group tasks based on settings.
    let groups = [];
    switch (settings.group.value) {
        case "status":
            // Sort to find the biggest status index.
            tasks.sort(StatusSort);
            let numGroups = tasks[tasks.length - 1].status.orderindex;

            // Sort according to setting.
            switch (settings.sort.value) {
                case "duedate":
                    tasks.sort(DueSort);
                    break;
                case "name":
                    tasks.sort(NameSort);
                    break;
                case "priority":
                    tasks.sort(PrioritySort);
                    break;
                case "created":
                    tasks.sort(CreatedSort);
                    break;
                default:
                    break;
            }

            // Filter into groups.
            for (let i = 0; i <= numGroups; i++) {
                let groupTasks = tasks.filter(e => e.status.orderindex == i);
                if (groupTasks.length > 0) {
                    groups.push({
                        name:groupTasks[0].status.status,
                        color:groupTasks[0].status.color,
                        tasks:groupTasks
                    });
                }
            }
            break;
    
            // TODO: Sort and group for other groupings.

        default:
            break;
    }
    console.log(groups);


    // TODO: Make and display html of the sorted groups depending on view
    
    // Add subtasks to their parent task if needed.
    if (settings.subtasks.value != "separate") {
        // TODO: add subtasks to their parent task
    }

    // Remove loading bar once done.
    tasksSection.querySelector('.loading').remove();
}

// Sorting function for sorting tasks by status.
function StatusSort(a, b) {
    return a.status.orderindex - b.status.orderindex;
}

// Sorting function for sorting tasks by due date.
function DueSort(a, b) {
    if (a.due_date == null) {
        return 1;
    }
    if (b.due_date == null) {
        return -1;
    }
    return a.due_date - b.due_date;
}

// Sorting function for sorting tasks by name.
function NameSort(a, b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if (a < b) {return -1;}
    if (a > b) {return 1;}
    return 0;
}

// Sorting function for sorting tasks by priority.
function PrioritySort(a, b) {
    // Sort order: null id:4 id:3 id:2 id:1
    if (a.priority == null) {
        a = 5;
    }else {
        a = a.priority.id;
    }
    if (b.priority == null) {
        b = 5;
    }else {
        b = b.priority.id;
    }
    return b - a;
}

// Sorting function for sorting tasks by creation date.
function CreatedSort(a, b) {
    return a.date_created - b.date_created;
}

// Creates and displays a neat error to the user.
function ErrorPopup(msg) {
    let popup = document.createElement('div');
    popup.className = "errorpopup";
    let common = document.createElement('h1');
    common.innerHTML = "An error has ocurred in this apps javascript. You may need to refresh the page for a clean start or you can dismiss this message and see if the app recovers. If this is a repeating issue, please report the issue with the following error to noahremke@gmail.com.";
    popup.appendChild(common);
    let errortxt = document.createElement('p');
    errortxt.innerHTML = msg;
    popup.appendChild(errortxt);
    let button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = "OK";
    button.onclick = DismissMsg;
    popup.appendChild(button);
    document.body.appendChild(popup);
}

// Removes the error popup the event target is part of.
function DismissMsg(e) {
    e.target.parentNode.remove();
}
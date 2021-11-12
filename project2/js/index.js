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

function GetSpaces(target) {
    /* planning 
    if value is unloaded add div for spaces and put loading then format request from parent for  workspace id and request with callback to new function that uses the request id to get back to the workspace div change button value, add results and remove loading
    if loaded change to show and make div visible
    if shown change to loaded and hide the div
    */
}


// Sends a request according to the configured currentRequest.
function Request() {
    let url;
    let callback;

    // Determine request type and assemble url from currentRequest.
    switch (currentRequest.type) {
        case 'workspaceTasks':
            url = 'team/' + currentRequest.id + '/task?page=' + currentRequest.page + '&reverse=true&subtasks=true&include_closed=true';
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
    if (loadedTasks.length < 1) {
        return;
    }
    // clear with loading bar.
    tasksSection.innerHTML = '<img class="loading" src="media/acurate-loading-bar.gif" alt="loading">';

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
    
    // Sort and group tasks based on settings.
    let groups = [];
    switch (settings.group.value) {
        case "status":{
            // Sort to find the biggest status index.
            // TODO: This way of getting the groups is flawed and should work more like tags then order them by type then index
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
        }
        case "priority":{
            // Sort according to setting.
            switch (settings.sort.value) {
                case "duedate":
                    tasks.sort(DueSort);
                    break;
                case "status":
                    tasks.sort(StatusSort);
                    break;
                case "name":
                    tasks.sort(NameSort);
                    break;
                case "created":
                    tasks.sort(CreatedSort);
                    break;
                default:
                    break;
            }

            // Filter into groups.
            let groupTasks = tasks.filter(e => e.priority == null);
            if (groupTasks.length > 0) {
                groups.push({
                    name:'none',
                    color:'#000000',
                    tasks:groupTasks
                });
            }
            for (let i = 4; i > 0; i--) {
                groupTasks = tasks.filter(e => e.priority != null && e.priority.orderindex == i);
                if (groupTasks.length > 0) {
                    groups.push({
                        name:groupTasks[0].priority.priority,
                        color:groupTasks[0].priority.color,
                        tasks:groupTasks
                    });
                }
            }
            break;
        }
        case "tag":{
            // Sort according to setting.
            switch (settings.sort.value) {
                case "duedate":
                    tasks.sort(DueSort);
                    break;
                case "status":
                    tasks.sort(StatusSort);
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
            let groupTasks = tasks.filter(e => e.tags.length == 0);
            if (groupTasks.length > 0) {
                groups.push({
                    name:'none',
                    color:'#ffffff',
                    bcolor:'#000000',
                    tasks:groupTasks
                });
            }
            // This block felt disgusting to write, heres an explanation so future me doesn't have a stroke trying to figure it out:
            tasks.forEach(task => {// For each task
                if (task.tags.length > 0) {// that has tags
                    task.tags.forEach(tag => {// Go through each tag
                        let found = false;
                        // And look through all groups for a matching one
                        for (let i = 0; i < groups.length; i++) {
                            if (groups[i].name == tag.name) {
                                // And add the task if found
                                groups[i].tasks.push(task);
                                found = true;
                                break;
                            }
                        }
                        // Otherwise make a new group for that tag if one wasnt found already
                        if (!found) {
                            groups.push({
                                name:tag.name,
                                color:tag.tag_fg,
                                bcolor:tag.tag_bg,
                                tasks:[task]
                            });
                        }
                    });
                }
            });
            break;
        }
        default:
            break;
    }
    console.log(groups);

    // TODO: Make and display html of the sorted groups depending on view
    if (settings.view.value == "board") {
        let boardView = document.createElement('ol');
        boardView.className = 'boardView';
        for (let i = 0; i < groups.length; i++) {
            let groupView = document.createElement('section');
            groupView.className = 'group';
            let groupHead = document.createElement('h3');
            groupHead.className = 'groupHead';
            groupHead.innerHTML = groups[i].name + '<span class="count">' + groups[i].tasks.length + '</span>';
            groupHead.style.borderTopColor = groups[i].color;
            // TODO: fix the colors on tag based groups
            groupView.appendChild(groupHead);
            let groupTasks = document.createElement('ol');
            groupTasks.className = 'groupTasks';
            for (const task of groups[i].tasks) {
                let li = document.createElement('li');
                li.className = 'task';
                li.id = task.id;
                // TODO: Turn loadedTasks into a dictionary so that when the task is clicked on we can just reference back to that task data to get the description and such instead of sending another request for it.
                // TODO: Add onclick for opening more info, description etc when that method is made.
                // TODO: add a status indicator
                let breadCrumbs = document.createElement('span');
                breadCrumbs.className = 'breadCrumbs';
                // TODO: Change this to search the hierarchy for whatever is marked active and get the task source from that. Otherwise changing view settings after sending any other request will screw with this. Althernitavely i could only use the current request for getting tasks since thats probably the only thing that needs it to keep track between pages but then i would have to redo the request method.
                switch (currentRequest.type) {
                    case 'workspaceTasks':
                        // TODO: Add breadcrumb for the space it came from after i add an automatic request to get and populate the spaces of a workspace before getting all the tasks for it. because tasks for some reason come with the name of the folder and list they come from but only the id of the space.
                        // Intentionaly fall through
                    case 'spaceTasks':
                        if (task.folder.name != 'hidden') {
                            breadCrumbs.innerHTML += ' > ' + task.folder.name;
                        }
                        // Intentionally fall through
                    case 'folderTasks':
                        breadCrumbs.innerHTML += ' > ' + task.list.name;
                        break;
                    default:
                        break;
                }
                li.appendChild(breadCrumbs);
                let taskName = document.createElement('h4');
                taskName.className = 'taskName';
                taskName.innerHTML = task.name;
                li.appendChild(taskName);
                if (task.assignees.length > 0) {
                    // TODO: Handle multiple assignees and no assignee
                    let assignee = document.createElement('img');
                    assignee.src = task.assignees[0].profilePicture;
                    assignee.alt = task.assignees[0].username;
                    assignee.className = 'assignee';
                    li.appendChild(assignee);
                }
                // TODO: Add priority and dates and tags

                groupTasks.appendChild(li);
            }
            groupView.appendChild(groupTasks);

            boardView.appendChild(groupView);
        }
        tasksSection.appendChild(boardView);
    }
    
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
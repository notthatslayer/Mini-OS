let zIndexCounter = 10;
const appNames = {
    notes: "Notepad",
    calc: "Calculator",
    paint: "Paint",
    browser: "Browser",
    clock: "Clock",
    terminal: "Terminal",
    files: "Files",
    calendar: "Calendar",
    settings: "Settings"
};

const runningApps = {};

function updateTaskbar() {
    const taskbar = document.getElementById("taskbarApps");
    if (!taskbar) return;

    taskbar.innerHTML = "";

    Object.keys(runningApps).forEach(id => {
        const button = document.createElement("button");
        button.className = "taskbar-app";
        button.textContent = appNames[id];

        if (runningApps[id].visible) {
            button.classList.add("active");
        }

        button.onclick = () => {
            const win = document.getElementById(id);

            if (runningApps[id].visible) {
                win.style.display = "none";
                runningApps[id].visible = false;
            } else {
                win.style.display = "block";
                win.style.zIndex = ++zIndexCounter;
                runningApps[id].visible = true;
            }

            updateTaskbar();
        };

        taskbar.appendChild(button);
    });
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (!runningApps[id]) {
        runningApps[id] = { visible: true };

        const count = Object.keys(runningApps).length;

        win.style.left = (60 + count * 30) + "px";
        win.style.top = (60 + count * 25) + "px";
    } else {
        runningApps[id].visible = true;
    }

    win.style.display = "block";
    win.style.zIndex = ++zIndexCounter;

    updateTaskbar();
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "none";

    delete runningApps[id];

    updateTaskbar();
}

function minimize(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "none";

    if (runningApps[id]) {
        runningApps[id].visible = false;
    }

    updateTaskbar();
}

function maximize(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (!win.dataset.max) {
        win.dataset.max = "1";

        win.dataset.old = JSON.stringify({
            width: win.style.width,
            height: win.style.height,
            left: win.style.left,
            top: win.style.top
        });

        win.style.left = "0";
        win.style.top = "0";
        win.style.width = "100vw";
        win.style.height = "calc(100vh - 52px)";
    } else {
        win.dataset.max = "";

        const old = JSON.parse(win.dataset.old);

        win.style.width = old.width;
        win.style.height = old.height;
        win.style.left = old.left;
        win.style.top = old.top;
    }
}

let activeWin = null;
let offsetX = 0;
let offsetY = 0;

function startDrag(e, id) {
    activeWin = document.getElementById(id);
    if (!activeWin) return;

    activeWin.style.zIndex = ++zIndexCounter;

    offsetX = e.clientX - activeWin.offsetLeft;
    offsetY = e.clientY - activeWin.offsetTop;

    document.onmousemove = drag;
    document.onmouseup = stopDrag;
}

function drag(e) {
    if (!activeWin) return;

    activeWin.style.left = (e.clientX - offsetX) + "px";
    activeWin.style.top = (e.clientY - offsetY) + "px";
}

function stopDrag() {
    activeWin = null;
    document.onmousemove = null;
    document.onmouseup = null;
}

function toggleStartMenu() {
    const menu = document.getElementById("startMenu");

    menu.style.display =
        menu.style.display === "block"
            ? "none"
            : "block";
}

document.addEventListener("click", e => {
    const menu = document.getElementById("startMenu");
    if (!menu) return;

    if (
        !menu.contains(e.target) &&
        e.target.textContent !== "⊞"
    ) {
        menu.style.display = "none";
    }
});

const startSearch = document.getElementById("startSearch");

if (startSearch) {
    startSearch.addEventListener("input", function () {
        const value = this.value.toLowerCase();

        document.querySelectorAll(".pinned div").forEach(item => {
            item.style.display =
                item.textContent.toLowerCase().includes(value)
                    ? "block"
                    : "none";
        });
    });
}

const note = document.getElementById("noteText");

if (note) {
    note.innerHTML = localStorage.getItem("note") || "";

    note.addEventListener("input", () => {
        localStorage.setItem("note", note.innerHTML);
    });
}

let expression = "";

function press(val) {
    expression += val;
    document.getElementById("display").value = expression;
}

function calc() {
    try {
        expression = Function("return " + expression)().toString();
        document.getElementById("display").value = expression;
    } catch {
        expression = "";
        document.getElementById("display").value = "Error";
    }
}

function clearCalc() {
    expression = "";
    document.getElementById("display").value = "";
}

document.addEventListener("keydown", e => {
    if ("0123456789+-*/.".includes(e.key)) {
        press(e.key);
    }

    if (e.key === "Enter") calc();
    if (e.key === "Escape") clearCalc();

    if (e.key === "Backspace") {
        expression = expression.slice(0, -1);
        document.getElementById("display").value = expression;
    }
});

let tool = "draw";

const canvas = document.getElementById("canvas");
let ctx;

if (canvas) {
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.onmousedown = e => {
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);

        canvas.onmousemove = ev => {
            ctx.globalCompositeOperation =
                tool === "erase"
                    ? "destination-out"
                    : "source-over";

            ctx.lineTo(ev.offsetX, ev.offsetY);
            ctx.stroke();
        };
    };

    canvas.onmouseup = () => {
        canvas.onmousemove = null;
    };
}

function setTool(t) {
    tool = t;
}

function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function go() {
    const q = document.getElementById("url").value.toLowerCase();
    const page = document.getElementById("page");

    if (q.includes("google")) {
        page.innerHTML = "<h2>Google</h2><p>Search Engine</p>";
    } else if (q.includes("youtube")) {
        page.innerHTML = "<h2>YouTube</h2><p>Video Platform</p>";
    } else if (q.includes("wiki")) {
        page.innerHTML = "<h2>Wikipedia</h2><p>Free Encyclopedia</p>";
    } else {
        page.innerHTML = "<center><h2>Hehe, It's not a real browser yet :') </h2></center>";
    }
}

function updateClock() {
    const now = new Date();

    if (document.getElementById("time")) {
        document.getElementById("time").innerText = now.toLocaleTimeString();
    }

    if (document.getElementById("date")) {
        document.getElementById("date").innerText = now.toDateString();
    }

    if (document.getElementById("taskTime")) {
        document.getElementById("taskTime").innerText = now.toLocaleTimeString();
    }
}

setInterval(updateClock, 1000);
updateClock();

function terminalCommand(e) {
    if (e.key !== "Enter") return;

    const input = document.getElementById("terminalInput");
    const output = document.getElementById("terminalOutput");

    const cmd = input.value.trim().toLowerCase();
    let res = "";

    const apps = {
        notes: "Notepad",
        calc: "Calculator",
        paint: "Paint",
        browser: "Browser",
        clock: "Clock",
        terminal: "Terminal",
        files: "Files",
        calendar: "Calendar",
        settings: "Settings"
    };

    if (apps[cmd]) {
        openWindow(cmd);
        res = `Opening ${apps[cmd]}...`;
    } else {
        switch (cmd) {
            case "help":
                res = "Commands: help, date, time, clear, about, open notes, open calc, open paint, open browser, open clock, open files, open calendar, open settings";
                break;

            case "date":
                res = new Date().toDateString();
                break;

            case "time":
                res = new Date().toLocaleTimeString();
                break;

            case "about":
                res = "Mini OS Project <br>Created by: Tayyaba<br> P.S. Would love to have a feedback! :)";
                break;

            case "clear":
                output.innerHTML = "";
                input.value = "";
                return;

            default:
                res = "command not found";
        }
    }

    output.innerHTML += `<div>> ${cmd}</div><div>${res}</div>`;

    output.scrollTop = output.scrollHeight;

    input.value = "";
}

const cal = document.getElementById("calendarBody");

if (cal) {
    for (let i = 1; i <= 30; i++) {
        const d = document.createElement("div");
        d.innerText = i;
        cal.appendChild(d);
    }
}

document.querySelectorAll(".window").forEach(w => {
    w.addEventListener("mousedown", () => {
        w.style.zIndex = ++zIndexCounter;
    });
});

window.addEventListener("load", () => {
    document.querySelectorAll(".window").forEach(win => {
        win.style.display = "none";
    });
});
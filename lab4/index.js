class Note {
    constructor(title, contents, color, pinned, tags, createdAt, todos, dueTo) {
        this.title = title;
        this.contents = contents;
        this.color = color;
        this.pinned = pinned;
        this.tags = tags;
        this.createdAt = createdAt;
        this.todos = todos;
        this.dueTo = dueTo;
    }

    static fromForm(formData) {
        const title = formData.get("title");
        const contents = formData.get("contents");
        const color = formData.get("color");
        const pinned = formData.get("pinned");
        const tags = formData
            .get("tags")
            .split(",")
            .filter((tag) => tag.length != 0)
            .map((tag) => tag.trim());
        const todos = formData
            .get("todos")
            .split(",")
            .filter((tag) => tag.length != 0)
            .map((tag) => tag.trim());
        const formDueTo = formData.get("due-to");
        const dueTo = formDueTo ? Date.parse(formDueTo) : undefined;

        return new Note(
            title,
            contents,
            color,
            pinned,
            tags,
            Date.now(),
            todos,
            dueTo,
        );
    }
}

let currentlyShownNotes = [];

for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("note-")) continue;

    const note = localStorage.getItem(key);
    currentlyShownNotes.push(JSON.parse(note));
}

const noteStyle = `
      width: 40%;
      margin: 2em auto;
      padding: 1em;
      border: 2px solid black;
`;

const formStyle = noteStyle;

const noteContainer = document.querySelector("#note-container");

function renderNotes() {
    currentlyShownNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (b.pinned && !a.pinned) return 1;

        return a.createdAt < b.createdAt ? -1 : 1;
    });

    for (const note of currentlyShownNotes) {
        const noteHTML = createNote(note);
        noteContainer.appendChild(noteHTML);
    }
}

function createNote(note) {
    const noteBody = document.createElement("section");
    const noteTitle = document.createElement("header");
    const noteTags = document.createElement("p");
    const noteContents = document.createElement("p");
    const noteCreatedAt = document.createElement("p");

    noteTitle.textContent = note.title;
    noteTitle.style.fontSize = "1.2em";

    if (note.tags.length != 0)
        noteTags.textContent = `Tags: ${note.tags.join(" ")}`;

    noteCreatedAt.textContent = `Created at: ${new Date(note.createdAt).toLocaleString()}`;

    noteContents.textContent = note.contents;
    noteContents.style =
        "border: 1px solid black; padding: 0.5em; background-color: white;";

    noteBody.style.backgroundColor = note.color;
    noteBody.append(
        noteTitle,
        noteTags,
        noteContents,
    );

    if (note.todos.length != 0) {
        const noteTodos = document.createElement("div");
        for (const todo of note.todos) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = todo;

            const label = document.createElement("label");
            label.htmlFor = todo;
            label.textContent = todo;

            const removeButton = document.createElement("button");
            removeButton.textContent = "X";

            const linebreak = document.createElement("br");

            removeButton.addEventListener("click", () => {
                checkbox.remove();
                label.remove();
                removeButton.remove();
                linebreak.remove();

                const todoIdx = note.todos.findIndex(t => t === todo);
                note.todos.splice(todoIdx, 1);

                localStorage.setItem(`note-${note.title}`, JSON.stringify(note));
            });

            noteTodos.append(
                checkbox,
                label,
                removeButton,
                linebreak,
            );
        }

        noteBody.appendChild(noteTodos);
    }

    if (note.dueTo) {
        const noteDueTo = document.createElement("p");
        noteDueTo.textContent = `Due to: ${new Date(note.dueTo).toLocaleString()}`;
        noteBody.appendChild(noteDueTo);
    }

    noteBody.style = `${noteStyle} background-color: ${note.color};`;

    noteBody.append(noteCreatedAt);

    return noteBody;
}

const formHtml = `
<input name="title" type="text"/>
<label for="title">Title</label>
<br>

<textarea name="contents"> </textarea>
<label for="contents">Contents</label>
<br>

<input name="tags" type="text" />
<label for="tags">Tags</label>
<br>

<input name="due-to" type="text" />
<label for="due-to">Due to</label>
<br>

<input name="todos" type="text" />
<label for="todos">Todos</label>
<br>

<input name="pinned" type="checkbox" />
<label for="pinned">Pin</label> 
<br>
`;

function createDefaultForm() {
    const form = document.createElement("form");
    form.innerHTML = formHtml;
    form.style = formStyle;

    const colorSelectors = getColorSelector();
    form.append(...colorSelectors);

    const button = document.createElement("button");
    button.innerText = "Create";
    form.appendChild(button);

    form.addEventListener("submit", () => {
        const submitter = form.getElementsByTagName("button")[0];
        const formData = new FormData(form, submitter);
        const note = Note.fromForm(formData);

        currentlyShownNotes.push(note);
        localStorage.setItem(`note-${note.title}`, JSON.stringify(note));
    });

    for (let i = 0; i < form.children.length; i++) {
        form.children.item(i).style = "margin: 0.5em 2px;";
    }

    return form;
}

function getColorSelector() {
    const defaultColors = ["seagreen", "skyblue", "fuchsia", "coral"];

    return defaultColors.flatMap((color) => {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "color";
        radio.id = color;
        radio.value = color;

        const label = document.createElement("label");
        label.htmlFor = color;

        const colorDiv = document.createElement("div");
        colorDiv.style = `display: inline-block; width: 2vw; height: 2vh; background-color: ${color}`;

        label.appendChild(colorDiv);

        return [radio, label];
    });
}

const searchBox = document.querySelector("#search-box");
searchBox.addEventListener("submit", (e) => {
    const submitter = searchBox.getElementsByTagName("button")[0];
    const formData = new FormData(searchBox, submitter);

    const tags = formData
        .get("tags")
        .split(",")
        .filter((s) => s.length !== 0);
    const title = formData.get("title");
    const color = formData.get("color");

    e.preventDefault();

    if (tags.length === 0 && title === "" && color === "") {
        currentlyShownNotes = initialNotes;
        noteContainer.innerHTML = "";
        renderNotes();
        return;
    }

    filterNotesBySearchQuery({ tags, title, color });
});

function filterNotesBySearchQuery(query) {
    function getFilter({ tags, title, color }) {
        const filters = [];
        if (tags.length !== 0)
            filters.push((note) => noteTagsOverlap(note.tags, tags));
        if (title.length !== 0) filters.push((note) => note.title === title);
        if (color.length !== 0) filters.push((note) => note.color === color);

        return (note) => filters.every((filter) => filter(note));
    }

    function noteTagsOverlap(noteTags, queryTags) {
        for (const queryTag of queryTags) {
            if (noteTags.find((tag) => tag === queryTag)) return true;
        }

        return false;
    }

    currentlyShownNotes = initialNotes.filter(getFilter(query));
    noteContainer.innerHTML = "";

    renderNotes();
}

// initial setup
renderNotes();
const initialNotes = currentlyShownNotes;

setInterval(() => {
    const messages = [];
    for (const note of initialNotes) {
        if (!note.dueTo)
            continue;

        const diff = note.dueTo - Date.now();
        if (diff <= 300_000 /* 5 minutes */) {
            messages.push(
                `Note ${note.title} is due in ${Math.floor(diff / (1000 * 60))} minutes!`,
            );
        }
    }

    if (messages.length != 0) alert(messages.join("\n"));
}, 60000);

document.body.appendChild(createDefaultForm());

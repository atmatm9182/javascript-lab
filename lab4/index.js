class Note {
    constructor(title, contents, color, pinned, tags, createdAt) {
        this.title = title;
        this.contents = contents;
        this.color = color;
        this.pinned = pinned;
        this.tags = tags;
        this.createdAt = createdAt;
    }

    static fromForm(formData) {
        const title = formData.get("title");
        const contents = formData.get("contents");
        const color = formData.get("color");
        const pinned = formData.get("pinned");
        const tags = formData.get("tags").split(",").filter(tag => tag.length != 0).map(tag => tag.trim());

        return new Note(title, contents, color, pinned, tags, Date.now());
    }
}

const notes = [];

for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("note-"))
        continue;

    const note = localStorage.getItem(key);
    notes.push(JSON.parse(note));
}

notes.sort((a, b) => {
    if (a.pinned && !b.pinned)
        return -1;
    if (b.pinned && !a.pinned)
        return 1;

    return a.createdAt < b.createdAt ? -1 : 1;
});

const noteStyle = `
    width: 40%;
    margin: 2em auto;
    padding: 1em;
    border: 2px solid black;
`;

const formStyle = noteStyle;

for (const note of notes) {
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
    noteContents.style = "border: 1px solid black; padding: 0.5em; background-color: white;";

    noteBody.style.backgroundColor = note.color;
    noteBody.append(noteTitle, noteTags, noteCreatedAt, noteContents);

    noteBody.style = `${noteStyle} background-color: ${note.color};`;

    document.body.appendChild(noteBody);
}

const formHtml = `
        <input name="title" type="text"/>
        <label for="title">Title</label>
        <br>

        <textarea name="contents"> </textarea>
        <label for="contents">Contents</label>
        <br>

        <input name="pinned" type="checkbox" />
        <label for="pinned">Pin</label> 

        <input name="tags" type="text" />
        <label for="tags">Tags</label>
        <br>
`;

function createDefaultForm() {
    const form = document.createElement("form");
    form.innerHTML = formHtml;
    form.style = formStyle;

    const colorSelectors = getColorSelector();
    form.append(...colorSelectors);

    const button = document.createElement("button");
    button.style.display = "block";
    button.innerText = "Create";
    form.appendChild(button);

    form.addEventListener("submit", () => {
        const submitter = form.getElementsByTagName("button")[0];
        const formData = new FormData(form, submitter);
        const note = Note.fromForm(formData);

        notes.push(formData);
        localStorage.setItem(`note-${note.title}`, JSON.stringify(note));
    });

    for (let i = 0; i < form.children.length; i++) {
        form.children.item(i).style = "margin: 0.5em 2px;";
    }

    return form;
}

function getColorSelector() {
    const defaultColors = ["seagreen", "skyblue", "fuchsia", "coral"];

    return defaultColors.flatMap(color => {
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

document.body.appendChild(createDefaultForm());

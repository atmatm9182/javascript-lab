class Note {
    constructor(title, contents, color, pinned, createdAt) {
        this.title = title;
        this.contents = contents;
        this.color = color;
        this.pinned = pinned;
        this.createdAt = createdAt;
    }

    static fromForm(formData) {
        const title = formData.get("title");
        const contents = formData.get("contents");
        const color = formData.get("color");
        const pinned = formData.get("pinned");

        return new Note(title, contents, color, pinned, Date.now());
    }
}

/** @type {Note[]} */
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

for (const note of notes) {
    const noteBody = document.createElement("section");
    const noteTitle = document.createElement("header");
    const noteContents = document.createElement("p");
    const noteCreatedAt = document.createElement("p");

    noteTitle.textContent = note.title;
    noteContents.textContent = note.contents;
    noteCreatedAt.textContent = new Date(note.createdAt).toLocaleString();

    noteBody.style.backgroundColor = note.color;
    noteBody.append(noteTitle, noteContents, noteCreatedAt);

    document.body.appendChild(noteBody);
}

const temp = `
        <input name="title" type="text"/>
        <label for="title">Title</label>
        <br>

        <textarea name="contents"> </textarea>
        <label for="contents">Contents</label>
        <br>

        <input name="pinned" type="checkbox" />
        <label for="pinned">Pin</label> 
        <br>

        <button>Create</button>
`;

function createDefaultForm() {
    const form = document.createElement("form");
    form.innerHTML = temp;
    form.classList.add("note-form");

    form.addEventListener("submit", () => {
        const submitter = form.getElementsByTagName("button")[0];
        const formData = new FormData(form, submitter);
        const note = Note.fromForm(formData);

        notes.push(formData);
        localStorage.setItem(`note-${note.title}`, JSON.stringify(note));

        form.reset();
    });

    return form;
}

document.body.appendChild(createDefaultForm());

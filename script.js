const newNote = document.getElementById("newNote");
const deleteNotes = document.getElementById("deleteNote");
const container = document.getElementById("container");

newNote.addEventListener('click', addNewNote);
deleteNotes.addEventListener('click', deleteAllNotes);

const INDEXDB_NAME = "notesDB";
const INDEXDB_VERSION = 1;
const STORE_NAME = "Notes";
let db = null;

let counter = 1;

function addNewNote() {

    let id = counter;

    const note = document.createElement("div");

    note.className = "note";
    note.innerHTML = `
        <div class="noteHeader">
            <div class="icons">
                <div class="icon red"></div>
                <div class="icon orange"></div>
                <div class="icon green"></div>
                <input type="hidden" class="id" value="${id}"/>
            </div>
        </div>
        <div class="noteContent">
            <textarea class="noteText"></textarea>
        </div>
    `;

    const deleteNote = note.querySelector('.red');
    deleteNote.addEventListener('click', () => {

        removeNote(id);
        note.remove();
    });

    const noteText = note.querySelector('.noteText');

    noteText.addEventListener('blur', () => {

        updateNote(id, noteText.value);
    });

    addNote(noteText.value);

    container.appendChild(note);

    counter++;
};

function deleteAllNotes() {

    const notes = document.querySelectorAll(".note");

    notes.forEach(note => {

        note.remove();
    });

    db.close();
    indexedDB.deleteDatabase(INDEXDB_NAME);
    counter = 1;
    openDB();
};

function openDB() {

    return new Promise((resolve, reject) => {

        let request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);

        request.onsuccess = (event) => {

            db = event.target.result;

            resolve();
        };

        request.onerror = (event) => {

            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                let objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

    });
}

function addNote(data){

    openDB()
        .then(() => {

            data = {"note": data};
            addData(data)
                .catch((error) => {

                    console.error("Error openDB: " + error);
                })
        })
        .catch((error) => {

            console.error("Error openDB: " + error);
        });
};

function addData(data) {
    if (!db) {

      throw new Error("La base de datos no está abierta.");
    }
  
    return new Promise((resolve, reject) => {

      let transaction = db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.add(data);

      request.onsuccess = (event) => {

        resolve();
      };
  
      request.onerror = (event) => {

        reject(event.target.error);
      };
    });
};

function updateNote(id, data) {
    if (!db) {
        throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.get(id);

        request.onsuccess = (event) => {
            const existingData = event.target.result;

            if (existingData) {

                const updatedNote = typeof data === 'string' ? data : JSON.stringify({ note: data });

                let updateRequest = objectStore.put({ id, note: updatedNote });

                updateRequest.onsuccess = (event) => {
                    resolve();
                };

                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            } else {
                reject(new Error("No se encontró la nota con el ID proporcionado."));
            }
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
function removeNote(id){

    if (!db) {

        throw new Error("La base de datos no está abierta.");
      }
    
      return new Promise((resolve, reject) => {
  
        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.delete(id);
  
        request.onsuccess = (event) => {
  
          resolve();
        };
    
        request.onerror = (event) => {
  
          reject(event.target.error);
        };
    });
}

function showNotes(){

}
const form = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const bookId = document.getElementById("bookId");
const search = document.getElementById("search");
const errorBox = document.getElementById("error");
const statusBox = document.getElementById("status");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let books = JSON.parse(localStorage.getItem("libraryBooks") || "[]");
let nextId = Math.max(0, ...books.map(book => book.id)) + 1;

function saveBooks() {
  localStorage.setItem("libraryBooks", JSON.stringify(books));
}

function showStatus(message) {
  statusBox.textContent = message;
}

function loadBooks() {
  bookList.replaceChildren();

  const query = search.value.trim().toLowerCase();

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.isbn.toLowerCase().includes(query)
  );

  if (filteredBooks.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = "No books found.";
    row.appendChild(cell);
    bookList.appendChild(row);
    return;
  }

  filteredBooks.forEach(book => {
    const row = document.createElement("tr");

    function addCell(value) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }

    addCell(book.id);
    addCell(book.title);
    addCell(book.author);
    addCell(book.isbn);
    addCell(book.quantity);

    const actions = document.createElement("td");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit";
    editButton.addEventListener("click", () => editBook(book.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";
    deleteButton.addEventListener("click", () => deleteBook(book.id));

    actions.append(editButton, deleteButton);
    row.appendChild(actions);
    bookList.appendChild(row);
  });
}

// CREATE and UPDATE
form.addEventListener("submit", event => {
  event.preventDefault();
  errorBox.textContent = "";

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const isbn = document.getElementById("isbn").value.trim();
  const quantity = Number(document.getElementById("quantity").value);

  if (!title || !author || !isbn) {
    errorBox.textContent = "Please fill in all fields.";
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    errorBox.textContent = "Quantity must be a non-negative integer.";
    return;
  }

  const duplicate = books.some(book =>
    book.isbn.toLowerCase() === isbn.toLowerCase() &&
    book.id !== Number(bookId.value)
  );

  if (duplicate) {
    errorBox.textContent = "This ISBN already exists.";
    return;
  }

  const book = {
    id: bookId.value ? Number(bookId.value) : nextId++,
    title,
    author,
    isbn,
    quantity
  };

  if (bookId.value) {
    books = books.map(existing =>
      existing.id === book.id ? book : existing
    );
    showStatus("Book updated successfully.");
  } else {
    books.push(book);
    showStatus("Book added successfully.");
  }

  saveBooks();
  resetForm();
  loadBooks();
});

// UPDATE
function editBook(id) {
  const book = books.find(book => book.id === id);
  if (!book) return;

  bookId.value = book.id;
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("isbn").value = book.isbn;
  document.getElementById("quantity").value = book.quantity;

  document.getElementById("formTitle").textContent = "Update Book";
  saveButton.textContent = "Save Changes";
  cancelButton.hidden = false;
  errorBox.textContent = "";

  form.scrollIntoView({ behavior: "smooth" });
}

// DELETE
function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book?")) return;

  books = books.filter(book => book.id !== id);

  saveBooks();

  if (Number(bookId.value) === id) {
    resetForm();
  }

  showStatus("Book deleted successfully.");
  loadBooks();
}

function resetForm() {
  form.reset();
  bookId.value = "";
  document.getElementById("quantity").value = 1;
  document.getElementById("formTitle").textContent = "Add Book";
  saveButton.textContent = "Add Book";
  cancelButton.hidden = true;
  errorBox.textContent = "";
}

cancelButton.addEventListener("click", resetForm);
search.addEventListener("input", loadBooks);

loadBooks();
let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

let initializeDBAndServer = async function () {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, function () {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

let hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
let hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
let hasStatus = (requestQuery) => {
  return requestQuery.Status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  let { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodoQuery = `
                SELECT *
                FROM
                    todo
                WHERE title LIKE '%${search_q}%',
                AND status = '${status}',
                AND priority = '${priority}';`;
      break;

    case hasPriority(request.query):
      getTodoQuery = `
                SELECT *
                FROM
                    todo
                WHERE title LIKE '%${search_q}%',
                AND priority = '${priority}';`;
      break;
    case hasStatus(request.query):
      getTodoQuery = `
                SELECT *
                FROM
                    todo
                WHERE title LIKE '%${search_q}%',
                AND status = '${status}';`;
      break;

    default:
      getTodoQuery = `
                SELECT *
                FROM
                    todo
                WHERE title LIKE '%${search_q}%';`;
      data = await db.all(getTodoQuery);
      response.send(data);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let getTodoQuery = `
        SELECT *
        FROM
            todo
        WHERE
            todo_id = '${todoId}';`;
  let statusQuery = await db.all(getTodoQuery);
  response.send(statusQuery);
});

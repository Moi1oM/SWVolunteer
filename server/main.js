const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const cors = require("cors");

const app = express();
const port = 3000;

// CORS 미들웨어를 전역으로 설정
// 이렇게 설정하면 모든 도메인에서 이 서버로의 요청이 허용됩니다.
app.use(cors());

// Body-parser middleware 사용 설정
app.use(bodyParser.json());

// 인메모리 데이터베이스 역할을 할 배열
const posts = [];

// SQLite 데이터베이스 연결
const db = new sqlite3.Database("sqlite3.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT, content TEXT, img_src TEXT)"
    );
  }
});

// POST 요청 처리
app.post("/posts", (req, res) => {
  const { title, content, img_src } = req.body;

  if (!title || !content || !img_src) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  const query = "INSERT INTO posts (title, content, img_src) VALUES (?, ?, ?)";
  db.run(query, [title, content, img_src], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      const newPost = { id: this.lastID, title, content, img_src };
      posts.push(newPost);
      res.status(201).json(newPost);
    }
  });
});

app.get("/posts/all", (req, res) => {
  // 캐시된 데이터가 있다면 바로 반환
  if (posts.length > 0) {
    return res.status(200).json(posts);
  }

  // 캐시된 데이터가 없다면 DB에서 불러온 후 캐시
  const query = "SELECT * FROM posts";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      rows.reverse();
      // DB에서 불러온 데이터를 캐시에 저장
      posts.push(...rows);
      res.status(200).json(rows);
    }
  });
});

app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM posts WHERE id = ?";
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.status(200).json(row);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });
});

// 게시글 삭제 라우트
app.delete("/posts/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM posts WHERE id = ?";
  db.run(query, [id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Post not found" });
    } else {
      // 배열에서 삭제된 포스트 제거
      const index = posts.findIndex((post) => post.id == id);
      if (index !== -1) posts.splice(index, 1);
      res.status(200).json({ message: "Post deleted successfully" });
    }
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

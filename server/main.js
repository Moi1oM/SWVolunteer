const express = require("express");
//변수에 익스프레스를 실행해서 담았음
const app = express();
const PORT = 4000;
//터미널에 node main.js를 입력하면 4000번 포트로 서버가 열린다.
app.listen(PORT);
//localhost:4000으로 로딩하면 페이지가 뜬다.
//라우터를 연결해 주지 않아서 Cannot Get /이 나오는 게 정상 (인덱스(루트)를 가지고 올 수 없음)

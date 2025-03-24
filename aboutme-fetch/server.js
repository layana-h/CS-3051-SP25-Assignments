import express from "express";
import path from "path";

const app = express();
const port = 3000;

app.listen(port, function() {
  console.log("App server is running on port", port);
  console.log("to end press Ctrl + C");
});

app.get('/', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'aboutme-fetch.html'));
});

app.get('/home.html', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'home.html'));
});

app.get('/likes.html', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'likes.html'));
});

app.get('/places.html', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'places.html'));
});

app.use(express.static('.'));
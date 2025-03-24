import express from "express";
import path from "path";

const app = express();
const port = 3000;

app.listen(port, function() {
    console.log("App server is running on port", port);
    console.log("to end press Ctrl + C");
});

const images = [
    "/images/sky1.png",
    "/images/sky2.png",
    "/images/sky3.png",
    "/images/sky4.png",
];

app.use(express.static("."));

app.get("/", (req, res) => {
    console.info("Serving random.html");
    res.sendFile(path.join(process.cwd(), "random.html"));
});

app.get("/random-image", (req, res) => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.json({ url: randomImage });
});
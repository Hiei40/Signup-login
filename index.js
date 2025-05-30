const { json } = require("body-parser");

const express = require("express");
const { readFileSync, createReadStream } = require("fs");
const app = express();
const port = 3000;
let isLogged = true;
const auth = (req, res, next) => {
    if (isLogged) {
        next();
    }
    else {

        return res.status(401).json({ message: "not authorized" });

    }

}
app.get("/products", (res, req, next) => {
    if (isLogged) {

        res.json({ message: "products" });

    } else {

        res.status(404).json({ message: "not Authorized" });


    }

})

app.get("/", (req, res) => {
    //  res.setHeader('Content-Type','text/plain')
    // return res.status(201).send({message:"Home Page"});
    //res.json(JSON.stringify({message:"yyegy<script>xss attack</script>"}))
    //   res.send("hello world");
    //res.download(path.resolve("./data.txt"))
res.json(JSON.stringify({message:"ygyegy<script>"}))

});

app.get("/about", (req, res, next) => {

    res.send("<h1>Aboutpage</h1>");
});


app.get("/blog", (req, res, next) => {
    const readfilestream = createReadStream(path.resolve("./data.txt"),
        { encoding: "utf-8" },)
    readfilestream.pipe(res);
    readfilestream.on("data", (chunk) => {
        res.write(chunk);
    })
    readfilestream.on('end', () => {
        res.end();
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    readFileSync.pipe(res);
    res.send("<h1>Aboutpage</h1>");
});

app.all("*/dummy", (req, res, next) => {
    res.status(404).json({ message: "Invalid routing" });
}



);

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

const express = require("express");
var fs = require('fs');
var url = require('url');
const app = express();
const path = require("path");
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, 'views');
const cheminFichier ="C:/Users/Matthieu/Desktop/Web/devph/docs/";

app.get("/", (req, res) => {
  var q = url.parse(req.url, true).query;
  //changer le chemin de fichier vers celui que tu veux lire
  
fs.readdir(cheminFichier, (err, docs) =>{
    if(err)
    {
      res.statusCode = 404;
    res.end("404 - page not found");
    }
    else
    {
      res.statusCode = 200;
      docs = docs.map(element =>{ return element.toLowerCase();});
      docs = docs.filter(word=> word.includes(q.name.toLowerCase()));
      res.render("template", {docs: docs});
    }
  })

})

app.get("/opendoc", (req, res) =>{
  res.statusCode = 200;
  var q = url.parse(req.url, true).query;
  //pareil pour l'envoi du fichier
  //res.sendFile("/var/www/devph/docs/" + q.name);
  res.sendFile(cheminFichier + q.name);
})

app.get("/folderView", (req, res) =>{
  res.statusCode=200;
  //var q = ;

  const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  
})

app.use((req, res) => {
    res.statusCode = 404;
    res.end("404 - page not found");
});

app.listen(3000, () => {

    console.log("Application started on port 3000");
});




 


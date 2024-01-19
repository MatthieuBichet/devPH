const express = require("express");
var fsp = require('fs/promises');
var url = require('url');
const app = express();
const path = require("path");
const { get } = require("http");
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, 'views');
const cheminFichier ="C:/Users/Matthieu/Desktop/Web/devph/docs/";

app.get("/", (req, res) => {
  
  var q = url.parse(req.url, true).query;
try{
  //array des dossiers traités
  var folderPaths = new Array();
  //array des fichiers traités
  var docLib = new Array();

  var docs = getFiles(cheminFichier, q);            //récup des fichiers async
  var folders = getFolders(cheminFichier, q);       //récup des dossiers async
  docs.then(function(docsResult)
  {
    folders.then(function(folderResult)
    {
      for(const folder of folderResult){
      folderPaths.push(folder.path + (folder.name));
    }
    for(const doc of docsResult)
    {
      docLib.push(doc.name);
      docLib = docLib.map(word =>{return word.toLowerCase();});
      docLib = docLib.filter(word=> word.includes(q.name.toLowerCase()));
    }
    //verifier que la query soit non nulle
  res.render("template", {docs: docLib, folders: folderPaths});
  res.statusCode = 200;
  });
  });



  }
catch(error)
  {
    console.log(error.toString());
    res.end(error);
    res.statusCode = 404;
  }




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

  
})



app.use((req, res) => {
    res.statusCode = 404;
    res.end("404 - page not found");
});

app.listen(3000, () => {

    console.log("Application started on port 3000");
});



/*const getFileList = async (dirName) => {
  let files = [];
  const items = fs.readdir(dirName, { withFileTypes: true });

  for (const item of items) {
      if (item.isDirectory()) {
          files = [
              ...files,
              ...(await getFileList(`${dirName}/${item.name}`)),
          ];
      } else {
          files.push(`${dirName}/${item.name}`);
      }
  }

  return files;
};*/


async function getFiles(dir, q) {
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((docs) =>{
  docs = docs.filter(dirent => dirent.isFile());
  return docs;
})
}

async function getFolders(dir, q){
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((folders) =>{
    folders = folders.filter(dirent => dirent.isDirectory());
    return folders;
  })
  }

 


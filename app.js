const express = require("express");
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";
const config = require('config');
var fsp = require('fs/promises');
var url = require('url');
const app = express();
const path = require("path");
const { get } = require("http");
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, 'views');
const { platform } = process;
const locale = path[platform === `win32` ? `win32` : `posix`];


//cheminFichier = variable de base des documents
var cheminFichier = config.get("cheminFichier");
var cheminFichierNor = cheminFichier.split(path.sep).join(locale.sep);


var docsPR = [];    //dirent array des fichiers du système de docs      
var foldersPR = []; //dirent array des dossiers du système de docs
var folderLib =[];  //string array des noms de dossier du système de docs
var docLib =[];     //string array des noms de fichiers du sytème de docs
var extList =[];    //list des extensions
extList.push("off");
initDB();

app.get("", (req, res) => {
//gestion des requêtes de recherche  

//récupération des paramètres de recherche
var queryName = url.parse(req.url, true).query.name;
var queryFolder = url.parse(req.url, true).query.folder;
var queryExt = url.parse(req.url, true).query.ext;
//variables de travail
var readFolder = folderLib; //array des dossiers manipulable
var readDocsPR =[];         //array des fichiers manipulable

//filtrage via paramètre de dossier / nom de fichier
try{
    //recherche globale ou par fichier(sous fichier)
    if(queryFolder != cheminFichierNor && typeof queryFolder ==='string')
    {
        readDocsPR = docsPR;
        readDocsPR = readDocsPR.filter(el => el.path == queryFolder);
    }
    else
    {
      readDocsPR = docsPR;

    }
    //filtrage par nom de fichier
    if(typeof queryName ==='string')
    {
      //var nameLowerCase = readDocsPR.name.toLowerCase();
      readDocsPR = readDocsPR.filter(word=> word.name.toLowerCase().includes(queryName.toLowerCase()));

    }
    if(typeof queryExt ==='string' && queryExt != "off")
    {
      readDocsPR = readDocsPR.filter(word => path.extname(word.name).toLowerCase().includes(queryExt));
    }
    //envoi des résultats de recherche
    res.render("template", {docs: readDocsPR, folders: readFolder, nameSearch: queryName, folderSearch: queryFolder, exts: extList, extSearch: queryExt});
    res.statusCode = 200;

    }
catch(error)
   {
    console.log(error.toString());
    res.end(error);
    res.statusCode = 404;
  }
})




//requête d'ouverture de fichier
app.get("/opendoc", (req, res) =>{
  res.statusCode = 200;
  var q = url.parse(req.url, true).query;
  if(q.path.charAt(q.path.length-1)!=locale.sep)
        {
          q.path += locale.sep;
        }
  res.sendFile(q.path + q.name);
})

/*app.get("/folderView", (req, res) =>{
  res.statusCode=200;
  //var q = ;

  
})*/

//initialisation de la librairie de fichiers / noms de dossiers
function initDB()
{
  folderLib.length=0;
  docLib.length=0;
  //requêtes asynchrones via fs.readdir
  var docs = getFiles(cheminFichier);           
  var folders = getFolders(cheminFichier);
  
  //attente de la réponse
  docs.then(function(docsResult)
  {
    folders.then(function(folderResult)
    {
      //copie des libraires en variables accessibles
      docsPR = docsResult;
      foldersPR = folderResult;
      //ajout du root à la liste
      folderLib.push(cheminFichierNor);
      for(const folder of folderResult)
      {
        //gestion des path win / posix
        folder.path = folder.path.split(path.sep).join(locale.sep);
        if(folder.path.charAt(folder.path.length-1)!=locale.sep)
        {
          folder.path += locale.sep;
        }
        folderLib.push(path.join(folder.path + (folder.name)));
      }
    //complétion des libraires de noms
    for(const doc of docsResult)
    {
      docLib.push(doc.name);
    }
    for(const doc of docsPR)
    {
      doc.path = doc.path.split(path.sep).join(locale.sep);
      extList.indexOf(path.extname(doc.name)) === -1 ? extList.push(path.extname(doc.name).toLowerCase()): null;
    }
    docLib = docLib.map(word =>{return word.toLowerCase();});
    
  });
});
}

//requête d'actualisation de la liste des fichiers
app.get("/refresh", (req, res)=>{
  initDB();
  res.redirect("/");
})

//gestion d'erreur
app.use((req, res) => {
    res.statusCode = 404;
    res.end("404 - page not found");
});

//ouverture du serveur au port 3000 par défaut TODO: ajouter si nécessaire la gestion du port dans le fichier de config
app.listen(3000, () => {

    console.log("Application started on port 3000");
});

//fonction asynchrone de recherche des fichiers de manière récursive
async function getFiles(dir) {
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((recherche) =>{
  //filtrage par type : fichier
  recherche = recherche.filter(dirent => dirent.isFile());
  return recherche;
})
}

//fonction asynchrone de recherche des dossier de manière récursive
async function getFolders(dir){
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((recherche) =>{
    //filtrage par type : dossierkj
    recherche = recherche.filter(dirent => dirent.isDirectory());
    return recherche;
    
  })
  }
  


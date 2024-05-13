const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/toDoListDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String

})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Pankaj"
})

const item2 = new Item({
    name: "Harsh"
})

const item3 = new Item({
    name: "Nikhilesh"
})
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
    
    Item.find({}, (err, foundItems) => {
        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log("error");
                }
                else {
                    console.log("successfully saved the items ....");
                }
            })
            res.redirect("/");

        }
        else {
            res.render("list", { listTitle: "Today", newItem: foundItems });
        }

    })


})

const listSchema = new mongoose.Schema({

    name: String,
    items: [itemsSchema]

})


const List = mongoose.model("List", listSchema);







app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
   
    List.findOne({ name: customListName }, (err, foundList) => {

        if (!err) {
           
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                 console.log("does not exist.......");
                res.redirect(`/${customListName}`);
            }
            else {
                console.log("it already exists.........");

                res.render("list", { listTitle: foundList.name, newItem: foundList.items });

            }
        }


    })
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.post("/delete", (req, res) => {
    
    console.log(req.body.check);
    const checkedItemId = req.body.check;
    const listName = req.body.listName;

    if(listName==="Today"){

        Item.findByIdAndRemove(checkedItemId, (err) => {

            if (err) {
                console.log("there is error...");
            }
            else {
                console.log("deleted successfully ......");
                res.redirect("/");
            }
        })

    }
    else {
        
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId} } },(err,foundList)=>{
                 if(!err){
                      res.redirect(`/${listName}`);
                 }
        })

    }

   


})

app.post("/", (req, res) => {
    const itemName = req.body.newItem;

    const listName = req.body.list;

    

    const newItem = new Item({
        name: itemName
    })

    if(listName=="Today"){
          newItem.save();
          res.redirect("/");
    }
    else {
        
        List.findOne({name:listName},(err,foundList)=>{
                 foundList.items.push(newItem);
                 foundList.save();
                 res.redirect(`/${listName}`);
        })

    }

})

app.listen(3001, () => {
    console.log("listening at 3001");
})

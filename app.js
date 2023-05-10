const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//mongoose connection
main().catch(function(err){
    console.log(err)
});

async function main(){
    await mongoose.connect("mongodb+srv://arihantkapoor6:Qwer1234@cluster0.e74rthu.mongodb.net/todolistDB");
}


const itemsSchema = {
    name: String
};

const workItems = [];
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Buy Food"
});
const item2 = new Item({
    name: "Cook Food"
});

const item3 = new Item({
    name: "Eat Food"
});

const defaultItems = [item1,item2,item3];

const listSchema={
    name: String,
    items: [itemsSchema]
  };
   
const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else{
            res.render("list",{ListTitle: "Today", newListItems: foundItems});
        }
    })
    .catch(function(err){
        console.log(err);
    });
});

app.get("/:listName",function(req,res){
    const listName = _.capitalize(req.params.listName);

   List.findOne({name: listName})
   .then(function(foundList){
    if(!foundList){
        const list = new List({
            name: listName,
            items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
    }
    else{
        res.render("list",{ListTitle: foundList.name, newListItems: foundList.items});
    }
   })
   .catch(function(err){
    console.log(err);
   });
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});


app.post("/delete",function(req,res){
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndDelete(checkItemId)
        .then(function(){
                console.log("Deleted successfully");
                res.redirect("/");
        }).
        catch(function(err){
            if(err) console.log(err);
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull : {items: {_id: checkItemId}}})
        .then(function(){
            console.log("Deleted Successfully");
            res.redirect("/" + listName);
        })
        .catch(function(err){
            console.log(err);
        });
    }
})


app.listen( process.env.PORT || 3000 , function(){
    console.log("server is running at port 3000");
});
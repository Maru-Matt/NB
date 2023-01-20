const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var _ = require('lodash');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/NBDB", {useNewUrlParser: true});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = {
    name: String
}
const Item  = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: 'Welcome to your Todo list'
})
const item2 = new Item({
    name: 'Hit the "+" to add a new task'
})
const item3 = new Item({
    name: 'Hit the delete button to delete a task'
})
const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    item: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get('/', function(req, res) {
    Item.find({}, function(err, foundList) {
        if(!err){
            if(foundList.length === 0){
                Item.insertMany(defaultItems)
                res.render("list", {listTitle: "Today", newListItems: defaultItems})
            }
            res.render('list', {listTitle: "Today", newListItems: foundList})
        }
    })
})

app.post('/', function(req, res) {
    const newItem = req.body.item;
    const listName = req.body.list;
    const item = new Item ({
        name : newItem
    })
    if(listName === 'Today'){
        item.save();
        res.redirect('/');
    } else{
        List.findOne({name: listName}, function(err, foundList){
            if(!err){
                foundList.item.push(item);
                foundList.save();
                res.redirect('/' + listName);
            }
        })
    }

})

app.post('/delete', function(req, res) {
    const deleteItem = req.body.checkbox;
    const listName = req.body.listName;
    console.log("qqqqqqq");
    if (listName === "Today"){
        Item.deleteOne({name: deleteItem}, function(err, item){
            console.log("qqqqqqq" + item);
            if(!err){
                res.redirect('/');
            }
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {item: {name: deleteItem}}}, function(err){
            if(!err){
                console.log("Deleted!")
                res.redirect('/' + listName);
            }
        })
    }
})

app.get('/:customList', function(req, res){
    const listName = req.params.customList
    List.findOne({name: listName}, function(err, foundList){
        if(!err){
            if(!foundList){
                
                const newList = List ({
                    name: listName,
                    item: defaultItems
                })
                newList.save();
                res.redirect('/' + listName);
            } else{
                
                res.render('list', {listTitle: foundList.name, newListItems: foundList.item})
            }
        }
    })
})

app.listen(3000, function(){
    console.log("server is up and running on port 3000");
})


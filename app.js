//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-paaji:1234@cluster0.cimhg.mongodb.net/todolist"
);
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const i1 = new Item({
  name: "Put your tasks here",
});
const i2 = new Item({
  name: "Type and hit + to add new task",
});
const i3 = new Item({
  name: "<-- Click this to cross task done",
});
const defaultitems = [i1, i2, i3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}).then((items) => {
    if (items.length == 0) {
      Item.insertMany(defaultitems)
        .then(() => {
          console.log("items inserted ...");
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/");
    }
    res.render("list", { listTitle: "Today", newListItems: items });
  });
});

app.post("/", function (req, res) {
  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = Item({ name: itemname });
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }).then(function (result) {
      result.items.push(item);
      result.save();
      res.redirect("/" + listname);
    });
  }
});
app.post("/remove", function (req, res) {
  const listname = req.body.listname;
  const itemid = req.body.checkbox;
  if (listname == "Today") {
    Item.findByIdAndDelete(itemid)
      .then(() => {
        console.log("item deleted");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}}).then(() =>{
      res.redirect('/'+listname)
    })
  }
});

app.get("/:listname", function (req, res) {
  const listname = _.capitalize(req.params.listname);

  List.findOne({ name: listname }).then(function (result) {
    if (result === null) {
      const list = new List({
        name: listname,
        items: defaultitems,
      });
      list.save();
      res.redirect("/" + listname);
    } else {
      res.render("list", { listTitle: listname, newListItems: result.items });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server started on port 3000");
});

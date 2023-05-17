//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://abhinya:%40Abhinya0501@cluster0.eaewmfr.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

// function connection() {
//   mongoose.set("strictQuery", false);
//   mongoose
//     .connect("mongodb://localhost:27017/todolistDB", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log("Database connected successfully");
//     })
//     .catch((err) => {
//       console.log("Database not connected successfully " + err);
//     });
// }
// connection();
const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcom to To Do List !!!",
});
const item2 = new Item({
  name: "Hit the + button to add a item .",
});
const item3 = new Item({
  name: "Hit the --> button to delete a item .",
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", async function (req, res) {
  try {
    const data = await Item.find({});
    if (data.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: data });
      console.log(data);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Successfully removed");
      })
      .catch(function (err) {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(function () {
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

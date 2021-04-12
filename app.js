// jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const _ = require("lodash");

// Now here we will use mongodb database for storing our data 
// so for that we will be mongoose ODM 
const mongoose = require('mongoose');
const { Template } = require('ejs');

// const date = require(__dirname+'/date.js');  do not use this now as we are using db
const app = express();


app.set('view engine', 'ejs');  // now here ejs is embedded javascript template for html 
// this uses view engine to set the template 
// now we have to make a folder "views" which includes our ejs template 

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'));

// let items=["cook food","buy food","bake cake"];  We will not use this now as we are using db

// let workItems=[];  not use this as using db

// we will connect to mongoose db server
mongoose.connect('mongodb+srv://admin_kapil:@cluster0.ph4p7.mongodb.net/todoListDb', {useNewUrlParser: true, useUnifiedTopology: true});
// to connect to the mongodb atlas we need to provide new string



// so now as per mongoose we will make our schema here

const itemsSchema = new mongoose.Schema({

    name: String
})


// now we make model as per schema

const Item = mongoose.model('Item',itemsSchema);


// now we add some data to db


const Item1 = new Item({
    name: "Welcome to your todolist!"
})
const Item2 = new Item({
    name: "Hit the + to add a new item"
})
const Item3 = new Item({
    name: "<--- Hit this to delete an item"
})

const defaultItems =[Item1,Item2,Item3];


// Now we will make new schema for our custom route
const ListSchema = new mongoose.Schema({
      name: String,
      items: [itemsSchema]

});

const List = mongoose.model("List", ListSchema);

// now we will add this to our db

// Item.insertMany(defaultItems,function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Saved to database successfully!");
//     }
// });

// Now here if we run this app again and again it will put the same default items many times in the db but we do not want that to happen
// So we need to check if there is already exisiting default items in the db


app.get("/", function(req, res){
    
     
//     let today = new Date();

//    // let currentDay = today.getDay();


//     let options={
//         weekday:"long",
//         day:"numeric",
//         month:"long"
//     };

//     let day= today.toLocaleDateString("en-US",options);


    // In place of this we will use module

      // let day= date();


    // switch (currentDay) {
      
        
    //         case 0: day="Sunday";
             
    //         break;
    //         case 1: day="Monday";
             
    //         break;
    
    //         case 2: day="Tuesday";
             
    //         break;
    
    //         case 3: day="Wednesday";
             
    //         break;
    
    //         case 4: day="Thrusday";
             
    //         break;
    
    //         case 5: day="Friday";
             
    //         break;

    //         case 6: day="Saturday";
             
    //         break;
    
    
    
    
    //        default:
    //         console.log("Error");
    // }




  //  res.render('list', {listTitle:"Today",Itemlist:items});   // now here the response from the server will be sent or render the list.ejs and the javascript object key set in the list.ejs 
    // here 'list'  is my list.ejs
   
    // now here render will also contain the todolist item so that we user post the new todoitem from browser to server for the post request , it will be render back to browser in form of list

    
    // now what we need is to find the or put to frontend what we have in out database  

    Item.find({},function(err, Items){   // here this {} means we want to pull all the data // Items is the response back from the database
    
    // now we need to check if Items is empty or it already has data
        
          if(Items.length === 0){
                  
            // now we need to insert the data inside our database
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Saved to database successfully!");
                }
            });
            
           // after this there is nothing we did the above line just inserted into db but not render what ever we put in db 

           // so we redirect it to show it our frontend

           res.redirect("/");


          }
          else{

                //  if there is already something in the database we need to render it to frontend

                res.render('list', {listTitle:"Today",Itemlist:Items});   // Items is the response back from db
          }
      

    });




});

// Now we want something to dynamic routing so that we can have custom different lists

// so we will use express routes for that

app.get("/:customListName", function(req, res){

     const customListName =  _.capitalize(req.params.customListName);
     // there is a problem with this is that if the user has already been to this route then it must be in database
     // and we go again to that route then this will add same data againg to DB
     // so to resolve this we need to check if there is a list already present 
     List.findOne({name: customListName}, function(err, foundList){
         if(err){
             console.log(err);
         }else{
             if(!foundList){
                // here list does not exist 

                // so create a new list

                const list = new List({
                    name: customListName,  // always provide space 
                    items: defaultItems
                });
           
                list.save();

                res.redirect("/" + customListName); // redirect to current rout
             }
             else{
                 // here list exist so just render 
                 res.render('list', {listTitle: foundList.name, Itemlist: foundList.items} )
             }
         }
     });
     // {}-->condition
     ;

});


app.post("/",function(req, res){
    
    let item = req.body.todoItem;

    // what we now is we want to add data to our database through custome routes
    // so for that
    let listName = req.body.list;

    console.log(listName);

    // if(req.body.list === "Work"){
    //     // list is the name given in ejs file to button 
    //    workItems.push(item);

    //    res.redirect("/Work");

    // }
    // else{

    //     items.push(item);

    //     res.redirect("/");  // this will redirect to home route and then go res.render 

    // }

     // but now if i post something it will give me error because workItems is delted

     // so what we need is to push the entered data by the user to the database 
    
    const userItem= new Item({
        name: item  
    })
   

    if(listName ==="Today"){
        // it means we are at home 
        // now to push to database 
        userItem.save();
        
        // now to render back whatever we save into the database to the frontend list we need to redirect

        res.redirect("/"); // ye get pe jata hai

    }
    else{
        List.findOne({name: listName}, function(err,foundList){

             if(err){
                 console.log(err);
             }
             else{
              foundList.items.push(userItem);
              
              foundList.save();

              res.redirect("/" + listName);  // redirect it to from where user came
             } 
        });
    }

    

});


// Now to remove or delted from the database we anothter route for that
app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;

    const listName = req.body.listName;

    // we have to check if the delete is from the home page or the different custom route page 
    if (listName === "Today") {  
       //console.log(checkedItemId);

        // Now there is some findByIdAndRemove() in mongoose for this purpose
   

        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){
            console.log(err);
            }
            else{
                console.log("Successfully Deleted Checked item!");

                // and for updating the frontend UI we need to redirect to home
                res.redirect("/");  // it will render the list with updated database

            }
        });


    }


    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if (!err){
            res.redirect("/" + listName);
          }
        });
    }
    
});



// app.get("/Work",function(req, res){
//     res.render('list',{listTitle:"Work List",Itemlist :workItems});
// });


// app.post("/work",function(req,res){
//     let item=req.body.todoItem;
//     workItems.push(item);
//     res.redirect("/Work");

// });


app.get("/about",function(req,res){
    res.render('about');
});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
//app.listen(port);








app.listen(port, function(){
    console.log("Server started successfully!");
})

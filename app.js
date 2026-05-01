// if (process.env.NODE_ENV != "production") {
//     require("dotenv").config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// // const { nextTick } = require("process");
// const ExpressError = require("./utils/ExpressError.js");
// // const { errorMonitor } = require("events");
// const session = require('express-session');
// // const MongoStore = require('connect-mongo');
// const MongoStore = require('connect-mongo').default;
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const User = require("./models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// // const MONGO_URL = ('mongodb://127.0.0.1:27017/wanderlust');
// const dbUrl = process.env.ATLASDB_URL;

// main()
//     .then(() => {
//         console.log("connected to DB");
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// async function main() {
//     await mongoose.connect(dbUrl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, "/public")));

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto: {
//         secret: process.env.SECRET,
//     },
//     touchAfter: 24 * 3600,
// });

// store.on("error", (err) => {
//     console.log("Error in mongo session store", err);
// });

// const sessionOptions = {
//     store,
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         httpOnly: true,
//     },
// }; 

// app.use((req, res, next) => {
//     res.locals.currUser = req.user;
//     next();
// });

// //HOME ROUTE
// // app.get("/", (req, res) => {
// //     res.send("hi i m root");
// // });



// app.use(session(sessionOptions));
// app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user;
//     // console.log(res.locals.success);
//     next();
// });

// // app.get("/demouser", async(req,res)=>{
// //     let fakeUser = new User({
// //         email: "student@gmail.com",
// //         username: "delta-student",
// //     });
// //     let registeredUser = await User.register(fakeUser, "helloworld");
// //     res.send(registeredUser);
// // })

// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);


// app.use((req, res, next) => {
//     next(new ExpressError(404, "page not found"));
// });

// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "something went wrong" } = err;
//     res.status(statusCode).render("error.ejs", { message });
//     // res.status(statuscode).send(message);
//     // res.send("something went wrong!");
// })

// app.listen(8080, () => {
//     console.log("server is listening to port 8080");
// });  










if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo").default ;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const dbUrl = process.env.ATLASDB_URL;
const dbUrl =
  process.env.ATLASDB_URL ||
  "mongodb+srv://siyachetana:siyachetupass@cluster0.nagl3bg.mongodb.net/myDB?retryWrites=true&w=majority";
console.log("ENV DB URL:", process.env.ATLASDB_URL);

// ================== BASIC CONFIG ==================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// ================== CONNECT DB & START SERVER ==================
async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to DB");

    // ✅ SESSION STORE
    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", (err) => {
        console.log("SESSION STORE ERROR", err);
    });

    // ✅ SESSION
    app.use(
        session({
            store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            },
        })
    );

    // ✅ PASSPORT + FLASH
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // ================== ROUTES ==================
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // ================== ERROR HANDLING ==================
    app.use((req, res, next) => {
        next(new ExpressError(404, "page not found"));
    });

    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "something went wrong" } = err;
        res.status(statusCode).render("error.ejs", { message });
    });

    // ✅ START SERVER LAST
    app.listen(8080, () => {
        console.log("server is listening on port 8080");
    });
}

main().catch((err) => console.log(err));
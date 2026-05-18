if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const User = require("./models/user"); // added

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl);

const listings = [
    {
        title: "Cozy Beachfront Cottage",
        description: "Escape to this charming beachfront cottage...",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        },
        price: 1500,
        location: "Malibu",
        country: "United States"
    },

    {
        title: "Modern Loft in Downtown",
        description: "Stay in the heart of the city...",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        },
        price: 1200,
        location: "New York City",
        country: "United States"
    },

    {
        title: "Mountain Retreat",
        description:
            "Unplug and unwind in this peaceful mountain cabin surrounded by nature.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d"
        },
        price: 1000,
        location: "Aspen",
        country: "United States"
    },

    {
        title: "Historic Villa in Tuscany",
        description:
            "Experience the charm of Tuscany in this restored villa.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
        },
        price: 2500,
        location: "Florence",
        country: "Italy"
    },

    {
        title: "Beachfront Paradise",
        description:
            "Enjoy relaxing beach views from this beautiful condo.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9"
        },
        price: 2000,
        location: "Cancun",
        country: "Mexico"
    }
];

async function initDB() {
    try {
        // delete old listings
        await Listing.deleteMany({});

        // get first registered user
        const user = await User.findOne();

        if (!user) {
            console.log("Please register a user first");
            return;
        }

        // add owner to every listing
        const updatedListings = listings.map((listing) => ({
            ...listing,
            owner: user._id
        }));

        // insert data
        await Listing.insertMany(updatedListings);

        console.log("Data inserted successfully");

        mongoose.connection.close();

    } catch (err) {
        console.log(err);
    }
}

initDB();
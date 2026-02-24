const mongoose = require('mongoose');
require('dotenv').config();

const webhookUrl = "https://discord.com/api/webhooks/1473551656107901172/ObhUgzVPS_2sy4ZdxWo5iVq0tUJDknP0Se2T04q_cipvKKFAoMMHp2x4wbPqhq705H2f";

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./backend/models/User'); // Adjusted paths assuming script is in root
        const Event = require('./backend/models/Event');
        const Registration = require('./backend/models/Registration');

        console.log("--- Starting Database Cleanup ---");
        // Delete all users except admin
        await User.deleteMany({ role: { $ne: 'admin' } });
        // Delete all events and registrations
        await Event.deleteMany({});
        await Registration.deleteMany({});
        console.log("Database wiped clean (kept admin).");

        console.log("--- Creating Accounts ---");
        // Helper to register users properly so passwords get hashed
        const registerUser = async (data) => {
            const userData = { ...data, password: "123" };
            return await User.register(userData);
        };

        // User 1: ramananbr15@gmail.com
        const part1 = await registerUser({
            email: "ramananbr15@gmail.com",
            role: "participant",
            firstName: "Ramanan",
            lastName: "BR 15",
            contactnumber: "9876543210",
            collegename: "Test College 1"
        });

        const org1 = await registerUser({
            email: "ramananbr15@gmail.com",
            role: "organizer",
            organizername: "Ramanan15 Events",
            category: "Technology",
            contactemail: "ramananbr15@gmail.com",
            description: "Top tier tech events and workshops.",
            discordWebhookUrl: webhookUrl
        });

        // User 2: ramananbrtmp@gmail.com
        const part2 = await registerUser({
            email: "ramananbrtmp@gmail.com",
            role: "participant",
            firstName: "Ramanan",
            lastName: "TMP",
            contactnumber: "8765432109",
            collegename: "Test College 2"
        });

        const org2 = await registerUser({
            email: "ramananbrtmp@gmail.com",
            role: "organizer",
            organizername: "Ramanan TMP Group",
            category: "Cultural",
            contactemail: "ramananbrtmp@gmail.com",
            description: "Bringing the best cultural events to campus.",
            discordWebhookUrl: webhookUrl
        });

        console.log("Accounts created successfully.");

        console.log("--- Creating Live Events ---");
        // Dates in March 2026
        const march10 = new Date("2026-03-10T10:00:00Z");
        const march12 = new Date("2026-03-12T18:00:00Z");
        const march15 = new Date("2026-03-15T09:00:00Z");
        const march18 = new Date("2026-03-18T17:00:00Z");
        const march20 = new Date("2026-03-20T10:00:00Z");
        const march22 = new Date("2026-03-22T20:00:00Z");
        const march25 = new Date("2026-03-25T08:00:00Z");
        const march28 = new Date("2026-03-28T16:00:00Z");

        // ORG 1 EVENTS
        const org1_norm1 = await new Event({
            eventName: "Tech Hackathon 2026",
            eventDescription: "A 48-hour competitive coding hackathon.",
            eventType: "normal",
            eligibility: "All",
            eventStartDate: march10,
            eventEndDate: march12,
            registrationDeadline: march10,
            registrationLimit: 100,
            registrationFee: 250,
            organizerId: org1._id,
            eventCategory: org1.category,
            eventStatus: "published",
            formFields: [
                { label: "Github Profile URL", type: "text", required: true },
                { label: "Coding Experience", type: "dropdown", options: ["Beginner", "Intermediate", "Expert"], required: true }
            ]
        }).save();

        const org1_norm2 = await new Event({
            eventName: "AI & Machine Learning Workshop",
            eventDescription: "Hands-on workshop on neural networks.",
            eventType: "normal",
            eligibility: "All",
            eventStartDate: march15,
            eventEndDate: march18,
            registrationDeadline: march15,
            registrationLimit: 100,
            registrationFee: 150,
            organizerId: org1._id,
            eventCategory: org1.category,
            eventStatus: "published",
            formFields: [
                { label: "Laptop Model", type: "text", required: false },
                { label: "Do you have Python installed?", type: "checkbox", required: true }
            ]
        }).save();

        const org1_merch1 = await new Event({
            eventName: "Exclusive Tech Hoodie Drop",
            eventDescription: "Premium quality hoodies for developers.",
            eventType: "merchandise",
            eligibility: "All",
            eventStartDate: march10,
            eventEndDate: march28,
            registrationDeadline: march28,
            registrationLimit: 100,
            registrationFee: 0,
            organizerId: org1._id,
            eventCategory: org1.category,
            eventStatus: "published",
            merchandiseConfig: {
                itemName: "Developer Hoodie",
                price: 899,
                stock: 50,
                itemsRemaining: 50,
                purchaseLimit: 2,
                variants: "S, M, L, XL"
            }
        }).save();

        const org1_merch2 = await new Event({
            eventName: "Tech Sticker Pack V2",
            eventDescription: "Decorate your laptop with these custom die-cut tech stickers.",
            eventType: "merchandise",
            eligibility: "All",
            eventStartDate: march15,
            eventEndDate: march28,
            registrationDeadline: march28,
            registrationLimit: 100,
            registrationFee: 0,
            organizerId: org1._id,
            eventCategory: org1.category,
            eventStatus: "published",
            merchandiseConfig: {
                itemName: "Sticker Pack",
                price: 199,
                stock: 200,
                itemsRemaining: 200,
                purchaseLimit: 5,
                variants: "Matte, Glossy"
            }
        }).save();

        // ORG 2 EVENTS
        const org2_norm1 = await new Event({
            eventName: "Annual Cultural Fest 2026",
            eventDescription: "The biggest cultural gathering of the year including music and dance.",
            eventType: "normal",
            eligibility: "All",
            eventStartDate: march20,
            eventEndDate: march22,
            registrationDeadline: march20,
            registrationLimit: 100,
            registrationFee: 500,
            organizerId: org2._id,
            eventCategory: org2.category,
            eventStatus: "published",
            formFields: [
                { label: "T-Shirt Size", type: "dropdown", options: ["S", "M", "L", "XL"], required: true },
                { label: "Dietary Restrictions", type: "text", required: false }
            ]
        }).save();

        const org2_norm2 = await new Event({
            eventName: "Battle of the Bands",
            eventDescription: "Rock out with the best college bands across the country.",
            eventType: "normal",
            eligibility: "All",
            eventStartDate: march25,
            eventEndDate: march25,
            registrationDeadline: march25,
            registrationLimit: 100,
            registrationFee: 300,
            organizerId: org2._id,
            eventCategory: org2.category,
            eventStatus: "published",
            formFields: [
                { label: "Band Name (if performing)", type: "text", required: false },
                { label: "Will you bring guests?", type: "checkbox", required: true }
            ]
        }).save();

        const org2_merch1 = await new Event({
            eventName: "Fest Official T-Shirts",
            eventDescription: "Grab the official merchandise for the Annual Fest.",
            eventType: "merchandise",
            eligibility: "All",
            eventStartDate: march10,
            eventEndDate: march28,
            registrationDeadline: march28,
            registrationLimit: 100,
            registrationFee: 0,
            organizerId: org2._id,
            eventCategory: org2.category,
            eventStatus: "published",
            merchandiseConfig: {
                itemName: "Fest T-Shirt",
                price: 499,
                stock: 100,
                itemsRemaining: 100,
                purchaseLimit: 3,
                variants: "S, M, L, XL"
            }
        }).save();

        const org2_merch2 = await new Event({
            eventName: "Fest Glow Wristbands",
            eventDescription: "LED wristbands that synch with the concert music.",
            eventType: "merchandise",
            eligibility: "All",
            eventStartDate: march15,
            eventEndDate: march28,
            registrationDeadline: march28,
            registrationLimit: 100,
            registrationFee: 0,
            organizerId: org2._id,
            eventCategory: org2.category,
            eventStatus: "published",
            merchandiseConfig: {
                itemName: "Glow Wristband",
                price: 99,
                stock: 500,
                itemsRemaining: 500,
                purchaseLimit: 10,
                variants: "Blue, Red, Green"
            }
        }).save();

        console.log("Live Events created successfully.");

        console.log("--- Creating Live Registrations ---");
        // Part 1 registers for Org 1 Normal 1 and Org 2 Merch 1
        await new Registration({
            eventId: org1_norm1._id,
            participantId: part1._id,
            formData: {
                "Github Profile URL": "https://github.com/ramanan",
                "Coding Experience": "Intermediate"
            },
            status: "Approved"
        }).save();
        org1_norm1.registeredCount += 1;
        await org1_norm1.save();

        const fs = require('fs');
        fs.writeFileSync('dummy.jpg', 'dummy proof');

        await new Registration({
            eventId: org2_merch1._id,
            participantId: part1._id,
            merchandiseSelection: ["M", "L"],
            status: "Pending",
            paymentProof: fs.readFileSync('dummy.jpg')
        }).save();
        org2_merch1.registeredCount += 1;
        await org2_merch1.save();

        // Part 2 registers for Org 2 Normal 1 and Org 1 Merch 1
        await new Registration({
            eventId: org2_norm1._id,
            participantId: part2._id,
            formData: {
                "T-Shirt Size": "L",
                "Dietary Restrictions": "None"
            },
            status: "Approved"
        }).save();
        org2_norm1.registeredCount += 1;
        await org2_norm1.save();

        await new Registration({
            eventId: org1_merch1._id,
            participantId: part2._id,
            merchandiseSelection: ["M"],
            status: "Pending",
            paymentProof: fs.readFileSync('dummy.jpg')
        }).save();
        org1_merch1.registeredCount += 1;
        await org1_merch1.save();


        console.log("Live Registrations created successfully.");

        // ==========================================
        // ANALYTICS EVENTS SEEDING 
        // ==========================================
        console.log("--- Creating Completed Events for Analytics ---");

        // Helper to create events
        const createCompletedEvent = async (orgId, orgCategory, fee, nameSuffix) => {
            return await new Event({
                eventName: `Analytics Test Event ${nameSuffix}`,
                eventDescription: `Completed event for analytics testing. Fee: ${fee}`,
                eventType: "normal",
                eligibility: "All",
                eventStartDate: new Date(Date.now() - 1000000000), // way in past
                eventEndDate: new Date(Date.now() - 500000000), // in past
                registrationDeadline: new Date(Date.now() - 1000000000),
                registrationLimit: 100,
                registrationFee: fee,
                organizerId: orgId,
                eventCategory: orgCategory,
                eventStatus: "completed",
                formFields: []
            }).save();
        };

        // Org 1 Events (400 and 200)
        const org1_evt400 = await createCompletedEvent(org1._id, org1.category, 400, "O1-400");
        const org1_evt200 = await createCompletedEvent(org1._id, org1.category, 200, "O1-200");

        // Org 2 Events (400 and 200)
        const org2_evt400 = await createCompletedEvent(org2._id, org2.category, 400, "O2-400");
        const org2_evt200 = await createCompletedEvent(org2._id, org2.category, 200, "O2-200");

        console.log("Analytics events created.");

        console.log("--- Creating Analytics Registrations ---");
        const registerUserForAnalytics = async (evt, partId) => {
            await new Registration({
                eventId: evt._id,
                participantId: partId,
                formData: {},
                status: "Approved",
                hasattended: true // To also seed attendance analytics
            }).save();
            evt.registeredCount += 1;
            await evt.save();
        };

        // For Org 1: Register Part 1 to both events -> 400 + 200 = 600 revenue
        await registerUserForAnalytics(org1_evt400, part1._id);
        await registerUserForAnalytics(org1_evt200, part1._id);

        // For Org 2: Register Part 2 to both events -> 400 + 200 = 600 revenue
        await registerUserForAnalytics(org2_evt400, part2._id);
        await registerUserForAnalytics(org2_evt200, part2._id);

        console.log("Registrations created. Analytics data seeded successfully!");
        console.log("Each organizer now has exactly 600 added to their total revenue, and 2 attended registrations.");

        fs.unlinkSync('dummy.jpg');
        console.log("--- SEEDING COMPLETE ---");

    } catch (e) {
        console.error("Error seeding data:", e);
    } finally {
        await mongoose.disconnect();
    }
}

seed();

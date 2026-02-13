const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realtyengage')
    .then(async () => {
        console.log('✅ MongoDB connected');

        // Get a project
        const projects = await Project.find().limit(1);

        if (projects.length === 0) {
            console.log('❌ No projects found in database');
            process.exit(1);
        }

        const project = projects[0];
        console.log('\n📋 Project found:', project.name);
        console.log('📋 Project ID:', project._id);
        console.log('\n🎬 Virtual Tour Data:');
        console.log(JSON.stringify(project.virtualTour, null, 2));

        // Test if virtualTour exists
        if (!project.virtualTour) {
            console.log('\n⚠️  virtualTour field is undefined!');
            console.log('Initializing virtualTour...');

            project.virtualTour = {
                enabled: false,
                type: 'none',
                images360: [],
                video360: {},
                viewCount: 0
            };

            await project.save();
            console.log('✅ virtualTour initialized and saved');
        } else {
            console.log('\n✅ virtualTour field exists');
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

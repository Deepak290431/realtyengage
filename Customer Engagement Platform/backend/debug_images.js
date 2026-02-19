const mongoose = require('mongoose');
require('dotenv').config();

const ProjectSchema = new mongoose.Schema({
    name: String,
    reraId: String,
    images: [{ url: String, isPrimary: Boolean }]
}, { strict: false });

const Project = mongoose.model('Project', ProjectSchema);

async function checkProject() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI?.split('@')[1] || 'DB');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find project by name or RERA ID seen in screenshot
        const project = await Project.findOne({
            $or: [
                { name: 'The Grand Horizon' },
                { reraId: 'PRM/TN/RERA/1254/2026' }
            ]
        });

        if (!project) {
            console.log('Project not found');
        } else {
            console.log('Project found:', project.name);
            console.log('RERA ID:', project.reraId);
            console.log('Images length:', project.images?.length);
            if (project.images) {
                project.images.forEach((img, i) => {
                    console.log(`Image ${i} URL starts with:`, img.url?.substring(0, 100));
                });
            }
        }
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkProject();

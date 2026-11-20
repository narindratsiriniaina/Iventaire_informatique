const db = require('./ServeurBAc/models/index');

async function syncDb() {
    try {
        await db.sequelize.sync({ alter: true });
        console.log("Database synchronized successfully with alter: true");
    } catch (err) {
        console.error("Error synchronizing database:", err);
    } finally {
        process.exit();
    }
}

syncDb();
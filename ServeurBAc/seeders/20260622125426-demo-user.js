'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        nom_user: 'admin',
        password: hashedPassword,
        type_user: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nom_user: 'user',
        password: await bcrypt.hash('user123', 10),
        type_user: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};

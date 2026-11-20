'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if category exists before inserting
    const [categories] = await queryInterface.sequelize.query(
      `SELECT * FROM categories WHERE nom_cat = 'Ordinateur Portable';`
    );

    if (categories.length === 0) {
      await queryInterface.bulkInsert('categories', [
        {
          nom_cat: 'Ordinateur Portable',
          description_cat: 'PC Portable pour employés',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nom_cat: 'Serveur',
          description_cat: 'Serveur rackable ou tour',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nom_cat: 'Imprimante',
          description_cat: 'Imprimante multifonction',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
    }

    // Insert materiel (hardware)
    const [materiels] = await queryInterface.sequelize.query(
      `SELECT * FROM materiels WHERE numero_serie = 'SN123456789';`
    );

    if (materiels.length === 0) {
      // Find the category id for 'Ordinateur Portable'
      const [portableCats] = await queryInterface.sequelize.query(
        `SELECT id_cat FROM categories WHERE nom_cat = 'Ordinateur Portable' LIMIT 1;`
      );
      
      let catId = portableCats.length > 0 ? portableCats[0].id_cat : null;

      if (catId) {
        await queryInterface.bulkInsert('materiels', [
          {
            nom: 'Dell Latitude 5420',
            numero_serie: 'SN123456789',
            marque: 'Dell',
            modele: 'Latitude 5420',
            date_achat: new Date('2023-01-15'),
            garantie: 24, // months
            etat: 'En Stock',
            id_cat: catId,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nom: 'ThinkPad T14',
            numero_serie: 'SN987654321',
            marque: 'Lenovo',
            modele: 'T14 Gen 2',
            date_achat: new Date('2023-05-10'),
            garantie: 36,
            etat: 'En Stock',
            id_cat: catId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('materiels', {
      numero_serie: ['SN123456789', 'SN987654321']
    }, {});
    await queryInterface.bulkDelete('categories', {
      nom_cat: ['Ordinateur Portable', 'Serveur', 'Imprimante']
    }, {});
  }
};

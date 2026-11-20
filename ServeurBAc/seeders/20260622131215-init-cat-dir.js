'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insertion des Directions
    await queryInterface.bulkInsert('direction', [
      {
        nom_dir: 'Direction de Service Topographique',
        type_dir: 'DST'
      },
      {
        nom_dir: 'Circonscription Topographique',
        type_dir: 'CIRCONSCRIPTION'
      }
    ], {});

    // Insertion des Catégories
    await queryInterface.bulkInsert('categorie', [
      {
        nom_cate: 'Ordinateur Portable',
        type: 'Informatique'
      },
      {
        nom_cate: 'Ordinateur de Bureau',
        type: 'Informatique'
      },
      {
        nom_cate: 'Serveur',
        type: 'Informatique'
      },
      {
        nom_cate: 'Imprimante',
        type: 'Périphérique'
      },
      {
        nom_cate: 'Onduleur',
        type: 'Équipement'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorie', null, {});
    await queryInterface.bulkDelete('direction', null, {});
  }
};

module.exports = function(db) {
 
   db.categorie.hasMany(db.materiel, { 
      foreignKey: 'id_cate',
      sourceKey: 'id_cate' 
    });
    db.materiel.belongsTo(db.categorie, { 
      foreignKey: 'id_cate',
      targetKey: 'id_cate'
    });
    
  
    db.emplacement.hasMany(db.materiel, {
      foreignKey: 'id_empl',
      sourceKey: 'code_empl'
    });
    db.materiel.belongsTo(db.emplacement, {
      foreignKey: 'id_empl',
      targetKey: 'code_empl'
    });
    
  
    db.detenteur.hasMany(db.materiel, {
      foreignKey: 'code_detent',
      sourceKey: 'code_detent'
    });
    db.materiel.belongsTo(db.detenteur, {
      foreignKey: 'code_detent',
      targetKey: 'code_detent'
    });
    
    db.departement.hasMany(db.emplacement, {
      foreignKey: 'id_depart',
      sourceKey: 'id_depart'
    });
    db.emplacement.belongsTo(db.departement, {
      foreignKey: 'id_depart',
      targetKey: 'id_depart'
    });
    
    
    db.departement.belongsTo(db.departement, {
      foreignKey: 'num_depa',
      targetKey: 'id_depart',
      as: 'ParentDepartement' 
    });
    

    db.fournisseur.hasMany(db.materiel,{
      foreignKey :'code_four',
      targetKey :'code_four'
    })

    db.materiel.belongsTo(db.fournisseur,{
      foreignKey :'code_four',
      targetKey:'code_four'
    })

    

  db.materiel.hasMany(db.historique, { foreignKey: 'code_mat' });
  db.historique.belongsTo(db.materiel,{foreignKey:'code_mat'})


  db.emplacement.hasMany(db.historique, {
    foreignKey: 'id_empl_src',
    as: 'HistoriquesSource'
  });


  db.emplacement.hasMany(db.historique, {
    foreignKey: 'id_empl_dest',
    as: 'HistoriquesDestination'
  });

  db.historique.belongsTo(db.emplacement, {
    foreignKey: 'id_empl_src',
    as: 'EmplacementSource'
  });

  db.historique.belongsTo(db.emplacement, {
    foreignKey: 'id_empl_dest',
    as: 'EmplacementDestination'
  });


  db.maintenance.belongsTo (db.technicien , {
    foreignKey : 'code_techn',
    targetKey : 'code_techn'
  })
  db.technicien.hasMany (db.maintenance,{
    foreignKey : 'code_techn',
    sourceKey : 'code_techn'
  })

 
  db.emplacement.belongsTo (db.direction,{
      foreignKey : "id_dir",
      targetKey : 'id_dir'
  })
  db.direction.hasMany(db.emplacement,{
      foreignKey : "id_dir",
      sourceKey : 'id_dir'
  })


  db.materiel.hasMany (db.maintenance,{
      foreignKey : "code_mat",
      sourceKey : 'code_mat'
  })

  db.maintenance.belongsTo (db.materiel,{
      foreignKey : "code_mat",
      targetKey : "code_mat"
  })



}
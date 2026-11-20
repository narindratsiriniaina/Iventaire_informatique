import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dstLogoBase64 } from '../../utils/logoBase64';

function AffectationRapport() {
  const [filters, setFilters] = useState({
    date: '',
    nom: '',
    ville: '',
    type_depart: ''
  });
  
  // Local state for the inputs before clicking the "Filter" button
  const [inputValues, setInputValues] = useState({
    date: '',
    nom: '',
    ville: '',
    type_depart: ''
  });

  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentIndex, setCurrentIndex] = useState(0);

  const [hasSearched, setHasSearched] = useState(false);

  const formatCustomDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchAffectations = async () => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    try {
      const response = await axios.get('http://localhost:3000/listeAffecter', {
        params: { 
          date_affec: filters.date || undefined, 
          nom: filters.nom || undefined
        },
      });
      
      let results = Array.isArray(response.data) ? response.data : [];
      
      // Frontend filtering for new fields
      if (results.length > 0) {
          if (filters.ville) {
              results = results.filter(a => 
                a.emplacement_destination?.ville?.toLowerCase().includes(filters.ville.toLowerCase()) || 
                a.emplacement_destination?.adresse_empl?.toLowerCase().includes(filters.ville.toLowerCase())
              );
          }
          if (filters.type_depart) {
              results = results.filter(a => 
                a.emplacement_destination?.departement?.type_depart?.toLowerCase().includes(filters.type_depart.toLowerCase())
              );
          }
      }
      
      setAffectations(results);
    } catch (err) {
      setError('Erreur lors de la récupération des affectations');
      console.error(err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const exportToPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Add Logo
    try {
      doc.addImage(dstLogoBase64, 'PNG', 14, 10, 20, 20);
    } catch (err) {
      console.error("Erreur PDF:", err);
    }

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 77, 64);
    doc.text("DIRECTION DES SERVICES TOPOGRAPHIQUES", 38, 16);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("République de Madagascar", 38, 22);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("MINISTÈRE DE L'AMÉNAGEMENT DU TERRITOIRE", 38, 27);

    // Madagascar Flag
    const flagX = 260;
    const flagY = 12;
    const flagW = 24;
    const flagH = 16;
    // White
    doc.setFillColor(255, 255, 255);
    doc.rect(flagX, flagY, flagW/3, flagH, 'F');
    // Red
    doc.setFillColor(252, 61, 50);
    doc.rect(flagX + flagW/3, flagY, flagW*2/3, flagH/2, 'F');
    // Green
    doc.setFillColor(0, 126, 58);
    doc.rect(flagX + flagW/3, flagY + flagH/2, flagW*2/3, flagH/2, 'F');
    // Border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(flagX, flagY, flagW, flagH, 'S');

    // Separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 77, 64);
    doc.line(14, 35, 283, 35);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("RAPPORT D'AFFECTATIONS", 148, 46, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    let filtersText = "Filtres appliqués : ";
    const appliedFilters = [];
    if (filters.nom) appliedFilters.push(`Nom: "${filters.nom}"`);
    if (filters.date) appliedFilters.push(`Date: "${formatCustomDate(filters.date)}"`);
    if (filters.ville) appliedFilters.push(`Ville: "${filters.ville}"`);
    if (filters.type_depart) appliedFilters.push(`Dép.: "${filters.type_depart}"`);
    filtersText += appliedFilters.length > 0 ? appliedFilters.join(' | ') : "Aucun";

    doc.text(filtersText, 14, 54);
    doc.text(`Résultats : ${affectations.length} affectation(s)`, 283, 54, { align: 'right' });

    autoTable(doc, {
      startY: 60,
      head: [['Matériel', 'Numéro de série', 'Emplacement Passé', 'Emplacement Actuel', 'Date Mouvement']],
      body: affectations.map(affec => [
        `${affec.materiel?.nom || 'N/A'} - ${affec.materiel?.marque || ''}`,
        affec.materiel?.numero_serie || 'N/A',
        `${affec.emplacement_source?.departement?.type_depart || 'N/A'} - ${affec.emplacement_source?.distrinct || 'N/A'} - ${affec.emplacement_source?.adresse_empl || 'N/A'}`,
        `${affec.emplacement_destination?.departement?.type_depart || 'N/A'} - ${affec.emplacement_destination?.distrinct || 'N/A'} - ${affec.emplacement_destination?.adresse_empl || 'N/A'}`,
        formatCustomDate(affec.date_mouvement)
      ]),
      styles: { font: 'helvetica', fontSize: 8.5, overflow: 'linebreak', cellPadding: 3 },
      headStyles: { fillColor: [0, 77, 64], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 30 }, 2: { cellWidth: 80 }, 3: { cellWidth: 80 }, 4: { cellWidth: 30 } },
      margin: { left: 14, right: 14, bottom: 40 }
    });

    // Pagination & Footer & Signatures
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const dateStr = new Date().toLocaleString('fr-FR');
        
        // Footer line
        doc.setLineWidth(0.3);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, doc.internal.pageSize.getHeight() - 35, 283, doc.internal.pageSize.getHeight() - 35);
        
        // Signatures area (Only on last page, or every page? Usually last page or bottom of every page)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text("Le Responsable de Service", 240, doc.internal.pageSize.getHeight() - 25, { align: 'center' });
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("(Signature et Cachet)", 240, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        
        // Bottom details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Généré le : ${dateStr}`, 14, doc.internal.pageSize.getHeight() - 8);
        doc.text(`Page ${i} / ${pageCount}`, 148, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
        doc.text('DST — Officiel', 283, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }

    const dateFileStr = new Date().toISOString().slice(0, 10);
    doc.save(`Affectations_${dateFileStr}.pdf`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    setHasSearched(true);
    setFilters({ ...inputValues });
  };

  const resetFilters = () => {
    const resetVals = {
      date: '',
      nom: '',
      ville: '',
      type_depart: ''
    };
    setInputValues(resetVals);
    setFilters(resetVals);
    setHasSearched(false);
    setAffectations([]);
  };

  useEffect(() => {
    // Only fetch if a filter is actually applied or if we want to submit explicitly
    // Since the user wants it to be empty initially until "Filtrer" is clicked:
    if (hasSearched) {
      fetchAffectations();
    }
  }, [filters]);

  const handleNext = () => {
    if (currentIndex < affectations.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const currentAffec = affectations[currentIndex];

  return (
    <main className="w-full min-h-screen bg-gray-50 overflow-x-hidden p-4 md:p-8 font-sans flex flex-col">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">Rapport d'Affectations</h1>
              <p className="text-gray-500 mt-1">Suivez l'historique de déplacement de chaque matériel.</p>
          </div>
          
          <button onClick={exportToPDF} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-100 transition-colors shadow-sm">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Exporter PDF
          </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 shrink-0">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-green-600 text-[18px]">filter_list</span>
              Filtres de recherche
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Date d'affectation</label>
                  <input type="date" name="date" value={inputValues.date} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all" />
              </div>
              <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Nom du Matériel</label>
                  <input type="text" name="nom" value={inputValues.nom} onChange={handleInputChange} placeholder="Ex: PC, Imprimante..." className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all" />
              </div>
              <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Département actuel</label>
                  <input type="text" name="type_depart" value={inputValues.type_depart} onChange={handleInputChange} placeholder="Ex: Informatique..." className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all" />
              </div>
              <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Ville / Province actuelle</label>
                  <select name="ville" value={inputValues.ville} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all bg-white">
                      <option value="">Toutes les provinces</option>
                      <option value="Antananarivo">Antananarivo</option>
                      <option value="Antsiranana">Antsiranana</option>
                      <option value="Fianarantsoa">Fianarantsoa</option>
                      <option value="Mahajanga">Mahajanga</option>
                      <option value="Toamasina">Toamasina</option>
                      <option value="Toliara">Toliara</option>
                  </select>
              </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
              <button onClick={resetFilters} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">Réinitialiser</button>
              <button onClick={handleFilterSubmit} className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Filtrer
              </button>
          </div>
      </div>

      {/* Affichage des résultats */}
      <div className="flex-1 flex flex-col">
          {!hasSearched ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search</span>
                <h3 className="text-lg font-medium text-gray-900">Recherchez une affectation</h3>
                <p className="text-gray-500 mt-1">Utilisez les filtres ci-dessus pour afficher l'historique d'un matériel.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                <p className="mt-2 text-gray-500 font-medium">Chargement des affectations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p>{error}</p>
            </div>
          ) : affectations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                <h3 className="text-lg font-medium text-gray-900">Aucune affectation trouvée</h3>
                <p className="text-gray-500 mt-1">Ajustez vos filtres pour voir d'autres résultats.</p>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col">
              
              {currentAffec && (
                <div className="flex-1 flex flex-col justify-center">
                  
                  {/* Ligne des 3 Cartes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Carte Informations Matériel */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                      <div className="bg-gray-800 text-white p-3 flex items-center gap-3 shrink-0">
                        <span className="material-symbols-outlined text-2xl">computer</span>
                        <div className="truncate">
                          <h2 className="text-lg font-bold m-0 truncate">{currentAffec.materiel?.nom || 'Matériel Inconnu'}</h2>
                          <p className="text-gray-300 text-xs m-0 truncate">Informations de l'équipement</p>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-around gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Numéro de série</p>
                          <p className="font-mono text-base font-semibold text-gray-900 bg-gray-100 inline-block px-2 py-0.5 rounded">{currentAffec.materiel?.numero_serie || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Marque / Modèle</p>
                          <p className="font-medium text-gray-900">{currentAffec.materiel?.marque || 'N/A'} {currentAffec.materiel?.modele ? `- ${currentAffec.materiel.modele}` : ''}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Catégorie</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <span className="material-symbols-outlined text-gray-400 text-sm">category</span>
                            {currentAffec.materiel?.type_equipement || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Date du mouvement</p>
                          <p className="font-medium text-green-700 bg-green-50 inline-block px-2 py-0.5 rounded border border-green-200">
                            {formatCustomDate(currentAffec.date_mouvement)}
                          </p>
                        </div>
                      </div>
                    </div>
    
                    {/* 2. Emplacement Passé */}
                    <div className="bg-white rounded-xl shadow-md border border-orange-200 overflow-hidden relative flex flex-col">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-orange-50 rounded-bl-full flex items-start justify-end p-1.5 opacity-50 shrink-0">
                         <span className="material-symbols-outlined text-orange-300">history</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-bold text-orange-800 flex items-center gap-1.5 mb-3 border-b border-orange-100 pb-2">
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Emplacement Passé
                        </h3>
                        
                        <div className="space-y-3 flex-1 flex flex-col justify-around text-sm">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Département</p>
                            <p className="text-gray-900 font-medium">{currentAffec.emplacement_source?.departement?.type_depart || 'N/A'}</p>
                          </div>
                          
                          {currentAffec.emplacement_source?.departement?.type_depart === 'DST' && currentAffec.emplacement_source?.direction?.length > 0 && (
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">Direction</p>
                              <p className="text-gray-900 text-xs">{currentAffec.emplacement_source.direction[0].nom_dir} ({currentAffec.emplacement_source.direction[0].type_dir})</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">Ville</p>
                              <p className="text-gray-900 text-xs">{currentAffec.emplacement_source?.ville || currentAffec.emplacement_source?.adresse_empl || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-semibold">District</p>
                              <p className="text-gray-900 text-xs">{currentAffec.emplacement_source?.distrinct || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Adresse complète</p>
                            <p className="text-gray-700 text-xs bg-gray-50 p-1.5 rounded border border-gray-100 mt-0.5 line-clamp-2">
                              {currentAffec.emplacement_source?.adresse_empl || 'Aucune adresse renseignée'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
    
                    {/* 3. Emplacement Actuel */}
                    <div className="bg-white rounded-xl shadow-md border border-green-300 overflow-hidden relative flex flex-col">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-green-50 rounded-bl-full flex items-start justify-end p-1.5 opacity-50 shrink-0">
                         <span className="material-symbols-outlined text-green-300">location_on</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-bold text-green-700 flex items-center gap-1.5 mb-3 border-b border-green-100 pb-2">
                          <span className="material-symbols-outlined text-[18px]">login</span>
                          Emplacement Actuel
                        </h3>
                        
                        <div className="space-y-3 flex-1 flex flex-col justify-around text-sm">
                          <div>
                            <p className="text-[10px] text-green-600/70 uppercase font-semibold">Département</p>
                            <p className="text-gray-900 font-bold">{currentAffec.emplacement_destination?.departement?.type_depart || 'N/A'}</p>
                          </div>
                          
                          {currentAffec.emplacement_destination?.departement?.type_depart === 'DST' && currentAffec.emplacement_destination?.direction?.length > 0 && (
                            <div>
                              <p className="text-[10px] text-green-600/70 uppercase font-semibold">Direction</p>
                              <p className="text-gray-900 text-xs font-medium">{currentAffec.emplacement_destination.direction[0].nom_dir} ({currentAffec.emplacement_destination.direction[0].type_dir})</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] text-green-600/70 uppercase font-semibold">Ville</p>
                              <p className="text-gray-900 text-xs font-medium">{currentAffec.emplacement_destination?.ville || currentAffec.emplacement_destination?.adresse_empl || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-green-600/70 uppercase font-semibold">District</p>
                              <p className="text-gray-900 text-xs font-medium">{currentAffec.emplacement_destination?.distrinct || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] text-green-600/70 uppercase font-semibold">Adresse complète</p>
                            <p className="text-gray-800 text-xs bg-green-50/50 p-1.5 rounded border border-green-100 mt-0.5 line-clamp-2">
                              {currentAffec.emplacement_destination?.adresse_empl || 'Aucune adresse renseignée'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
    
                  </div>
                  
                </div>
              )}

              {/* Navigation Pagination au bas */}
              <div className="mt-8 flex justify-center">
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm w-full max-w-sm">
                    <button 
                      onClick={handlePrev} 
                      disabled={currentIndex === 0}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${currentIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                    <div className="text-gray-700 text-sm font-medium px-4">
                      Affectation <span className="text-green-700 font-bold">{currentIndex + 1}</span> / <span className="font-bold">{affectations.length}</span>
                    </div>
                    <button 
                      onClick={handleNext} 
                      disabled={currentIndex === affectations.length - 1}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${currentIndex === affectations.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
              </div>

            </div>
          )}
      </div>
    </main>
  );
}

export default AffectationRapport;
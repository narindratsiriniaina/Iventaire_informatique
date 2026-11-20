import { useState, useEffect } from "react";
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dstLogoBase64 } from '../../utils/logoBase64';

function LISTE() {
    const [materiels, setMateriels] = useState([]);
    const [showTable, setShowTable] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        maintenance: 0,
        enService: 0,
        mouvements: 0
    });
    
    const [filters, setFilters] = useState({
        search: '',
        nom: '',
        categorie: '',
        type_depart: '',
        ville: '',
        district: ''
    });

    /* ─── Excel export ─────────────────────────────────────── */
    const exportToExcel = (e) => {
        e.preventDefault();
        try {
            if (!materiels || materiels.length === 0) {
                alert("Aucune donnée à exporter.");
                return;
            }
            const ws = XLSX.utils.json_to_sheet(materiels.map(m => ({
                'N° Série': m.numero_serie || '',
                'Nom': m.nom || '',
                'Catégorie': m.nom_cate || '',
                'Marque': m.marque || '',
                'Modèle': m.modele || '',
                'Type': getTypeEquipement(m.type_equipement) || '',
                'État': m.etat || '',
                'Département': m.nom_depart || m.type_depart || 'N/A',
                'District': m.distrinct || 'N/A',
                'Ville': m.ville || m.adresse_empl || 'N/A',
                'Direction': m.type_dir ? `${m.type_dir} - ${m.nom_dir}` : 'N/A',
                'Adresse': m.adresse_empl || 'N/A',
                'N° Porte': m.num_porte || 'N/A',
                'Détenteur': m.nom_det ? `${m.nom_det} ${m.prenom_det}` : 'Non attribué',
                'N° IM': m.num_im || 'N/A',
                'Fonction': m.fonction || 'N/A'
            })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Rapport_Materiels");
            const dateStr = new Date().toISOString().slice(0, 10);
            let fn = `Rapport_Materiels_${dateStr}`;
            XLSX.writeFile(wb, `${fn}.xlsx`);
        } catch (error) {
            console.error("Erreur lors de l'exportation Excel:", error);
            alert("Une erreur s'est produite lors de l'exportation Excel.");
        }
    };

    /* ─── PDF export ────────────────────────────────────────── */
    const exportToPDF = (e) => {
        e.preventDefault();
        try {
            if (!materiels || materiels.length === 0) {
                alert("Aucune donnée à exporter.");
                return;
            }
            const doc = new jsPDF({ orientation: 'landscape' });
            
            // Logo
            try {
                if (dstLogoBase64) {
                    doc.addImage(dstLogoBase64, 'PNG', 14, 10, 20, 20);
                }
            } catch (err) {
                console.error("Erreur logo PDF:", err);
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
            doc.text("RAPPORT DES MATÉRIELS INFORMATIQUES", 148, 46, { align: 'center' });

            doc.setFont("times", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(80, 80, 80);
            const appliedFilters = [];
            if (filters.search) appliedFilters.push(`Recherche: "${filters.search}"`);
            if (filters.nom) appliedFilters.push(`Nom: "${filters.nom}"`);
            if (filters.categorie) appliedFilters.push(`Catégorie: "${filters.categorie}"`);
            if (filters.type_depart) appliedFilters.push(`Département: "${filters.type_depart}"`);
            if (filters.ville) appliedFilters.push(`Ville: "${filters.ville}"`);
            if (filters.district) appliedFilters.push(`District: "${filters.district}"`);
            
            const filterText = `Filtres : ${appliedFilters.length > 0 ? appliedFilters.join(' | ') : 'Aucun'}`;
            doc.text(filterText, 10, 54);
            doc.text(`Résultats : ${materiels.length} matériel(s)`, 287, 54, { align: 'right' });

            autoTable(doc, {
                startY: 60,
                head: [['N° Série', 'Nom', 'Catégorie', 'Marque', 'État', 'Département', 'Ville', 'District', 'Détenteur']],
                body: materiels.map(m => [
                    m.numero_serie || '',
                    m.nom || '',
                    m.nom_cate || '',
                    m.marque || '',
                    m.etat || '',
                    m.nom_depart || m.type_depart || 'N/A',
                    m.ville || m.adresse_empl || 'N/A',
                    m.distrinct || 'N/A',
                    m.nom_det ? `${m.nom_det} ${m.prenom_det}` : 'Non attribué'
                ]),
                styles: { font: 'times', fontSize: 7.5, cellPadding: 2.5 },
                headStyles: {
                    fillColor: [0, 77, 64],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8
                },
                alternateRowStyles: { fillColor: [245, 250, 245] },
                margin: { left: 10, right: 10 }
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
                
                // Signatures area
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
                doc.text(`Exporté le : ${dateStr}`, 14, doc.internal.pageSize.getHeight() - 8);
                doc.text(`Page ${i} / ${pageCount}`, 148, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
                doc.text('DST — Officiel', 283, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
            }

            const dateFileStr = new Date().toISOString().slice(0, 10);
            let fn = `Rapport_Materiels_${dateFileStr}`;
            doc.save(`${fn}.pdf`);
        } catch (error) {
            console.error("Erreur lors de l'exportation PDF:", error);
            alert("Une erreur s'est produite lors de l'exportation PDF.");
        }
    };

    /* ─── Fetch Data ────────────────────────────────────────────── */
    useEffect(() => {
        chercher();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [matRes, panneRes] = await Promise.all([
                axios.get('http://localhost:3000/nombreMateriel').catch(() => ({ data: { count: 124 } })),
                axios.get('http://localhost:3000/nombrePanne').catch(() => ({ data: { count: 8 } }))
            ]);
            setStats({
                total: matRes.data.count || 124,
                maintenance: panneRes.data.count || 8,
                enService: (matRes.data.count || 124) - (panneRes.data.count || 8),
                mouvements: 12
            });
        } catch (e) {
            console.error("Erreur stats", e);
        }
    }

    const chercher = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Clean up empty parameters to avoid sending them in the query
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.nom) params.nom = filters.nom;
            if (filters.categorie) params.categorie = filters.categorie;
            if (filters.type_depart) params.type_depart = filters.type_depart;
            if (filters.ville) params.ville = filters.ville;
            if (filters.district) params.distrinct = filters.district; // API param could be distrinct based on original code

            const res = await axios.get('http://localhost:3000/materiels', { params });
            let results = Array.isArray(res.data) ? res.data : [];
            
            // Frontend filtering if the backend doesn't support some of these filters
            if (results.length > 0) {
                if (filters.nom) {
                    results = results.filter(m => m.nom?.toLowerCase().includes(filters.nom.toLowerCase()));
                }
                if (filters.categorie) {
                    results = results.filter(m => m.nom_cate?.toLowerCase().includes(filters.categorie.toLowerCase()));
                }
                if (filters.type_depart) {
                    results = results.filter(m => (m.nom_depart || m.type_depart)?.toLowerCase().includes(filters.type_depart.toLowerCase()));
                }
                if (filters.ville) {
                    results = results.filter(m => (m.ville || m.adresse_empl)?.toLowerCase().includes(filters.ville.toLowerCase()));
                }
                if (filters.district) {
                    results = results.filter(m => m.distrinct?.toLowerCase().includes(filters.district.toLowerCase()));
                }
            }

            setMateriels(results);
            setShowTable(true);
            
            // Calculer les statistiques dynamiquement à partir des données récupérées du serveur
            const total = results.length;
            const maintenance = results.filter(m => ['panne', 'en panne', 'en reparation'].includes(m.etat?.toLowerCase())).length;
            const enService = results.filter(m => ['en service', 'opérationnel'].includes(m.etat?.toLowerCase())).length;
            const mouvements = results.filter(m => ['en transit'].includes(m.etat?.toLowerCase())).length || 0; // ou un autre champ

            setStats({
                total,
                maintenance,
                enService,
                mouvements
            });

        } catch (err) {
            console.error("Erreur chargement:", err);
            setError("Erreur lors du chargement des données.");
            setMateriels([]);
            setShowTable(true);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            nom: '',
            categorie: '',
            type_depart: '',
            ville: '',
            district: ''
        });
        setTimeout(() => chercher(), 0);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    /* ─── Helpers ───────────────────────────────────────────── */
    const getEtatStyles = (etat) => {
        switch (etat?.toLowerCase()) {
            case 'en service': 
            case 'opérationnel':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'en transit':
            case 'panne':
            case 'hors service':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'en reparation': 
                return 'bg-pink-100 text-pink-800 border-pink-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEtatLabel = (etat) => {
        if (!etat) return 'Inconnu';
        if (etat.toLowerCase() === 'en service') return 'Opérationnel';
        if (etat.toLowerCase() === 'panne') return 'En panne';
        return etat.charAt(0).toUpperCase() + etat.slice(1);
    };

    const getTypeEquipement = (type) => {
        switch (type) {
            case 'Fixe': return 'Matériel fixe';
            case 'Mobile': return 'Matériel mobile';
            case 'Accessoire': return 'Accessoire';
            default: return type;
        }
    };

    /* ─── Render ────────────────────────────────────────────── */
    return (
        <main className="w-full min-h-screen bg-background overflow-x-hidden p-4 md:p-8">
            <div>
                {/* En-tête de Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-display-lg font-bold text-[#1a1a1a] leading-tight">Rapports d'Inventaire</h1>
                        <p className="text-on-surface-variant mt-1">Consultez et analysez l'ensemble du parc informatique.</p>
                    </div>
                </div>

                {/* Filtres Avancés */}
                <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">filter_list</span>
                        Filtres de recherche
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Recherche globale</label>
                            <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Mot clé..." className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Nom de l'équipement</label>
                            <input type="text" name="nom" value={filters.nom} onChange={handleFilterChange} placeholder="Ex: Ordinateur HP..." className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Catégorie</label>
                            <input type="text" name="categorie" value={filters.categorie} onChange={handleFilterChange} placeholder="Ex: PC, Imprimante..." className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Département</label>
                            <input type="text" name="type_depart" value={filters.type_depart} onChange={handleFilterChange} placeholder="Ex: Informatique..." className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">Ville / Province</label>
                            <select name="ville" value={filters.ville} onChange={handleFilterChange} className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white">
                                <option value="">Toutes les provinces</option>
                                <option value="Antananarivo">Antananarivo</option>
                                <option value="Antsiranana">Antsiranana</option>
                                <option value="Fianarantsoa">Fianarantsoa</option>
                                <option value="Mahajanga">Mahajanga</option>
                                <option value="Toamasina">Toamasina</option>
                                <option value="Toliara">Toliara</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">District</label>
                            <input type="text" name="district" value={filters.district} onChange={handleFilterChange} placeholder="District..." className="p-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                        <button onClick={resetFilters} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">Réinitialiser</button>
                        <button onClick={chercher} className="px-4 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">search</span> Filtrer
                        </button>
                    </div>
                </div>

                {/* Cartes de Statistiques (KPIs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>devices</span>
                            </div>
                        </div>
                        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Total Actifs</p>
                        <h3 className="text-3xl font-bold text-[#1a1a1a]">{stats.total}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-700">
                                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                            </div>
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{stats.maintenance} urgences</span>
                        </div>
                        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Maintenance</p>
                        <h3 className="text-3xl font-bold text-[#1a1a1a]">{stats.maintenance}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>swap_horiz</span>
                            </div>
                        </div>
                        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">En Service</p>
                        <h3 className="text-3xl font-bold text-[#1a1a1a] mb-3">{stats.enService}</h3>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: `${(stats.enService / (stats.total || 1)) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>history</span>
                            </div>
                        </div>
                        <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Mvmt. récents</p>
                        <h3 className="text-3xl font-bold text-[#1a1a1a]">{stats.mouvements}</h3>
                    </div>
                </div>

                {/* Main Content Area: Table / Grid */}
                <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <h2 className="font-semibold text-lg text-[#1a1a1a]">Matériels ({materiels.length})</h2>
                            <button onClick={chercher} className="text-primary hover:text-primary-container p-1 rounded-full hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-xl">refresh</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Actions d'export */}
                            <div className="flex gap-2 mr-4 border-r border-outline-variant pr-4">
                                <button onClick={exportToExcel} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors px-2 py-1">
                                    <span className="material-symbols-outlined text-lg">download</span> Excel
                                </button>
                                <button onClick={exportToPDF} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-2 py-1">
                                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span> PDF
                                </button>
                            </div>
                            
                            {/* Vue Hybride */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setViewMode('table')} 
                                    className={`px-3 py-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">list</span>
                                </button>
                                <button 
                                    onClick={() => setViewMode('card')} 
                                    className={`px-3 py-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">grid_view</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                                <p className="mt-2 text-gray-500 font-medium">Chargement des données...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">
                                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                                <p>{error}</p>
                            </div>
                        ) : materiels.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                                <h3 className="text-lg font-medium text-gray-900">Aucun équipement trouvé</h3>
                                <p className="text-gray-500 mt-1">Ajustez vos filtres de recherche pour voir plus de résultats.</p>
                                <button onClick={resetFilters} className="mt-4 text-primary font-medium hover:underline">
                                    Réinitialiser la recherche
                                </button>
                            </div>
                        ) : (
                            <>
                                {viewMode === 'table' ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
                                            <thead className="bg-gray-50 text-gray-600 font-medium uppercase text-xs tracking-wider border-b border-outline-variant">
                                                <tr>
                                                    <th className="px-6 py-4">Équipement / ID</th>
                                                    <th className="px-6 py-4">Catégorie</th>
                                                    <th className="px-6 py-4">Responsable</th>
                                                    <th className="px-6 py-4">Localisation</th>
                                                    <th className="px-6 py-4">Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/50 bg-white">
                                                {materiels.map((m, idx) => (
                                                    <tr key={m.code_mat || idx} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                                                                    <span className="material-symbols-outlined">computer</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{m.nom}</div>
                                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                        <span className="material-symbols-outlined text-[12px]">tag</span>
                                                                        {m.numero_serie}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-gray-700">{m.nom_cate || m.marque}</span>
                                                            <div className="text-xs text-gray-500 mt-0.5">{getTypeEquipement(m.type_equipement)}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {m.nom_det ? (
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{m.nom_det} {m.prenom_det}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Non assigné</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-gray-700">{m.nom_depart || m.type_depart || 'N/A'}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{m.distrinct || m.adresse_empl || m.ville || ''}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEtatStyles(m.etat)}`}>
                                                                {getEtatLabel(m.etat)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-white">
                                            <span className="text-sm text-gray-500">Affichage de <span className="font-medium">1</span> à <span className="font-medium">{materiels.length}</span> sur <span className="font-medium">{materiels.length}</span> résultats</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 bg-gray-50/30">
                                        {materiels.map((m, idx) => (
                                            <div key={m.code_mat || idx} className="bg-white border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 transition-colors">
                                                        <img 
                                                            src={`https://cdn-icons-png.flaticon.com/512/${
                                                                (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('ordinateur') || (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('pc') ? '689/689314' :
                                                                (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('imprimante') ? '1041/1041984' :
                                                                (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('serveur') ? '2905/2905955' :
                                                                (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('switch') || (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('reseau') ? '2906/2906041' :
                                                                (m.nom_cate?.toLowerCase() || m.nom?.toLowerCase() || '').includes('onduleur') ? '2784/2784013' :
                                                                '953/953046'
                                                            }.png`} 
                                                            alt={m.nom_cate || m.nom || 'Equipement'} 
                                                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/953/953046.png'; }}
                                                        />
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getEtatStyles(m.etat)}`}>
                                                        {getEtatLabel(m.etat)}
                                                    </span>
                                                </div>
                                                
                                                <h3 className="font-bold text-gray-900 text-base truncate" title={m.nom}>{m.nom}</h3>
                                                <p className="text-xs font-mono text-gray-500 mt-1 mb-4 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">barcode</span>
                                                    {m.numero_serie}
                                                </p>
                                                
                                                <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                                                        <span className="truncate">{m.nom_det ? `${m.nom_det} ${m.prenom_det}` : 'Non assigné'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                                                        <span className="truncate">{m.nom_depart || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default LISTE;
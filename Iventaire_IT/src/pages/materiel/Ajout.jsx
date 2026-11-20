import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Table, Form, Alert, Col, Row, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaTimes, FaList, FaThLarge } from 'react-icons/fa';
import { restrictInput } from '../../utils/validation';

function Materiel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numero_serie: "",
    nom_equi: "",
    modele: "",
    num_porte: "",
    etat: "en service",
    type_equi: "Fixe",
    marque: "",
    date_utilisation: "",
    id_categorie: "",
    num_depa: "",
    type_dir: "",
    nom_dir: "",
    role: "",
    nom_techn: "",
    date_mouvement: "",
    ville: "",
    distrinct: "",
    Region: "",
    adresse_empl: "",
    attribue: false,
    nom_det: "",
    prenom_det: "",
    num_im: "",
    fonction: "",
    nom_four: "",
    contact_four: "",
    adresse_four: "",
    code_empl: ""
  });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [emplacements, setEmplacements] = useState([]);
  const [filteredEmplacements, setFilteredEmplacements] = useState([]);
  const [searchEmplacement, setSearchEmplacement] = useState('');
  const [showNewEmplacementFields, setShowNewEmplacementFields] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    etat: '',
    id_categorie: '',
    date_entree: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, departementsRes, emplacementsRes] = await Promise.all([
          axios.get('http://localhost:3000/categories'),
          axios.get('http://localhost:3000/departements'),
          axios.get('http://localhost:3000/emplacement')
        ]);
        
        setCategories(categoriesRes.data || []);
        setDepartements(departementsRes.data || []);
        setEmplacements(emplacementsRes.data || []);
        setFilteredEmplacements(emplacementsRes.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        showAlert('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filtrer les emplacements en fonction de la recherche
  useEffect(() => {
    if (searchEmplacement && searchEmplacement.length > 0) {
      const filtered = emplacements.filter((empl) => {
        const searchStr = `${empl.adresse_empl || ''} ${empl.distrinct || ''} ${empl.ville || ''} ${empl.Region || ''} ${empl.Departement?.nom_depart || ''}`.toLowerCase();
        return searchStr.includes(searchEmplacement.toLowerCase());
      });
      setFilteredEmplacements(filtered);
    } else {
      setFilteredEmplacements(emplacements);
    }
  }, [searchEmplacement, emplacements]);

  // Chargement des matériels avec filtres
  const fetchMateriels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/materiels', {
        params: { ...filters, include_all: true }
      });
      
      const uniqueMateriels = response.data.reduce((acc, current) => {
        const x = acc.find(item => item.code_mat === current.code_mat);
        if (!x) {
          return acc.concat([current]);
        }
        return acc;
      }, []);
      
      setMateriels(uniqueMateriels || []);
    } catch (err) {
      console.error("Erreur lors du chargement des matériels:", err);
      showAlert('Erreur lors du chargement des matériels', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Utiliser useEffect avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMateriels();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Appliquer la validation pour certains champs
    let validatedValue = value;
    if (name === 'contact_four' || name === "num_im") {
      validatedValue = restrictInput(value, 'phone', 20);
      if (value !== validatedValue && value !== '') {
        showAlert("Seuls les chiffres, espaces, tirets et + sont autorisés.", 'warning');
      }
    } else if (name === 'nom_det' || name === 'prenom_det' || name === 'adresse_empl' || name === 'ville' || name === 'Region' || name === 'nom_dir') {
      validatedValue = restrictInput(value, 'letters', 100);
      if (value !== validatedValue && value !== '') {
        const fieldName = name === 'nom_det' ? 'le nom du détenteur' : 
                         name === 'prenom_det' ? 'le prénom du détenteur' : 
                         name === 'adresse_empl' ? 'l\'adresse' : 
                         name === 'ville' ? 'la ville' : 
                         name === 'Region' ? 'la région' : 
                         'le nom de la direction';
        showAlert(`Seules les lettres et les espaces sont autorisés pour ${fieldName}.`, 'warning');
      }
    } else if (name === 'num_porte') {
      validatedValue = restrictInput(value, 'numbers', 10);
      if (value !== validatedValue && value !== '') {
        showAlert("Seuls les chiffres sont autorisés pour le numéro de porte.", 'warning');
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : validatedValue 
    }));
    
    // Réinitialiser les champs de direction si le département change
    if (name === "num_depa") {
      const selectedDep = departements.find(dep => String(dep.id_depart) === value);
      const isSpecialDepart = ['DST', 'CIRTOPO'].includes(selectedDep?.type_depart || '');
      setFormData(prev => ({
        ...prev,
        num_depa: value,
        type_dir: isSpecialDepart ? prev.type_dir : "",
        nom_dir: isSpecialDepart ? prev.nom_dir : ""
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      etat: '',
      id_categorie: '',
      date_entree: '',
    });
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep === 1 && (!formData.numero_serie || !formData.nom_equi || !formData.marque || !formData.id_categorie)) {
      showAlert("Veuillez remplir tous les champs obligatoires de l'équipement", 'warning');
      return;
    }
    if (currentStep === 2 && (!formData.num_depa || !formData.ville || !formData.adresse_empl)) {
      showAlert("Veuillez remplir tous les champs obligatoires de l'emplacement", 'warning');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const showAlert = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const resetForm = () => {
    setFormData({
      numero_serie: "",
      nom_equi: "",
      modele: "",
      etat: "en service",
      type_equi: "Fixe",
      marque: "",
      num_porte: "",
      date_utilisation: "",
      id_categorie: "",
      num_depa: "",
      type_dir: "",
      nom_dir: "",
      role: "",
      nom_techn: "",
      date_mouvement: "",
      ville: "",
      distrinct: "",
      Region: "",
      adresse_empl: "",
      attribue: false,
      nom_det: "",
      prenom_det: "",
      num_im: "",
      fonction: "",
      nom_four: "",
      contact_four: "",
      adresse_four: "",
      code_empl: ""
    });
    setCurrentStep(1);
    setSearchEmplacement('');
    setShowNewEmplacementFields(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.attribue && (!formData.nom_det || !formData.prenom_det)) {
      showAlert("Veuillez remplir les informations du détenteur ou décocher 'Matériel attribué'", 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/materiels', formData);
      
      if (response.data.success) {
        showAlert('Matériel ajouté avec succès', 'success');
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          resetForm();
          setSubmitSuccess(false);
          fetchMateriels();
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/ajout/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    setMaterialToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/materiels/${materialToDelete}`);
      showAlert('Matériel supprimé avec succès', 'success');
      fetchMateriels();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la suppression", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la sélection d'un emplacement
  const handleEmplacementSelect = (emplacement) => {
    setFormData(prev => ({
      ...prev,
      code_empl: emplacement.code_empl,
      num_depa: String(emplacement.id_depart || ''),
      ville: emplacement.ville || '',
      adresse_empl: emplacement.adresse_empl || '',
      distrinct: emplacement.distrinct || '',
      Region: emplacement.Region || '',
      num_porte: emplacement.num_porte || '',
      type_dir: emplacement.Direction?.type_dir || '',
      nom_dir: emplacement.Direction?.nom_dir || ''
    }));
    setSearchEmplacement(`${emplacement.adresse_empl || ''} - ${emplacement.distrinct || ''} - ${emplacement.ville || ''}`);
    setShowNewEmplacementFields(true);
  };

  return (
    <div className="container-fluid"> 
      <style>
        {`
          .emplacement-search {
            position: relative;
          }
          .emplacement-search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 1000;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            max-height: 200px;
            overflow-y: auto;
            width: 100%;
          }
          .emplacement-search-results div {
            padding: 10px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            font-size: 14px;
          }
          .emplacement-search-results div:last-child {
            border-bottom: none;
          }
          .emplacement-search-results div:hover {
            background: #f5f5f5;
          }
          .emplacement-search-results .emplacement-info {
            display: flex;
            flex-direction: column;
          }
          .emplacement-search-results .emplacement-info span {
            margin-bottom: 2px;
          }
          .emplacement-search-results .new-emplacement {
            font-weight: bold;
            color: #28a745;
          }
        `}
      </style>
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
            <h4 className="mb-0 fw-bold">Gestion des Matériels</h4>
            <Button 
              variant="success"
              className="d-flex align-items-center gap-2"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FaPlus />
              <span>Nouveau Matériel</span>
            </Button>
          </div>

          {/* Filtres */}
          <Card className="border-0 mb-4 shadow-sm">
            <Card.Header className="bg-transparent border-0 pb-0 pt-3">
              <h5 className="mb-0">Filtres de recherche</h5>
            </Card.Header>
            <Card.Body>
              <Form className="mb-0">
                <Row className="g-3 align-items-end">
                  <Col md={5}>
                    <Form.Label>Rechercher par nom ou numéro de série</Form.Label>
                    <Form.Control
                      type="text"
                      name="search"
                      placeholder="Ex: Laptop, 4567-..."
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Date d'utilisation</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_entree"
                      value={filters.date_entree}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>État du matériel</Form.Label>
                    <Form.Select
                      name="etat"
                      value={filters.etat}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tous les états</option>
                      <option value="en service">En service</option>
                      <option value="hors service">Hors service</option>
                      <option value="en panne">En panne</option>
                      <option value="en reparation">En réparation</option>
                    </Form.Select>
                  </Col>
                  <Col md={1}>
                    <Button 
                      variant="outline-danger" 
                      className="w-100" 
                      onClick={resetFilters} 
                      title="Réinitialiser"
                    >
                      <FaTimes />
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Tableau des matériels */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">Registre des Matériels</h5>
              <div className="btn-group" role="group">
                <Button 
                  variant={viewMode === 'table' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="d-flex align-items-center gap-1"
                >
                  <FaList size={12} />
                  <span>Tableau</span>
                </Button>
                <Button 
                  variant={viewMode === 'cards' ? 'success' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="d-flex align-items-center gap-1"
                >
                  <FaThLarge size={12} />
                  <span>Cartes</span>
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-2 text-muted">Chargement des matériels...</p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="table-responsive">
                  <Table striped hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>N° Série</th>
                        <th>Nom</th>
                        <th>Modèle</th>
                        <th>État</th>
                        <th>Type</th>
                        <th>Marque</th>
                        <th>Catégorie</th>
                        <th>Ville</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiels.length > 0 ? (
                        materiels.map(materiel => (
                          <tr key={materiel.code_mat || materiel.id}>
                            <td className="fw-semibold">{materiel.numero_serie}</td>
                            <td className="text-primary fw-semibold">{materiel.nom}</td>
                            <td>{materiel.modele || 'N/A'}</td>
                            <td>
                              <span className={`badge ${
                                materiel.etat === 'en service' ? 'bg-success' :
                                materiel.etat === 'en panne' ? 'bg-warning text-dark' : 
                                materiel.etat === 'en reparation' ? 'bg-info' : 'bg-danger'
                              }`}>
                                {materiel.etat}
                              </span>
                            </td>
                            <td>{materiel.type_equipement}</td>
                            <td>{materiel.marque}</td>
                            <td>{materiel.nom_cate}</td>
                            <td>{materiel.ville}</td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(materiel.code_mat)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(materiel.code_mat)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4 text-muted">
                            Aucun matériel trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Row className="g-3 p-3">
                  {materiels.length > 0 ? (
                    materiels.map(materiel => (
                      <Col key={materiel.code_mat || materiel.id} xs={12} sm={6} md={4} lg={3}>
                        <Card className="h-100 shadow-sm border border-light-subtle">
                          <Card.Body className="d-flex flex-column p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className={`badge ${
                                materiel.etat === 'en service' ? 'bg-success' :
                                materiel.etat === 'en panne' ? 'bg-warning text-dark' : 
                                materiel.etat === 'en reparation' ? 'bg-info' : 'bg-danger'
                              }`}>
                                {materiel.etat || 'N/A'}
                              </span>
                              <span className="text-muted small fw-semibold">{materiel.nom_cate || 'N/A'}</span>
                            </div>
                            <div className="text-center mb-3">
                              {/* Flaticon based on category */}
                              <img 
                                src={`https://cdn-icons-png.flaticon.com/512/${
                                  materiel.nom_cate?.toLowerCase().includes('ordinateur') || materiel.nom_cate?.toLowerCase().includes('pc') ? '689/689314' :
                                  materiel.nom_cate?.toLowerCase().includes('imprimante') ? '1041/1041984' :
                                  materiel.nom_cate?.toLowerCase().includes('serveur') ? '2905/2905955' :
                                  materiel.nom_cate?.toLowerCase().includes('switch') || materiel.nom_cate?.toLowerCase().includes('reseau') ? '2906/2906041' :
                                  materiel.nom_cate?.toLowerCase().includes('onduleur') ? '2784/2784013' :
                                  '953/953046'
                                }.png`} 
                                alt={materiel.nom_cate} 
                                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/953/953046.png'; }}
                              />
                            </div>
                            <h6 className="fw-bold mb-2 text-primary text-center">{materiel.nom || 'N/A'}</h6>
                            <div className="text-muted small mb-3">
                              <div className="mb-1"><strong>S/N:</strong> {materiel.numero_serie || 'N/A'}</div>
                              <div className="mb-1"><strong>Marque:</strong> {materiel.marque || 'N/A'} {materiel.modele && `(${materiel.modele})`}</div>
                              <div className="mb-1"><strong>Type:</strong> {materiel.type_equipement || 'N/A'}</div>
                              <div><strong>Emplacement:</strong> {materiel.ville || 'N/A'}</div>
                            </div>
                            <div className="mt-auto d-flex justify-content-end gap-2 pt-2 border-top">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleEdit(materiel.code_mat)}
                                className="d-flex align-items-center gap-1"
                              >
                                <FaEdit size={12} />
                                <span>Modifier</span>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(materiel.code_mat)}
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <div className="text-center p-5 text-muted col-12">
                      Aucun matériel ne correspond aux critères.
                    </div>
                  )}
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Modal pour ajouter un matériel */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un nouveau matériel</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
              <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Step indicator */}
                <div className="d-flex justify-content-between mb-4 mt-2 px-3">
                  {['Caractéristiques', 'Emplacement', 'Détenteur & Fournisseur'].map((stepName, index) => {
                    const stepNum = index + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;
                    return (
                      <div key={stepNum} className="d-flex align-items-center">
                        <div className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${
                          isActive ? 'bg-success text-white' : isCompleted ? 'bg-success text-white' : 'bg-light text-muted border'
                        }`} style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {stepNum}
                        </div>
                        <span className={`ms-2 d-none d-md-inline small fw-semibold ${
                          isActive ? 'text-success' : 'text-muted'
                        }`}>
                          {stepName}
                        </span>
                        {stepNum < 3 && <div className="mx-2 d-none d-md-block" style={{ width: '40px', height: '2px', backgroundColor: isCompleted ? '#28a745' : '#e2e8f0' }}></div>}
                      </div>
                    );
                  })}
                </div>

                {submitSuccess ? (
                  <Alert variant="success">
                    Matériel ajouté avec succès !
                  </Alert>
                ) : (
                  <>
                    {/* Étape 1: Informations équipement */}
                    {currentStep === 1 && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <Form.Label>Catégorie <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            name="id_categorie"
                            value={formData.id_categorie}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            {categories.map(cat => (
                              <option key={cat.id_cate} value={cat.id_cate}>{cat.nom_cate}</option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Numéro de série <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="numero_serie"
                            value={formData.numero_serie}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Nom de l'équipement <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="nom_equi"
                            value={formData.nom_equi}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Modèle</Form.Label>
                          <Form.Control
                            type="text"
                            name="modele"
                            value={formData.modele}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Marque <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="marque"
                            value={formData.marque}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>État</Form.Label>
                          <Form.Select
                            name="etat"
                            value={formData.etat}
                            onChange={handleChange}
                          >
                            <option value="en service">En service</option>
                            <option value="hors service">Hors service</option>
                            <option value="en panne">En panne</option>
                            <option value="en reparation">En réparation</option>
                          </Form.Select>
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Type d'équipement</Form.Label>
                          <Form.Select
                            name="type_equi"
                            value={formData.type_equi}
                            onChange={handleChange}
                          >
                            <option value="Fixe">Matériel fixe</option>
                            <option value="Mobile">Matériel mobile</option>
                            <option value="Accessoire">Accessoire</option>
                          </Form.Select>
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Date d'utilisation</Form.Label>
                          <Form.Control
                            type="date"
                            name="date_utilisation"
                            value={formData.date_utilisation}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    {/* Étape 2: Emplacement */}
                    {currentStep === 2 && (
                      <div className="row g-3">
                        <div className="col-md-12">
                          <Form.Label>Rechercher un emplacement existant</Form.Label>
                          <div className="emplacement-search">
                            <Form.Control
                              type="text"
                              placeholder="Rechercher par adresse, district, ville, région..."
                              value={searchEmplacement}
                              onChange={(e) => setSearchEmplacement(e.target.value)}
                            />
                            {searchEmplacement && filteredEmplacements.length > 0 && (
                              <div className="emplacement-search-results">
                                <div
                                  className="new-emplacement"
                                  onClick={() => {
                                    setShowNewEmplacementFields(true);
                                    setSearchEmplacement('');
                                    setFormData(prev => ({
                                      ...prev,
                                      code_empl: '',
                                      num_depa: '',
                                      ville: '',
                                      adresse_empl: '',
                                      distrinct: '',
                                      Region: '',
                                      num_porte: '',
                                      type_dir: '',
                                      nom_dir: ''
                                    }));
                                  }}
                                >
                                  + Créer un nouvel emplacement
                                </div>
                                {filteredEmplacements.map((empl) => (
                                  <div
                                    key={empl.code_empl}
                                    onClick={() => handleEmplacementSelect(empl)}
                                  >
                                    <div className="emplacement-info">
                                      <span><strong>Adresse:</strong> {empl.adresse_empl || 'N/A'}</span>
                                      <span><strong>District:</strong> {empl.distrinct || 'N/A'}</span>
                                      <span><strong>Ville:</strong> {empl.ville || 'N/A'}</span>
                                      <span><strong>Région:</strong> {empl.Region || 'N/A'}</span>
                                      <span><strong>Département:</strong> {empl.Departement?.nom_depart || 'N/A'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {searchEmplacement && filteredEmplacements.length === 0 && (
                              <div className="emplacement-search-results">
                                <div
                                  className="new-emplacement"
                                  onClick={() => {
                                    setShowNewEmplacementFields(true);
                                    setSearchEmplacement('');
                                  }}
                                >
                                  + Créer un nouvel emplacement
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-12">
                          <hr />
                          <Form.Label className="fw-semibold">Détails de l'emplacement</Form.Label>
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Département <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            name="num_depa"
                            value={formData.num_depa}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            {departements.map(dep => (
                              <option key={dep.id_depart} value={String(dep.id_depart)}>
                                {dep.nom_depart} - {dep.type_depart}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        {formData.num_depa && ['DST', 'CIRTOPO'].includes(departements.find(dep => String(dep.id_depart) === formData.num_depa)?.type_depart || '') && (
                          <>
                            <div className="col-md-6">
                              <Form.Label>Type de direction</Form.Label>
                              <Form.Select
                                name="type_dir"
                                value={formData.type_dir}
                                onChange={handleChange}
                              >
                                <option value="">Sélectionner...</option>
                                <option value="Service">Service</option>
                                <option value="Division">Division</option>
                              </Form.Select>
                            </div>
                            <div className="col-md-6">
                              <Form.Label>Nom de la direction</Form.Label>
                              <Form.Control
                                type="text"
                                name="nom_dir"
                                value={formData.nom_dir}
                                onChange={handleChange}
                              />
                            </div>
                          </>
                        )}
                        <div className="col-md-6">
                          <Form.Label>Ville <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            name="ville"
                            value={formData.ville}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Sélectionner une ville...</option>
                            <option value="Antananarivo">Antananarivo</option>
                            <option value="Fianarantsoa">Fianarantsoa</option>
                            <option value="Toamasina">Toamasina</option>
                            <option value="Toliara">Toliara</option>
                            <option value="Antsiranana">Antsiranana</option>
                            <option value="Mahajanga">Mahajanga</option>
                          </Form.Select>
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Adresse <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="adresse_empl"
                            value={formData.adresse_empl}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <Form.Label>N° de Porte</Form.Label>
                          <Form.Control
                            name="num_porte"
                            type="text"
                            onChange={handleChange}
                            value={formData.num_porte}
                          />
                        </div>
                        <div className="col-md-4">
                          <Form.Label>Circonscription</Form.Label>
                          <Form.Control 
                            type="text"
                            name="distrinct"
                            value={formData.distrinct}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <Form.Label>Région</Form.Label>
                          <Form.Control
                            type="text"
                            name="Region"
                            value={formData.Region}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    {/* Étape 3: Détenteur et Fournisseur */}
                    {currentStep === 3 && (
                      <div className="row g-3">
                        <div className="col-12 mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Matériel attribué à un détenteur"
                            name="attribue"
                            checked={formData.attribue}
                            onChange={handleChange}
                          />
                        </div>
                        {formData.attribue && (
                          <>
                            <div className="col-md-6">
                              <Form.Label>Nom du détenteur <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="text"
                                name="nom_det"
                                value={formData.nom_det}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <Form.Label>Prénom du détenteur <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="text"
                                name="prenom_det"
                                value={formData.prenom_det}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <Form.Label>Matricule</Form.Label>
                              <Form.Control
                                type="text"
                                name="num_im"
                                value={formData.num_im}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <Form.Label>Fonction</Form.Label>
                              <Form.Control
                                type="text"
                                name="fonction"
                                value={formData.fonction}
                                onChange={handleChange}
                              />
                            </div>
                          </>
                        )}
                        <div className="col-12 mt-4">
                          <h6 className="fw-semibold">Informations fournisseur (optionnel)</h6>
                          <hr />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Nom du fournisseur</Form.Label>
                          <Form.Control
                            type="text"
                            name="nom_four"
                            value={formData.nom_four}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Label>Contact</Form.Label>
                          <Form.Control
                            type="text"
                            name="contact_four"
                            value={formData.contact_four}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12">
                          <Form.Label>Adresse du fournisseur</Form.Label>
                          <Form.Control
                            type="text"
                            name="adresse_four"
                            value={formData.adresse_four}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Modal.Body>
              <Modal.Footer className="bg-light">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (currentStep === 1) {
                      setShowModal(false);
                      resetForm();
                    } else {
                      prevStep();
                    }
                  }}
                  disabled={loading}
                >
                  {currentStep === 1 ? 'Annuler' : 'Précédent'}
                </Button>
                {!submitSuccess && (
                  currentStep < 3 ? (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={loading}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'En cours...' : 'Enregistrer'}
                    </Button>
                  )
                )}
              </Modal.Footer>
            </form>
          </Modal>

          {/* Modal de confirmation de suppression */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmation de suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Êtes-vous sûr de vouloir supprimer ce matériel ? Cette action est irréversible.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </Modal.Footer>
          </Modal>

          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </div>
    </div>
  );
}

export default Materiel;
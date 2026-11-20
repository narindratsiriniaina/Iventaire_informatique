import { useState, useEffect } from "react";
import axios from 'axios';
import { Card, Button, Table, Form, Alert, Row, Col, Badge, Spinner, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nav from '../Menu';

function Affectation() {
    // États pour le chargement
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingAffectations, setLoadingAffectations] = useState(false);
    
    // États pour les données
    const [categories, setCategories] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [materiels, setMateriels] = useState([]);
    const [affectations, setAffectations] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    
    // États pour les filtres
    const [filters, setFilters] = useState({
        id_categorie: '',
        id_depart: '',
        search: ''
    });
    
    // États pour le formulaire
    const [formData, setFormData] = useState({
        code_mat: '',
        id_empl_source: '',
        id_depart_source: '',
        type_dir_source: '',
        nom_dir_source: '',
        adresse_source: '',
        ville_source: '',
        id_depart_destination: '',
        type_dir_destination: '',
        nom_dir_destination: '',
        adresse_destination: '',
        ville_destination: '',
        date_affectation: new Date().toISOString().split('T')[0],
        motif: ''
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Chargement initial des données
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                
                const [categoriesRes, departementsRes] = await Promise.all([
                    axios.get('http://localhost:5000/categories'),
                    axios.get('http://localhost:5000/departements')
                ]);
                
                setCategories(categoriesRes.data);
                setDepartements(departementsRes.data);
                
                await fetchAffectations();
                await fetchMateriels();
                
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                showAlert('Erreur lors du chargement des données', 'error');
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, []);

    // Charger les matériels avec filtres
    const fetchMateriels = async () => {
        try {
            setLoadingMaterials(true);
            const response = await axios.get('http://localhost:5000/materiels/filtres', {
                params: filters
            });
            setMateriels(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des matériels:", err);
            showAlert('Erreur lors du chargement des matériels', 'error');
        } finally {
            setLoadingMaterials(false);
        }
    };

    // Charger les affectations
    const fetchAffectations = async () => {
        try {
            setLoadingAffectations(true);
            const response = await axios.get('http://localhost:5000/affectations');
            setAffectations(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des affectations:", err);
            showAlert('Erreur lors du chargement des affectations', 'error');
        } finally {
            setLoadingAffectations(false);
        }
    };

    // Gestion des notifications
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

    // Gestion des changements de filtres
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Gestion des changements de formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Sélection d'un matériel
    const handleSelectMaterial = (materiel) => {
        setFormData({
            ...formData,
            code_mat: materiel.code_mat,
            id_empl_source: materiel.id_empl || '',
            id_depart_source: materiel.id_depart || '',
            type_dir_source: materiel.type_dir || '',
            nom_dir_source: materiel.nom_dir || '',
            adresse_source: materiel.adresse_empl || '',
            ville_source: materiel.ville || '',
            id_depart_destination: '',
            type_dir_destination: '',
            nom_dir_destination: '',
            adresse_destination: '',
            ville_destination: ''
        });
        
        setSelectedMaterial(materiel);
        setCurrentStep(2); // Move to next step after selection
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.code_mat || !formData.id_depart_destination) {
            showAlert("Veuillez sélectionner un matériel et un département de destination", 'warning');
            return;
        }

        try {
            setLoading(true);
            
            const affectationData = {
                code_mat: formData.code_mat,
                id_empl_source: formData.id_empl_source,
                id_empl_destination: formData.id_depart_destination,
                date_affectation: formData.date_affectation,
                motif: formData.motif,
                type_dir: formData.type_dir_destination,
                nom_dir: formData.nom_dir_destination,
                ville_destination: formData.ville_destination,
                adresse_destination: formData.adresse_destination
            };

            const response = await axios.post('http://localhost:5000/affectations', affectationData);
            
            if (response.data.success) {
                showAlert('Affectation enregistrée avec succès', 'success');
                await Promise.all([fetchAffectations(), fetchMateriels()]);
                resetForm();
                setShowModal(false);
                setCurrentStep(1);
            }
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Réinitialisation du formulaire
    const resetForm = () => {
        setFormData({
            code_mat: '',
            id_empl_source: '',
            id_depart_source: '',
            type_dir_source: '',
            nom_dir_source: '',
            adresse_source: '',
            ville_source: '',
            id_depart_destination: '',
            type_dir_destination: '',
            nom_dir_destination: '',
            adresse_destination: '',
            ville_destination: '',
            date_affectation: new Date().toISOString().split('T')[0],
            motif: ''
        });
        setFilters({
            id_categorie: '',
            id_depart: '',
            search: ''
        });
        setSelectedMaterial(null);
    };

    // Vérifier si le département de destination est DST
    const isDestinationDST = departements.find(
        d => d.id_depart.toString() === formData.id_depart_destination.toString()
    )?.type_depart === "DST";

    // Handle modal open
    const handleOpenModal = () => {
        setShowModal(true);
        setCurrentStep(1);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
        setCurrentStep(1);
    };

    // Handle next step
    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="container-fluid mt-5 pt-3">
            <div className="row">
                <div className="col-md-2">
                    <Nav />
                </div>
                
                <div className="col-md-10">
                    <Card className="mb-4 mt-3"> 
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0">
                                Gestion des affectations
                            </h5>
                            <Button variant="primary" onClick={handleOpenModal}>
                                Nouvelle affectation
                            </Button>
                        </Card.Header>
                    </Card>

                    {/* Historique des affectations */}
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0">
                                Historique des affectations
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive" style={{overflowX: 'auto'}}>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th width="15%">Matériel</th>
                                            <th width="15%">N° Série</th>
                                            <th width="25%">Source</th>
                                            <th width="25%">Destination</th>
                                            <th width="10%">Date</th>
                                            <th width="10%">Motif</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingAffectations ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    <Spinner animation="border" />
                                                </td>
                                            </tr>
                                        ) : affectations.length > 0 ? (
                                            affectations.map(aff => (
                                                <tr key={aff.id_aff}>
                                                    <td>{aff.nom_materiel}</td>
                                                    <td>{aff.numero_serie}</td>
                                                    <td>
                                                        <div>
                                                            <strong>Département:</strong> {aff.nom_depart_source || 'Non spécifié'}
                                                        </div>
                                                        <div className="text-muted small">
                                                            <strong>Adresse:</strong> {aff.adresse_source || 'Non spécifié'}
                                                            {aff.ville_source && `, ${aff.ville_source}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>Département:</strong> {aff.nom_depart_dest || 'Non spécifié'}
                                                        </div>
                                                        <div className="text-muted small">
                                                            <strong>Adresse:</strong> {aff.adresse_dest || 'Non spécifié'}
                                                            {aff.ville_dest && `, ${aff.ville_dest}`}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(aff.date_affectation).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        {aff.motif || 'Non spécifié'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    Aucune affectation trouvée
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Modal for new affectation */}
                    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Nouvelle affectation de matériel</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                {/* Step 1: Material Selection */}
                                {currentStep === 1 && (
                                    <div>
                                        <h6 className="mb-3">1. Sélection du matériel à affecter</h6>
                                        <Row className="g-3 mb-3">
                                            <Col md={4}>
                                                <Form.Label>Catégorie</Form.Label>
                                                <Form.Select
                                                    name="id_categorie"
                                                    value={filters.id_categorie}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value="">Toutes les catégories</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id_cate} value={cat.id_cate}>
                                                            {cat.nom_cate}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Département actuel</Form.Label>
                                                <Form.Select
                                                    name="id_depart"
                                                    value={filters.id_depart}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value="">Tous les départements</option>
                                                    {departements.map(dep => (
                                                        <option key={dep.id_depart} value={dep.id_depart}>
                                                            {dep.nom_depart}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Recherche</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="search"
                                                    placeholder="Nom ou N° série"
                                                    value={filters.search}
                                                    onChange={handleFilterChange}
                                                />
                                            </Col>
                                        </Row>

                                        <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                            <Table striped bordered hover size="sm" responsive>
                                                <thead>
                                                    <tr>
                                                        <th width="10%">Sélection</th>
                                                        <th width="15%">N° Série</th>
                                                        <th width="20%">Nom</th>
                                                        <th width="20%">Catégorie</th>
                                                        <th width="35%">Emplacement actuel</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loadingMaterials ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center">
                                                                <Spinner animation="border" size="sm" />
                                                            </td>
                                                        </tr>
                                                    ) : materiels.length > 0 ? (
                                                        materiels.map(materiel => (
                                                            <tr key={materiel.code_mat}>
                                                                <td>
                                                                    <Form.Check
                                                                        type="radio"
                                                                        name="selectedMaterial"
                                                                        checked={formData.code_mat === materiel.code_mat}
                                                                        onChange={() => handleSelectMaterial(materiel)}
                                                                    />
                                                                </td>
                                                                <td>{materiel.numero_serie}</td>
                                                                <td>{materiel.nom}</td>
                                                                <td>{materiel.nom_cate}</td>
                                                                <td>
                                                                    <div>
                                                                        <strong>Département:</strong> {materiel.nom_depart || 'Non spécifié'}
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        <strong>Adresse:</strong> {materiel.adresse_empl || 'Non spécifié'}
                                                                        {materiel.ville && `, ${materiel.ville}`}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted">
                                                                Aucun matériel trouvé
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Source Location */}
                                {currentStep === 2 && (
                                    <div>
                                        <h6 className="mb-3">2. Emplacement source (actuel)</h6>
                                        <div className="p-3 rounded bg-light mb-3">
                                            <Row>
                                                <Col md={6}>
                                                    <p>
                                                        <strong>Département:</strong> {selectedMaterial?.nom_depart || 'Non spécifié'}
                                                    </p>
                                                    {selectedMaterial?.type_depart === 'DST' && (
                                                        <>
                                                            <p>
                                                                <strong>Type direction:</strong> {selectedMaterial?.type_dir || 'Non spécifié'}
                                                            </p>
                                                            <p>
                                                                <strong>Nom direction:</strong> {selectedMaterial?.nom_dir || 'Non spécifié'}
                                                            </p>
                                                        </>
                                                    )}
                                                </Col>
                                                <Col md={6}>
                                                    <p>
                                                        <strong>Adresse:</strong> {selectedMaterial?.adresse_empl || 'Non spécifié'}
                                                    </p>
                                                    <p>
                                                        <strong>Ville:</strong> {selectedMaterial?.ville || 'Non spécifié'}
                                                    </p>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Destination Location */}
                                {currentStep === 3 && (
                                    <div>
                                        <h6 className="mb-3">3. Nouvel emplacement (destination)</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Label>Département</Form.Label>
                                                <Form.Select
                                                    name="id_depart_destination"
                                                    value={formData.id_depart_destination}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            id_depart_destination: e.target.value,
                                                            type_dir_destination: "",
                                                            nom_dir_destination: ""
                                                        }));
                                                    }}
                                                    required
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {departements.map(dep => (
                                                        <option key={dep.id_depart} value={dep.id_depart}>
                                                            {dep.nom_depart} ({dep.type_depart})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>

                                            {isDestinationDST && (
                                                <>
                                                    <Col md={3}>
                                                        <Form.Label>Type de direction</Form.Label>
                                                        <Form.Select
                                                            name="type_dir_destination"
                                                            value={formData.type_dir_destination}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="">Sélectionner...</option>
                                                            <option value="Service">Service</option>
                                                            <option value="Division">Division</option>
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={3}>
                                                        <Form.Label>Nom de la direction</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="nom_dir_destination"
                                                            value={formData.nom_dir_destination}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </Col>
                                                </>
                                            )}

                                            <Col md={6}>
                                                <Form.Label>Adresse</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="adresse_destination"
                                                    value={formData.adresse_destination}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Ville</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="ville_destination"
                                                    value={formData.ville_destination}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {/* Step 4: Affectation Details */}
                                {currentStep === 4 && (
                                    <div>
                                        <h6 className="mb-3">4. Détails de l'affectation</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Label>Date d'affectation</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="date_affectation"
                                                    value={formData.date_affectation}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Motif</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="motif"
                                                    value={formData.motif}
                                                    onChange={handleChange}
                                                    placeholder="Raison de l'affectation"
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Annuler
                            </Button>
                            
                            {currentStep > 1 && (
                                <Button variant="outline-primary" onClick={handlePrevious}>
                                    Précédent
                                </Button>
                            )}
                            
                            {currentStep < 4 ? (
                                <Button 
                                    variant="primary" 
                                    onClick={handleNext}
                                    disabled={currentStep === 1 && !formData.code_mat}
                                >
                                    Suivant
                                </Button>
                            ) : (
                                <Button 
                                    variant="success" 
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            En cours...
                                        </>
                                    ) : (
                                        "Enregistrer l'affectation"
                                    )}
                                </Button>
                            )}
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

export default Affectation;
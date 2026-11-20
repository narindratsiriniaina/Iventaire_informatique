import { useState, useEffect } from "react";
import axios from 'axios';
import { Card, Button, Table, Form, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Affectation() {
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const navigate = useNavigate();
    const [departements, setDepartements] = useState([]);
    const [materiels, setMateriels] = useState([]);
    const [historique, setHistorique] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [showMaterialsTable, setShowMaterialsTable] = useState(false);

    const handleClick = () => {
        navigate('/Equi', { state: { from: 'Mouvement' } });
    };

    const [filters, setFilters] = useState({
        type_depart: '',
        adresse: '',
        search: '',
        nom_dete: '',
        attribue_only: false
    });

    const [formData, setFormData] = useState({
        code_mat: '',
        ville: '',
        adresse_empl: '',
        nom_depart: '',
        nom_dir: '',
        num_porte :'',
        distrinct: '',
        Region: '',
        type_dir: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const API_BASE_URL = 'http://localhost:3000';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const departementsRes = await axios.get(`${API_BASE_URL}/departements`);
                setDepartements(departementsRes.data.data || departementsRes.data);
                await fetchHistorique();
                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                showAlert('Erreur lors du chargement des données', 'error');
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchMateriels = async () => {
        try {
            setLoadingMaterials(true);
            const response = await axios.get(`${API_BASE_URL}/materiels`, {
                params: {
                    ...filters,
                    attribue_only: filters.attribue_only ? 'true' : undefined
                }
            });
            setMateriels(response.data);
            setShowMaterialsTable(true);
        } catch (err) {
            console.error("Erreur lors du chargement des matériels:", err);
            showAlert('Erreur lors du chargement des matériels', 'error');
            setShowMaterialsTable(false); 
        } finally {
            setLoadingMaterials(false);
        }
    };

    const fetchHistorique = async () => {
        try {
            setLoadingHistory(true);
            const response = await axios.get(`${API_BASE_URL}/historique`);
            setHistorique(response.data.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement de l'historique:", err);
            showAlert("Erreur lors du chargement de l'historique", 'error');
        } finally {
            setLoadingHistory(false);
        }
    };

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

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectMaterial = (materiel) => {
        setFormData(prev => ({
            ...prev,
            code_mat: materiel.code_mat
        }));
        setSelectedMaterial(materiel);
        setCurrentStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code_mat || !formData.nom_depart) {
            showAlert("Veuillez sélectionner un matériel et un département de destination", 'warning');
            return;
        }

        try {
            setLoading(true);

            const affectationData = {
                code_mat: formData.code_mat,
                ville: formData.ville,
                adresse_empl: formData.adresse_empl,
                nom_depart: formData.nom_depart,
                nom_dir: formData.nom_dir || null,
                distrinct: formData.distrinct || null,
                Region: formData.Region || null,
                type_dir: formData.type_dir || null
            };

            const response = await axios.post(`${API_BASE_URL}/historique`, affectationData);

            if (response.data.message.includes("succès")) {
                showAlert('Affectation enregistrée avec succès', 'success');
                await Promise.all([fetchHistorique(), fetchMateriels()]);
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

    const resetForm = () => {
        setFormData({
            code_mat: '',
            ville: '',
            adresse_empl: '',
            nom_depart: '',
            nom_dir: '',
            distrinct: '',
            Region: '',
            type_dir: ''
        });
        setFilters({
            type_depart: '',
            adresse: '',
            search: '',
            nom_dete: '',
            attribue_only: false
        });
        setSelectedMaterial(null);
        setShowMaterialsTable(false);
    };

    const isDestinationDST = departements.find(
        d => d.nom_depart === formData.nom_depart
    )?.type_depart === "DST";

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
        setCurrentStep(1);
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="container-fluid py-3 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">Historique des Affectations</h4>
                <Button variant="success" onClick={handleClick}>
                    Nouvelle affectation
                </Button>
            </div>

            <Card className="dashboard-card border-0">
                <Card.Header className="bg-transparent border-0 pb-0">
                    <h5 className="mb-0">Derniers Mouvements de Matériel</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive border-0">
                        <Table striped hover className="align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Matériel</th>
                                    <th>N° Série</th>
                                    <th>Source</th>
                                    <th>Destination</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingHistory ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <Spinner animation="border" size="sm" className="text-success" />
                                        </td>
                                    </tr>
                                ) : historique.length > 0 ? (
                                    historique.map(hist => (
                                        <tr key={hist.id_hist}>
                                            <td className="fw-semibold text-primary">{hist.materiel?.nom || 'Non spécifié'}</td>
                                            <td className="fw-semibold">{hist.materiel?.numero_serie || 'Non spécifié'}</td>
                                            <td>
                                                <div>
                                                    <strong>Ville:</strong> {hist.emplacement_source?.ville || 'Non spécifié'}
                                                </div>
                                                <div className="text-muted small">
                                                    <strong>Adresse:</strong> {hist.emplacement_source?.adresse_empl || 'Non spécifié'}
                                                    {hist.emplacement_source?.departement?.type_depart === 'DST' && hist.emplacement_source?.direction?.length > 0 && (
                                                        <div>
                                                            <strong>Direction:</strong> {hist.emplacement_source?.direction[0].nom_dir} ({hist.emplacement_source?.direction[0]?.type_dir})
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>Ville:</strong> {hist.emplacement_destination?.ville || 'Non spécifié'}
                                                </div>
                                                <div className="text-muted small">
                                                    <strong>Adresse:</strong> {hist.emplacement_destination?.adresse_empl || 'Non spécifié'}
                                                    {hist.emplacement_destination?.departement?.type_depart === 'DST' && hist.emplacement_destination?.direction?.length > 0 && (
                                                        <div>
                                                            <strong>Direction:</strong> {hist.emplacement_destination?.direction[0]?.nom_dir} ({hist.emplacement_destination?.direction[0]?.type_dir})
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(hist.date_mouvement).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            Aucune affectation trouvée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal pour nouvelle affectation */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Nouvelle affectation de matériel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* Step indicator */}
                        <div className="d-flex justify-content-between mb-4 mt-2 px-3">
                            {['Sélection Matériel', 'Source', 'Destination', 'Confirmation'].map((stepName, index) => {
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
                                        {stepNum < 4 && <div className="mx-2 d-none d-md-block" style={{ width: '40px', height: '2px', backgroundColor: isCompleted ? '#28a745' : '#e2e8f0' }}></div>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Étape 1 : Sélection du matériel */}
                        {currentStep === 1 && (
                            <div>
                                <h6 className="mb-3 fw-bold">1. Sélection du matériel à affecter</h6>
                                <Row className="g-3 mb-3">
                                    <Col md={4}>
                                        <Form.Label>Type de département</Form.Label>
                                        <Form.Select
                                            name="type_depart"
                                            value={filters.type_depart}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">Tous les types</option>
                                            <option value="DST">DST</option>
                                            <option value="CIRTOPO">CIRTOPO</option>
                                        </Form.Select>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Adresse</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="adresse"
                                            placeholder="Adresse de l'emplacement"
                                            value={filters.adresse}
                                            onChange={handleFilterChange}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label>Recherche</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="search"
                                            placeholder="Nom, N° série, marque, modèle"
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Nom du détenteur</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nom_dete"
                                            placeholder="Nom ou prénom"
                                            value={filters.nom_dete}
                                            onChange={handleFilterChange}
                                        />
                                    </Col>
                                    <Col md={6} className="d-flex align-items-center mt-4">
                                        <Form.Check
                                            type="checkbox"
                                            name="attribue_only"
                                            checked={filters.attribue_only}
                                            onChange={handleFilterChange}
                                            label="Afficher seulement les matériels attribués"
                                        />
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-end mb-3">
                                    <Button variant="success" onClick={fetchMateriels}>
                                        Rechercher
                                    </Button>
                                </div>

                                {showMaterialsTable && (
                                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <Table striped hover className="align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th width="10%">Sélection</th>
                                                    <th width="20%">N° Série</th>
                                                    <th width="30%">Nom</th>
                                                    <th width="20%">Département</th>
                                                    <th width="20%">Ville</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loadingMaterials ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-3">
                                                            <Spinner animation="border" size="sm" className="text-success" />
                                                        </td>
                                                    </tr>
                                                ) : materiels.length > 0 ? (
                                                    materiels.map(materiel => (
                                                        <tr key={materiel.code_mat}>
                                                            <td className="text-center">
                                                                <Form.Check
                                                                    type="radio"
                                                                    name="selectedMaterial"
                                                                    checked={formData.code_mat === materiel.code_mat}
                                                                    onChange={() => handleSelectMaterial(materiel)}
                                                                />
                                                            </td>
                                                            <td className="fw-semibold">{materiel.numero_serie}</td>
                                                            <td className="text-primary fw-semibold">{materiel.nom}</td>
                                                            <td>{materiel.nom_depart || 'Non spécifié'}</td>
                                                            <td>{materiel.ville || 'Non spécifié'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted py-3">
                                                            Aucun matériel trouvé
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Étape 2 : Emplacement source */}
                        {currentStep === 2 && (
                            <div>
                                <h6 className="mb-3 fw-bold">2. Emplacement source (actuel)</h6>
                                <div className="p-3 rounded bg-light border mb-3">
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <p className="mb-2">
                                                <strong>Département:</strong> <span className="text-primary">{selectedMaterial?.nom_depart || 'Non spécifié'}</span>
                                            </p>
                                            {selectedMaterial?.type_depart === 'DST' && (
                                                <>
                                                    <p className="mb-2">
                                                        <strong>Type direction:</strong> {selectedMaterial?.type_dir || 'Non spécifié'}
                                                    </p>
                                                    <p className="mb-2">
                                                        <strong>Nom direction:</strong> {selectedMaterial?.nom_dir || 'Non spécifié'}
                                                    </p>
                                                </>
                                            )}
                                        </Col>
                                        <Col md={6}>
                                            <p className="mb-2">
                                                <strong>Adresse:</strong> {selectedMaterial?.adresse_empl || 'Non spécifié'}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Ville:</strong> {selectedMaterial?.ville || 'Non spécifié'}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Région:</strong> {selectedMaterial?.Region || 'Non spécifié'}
                                            </p>
                                            <p className="mb-0">
                                                <strong>District:</strong> {selectedMaterial?.distrinct || 'Non spécifié'}
                                            </p>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        )}

                        {/* Étape 3 : Emplacement de destination */}
                        {currentStep === 3 && (
                            <div>
                                <h6 className="mb-3 fw-bold">3. Nouvel emplacement (destination)</h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Label>Département</Form.Label>
                                        <Form.Select
                                            name="nom_depart"
                                            value={formData.nom_depart}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    nom_depart: e.target.value,
                                                    type_dir: '',
                                                    nom_dir: ''
                                                }));
                                            }}
                                            required
                                        >
                                            <option value="">Sélectionner...</option>
                                            {departements.map(dep => (
                                                <option key={dep.id_depart} value={dep.nom_depart}>
                                                    {dep.nom_depart} ({dep.type_depart})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Ville</Form.Label>
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
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Adresse</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="adresse_empl"
                                            value={formData.adresse_empl}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>District</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="distrinct"
                                            value={formData.distrinct}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Région</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Region"
                                            value={formData.Region}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    {isDestinationDST && (
                                        <>
                                            <Col md={6}>
                                                <Form.Label>Type de direction</Form.Label>
                                                <Form.Select
                                                    name="type_dir"
                                                    value={formData.type_dir}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="Service">Service</option>
                                                    <option value="Division">Division</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Nom de la direction</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="nom_dir"
                                                    value={formData.nom_dir}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )}
                        {/* Étape 4 : Confirmation */}
                        {currentStep === 4 && (
                            <div>
                                <h6 className="mb-3 fw-bold">4. Confirmation de l'affectation</h6>
                                <div className="p-3 rounded bg-light border mb-3">
                                    <h6 className="fw-bold text-success border-bottom pb-2 mb-3">Matériel à affecter</h6>
                                    <Row className="g-3 mb-3">
                                        <Col md={6}><p className="mb-1"><strong>N° Série:</strong> {selectedMaterial?.numero_serie}</p></Col>
                                        <Col md={6}><p className="mb-1"><strong>Nom:</strong> {selectedMaterial?.nom}</p></Col>
                                    </Row>

                                    <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-4">Emplacement Initial (Source)</h6>
                                    <Row className="g-3 mb-3">
                                        <Col md={6}><p className="mb-1"><strong>Département:</strong> {selectedMaterial?.nom_depart}</p></Col>
                                        <Col md={6}><p className="mb-1"><strong>Ville:</strong> {selectedMaterial?.ville}</p></Col>
                                        <Col md={12}><p className="mb-1"><strong>Adresse:</strong> {selectedMaterial?.adresse_empl}</p></Col>
                                    </Row>

                                    <h6 className="fw-bold text-warning border-bottom pb-2 mb-3 mt-4">Nouvel Emplacement (Destination)</h6>
                                    <Row className="g-3">
                                        <Col md={6}><p className="mb-1"><strong>Département:</strong> {formData.nom_depart}</p></Col>
                                        <Col md={6}><p className="mb-1"><strong>Ville:</strong> {formData.ville}</p></Col>
                                        <Col md={12}><p className="mb-1"><strong>Adresse:</strong> {formData.adresse_empl}</p></Col>
                                        {formData.distrinct && <Col md={6}><p className="mb-1"><strong>District:</strong> {formData.distrinct}</p></Col>}
                                        {formData.Region && <Col md={6}><p className="mb-1"><strong>Région:</strong> {formData.Region}</p></Col>}
                                        {isDestinationDST && (
                                            <>
                                                <Col md={6}><p className="mb-1"><strong>Direction:</strong> {formData.nom_dir} ({formData.type_dir})</p></Col>
                                            </>
                                        )}
                                    </Row>
                                </div>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    {currentStep > 1 && (
                        <Button variant="outline-success" onClick={handlePrevious}>
                            Précédent
                        </Button>
                    )}
                    {currentStep < 4 ? (
                        <Button
                            variant="success"
                            onClick={handleNext}
                            disabled={
                                (currentStep === 1 && !formData.code_mat) ||
                                (currentStep === 3 && (!formData.nom_depart || !formData.ville || !formData.adresse_empl || (isDestinationDST && (!formData.nom_dir || !formData.type_dir))))
                            }
                        >
                            Suivant
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    En cours...
                                </>
                            ) : (
                                "Confirmer l'affectation"
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
    );
}

export default Affectation;
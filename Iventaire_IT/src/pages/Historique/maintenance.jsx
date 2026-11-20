import React, { useState, useEffect } from 'react';
import { 
    Card, Button, Table, Form, Alert, Row, Col, 
    Modal, Spinner, Badge, InputGroup, FormSelect 
} from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Maintenance() {
    // États pour le chargement
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingMaintenances, setLoadingMaintenances] = useState(false);
    const [loadingTechniciens, setLoadingTechniciens] = useState(false);
    
    // États pour les données
    const [materiels, setMateriels] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [techniciens, setTechniciens] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    
    // États pour les filtres
    const [filters, setFilters] = useState({
        search: '',
        etat: '',
        statut: ''
    });
    
    // États pour le formulaire
    const [formData, setFormData] = useState({
        code_mat: '',
        type_main: 'preventive',
        description: '',
        date_main: new Date().toISOString().split('T')[0],
        statut: 'en_cours',
        id_tech: '',
        observations: '',
        cout: 0
    });

    // États pour le modal
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create' or 'edit'

    // Chargement initial des données
    useEffect(() => {
        fetchMaintenances();
        fetchTechniciens();
        fetchMateriels();
    }, []);

    // Charger les matériels
    const fetchMateriels = async () => {
        try {
            setLoadingMaterials(true);
            const response = await axios.get('http://localhost:5000/materiels');
            setMateriels(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des matériels:", err);
            showAlert('Erreur lors du chargement des matériels', 'error');
        } finally {
            setLoadingMaterials(false);
        }
    };

    // Charger les maintenances
    const fetchMaintenances = async () => {
        try {
            setLoadingMaintenances(true);
            const response = await axios.get('http://localhost:5000/maintenances');
            setMaintenances(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des maintenances:", err);
            showAlert('Erreur lors du chargement des maintenances', 'error');
        } finally {
            setLoadingMaintenances(false);
        }
    };

    // Charger les techniciens
    const fetchTechniciens = async () => {
        try {
            setLoadingTechniciens(true);
            // Cette route doit être créée dans votre backend
            const response = await axios.get('http://localhost:5000/techniciens');
            setTechniciens(response.data);
        } catch (err) {
            console.error("Erreur lors du chargement des techniciens:", err);
            showAlert('Erreur lors du chargement des techniciens', 'error');
        } finally {
            setLoadingTechniciens(false);
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

    // Gestion des changements de formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Sélection d'un matériel
    const handleSelectMaterial = (materiel) => {
        setFormData({
            ...formData,
            code_mat: materiel.code_mat
        });
        setSelectedMaterial(materiel);
    };

    // Ouvrir le modal de création
    const handleOpenCreateModal = () => {
        setFormData({
            code_mat: '',
            type_main: 'preventive',
            description: '',
            date_main: new Date().toISOString().split('T')[0],
            statut: 'en_cours',
            id_tech: '',
            observations: '',
            cout: 0
        });
        setSelectedMaterial(null);
        setModalType('create');
        setShowModal(true);
    };

    // Ouvrir le modal d'édition
    const handleOpenEditModal = (maintenance) => {
        setFormData({
            code_mat: maintenance.code_mat,
            type_main: maintenance.type_main,
            description: maintenance.description,
            date_main: maintenance.date_main.split('T')[0],
            statut: maintenance.statut,
            id_tech: maintenance.id_tech || '',
            observations: maintenance.observations || '',
            cout: maintenance.cout || 0
        });
        
        // Trouver le matériel correspondant
        const mat = materiels.find(m => m.code_mat === maintenance.code_mat);
        setSelectedMaterial(mat);
        
        setModalType('edit');
        setShowModal(true);
    };

    // Fermer le modal
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.code_mat || !formData.description) {
            showAlert("Veuillez sélectionner un matériel et remplir la description", 'warning');
            return;
        }

        try {
            setLoading(true);
            
            const maintenanceData = {
                ...formData,
                date_main: formData.date_main
            };

            if (modalType === 'create') {
                // Création d'une nouvelle maintenance
                await axios.post('http://localhost:5000/maintenances', maintenanceData);
                showAlert('Maintenance créée avec succès', 'success');
            } else {
                // Mise à jour d'une maintenance existante
                // Vous devrez ajouter une route PUT dans votre backend pour gérer cela
                await axios.put(`http://localhost:5000/maintenances/${formData.id_main}`, maintenanceData);
                showAlert('Maintenance mise à jour avec succès', 'success');
            }

            // Si la maintenance est terminée, mettre à jour l'état du matériel
            if (formData.statut === 'terminee') {
                await axios.put(`http://localhost:5000/materiels/${formData.code_mat}/etat`, {
                    etat: 'service'
                });
            }

            await Promise.all([fetchMaintenances(), fetchMateriels()]);
            setShowModal(false);
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Gestion du statut des maintenances
    const getStatusBadge = (statut) => {
        switch(statut) {
            case 'en_cours':
                return <Badge bg="warning">En cours</Badge>;
            case 'terminee':
                return <Badge bg="success">Terminée</Badge>;
            case 'annulee':
                return <Badge bg="danger">Annulée</Badge>;
            default:
                return <Badge bg="secondary">{statut}</Badge>;
        }
    };

    // Gestion du type de maintenance
    const getTypeBadge = (type) => {
        switch(type) {
            case 'preventive':
                return <Badge bg="info">Préventive</Badge>;
            case 'corrective':
                return <Badge bg="danger">Corrective</Badge>;
            case 'amelioration':
                return <Badge bg="primary">Amélioration</Badge>;
            default:
                return <Badge bg="secondary">{type}</Badge>;
        }
    };

    return (
        <div className="container-fluid mt-5 pt-3">
            <div className="row">
                <div className="col-md-12">
                    <Card className="mb-4 mt-3">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0">Gestion des maintenances</h5>
                            <Button variant="primary" onClick={handleOpenCreateModal}>
                                Nouvelle maintenance
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher par matériel ou technicien"
                                        value={filters.search}
                                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filters.etat}
                                        onChange={(e) => setFilters({...filters, etat: e.target.value})}
                                    >
                                        <option value="">Tous les états</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={filters.type}
                                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="preventive">Préventive</option>
                                        <option value="corrective">Corrective</option>
                                        <option value="amelioration">Amélioration</option>
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Button variant="secondary" onClick={() => {
                                        setFilters({search: '', etat: '', type: ''});
                                        fetchMaintenances();
                                    }}>
                                        Réinitialiser
                                    </Button>
                                </Col>
                            </Row>

                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Matériel</th>
                                            <th>N° Série</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Technicien</th>
                                            <th>Date</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingMaintenances ? (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    <Spinner animation="border" />
                                                </td>
                                            </tr>
                                        ) : maintenances.length > 0 ? (
                                            maintenances.filter(maintenance => {
                                                // Filtrage côté client (pourrait être fait côté serveur)
                                                const matchesSearch = filters.search === '' || 
                                                    maintenance.nom_materiel.toLowerCase().includes(filters.search.toLowerCase()) ||
                                                    (maintenance.nom_tech && maintenance.nom_tech.toLowerCase().includes(filters.search.toLowerCase()));
                                                
                                                const matchesEtat = filters.etat === '' || maintenance.statut === filters.etat;
                                                const matchesType = filters.type === '' || maintenance.type_main === filters.type;
                                                
                                                return matchesSearch && matchesEtat && matchesType;
                                            }).map(maintenance => (
                                                <tr key={maintenance.id_main}>
                                                    <td>{maintenance.nom_materiel}</td>
                                                    <td>{maintenance.numero_serie}</td>
                                                    <td>{getTypeBadge(maintenance.type_main)}</td>
                                                    <td>{maintenance.description}</td>
                                                    <td>{maintenance.nom_tech || 'Non attribué'}</td>
                                                    <td>{new Date(maintenance.date_main).toLocaleDateString()}</td>
                                                    <td>{getStatusBadge(maintenance.statut)}</td>
                                                    <td>
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm" 
                                                            onClick={() => handleOpenEditModal(maintenance)}
                                                        >
                                                            Modifier
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted">
                                                    Aucune maintenance trouvée
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Modal pour créer/modifier une maintenance */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === 'create' ? 'Nouvelle maintenance' : 'Modifier maintenance'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* Section 1: Sélection du matériel */}
                        <Card className="mb-3">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">1. Sélection du matériel</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th width="10%">Sélection</th>
                                                <th width="15%">N° Série</th>
                                                <th width="20%">Nom</th>
                                                <th width="20%">État</th>
                                                <th width="35%">Emplacement</th>
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
                                                        <td>
                                                            <Badge bg={
                                                                materiel.etat === 'service' ? 'success' :
                                                                materiel.etat === 'en_panne' ? 'danger' :
                                                                materiel.etat === 'en_reparation' ? 'warning' : 'secondary'
                                                            }>
                                                                {materiel.etat}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            {materiel.adresse_empl || 'Non spécifié'}
                                                            {materiel.ville && `, ${materiel.ville}`}
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
                            </Card.Body>
                        </Card>

                        {/* Section 2: Détails de la maintenance */}
                        <Card className="mb-3">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">2. Détails de la maintenance</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Type de maintenance</Form.Label>
                                            <Form.Select
                                                name="type_main"
                                                value={formData.type_main}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="preventive">Préventive</option>
                                                <option value="corrective">Corrective</option>
                                                <option value="amelioration">Amélioration</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Statut</Form.Label>
                                            <Form.Select
                                                name="statut"
                                                value={formData.statut}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="en_cours">En cours</option>
                                                <option value="terminee">Terminée</option>
                                                <option value="annulee">Annulée</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date_main"
                                                value={formData.date_main}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Technicien</Form.Label>
                                            <Form.Select
                                                name="id_tech"
                                                value={formData.id_tech}
                                                onChange={handleChange}
                                            >
                                                <option value="">Sélectionner un technicien</option>
                                                {techniciens.map(tech => (
                                                    <option key={tech.id_tech} value={tech.id_tech}>
                                                        {tech.nom} {tech.prenom} ({tech.specialite})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Décrivez la maintenance à effectuer"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Observations</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="observations"
                                                value={formData.observations}
                                                onChange={handleChange}
                                                placeholder="Observations complémentaires"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Coût (€)</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    name="cout"
                                                    value={formData.cout}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <InputGroup.Text>€</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end gap-3">
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        En cours...
                                    </>
                                ) : (
                                    modalType === 'create' ? 'Créer la maintenance' : 'Mettre à jour'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
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

export default Maintenance;
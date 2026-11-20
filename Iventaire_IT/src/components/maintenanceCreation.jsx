import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Row, Col, Modal, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function MaintenanceCreate() {
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [loadingTechniciens, setLoadingTechniciens] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [materiels, setMateriels] = useState([]);
    const [techniciens, setTechniciens] = useState([]);
    const [filteredTechniciens, setFilteredTechniciens] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [technicienSearch, setTechnicienSearch] = useState('');
    const [showTechnicienModal, setShowTechnicienModal] = useState(false);
    const [newTechnicien, setNewTechnicien] = useState({
        nom_techn: '',
        prenom_techn: '',
        contact_techn: '',
        adresse_techn: ''
    });
    const [filtersMateriels, setFiltersMateriels] = useState({
        search: '',
        categorie: '',
        nom_dete: '',
        attribue_only: false
    });
    const [formData, setFormData] = useState({
        code_mat: '',
        type_main: 'preventive',
        description: '',
        date_main: new Date().toISOString().split('T')[0],
        statut: 'en_cours',
        code_techn: ''
    });
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchMateriels(), fetchTechniciens(), fetchCategories()]);
            } catch (err) {
                console.error("Erreur lors du chargement initial:", err);
                showAlert('Erreur lors du chargement initial', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchMateriels();
    }, [filtersMateriels]);

    useEffect(() => {
        if (technicienSearch) {
            const filtered = techniciens.filter(tech =>
                `${tech.nom_techn} ${tech.prenom_techn}`.toLowerCase().includes(technicienSearch.toLowerCase())
            );
            setFilteredTechniciens(filtered);
        } else {
            setFilteredTechniciens(techniciens);
        }
    }, [technicienSearch, techniciens]);

    const fetchMateriels = async () => {
        try {
            setLoadingMaterials(true);
            const response = await axios.get('http://localhost:3000/maintenance/materiels', {
                params: {
                    ...filtersMateriels,
                    attribue_only: filtersMateriels.attribue_only ? 'true' : undefined
                }
            });
            setMateriels(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des matériels:", err);
            showAlert('Erreur lors du chargement des matériels', 'error');
            setMateriels([]);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const fetchTechniciens = async () => {
        try {
            setLoadingTechniciens(true);
            const response = await axios.get('http://localhost:3000/technicien');
            setTechniciens(response.data.data || response.data || []);
            setFilteredTechniciens(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des techniciens:", err);
            showAlert('Erreur lors du chargement des techniciens', 'error');
            setTechniciens([]);
            setFilteredTechniciens([]);
        } finally {
            setLoadingTechniciens(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axios.get('http://localhost:3000/maintenance/categories');
            setCategories(response.data.data || response.data || []);
        } catch (err) {
            console.error("Erreur lors du chargement des catégories:", err);
            showAlert('Erreur lors du chargement des catégories', 'error');
            setCategories([]);
        } finally {
            setLoadingCategories(false);
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

    const handleFilterMaterielsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltersMateriels(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTechnicienSearch = (e) => {
        setTechnicienSearch(e.target.value);
    };

    const handleSelectMaterial = (materiel) => {
        setFormData({ ...formData, code_mat: materiel.code_mat });
        setSelectedMaterial(materiel);
    };

    const handleOpenCreateModal = () => {
        if (!formData.code_mat) {
            showAlert("Veuillez sélectionner un matériel avant de créer une maintenance", 'warning');
            return;
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOpenTechnicienModal = () => {
        setShowTechnicienModal(true);
    };

    const handleCloseTechnicienModal = () => {
        setShowTechnicienModal(false);
        setNewTechnicien({
            nom_techn: '',
            prenom_techn: '',
            contact_techn: '',
            adresse_techn: ''
        });
    };

    const handleNewTechnicienChange = (e) => {
        const { name, value } = e.target;
        setNewTechnicien(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateTechnicien = async () => {
        if (!newTechnicien.nom_techn || !newTechnicien.prenom_techn || !newTechnicien.contact_techn) {
            showAlert("Veuillez remplir le nom, prénom et contact du technicien", 'warning');
            return;
        }
        try {
            setLoadingTechniciens(true);
            const response = await axios.post('http://localhost:3000/technicien', newTechnicien);
            showAlert('Technicien créé avec succès', 'success');
            await fetchTechniciens();
            setFormData(prev => ({ ...prev, code_techn: response.data.code_techn }));
            handleCloseTechnicienModal();
        } catch (err) {
            console.error("Erreur lors de la création du technicien:", err);
            showAlert(err.response?.data?.message || 'Erreur lors de la création du technicien', 'error');
        } finally {
            setLoadingTechniciens(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code_mat || !formData.description) {
            showAlert("Veuillez sélectionner un matériel et remplir la description", 'warning');
            return;
        }
        try {
            setLoading(true);
            const maintenanceData = { ...formData, code_techn: formData.code_techn || null };
            await axios.post('http://localhost:3000/maintenance/maintenances', maintenanceData);
            showAlert('Maintenance créée avec succès', 'success');

            if (formData.statut === 'terminee') {
                await axios.put(`http://localhost:3000/maintenance/materiels/${formData.code_mat}/etat`, { etat: 'hors service'});

            }
            if (formData.statut === 'en_cours' ){
                await axios.put(`http://localhost:3000/maintenance/materiels/${formData.code_mat}/etat`, { etat: 'en reparation' });
            }

            await Promise.all([fetchMateriels(), fetchTechniciens(), fetchCategories()]);
            setShowModal(false);
            navigate('/ListeMain');
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" >
            <ToastContainer />
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <h6 className="mb-0">Rechercher les matériels</h6>
                            <Button variant="success" onClick={handleOpenCreateModal} disabled={!selectedMaterial}>
                                Créer maintenance
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3 mb-3">
                                <Col md={3}>
                                    <Form.Label>Nom ou Numéro de série</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="search"
                                        placeholder="Nom ou numéro de série"
                                        value={filtersMateriels.search}
                                        onChange={handleFilterMaterielsChange}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Catégorie</Form.Label>
                                    <Form.Select
                                        name="categorie"
                                        value={filtersMateriels.categorie}
                                        onChange={handleFilterMaterielsChange}
                                        disabled={loadingCategories}
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id_cate} value={cat.id_cate}>
                                                {cat.nom_cate}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Nom du détenteur</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nom_dete"
                                        placeholder="Nom ou prénom"
                                        value={filtersMateriels.nom_dete}
                                        onChange={handleFilterMaterielsChange}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Check
                                        type="checkbox"
                                        label="Matériels attribués uniquement"
                                        name="attribue_only"
                                        checked={filtersMateriels.attribue_only}
                                        onChange={handleFilterMaterielsChange}
                                    />
                                </Col>
                            </Row>
                            <div className="table-responsive small" style={{ maxHeight: '500rem', overflowY: 'auto' }}>
                                <Table className='table table-striped table-sm' size="sm">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sélection</th>
                                            <th scope="col">N° Série</th>
                                            <th scope="col">Nom</th>
                                            <th scope="col">État</th>
                                            <th scope="col">Emplacement</th>
                                            <th scope ='col'>Detenteur</th>
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
                                                    <td>{materiel.nom_dete}</td>
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
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Nouvelle maintenance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Card className="mb-3">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">Détails de la maintenance</h6>
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
                                            <Form.Label>Rechercher un technicien</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nom ou prénom du technicien"
                                                value={technicienSearch}
                                                onChange={handleTechnicienSearch}
                                            />
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={handleOpenTechnicienModal}
                                                className="mt-2"
                                            >
                                                Créer un nouveau technicien
                                            </Button>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Technicien</Form.Label>
                                            <Form.Select
                                                name="code_techn"
                                                value={formData.code_techn}
                                                onChange={handleChange}
                                                disabled={loadingTechniciens}
                                            >
                                                <option value="">Sélectionner un technicien</option>
                                                {filteredTechniciens.map(tech => (
                                                    <option key={tech.code_techn} value={tech.code_techn}>
                                                        {tech.nom_techn} {tech.prenom_techn}
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
                                </Row>
                            </Card.Body>
                        </Card>
                        <div className="d-flex justify-content-end gap-3">
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Annuler
                            </Button>
                            <Button variant="danger" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        En cours...
                                    </>
                                ) : (
                                    'Créer la maintenance'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showTechnicienModal} onHide={handleCloseTechnicienModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Créer un nouveau technicien</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nom</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nom_techn"
                                        value={newTechnicien.nom_techn}
                                        onChange={handleNewTechnicienChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Prénom</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="prenom_techn"
                                        value={newTechnicien.prenom_techn}
                                        onChange={handleNewTechnicienChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="contact_techn"
                                        value={newTechnicien.contact_techn}
                                        onChange={handleNewTechnicienChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Adresse</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="adresse_techn"
                                        value={newTechnicien.adresse_techn}
                                        onChange={handleNewTechnicienChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseTechnicienModal}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleCreateTechnicien} disabled={loadingTechniciens}>
                        {loadingTechniciens ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                En cours...
                            </>
                        ) : (
                            'Créer le technicien'
                        )}
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
    );
}

export default MaintenanceCreate;
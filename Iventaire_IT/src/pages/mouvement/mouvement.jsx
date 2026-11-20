import axios from 'axios';
import { Card, Button, Table, Form, Row, Col, Spinner, Modal, FormControl } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { restrictInput } from '../../utils/validation';

function Mouvement() {
  const [donnees, setDonnees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [selectedMateriels, setSelectedMateriels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMaterielIndex, setCurrentMaterielIndex] = useState(0);
  const [departements, setDepartements] = useState([]);
  const [detenteurs, setDetenteurs] = useState([]);
  const [searchDetenteur, setSearchDetenteur] = useState('');
  const [filteredDetenteurs, setFilteredDetenteurs] = useState([]);

  const [filtrer, setFilters] = useState({
    type_depart: '',
    adresse: '',
    search: '',
    region: '',
    distrinct: '',
    date_entree: '',
    nom_dete: '',
    attribue_only: false,
  });

  const [destination, setDestination] = useState({
    type_depart: '',
    ville: '',
    adresse_empl: '',
    nom_depart: '',
    nom_dir: '',
    distrinct: '',
    num_porte :'',
    region: '',
    type_dir: '',
    code_detent: '',
    nom_det: '',
    prenom_det: '',
    fonction: '',
    num_im: '',
    remove_detenteur: false,
  });

  const [showNewDetenteurFields, setShowNewDetenteurFields] = useState(false);

  // Charger les départements et les détenteurs lors du montage du composant
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [departementsRes, detenteursRes] = await Promise.all([
          axios.get(`http://localhost:3000/departements`),
          axios.get(`http://localhost:3000/Detenteur`),
        ]);
        setDepartements(departementsRes.data.data || departementsRes.data);
        setDetenteurs(detenteursRes.data.data || detenteursRes.data);
        setFilteredDetenteurs(detenteursRes.data.data || detenteursRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        showAlert('Erreur lors du chargement des données initiales', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filtrer les détenteurs en fonction de la recherche
  useEffect(() => {
    if (searchDetenteur) {
      const filtered = detenteurs.filter((det) =>
        `${det.nom_det} ${det.prenom_det}`
          .toLowerCase()
          .includes(searchDetenteur.toLowerCase())
      );
      setFilteredDetenteurs(filtered);
    } else {
      setFilteredDetenteurs(detenteurs);
    }
  }, [searchDetenteur, detenteurs]);

  // Gestion des filtres
  const filtration = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Fonction de recherche des matériels
  const filtrage = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/materiels`, {
        params: {
          ...filtrer,
          attribue_only: filtrer.attribue_only ? 'true' : undefined,
          region: filtrer.region,
          district: filtrer.district,
          date_entree: filtrer.date_entree,
        },
      });
      setDonnees(response.data);
      setShowTable(true);
    } catch (err) {
      console.error('Erreur lors du chargement des matériels:', err);
      showAlert('Erreur lors du chargement des matériels', 'error');
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des notifications
  const showAlert = (message, type = 'success') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Gestion de la sélection des matériels
  const handleSelectMateriel = (materiel) => {
    const exists = selectedMateriels.some((m) => m.code_mat === materiel.code_mat);
    setSelectedMateriels((prev) =>
      exists
        ? prev.filter((m) => m.code_mat !== materiel.code_mat)
        : [...prev, materiel]
    );
  };

  // Gestion de l'ouverture du modal pour affectation
  const handleAffecter = () => {
    if (selectedMateriels.length === 0) {
      showAlert('Veuillez sélectionner au moins un matériel', 'error');
      return;
    }
    setShowModal(true);
    setCurrentMaterielIndex(0);
    setDestination({
      type_depart: '',
      ville: '',
      adresse_empl: '',
      nom_depart: '',
      nom_dir: '',
      distrinct: '',
      num_porte: '',
      region: '',
      type_dir: '',
      code_detent: '',
      nom_det: '',
      prenom_det: '',
      fonction: '',
      num_im: '',
      remove_detenteur: false,
    });
    setShowNewDetenteurFields(false);
    setSearchDetenteur('');
  };

  // Gestion de la soumission du modal
  const handleSubmitDestination = async () => {
    const currentMateriel = selectedMateriels[currentMaterielIndex];
    if (!destination.nom_depart || !destination.ville || !destination.adresse_empl) {
      showAlert('Veuillez remplir tous les champs obligatoires (Département, Ville, Adresse)', 'warning');
      return;
    }
    if (destination.type_depart === 'DST' && (!destination.nom_dir || !destination.type_dir)) {
      showAlert('Veuillez remplir le type et le nom de la direction pour un département DST', 'warning');
      return;
    }
    if (showNewDetenteurFields && (!destination.nom_det || !destination.prenom_det)) {
      showAlert('Veuillez remplir le nom et prénom pour créer un nouveau détenteur', 'warning');
      return;
    }
    try {
      const payload = {
        code_mat: currentMateriel.code_mat,
        ville: destination.ville,
        adresse_empl: destination.adresse_empl,
        nom_depart: destination.nom_depart,
        nom_dir: destination.nom_dir || null,
        num_porte : destination.num_porte || null,
        district: destination.distrinct || null,
        region: destination.region || null,
        type_dir: destination.type_dir || null,
      };
      if (destination.remove_detenteur) {
        payload.code_detent = null;
      } else if (destination.code_detent && !showNewDetenteurFields) {
        payload.code_detent = destination.code_detent;
      } else if (showNewDetenteurFields) {
        payload.nom_det = destination.nom_det;
        payload.prenom_det = destination.prenom_det;
        payload.fonction = destination.fonction || null;
        payload.num_im = destination.num_im || null;
      }
      await axios.post('http://localhost:3000/historique', payload);
      showAlert(`Affectation réussie pour ${currentMateriel.nom}`);
      
      if (currentMaterielIndex < selectedMateriels.length - 1) {
        setCurrentMaterielIndex(currentMaterielIndex + 1);
        setDestination({
          type_depart: '',
          ville: '',
          adresse_empl: '',
          nom_depart: '',
          nom_dir: '',
          distrinct: '',
          region: '',
          num_porte: '',
          type_dir: '',
          code_detent: '',
          nom_det: '',
          prenom_det: '',
          fonction: '',
          num_im: '',
          remove_detenteur: false,
        });
        setShowNewDetenteurFields(false);
        setSearchDetenteur('');
      } else {
        setShowModal(false);
        setSelectedMateriels([]);
        setDonnees([]);
        setShowTable(false);
      }
    } catch (err) {
      console.error('Erreur lors de l\'affectation:', err);
      showAlert(err.response?.data?.message || 'Erreur lors de l\'affectation', 'error');
    }
  };

  // Gestion des changements dans le modal
  const handleDestinationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let validatedValue = value;
    if (name === "num_im") {
      validatedValue = restrictInput(value, 'phone', 20);
    } else if (name === 'nom_det' || name === 'prenom_det' || name === 'adresse_empl' || name === 'ville' || name === 'region' || name === 'nom_dir') {
      validatedValue = restrictInput(value, 'letters', name === 'adresse_empl' ? 100 : 50);
    } else if (name === 'num_porte') {
      validatedValue = restrictInput(value, 'numbers', 10);
    }

    setDestination((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : validatedValue,
      ...(name === 'nom_depart' ? { type_dir: '', nom_dir: '' } : {}),
      ...(name === 'code_detent' ? { nom_det: '', prenom_det: '', fonction: '', num_im: '' } : {}),
    }));
    if (name === 'code_detent') {
      setShowNewDetenteurFields(value === 'new');
    }
    if (name === 'remove_detenteur' && checked) {
      setShowNewDetenteurFields(false);
      setSearchDetenteur('');
      setDestination((prev) => ({
        ...prev,
        code_detent: '',
        nom_det: '',
        prenom_det: '',
        fonction: '',
        num_im: '',
      }));
    }
  };

  const isDestinationDST = destination.nom_depart === 'Direction de Service Topographique';

  return (
    <div className="container-fluid py-3 fade-in">
      <ToastContainer />
      
      <div className="d-flex align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Affectation & Mouvements</h4>
      </div>

      <Row>
        <Col>
          <Card className="dashboard-card border-0 mb-4">
            <Card.Header className="bg-transparent border-0 pb-0">
              <h5 className="mb-0">Rechercher des matériels à affecter</h5>
              <span className="text-muted small">Filtrez le registre pour sélectionner les équipements</span>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Label>Nom ou Numéro de série</Form.Label>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Ex: Laptop, 4567-..."
                    value={filtrer.search}
                    onChange={filtration}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Date d'entrée</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_entree"
                    value={filtrer.date_entree}
                    onChange={filtration}
                  />
                </Col>
              </Row>
              <Row className="g-3 mb-3">
                <Col md={3}>
                  <Form.Label>Type de département</Form.Label>
                  <Form.Select
                    name="type_depart"
                    value={filtrer.type_depart}
                    onChange={filtration}
                  >
                    <option value="">Tous les types</option>
                    <option value="DST">DST</option>
                    <option value="CIRTOPO">CIRTOPO</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label>Région</Form.Label>
                  <Form.Control
                    type="text"
                    name="region"
                    placeholder="Région"
                    value={filtrer.region}
                    onChange={filtration}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Circonscription</Form.Label>
                  <Form.Control
                    type="text"
                    name="distrinct"
                    placeholder="Circonscription"
                    value={filtrer.distrinct}
                    onChange={filtration}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Adresse exacte</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    placeholder="Adresse"
                    value={filtrer.adresse}
                    onChange={filtration}
                  />
                </Col>
              </Row>
              <Row className="g-2 align-items-center">
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Matériels attribués uniquement"
                    name="attribue_only"
                    checked={filtrer.attribue_only}
                    onChange={filtration}
                  />
                </Col>
                <Col md={6} className="d-flex justify-content-end">
                  <Button variant="success" onClick={filtrage} disabled={loading} style={{ minWidth: '120px' }}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Rechercher'}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showTable && donnees.length > 0 && (
        <Row className="mt-2">
          <Col>
            <Card className="dashboard-card border-0">
              <Card.Header className="bg-transparent border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Résultats de la recherche</h5>
                <span className="badge bg-light text-dark border">
                  {selectedMateriels.length} sélectionné(s)
                </span>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive border-0">
                  <Table striped hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Select</th>
                        <th>Matériel</th>
                        <th>État</th>
                        <th>Adresse</th>
                        <th>Région</th>
                        <th>Circonscription</th>
                        <th>Département</th>
                        <th>Détenteur actuel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donnees.map((materiel) => {
                        const isSelected = selectedMateriels.some((m) => m.code_mat === materiel.code_mat);
                        return (
                          <tr key={materiel.code_mat}>
                            <td className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectMateriel(materiel)}
                              />
                            </td>
                            <td>
                              <div className="fw-semibold text-primary">{materiel.nom}</div>
                              <div className="text-muted small">{materiel.numero_serie}</div>
                            </td>
                            <td>
                              <span className={`badge ${
                                materiel.etat === 'en service' ? 'bg-success' :
                                materiel.etat === 'en panne' ? 'bg-warning text-dark' : 'bg-danger'
                              }`}>
                                {materiel.etat}
                              </span>
                            </td>
                            <td>{materiel.adresse_empl || 'N/A'}</td>
                            <td>{materiel.Region || 'N/A'}</td>
                            <td>{materiel.distrinct || 'N/A'}</td>
                            <td>{materiel.type_depart || 'N/A'}</td>
                            <td>
                              {materiel.nom_det ? (
                                <span className="fw-semibold">{materiel.nom_det} {materiel.prenom_det}</span>
                              ) : (
                                <span className="text-muted italic">Non attribué</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
                <div className="p-3 bg-light border-top d-flex justify-content-end">
                  <Button variant="success" onClick={handleAffecter} disabled={selectedMateriels.length === 0}>
                    Affecter les {selectedMateriels.length} matériel(s) sélectionné(s)
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {showTable && donnees.length === 0 && (
        <Row className="mt-2">
          <Col>
            <Card className="dashboard-card border-0 p-4 text-center text-muted">
              Aucun matériel trouvé pour ces critères.
            </Card>
          </Col>
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Affectation ({currentMaterielIndex + 1}/{selectedMateriels.length}) :{' '}
            <span className="text-success fw-bold">
              {selectedMateriels[currentMaterielIndex]?.nom}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Label>Département de destination</Form.Label>
                <Form.Select
                  name="nom_depart"
                  value={destination.nom_depart}
                  onChange={handleDestinationChange}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {departements.map((dep) => (
                    <option key={dep.id_depart} value={dep.nom_depart}>
                      {dep.nom_depart} ({dep.type_depart})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Ville</Form.Label>
                <Form.Select
                  name="ville"
                  value={destination.ville}
                  onChange={handleDestinationChange}
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
              <Col xs={12} md={6}>
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  name="adresse_empl"
                  value={destination.adresse_empl}
                  onChange={handleDestinationChange}
                  required
                />
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Numéro de porte</Form.Label>
                <Form.Control
                  type="number"
                  name="num_porte"
                  value={destination.num_porte}
                  onChange={handleDestinationChange}
                  required
                />
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>District</Form.Label>
                <Form.Control
                  type="text"
                  name="distrinct"
                  value={destination.distrinct}
                  onChange={handleDestinationChange}
                />
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Région</Form.Label>
                <Form.Control
                  type="text"
                  name="region"
                  value={destination.region}
                  onChange={handleDestinationChange}
                />
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Détenteur</Form.Label>
                <div className="position-relative">
                  <FormControl
                    type="text"
                    placeholder="Rechercher ou créer un détenteur..."
                    value={searchDetenteur}
                    onChange={(e) => setSearchDetenteur(e.target.value)}
                    disabled={destination.remove_detenteur}
                  />
                  {searchDetenteur && !destination.remove_detenteur && (
                    <div className="position-absolute bg-white border rounded shadow-sm w-100 mt-1 overflow-auto" style={{ maxHeight: '180px', zIndex: 1050 }}>
                      <div
                        className="p-2 border-bottom fw-bold text-success cursor-pointer hover-bg-light"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowNewDetenteurFields(true);
                          setSearchDetenteur('');
                          setDestination((prev) => ({
                            ...prev,
                            code_detent: 'new',
                            nom_det: '',
                            prenom_det: '',
                            fonction: '',
                            num_im: '',
                          }));
                        }}
                      >
                        + Créer un nouveau détenteur
                      </div>
                      {filteredDetenteurs.map((det) => (
                        <div
                          key={det.code_detent}
                          className="p-2 border-bottom cursor-pointer hover-bg-light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setDestination((prev) => ({
                              ...prev,
                              code_detent: det.code_detent,
                            }));
                            setSearchDetenteur(`${det.nom_det} ${det.prenom_det}`);
                            setShowNewDetenteurFields(false);
                          }}
                        >
                          {det.nom_det} {det.prenom_det}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
              <Col xs={12} md={6} className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  label="Retirer le détenteur (laisser non attribué)"
                  name="remove_detenteur"
                  checked={destination.remove_detenteur}
                  onChange={handleDestinationChange}
                />
              </Col>
              {showNewDetenteurFields && !destination.remove_detenteur && (
                <>
                  <Col xs={12} md={6}>
                    <Form.Label>Nom du détenteur</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom_det"
                      value={destination.nom_det}
                      onChange={handleDestinationChange}
                      required
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Prénom du détenteur</Form.Label>
                    <Form.Control
                      type="text"
                      name="prenom_det"
                      value={destination.prenom_det}
                      onChange={handleDestinationChange}
                      required
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Fonction</Form.Label>
                    <Form.Control
                      type="text"
                      name="fonction"
                      value={destination.fonction}
                      onChange={handleDestinationChange}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Numéro IM</Form.Label>
                    <Form.Control
                      type="text"
                      name="num_im"
                      value={destination.num_im}
                      onChange={handleDestinationChange}
                    />
                  </Col>
                </>
              )}
              {isDestinationDST && (
                <>
                  <Col xs={12} md={6}>
                    <Form.Label>Type de direction</Form.Label>
                    <Form.Select
                      name="type_dir"
                      value={destination.type_dir}
                      onChange={handleDestinationChange}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Service">Service</option>
                      <option value="Division">Division</option>
                    </Form.Select>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Nom de la direction</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom_dir"
                      value={destination.nom_dir}
                      onChange={handleDestinationChange}
                      required
                    />
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleSubmitDestination}>
            {currentMaterielIndex < selectedMateriels.length - 1
              ? 'Affecter et passer au suivant'
              : 'Affecter et terminer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Mouvement;
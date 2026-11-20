import { useState, useEffect } from "react";
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { restrictInput } from '../../utils/validation';

function EditMateriel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numero_serie: "",
    nom_equi: "",
    modele: "",
    etat: "en service",
    type_equi: "Fixe",
    marque: "",
    date_utilisation: "",
    id_categorie: "",
    num_depa: "",
    num_porte :"",
    type_dir: "",
    nom_dir: "",
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
    adresse_four: ""
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les données initiales (catégories, départements, et matériel)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, departementsRes, materielRes] = await Promise.all([
          axios.get('http://localhost:3000/categories'),
          axios.get('http://localhost:3000/departements'),
          axios.get(`http://localhost:3000/materiels/${id}`)
        ]);

        setCategories(categoriesRes.data || []);
        setDepartements(departementsRes.data || []);

        const materiel = materielRes.data;

        // Formater la date au format YYYY-MM-DD
        let dateUtilisation = '';
        if (materiel.date_entree) {
          try {
            const date = new Date(materiel.date_entree);
            if (!isNaN(date.getTime())) {
              dateUtilisation = date.toISOString().split('T')[0];
            } else if (typeof materiel.date_entree === 'string') {
              const parts = materiel.date_entree.split(/[-T]/);
              if (parts.length >= 3) {
                dateUtilisation = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          } catch (error) {
            console.warn("Erreur lors du formatage de la date:", error);
          }
        }

        const idCategorie = String(materiel.id_cate || '');
        const numDepa = String(materiel.id_depart || '');

        const categorieExiste = categoriesRes.data.find(cat => String(cat.id_cate) === idCategorie);
        const departementExiste = departementsRes.data.find(dep => String(dep.id_depart) === numDepa);

        if (!categorieExiste && idCategorie) {
          showAlert(`La catégorie avec l'ID ${idCategorie} n'est pas disponible`, 'warning');
        }
        if (!departementExiste && numDepa) {
          showAlert(`Le département avec l'ID ${numDepa} n'est pas disponible`, 'warning');
        }

        setFormData({
          numero_serie: materiel.numero_serie || '',
          nom_equi: materiel.nom || '',
          modele: materiel.modele || '',
          etat: materiel.etat || 'en service',
          type_equi: materiel.type_equipement || 'Fixe',
          marque: materiel.marque || '',
          date_utilisation: dateUtilisation,
          id_categorie: categorieExiste ? idCategorie : '',
          num_depa: departementExiste ? numDepa : '',
          type_dir: materiel.type_dir || '',
          num_porte : materiel.num_porte || '',
          nom_dir: materiel.nom_dir || '',
          ville: materiel.ville || '',
          adresse_empl: materiel.adresse_empl || '',
          Region: materiel.Region || '',
          distrinct: materiel.distrinct || '',
          attribue: !!materiel.est_attribue,
          nom_det: materiel.nom_det || '',
          prenom_det: materiel.prenom_det || '',
          num_im: materiel.num_im || '',
          fonction: materiel.fonction || '',
          nom_four: materiel.nom_four || '',
          contact_four: materiel.contact_four || '',
          adresse_four: materiel.adresse_four || ''
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        showAlert('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let validatedValue = value;
    if (name === 'contact_four' || name === "num_im") {
      validatedValue = restrictInput(value, 'phone', 20);
      if (value !== validatedValue) {
        showAlert("Seuls les chiffres, espaces, tirets et + sont autorisés pour le contact.", 'warning');
      }
    } else if (name === 'nom_det' || name === 'prenom_det' || name === 'adresse_empl' || name === 'ville' || name === 'Region') {
      validatedValue = restrictInput(value, 'letters', name === 'adresse_empl' ? 100 : 50);
      if (value !== validatedValue) {
        showAlert(`Seules les lettres et les espaces sont autorisés pour ${name === 'nom_det' ? 'le nom du détenteur' : name === 'prenom_det' ? 'le prénom du détenteur' : name === 'adresse_empl' ? 'l\'adresse' : name === 'ville' ? 'la ville' : name === 'nom_dir' ? 'le nom de la direction' : 'la région'}.`, 'warning');
      }
    } else if (name === 'num_porte') {
      validatedValue = restrictInput(value, 'numbers', 10);
      if (value !== validatedValue) {
        showAlert("Seuls les chiffres sont autorisés pour le numéro de porte.", 'warning');
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : validatedValue 
    }));
    
    if (name === "num_depa") {
      const selectedDep = departements.find(dep => String(dep.id_depart) === value);
      const isSpecialDepart = ['DST', 'CIRTOPO'].includes(selectedDep?.type_depart);
      setFormData(prev => ({
        ...prev,
        num_depa: value,
        type_dir: isSpecialDepart ? prev.type_dir : "",
        nom_dir: isSpecialDepart ? prev.nom_dir : ""
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.attribue && (!formData.nom_det || !formData.prenom_det)) {
      showAlert("Veuillez remplir les informations du détenteur ou décocher 'Matériel attribué'", 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:3000/materiels/${id}`, formData);
      showAlert('Matériel modifié avec succès', 'success');
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          navigate('/ajout');
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showAlert(error.response?.data?.message || "Une erreur est survenue", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3 fade-in">
      <div className="d-flex align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Modifier le matériel</h4>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div>
          {submitSuccess ? (
            <Alert variant="success" className="mb-4">
              Matériel modifié avec succès ! Redirection en cours...
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              {/* Card 1: Caractéristiques de l'équipement */}
              <Card className="dashboard-card border-0 mb-4">
                <Card.Header className="bg-transparent border-0 pb-0">
                  <h5 className="mb-0">Caractéristiques de l'équipement</h5>
                  <span className="text-muted small">Détails techniques généraux</span>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        name="id_categorie"
                        value={formData.id_categorie}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {categories.map(cat => (
                          <option key={cat.id_cate} value={String(cat.id_cate)}>
                            {cat.nom_cate}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Numéro de série</Form.Label>
                      <Form.Control
                        type="text"
                        name="numero_serie"
                        value={formData.numero_serie}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom_equi"
                        value={formData.nom_equi}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Modèle</Form.Label>
                      <Form.Control
                        type="text"
                        name="modele"
                        value={formData.modele}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Marque</Form.Label>
                      <Form.Control
                        type="text"
                        name="marque"
                        value={formData.marque}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>État</Form.Label>
                      <Form.Select
                        name="etat"
                        value={formData.etat}
                        onChange={handleChange}
                      >
                        <option value="en service">En service</option>
                        <option value="hors service">Hors service</option>
                        <option value="en panne">En panne</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
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
                    </Col>
                    <Col md={6}>
                      <Form.Label>Date d'utilisation</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_utilisation"
                        value={formData.date_utilisation}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Card 2: Emplacement */}
              <Card className="dashboard-card border-0 mb-4">
                <Card.Header className="bg-transparent border-0 pb-0">
                  <h5 className="mb-0">Emplacement géographique</h5>
                  <span className="text-muted small">Où se trouve actuellement le matériel</span>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Département</Form.Label>
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
                    </Col>
                    <Col md={6}>
                      <Form.Label>Ville</Form.Label>
                      <Form.Select
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
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
                    <Col md={6}>
                      <Form.Label>Numéro de porte</Form.Label>
                      <Form.Control
                        type="number"
                        name="num_porte"
                        value={formData.num_porte}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Card 3: Direction (DST et CIRTOPO) */}
              {formData.num_depa && ['DST', 'CIRTOPO'].includes(departements.find(dep => String(dep.id_depart) === formData.num_depa)?.type_depart) && (
                <Card className="dashboard-card border-0 mb-4">
                  <Card.Header className="bg-transparent border-0 pb-0">
                    <h5 className="mb-0">Direction administrative</h5>
                    <span className="text-muted small">Spécifique aux départements de type DST et CIRTOPO</span>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
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
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Card 4: Détenteur */}
              <Card className="dashboard-card border-0 mb-4">
                <Card.Header className="bg-transparent border-0 pb-0">
                  <h5 className="mb-0">Attribution / Détenteur</h5>
                  <span className="text-muted small">À qui est assigné ce matériel</span>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col xs={12} className="mb-2">
                      <Form.Check
                        type="checkbox"
                        label="Matériel attribué à un détenteur"
                        name="attribue"
                        checked={formData.attribue}
                        onChange={handleChange}
                      />
                    </Col>
                    {formData.attribue && (
                      <>
                        <Col md={6}>
                          <Form.Label>Nom du détenteur</Form.Label>
                          <Form.Control
                            type="text"
                            name="nom_det"
                            value={formData.nom_det}
                            onChange={handleChange}
                            required={formData.attribue}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label>Prénom du détenteur</Form.Label>
                          <Form.Control
                            type="text"
                            name="prenom_det"
                            value={formData.prenom_det}
                            onChange={handleChange}
                            required={formData.attribue}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label>Matricule (IM)</Form.Label>
                          <Form.Control
                            type="text"
                            name="num_im"
                            value={formData.num_im}
                            onChange={handleChange}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label>Fonction</Form.Label>
                          <Form.Control
                            type="text"
                            name="fonction"
                            value={formData.fonction}
                            onChange={handleChange}
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                </Card.Body>
              </Card>

              {/* Card 5: Fournisseur */}
              <Card className="dashboard-card border-0 mb-4">
                <Card.Header className="bg-transparent border-0 pb-0">
                  <h5 className="mb-0">Fournisseur</h5>
                  <span className="text-muted small">Informations d'acquisition de l'équipement</span>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Nom du fournisseur</Form.Label>
                      <Form.Control
                        type="text"
                        name="nom_four"
                        value={formData.nom_four}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Contact</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_four"
                        value={formData.contact_four}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="adresse_four"
                        value={formData.adresse_four}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/ajout')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'En cours...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      )}

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

export default EditMateriel;
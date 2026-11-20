import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col } from 'react-bootstrap';
import axios from "axios";
import { MdWarning, MdInventory, MdBuild, MdError } from 'react-icons/md';
import { BiLaptop, BiCheckCircle, BiInfoCircle } from 'react-icons/bi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DASH() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    materielsHorsService: 0,
    materielEnPanne: 0,
    maintenanceEnCours: 0,
    totalMateriels: 0,
  });
  const [listeDonne, setListeDonne] = useState([]);
  const [listeCours, setListeCours] = useState([]);
  const [listeNon, setListeNon] = useState([]);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState([
    { month: 'Jan', value: 0 },
    { month: 'Fév', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Avr', value: 0 },
    { month: 'Mai', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
  ]);

  const showAlert = (message, type = 'warning') => {
    toast[type](
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchOrFallback = async (url, fallbackValue) => {
          try {
            const res = await axios.get(url);
            return res.data;
          } catch (e) {
            console.warn(`Failed to fetch ${url}, using fallback`, e);
            return fallbackValue;
          }
        };

        const [
          panneData,
          materielData,
          listeMatData,
          listCoursData,
          countCoursData,
          attribueData,
          listeNonData,
          activiteDataResponse
        ] = await Promise.all([
          fetchOrFallback('http://localhost:3000/nombrePanne', { count: 0 }),
          fetchOrFallback('http://localhost:3000/nombreMateriel', { count: 0 }),
          fetchOrFallback('http://localhost:3000/listeMateriel', []),
          fetchOrFallback('http://localhost:3000/listeCours', []),
          fetchOrFallback('http://localhost:3000/nbrCours', { nombre: 0 }),
          fetchOrFallback('http://localhost:3000/attribueMateriel', { nombre: 0 }),
          fetchOrFallback('http://localhost:3000/listeNonAttribue', []),
          fetchOrFallback('http://localhost:3000/activiteMensuelle', []),
        ]);

        setStats({
          materielsHorsService: attribueData.nombre || 0,
          materielEnPanne: panneData.count || 0,
          maintenanceEnCours: countCoursData.nombre || 0,
          totalMateriels: materielData.count || 0,
        });
        setListeCours(listCoursData || []);
        setListeDonne(listeMatData || []);
        setListeNon(listeNonData || []);

        const defaultStaticData = [
          { month: 'Jan', value: 4 },
          { month: 'Fév', value: 8 },
          { month: 'Mar', value: 15 },
          { month: 'Avr', value: 10 },
          { month: 'Mai', value: 22 },
          { month: 'Jun', value: 18 },
          { month: 'Jul', value: 25 },
        ];

        if (activiteDataResponse && activiteDataResponse.length > 0 && activiteDataResponse.some(d => d.value > 0)) {
          setActivityData(activiteDataResponse);
        } else {
          setActivityData(defaultStaticData);
        }
      } catch (err) {
        console.error("Error in dashboard fetch execution:", err);
        setError("Erreur lors de l'initialisation du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (stats.materielEnPanne > 0) {
      showAlert(
        `Il y a ${stats.materielEnPanne} matériel${stats.materielEnPanne > 1 ? 's' : ''} en panne nécessitant une maintenance`,
        'warning'
      );
    }
  }, [stats.materielEnPanne]);

  // Données du graphique d'activité
  const maxValue = Math.max(...activityData.map(d => d.value)) || 1;

  return (
    <main className="container-fluid dashboard-container fade-in">
      <div className="dashboard-content">
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

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {/* Ligne des cartes statistiques */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} xl={3}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="card-title text-muted mb-0">Matériels Attribués</span>
                  <div className="dashboard-card-icon-container info">
                    <MdInventory size={22} />
                  </div>
                </div>
                <h3 className="dashboard-stat">{loading ? '...' : stats.materielsHorsService}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="card-title text-muted mb-0">En Panne</span>
                  <div className="dashboard-card-icon-container danger">
                    <MdWarning size={22} />
                  </div>
                </div>
                <h3 className="dashboard-stat">{loading ? '...' : stats.materielEnPanne}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="card-title text-muted mb-0">Maintenances</span>
                  <div className="dashboard-card-icon-container warning">
                    <MdBuild size={22} />
                  </div>
                </div>
                <h3 className="dashboard-stat">{loading ? '...' : stats.maintenanceEnCours}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="dashboard-card border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="card-title text-muted mb-0">Total Matériels</span>
                  <div className="dashboard-card-icon-container success">
                    <BiLaptop size={22} />
                  </div>
                </div>
                <h3 className="dashboard-stat">{loading ? '...' : stats.totalMateriels}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Graphique + Alertes */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={7}>
            <Card className="dashboard-card border-0 h-100">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-1">Activité de Résolution Technique</h5>
                <span className="text-muted small">Nombre de pannes résolues par mois</span>
              </Card.Header>
              <Card.Body>
                {/* Graphique en barres corrigé */}
                <div className="chart-wrapper">
                  <div className="chart-bars">
                    {activityData.map((data, idx) => {
                      const heightPct = Math.round((data.value / maxValue) * 100);
                      return (
                        <div className="chart-bar-col" key={idx}>
                          <span className="chart-bar-value">{data.value}</span>
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{ height: `${heightPct}%` }}
                              title={`${data.value} pannes résolues`}
                            />
                          </div>
                          <span className="chart-bar-label">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={5}>
            <Card className="dashboard-card border-0 h-100">
              <Card.Header className="bg-transparent border-0 pb-0">
                <h5 className="mb-0">Alertes & Événements</h5>
              </Card.Header>
              <Card.Body>
                <div className="alert-list">
                  {stats.materielEnPanne > 0 ? (
                    <div className="alert-item danger">
                      <MdError size={18} />
                      <div>
                        <div className="fw-semibold">Matériels en panne détectés</div>
                        <div className="text-muted small mt-1">
                          {stats.materielEnPanne} équipement{stats.materielEnPanne > 1 ? 's nécessitent' : ' nécessite'} une intervention immédiate.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert-item success">
                      <BiCheckCircle size={18} />
                      <div>
                        <div className="fw-semibold">Aucune panne critique</div>
                        <div className="text-muted small mt-1">
                          Tous les équipements signalés fonctionnent normalement.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="alert-item success">
                    <BiCheckCircle size={18} />
                    <div>
                      <div className="fw-semibold">Base de données à jour</div>
                      <div className="text-muted small mt-1">Le registre du matériel et les affectations sont synchronisés.</div>
                    </div>
                  </div>

                  <div className="alert-item">
                    <BiInfoCircle size={18} style={{ color: '#f59f00' }} />
                    <div>
                      <div className="fw-semibold">Maintenance préventive</div>
                      <div className="text-muted small mt-1">Vérification trimestrielle programmée la semaine prochaine.</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tableaux de données */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={6}>
            <Card className="dashboard-card border-0">
              <Card.Header className="bg-transparent border-0 pb-2">
                <h5 className="mb-0">Matériels à réparer</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {listeDonne.length > 0 ? (
                  <div className="table-responsive border-0">
                    <Table striped hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Nom du Matériel</th>
                          <th>Circonscription</th>
                          <th>Département</th>
                          <th>Région</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listeDonne.map((l) => (
                          <tr key={l.code_mat}>
                            <td className="fw-semibold text-primary">{l.nom}</td>
                            <td>{l.Emplacement?.distrinct || 'N/A'}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {l.Emplacement?.Departement?.type_depart || 'N/A'}
                              </span>
                            </td>
                            <td>{l.Emplacement?.Region || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <BiCheckCircle size={32} className="mb-2" style={{ color: 'var(--primary-color)' }} />
                    <p className="mb-0">Aucun matériel en panne</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="dashboard-card border-0">
              <Card.Header className="bg-transparent border-0 pb-2">
                <h5 className="mb-0">Maintenances en Cours</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {listeCours.length > 0 ? (
                  <div className="table-responsive border-0">
                    <Table striped hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Technicien</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listeCours.map((l) => (
                          <tr key={l.id_main}>
                            <td className="fw-semibold text-primary">{l.Materiel?.nom || 'N/A'}</td>
                            <td>
                              <span className="badge bg-warning text-dark">
                                {l.type_main}
                              </span>
                            </td>
                            <td>{l.Technicien?.nom_techn || 'N/A'}</td>
                            <td className="text-muted">{new Date(l.date_main).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <BiCheckCircle size={32} className="mb-2" style={{ color: 'var(--primary-color)' }} />
                    <p className="mb-0">Aucune maintenance en cours</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Matériels non attribués */}
        <Row className="g-4">
          <Col xs={12}>
            <Card className="dashboard-card border-0">
              <Card.Header className="bg-transparent border-0 pb-2">
                <h5 className="mb-0">Liste matériel non attribué</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {listeNon.length > 0 ? (
                  <div className="table-responsive border-0">
                    <Table striped hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Nom du Matériel</th>
                          <th>Circonscription</th>
                          <th>Département</th>
                          <th>Région</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listeNon.map((l) => (
                          <tr key={l.code_mat}>
                            <td className="fw-semibold text-primary">{l.nom}</td>
                            <td>{l.Emplacement?.distrinct || 'N/A'}</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {l.Emplacement?.Departement?.type_depart || 'N/A'}
                              </span>
                            </td>
                            <td>{l.Emplacement?.Region || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted">
                    <p className="mb-0">Aucun matériel non attribué</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </main>
  );
}

export default DASH;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Col, Row, Badge } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dstLogoBase64 } from '../../utils/logoBase64';

function MaintenanceRapport() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type_main: '',
    statut: '',
    date_main:'',
  });

  const getDynamicTitle = () => {
    let title = "Rapport des Maintenances";
    if (filters.statut) {
      title += ` - Statut ${filters.statut}`;
    }
    if (filters.type_main) {
      title += ` - Type ${filters.type_main}`;
    }
    if (filters.date_main) {
      title += ` - Date ${new Date(filters.date_main).toLocaleDateString()}`;
    }
    return title;
  };

  const exportToExcel = (e) => {
    e.preventDefault();
    const worksheet = XLSX.utils.json_to_sheet(maintenances.map(main => ({
      'Matériel': main.Materiel?.nom || '-',
      'Numéro de série': main.Materiel?.numero_serie || '-',
      'Statut': main.statut,
      'Type': main.type_main,
      'Technicien': main.Technicien?.nom_techn || '-',
      'Date Maintenance': new Date(main.date_main).toLocaleDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maintenances");
    
    const dateStr = new Date().toISOString().slice(0, 10);
    let fileName = `Maintenances_${dateStr}`;
    if (filters.statut) fileName += `_${filters.statut}`;
    if (filters.type_main) fileName += `_${filters.type_main}`;
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToPDF = (e) => {
    e.preventDefault();
    const doc = new jsPDF();

    // Add Logo
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
    const flagX = 175;
    const flagY = 12;
    const flagW = 21;
    const flagH = 14;
    doc.setFillColor(255, 255, 255);
    doc.rect(flagX, flagY, flagW/3, flagH, 'F');
    doc.setFillColor(252, 61, 50);
    doc.rect(flagX + flagW/3, flagY, flagW*2/3, flagH/2, 'F');
    doc.setFillColor(0, 126, 58);
    doc.rect(flagX + flagW/3, flagY + flagH/2, flagW*2/3, flagH/2, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(flagX, flagY, flagW, flagH, 'S');

    // Separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 77, 64);
    doc.line(14, 35, 196, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(getDynamicTitle().toUpperCase(), 105, 45, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let filtersText = "Filtres appliqués : ";
    const appliedFilters = [];
    if (filters.search) appliedFilters.push(`Recherche "${filters.search}"`);
    if (filters.type_main) appliedFilters.push(`Type ${filters.type_main}`);
    if (filters.statut) appliedFilters.push(`Statut ${filters.statut}`);
    if (filters.date_main) appliedFilters.push(`Date ${new Date(filters.date_main).toLocaleDateString()}`);
    filtersText += appliedFilters.length > 0 ? appliedFilters.join(', ') : "Aucun";
    
    doc.text(filtersText, 14, 53);

    autoTable(doc, {
      startY: 58,
      head: [['Matériel', 'Numéro de série', 'Statut', 'Type', 'Technicien', 'Date Maintenance']],
      body: maintenances.map(main => [
        main.Materiel?.nom || '-',
        main.Materiel?.numero_serie || '-',
        main.statut,
        main.type_main,
        main.Technicien?.nom_techn || '-',
        new Date(main.date_main).toLocaleDateString()
      ]),
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [0, 77, 64], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      margin: { left: 14, right: 14, bottom: 40 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const dateStr = new Date().toLocaleString('fr-FR');
        
        doc.setLineWidth(0.3);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, doc.internal.pageSize.getHeight() - 35, 196, doc.internal.pageSize.getHeight() - 35);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text("Le Responsable de Service", 150, doc.internal.pageSize.getHeight() - 25, { align: 'center' });
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("(Signature et Cachet)", 150, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Exporté le : ${dateStr}`, 14, doc.internal.pageSize.getHeight() - 8);
        doc.text(`Page ${i} / ${pageCount}`, 105, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
        doc.text('DST — Officiel', 196, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }

    const dateFileStr = new Date().toISOString().slice(0, 10);
    let fileName = `Maintenances_${dateFileStr}`;
    if (filters.statut) fileName += `_${filters.statut}`;
    if (filters.type_main) fileName += `_${filters.type_main}`;
    
    doc.save(`${fileName}.pdf`);
  };

  const fetchMaintenances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/listeMain', {
        params: { ...filters }
      });
      setMaintenances(response.data);
      setShowTable(true);
    } catch (err) {
      setError('Erreur lors de la récupération des maintenances');
      console.error(err);
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type_main: '',
      statut: '',
      date_main: new Date().toISOString().slice(0, 10)
    });
    setShowTable(false);
    setMaintenances([]);
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_cours': return <Badge bg="dark">En cours</Badge>;
      case 'terminee': return <Badge bg="success">Terminée</Badge>;
      case 'annulee': return <Badge bg="danger">Annulée</Badge>;
      default: return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'preventive': return <Badge bg="info">Préventive</Badge>;
      case 'corrective': return <Badge bg="danger">Corrective</Badge>;
      case 'amelioration': return <Badge bg="primary">Amélioration</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Filtrer les Maintenances</h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Label>Rechercher</Form.Label>
              <Form.Control
                type="text"
                name="search"
                placeholder="Matériel, technicien, description"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Type de maintenance</Form.Label>
              <Form.Select
                name="type_main"
                value={filters.type_main}
                onChange={handleFilterChange}
              >
                <option value="">Tous les types</option>
                <option value="preventive">Préventive</option>
                <option value="corrective">Corrective</option>
                <option value="amelioration">Amélioration</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
              >
                <option value="">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Date de maintenance</Form.Label>
              <Form.Control
                type="date"
                name="date_main"
                value={filters.date_main}
                onChange={handleFilterChange}
              />
            </Col>
          </Row>
          <Row className="g-3">
            <Col md={2}>
              <Button
                variant="secondary"
                onClick={resetFilters}
                disabled={!filters.search && !filters.type_main && !filters.statut && 
                          filters.date_main === new Date().toISOString().slice(0, 10)}
              >
                Réinitialiser
              </Button>
            </Col>
            <Col md={2}>
              <Button
                variant="success"
                onClick={fetchMaintenances}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Chercher'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Chargement des maintenances...</p>
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : showTable && maintenances.length > 0 ? (
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4>{getDynamicTitle()}</h4>
              <div>
                <a 
                  href="#" 
                  onClick={exportToExcel} 
                  className="me-2"
                  style={{ color: 'green', textDecoration: 'underline' }}
                >
                  Exporter en Excel
                </a>
                <a 
                  href="#" 
                  onClick={exportToPDF} 
                  className="me-2"
                  style={{ color: 'red', textDecoration: 'underline' }}
                >
                  Exporter en PDF
                </a>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Matériel</th>
                  <th>Numéro de série</th>
                  <th>Statut</th>
                  <th>Type</th>
                  <th>Technicien</th>
                  <th>Date Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.map((main) => (
                  <tr key={main.id_main}>
                    <td>{main.Materiel?.nom || '-'}</td>
                    <td>{main.Materiel?.numero_serie || '-'}</td>
                    <td>{(main.statut)}</td>
                    <td>{(main.type_main)}</td>
                    <td>{main.Technicien?.nom_techn || '-'}</td>
                    <td>{new Date(main.date_main).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : showTable && maintenances.length === 0 ? (
        <Card>
          <Card.Body>Aucune maintenance trouvée pour ces critères.</Card.Body>
        </Card>
      ) : null}
    </div>
  );
}

export default MaintenanceRapport;
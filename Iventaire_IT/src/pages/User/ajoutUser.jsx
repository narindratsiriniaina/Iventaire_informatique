import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { restrictInput } from '../../utils/validation';
import { BiUser, BiPencil, BiTrash, BiPlus } from 'react-icons/bi';

function UserList() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    nom_user: '',
    password: '',
    type_user: 'user',
    avatar: ''
  });
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/affichage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur lors de la récupération des utilisateurs.');
      toast.error('Erreur lors de la récupération des utilisateurs.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let validatedValue = value;
    if (name === 'nom_user') {
      validatedValue = restrictInput(value, 'alphanumeric', 32);
    }
    setFormData({ ...formData, [name]: validatedValue });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ nom_user: '', password: '', type_user: 'user', avatar: '' });
    setIsEditing(false);
    setCurrentUserId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({
      nom_user: user.nom_user,
      password: '', // Ne pas afficher le mot de passe actuel
      type_user: user.type_user,
      avatar: user.avatar || ''
    });
    setCurrentUserId(user.id_use);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Utilisateur supprimé avec succès");
        fetchUsers();
      } catch (err) {
        toast.error("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom_user) {
      toast.error("Le nom d'utilisateur est requis.");
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error("Le mot de passe est requis.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        await axios.put(`http://localhost:3000/user/${currentUserId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        await axios.post('http://localhost:3000/register', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Utilisateur créé avec succès");
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <main className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold" style={{ color: '#1a1a1a' }}>Gestion des Utilisateurs</h2>
          <p className="text-muted mb-0">Ajouter, modifier ou supprimer des comptes utilisateurs.</p>
        </div>
        <Button variant="success" onClick={handleOpenAdd} className="d-flex align-items-center gap-2 shadow-sm">
          <BiPlus size={20} />
          Nouveau Utilisateur
        </Button>
      </div>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      <div className="row g-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={user.id_use}>
              <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                  {/* Avatar Rendering */}
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid #e9ecef' }}
                    />
                  ) : (
                    <div 
                      className="d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#198754', marginBottom: '15px', fontSize: '1.5rem', border: '3px solid #e9ecef' }}
                    >
                      {getInitials(user.nom_user)}
                    </div>
                  )}

                  <h5 className="fw-bold mb-1">{user.nom_user}</h5>
                  
                  <span className={`badge ${user.type_user === 'admin' ? 'bg-danger' : user.type_user === 'editeur' ? 'bg-primary' : 'bg-secondary'} mb-3`}>
                    {user.type_user.toUpperCase()}
                  </span>

                  <div className="mt-auto pt-3 w-100 d-flex justify-content-center gap-3 border-top">
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEdit(user)} className="d-flex align-items-center gap-1 rounded-pill px-3">
                      <BiPencil /> Modifier
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(user.id_use)} className="d-flex align-items-center gap-1 rounded-pill px-3">
                      <BiTrash /> Supprimer
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 text-muted">
            <BiUser size={50} style={{ opacity: 0.5 }} />
            <p className="mt-3">Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            {isEditing ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            
            <div className="d-flex justify-content-center mb-4">
              <div className="position-relative">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #198754' }} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '2rem' }}>
                    <BiUser />
                  </div>
                )}
                <label htmlFor="avatar-upload" className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 shadow-sm" style={{ cursor: 'pointer' }}>
                  <BiPencil size={20} color="#198754" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="d-none" />
              </div>
            </div>

            <Row className='g-3 mb-3'>
              <Col md={12}>
                <Form.Group controlId="formUsername">
                  <Form.Label className="fw-semibold">Nom d'Utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom_user"
                    value={formData.nom_user}
                    onChange={handleInputChange}
                    placeholder="Entrez le nom"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={12}>
                <Form.Group controlId="formPassword">
                  <Form.Label className="fw-semibold">Mot de passe {isEditing && <span className="text-muted fw-normal">(Optionnel si inchangé)</span>}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Entrez le mot de passe"
                    required={!isEditing}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formUserType">
                  <Form.Label className="fw-semibold">Type de Compte</Form.Label>
                  <Form.Select
                    name="type_user"
                    value={formData.type_user}
                    onChange={handleInputChange}
                  >
                    <option value="user">Utilisateur Standard</option>
                    <option value="editeur">Editeur</option>
                    <option value="admin">Administrateur</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="success" type="submit">
                {isEditing ? 'Mettre à jour' : 'Créer le compte'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </main>
  );
}

export default UserList;
document.addEventListener('DOMContentLoaded', () => {
    // Base URL pour les appels API
    const API_BASE_URL = '/api';

    // Éléments DOM
    const contentElement = document.getElementById('content');
    
    // Navigation via les liens
    document.querySelectorAll('a').forEach(link => {
        // Ignorer les liens externes
        if (link.getAttribute('href').startsWith('http') || link.getAttribute('href').startsWith('#')) {
            return;
        }
        
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            navigateTo(url);
            
            // Mettre à jour l'URL dans la barre d'adresse sans recharger la page
            history.pushState(null, '', url);
        });
    });
    
    // Gérer les événements de navigation du navigateur (boutons précédent/suivant)
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname);
    });
    
    // Naviguer vers la page appropriée au chargement initial
    navigateTo(window.location.pathname);
    
    // Fonction principale de navigation
    async function navigateTo(url) {
        // Page d'accueil
        if (url === '/' || url === '') {
            renderHomePage();
            return;
        }
        
        // Autres routes
        switch (true) {
            case url.startsWith('/teachers'):
                await renderTeachersPage(url);
                break;
            case url.startsWith('/subjects'):
                await renderSubjectsPage(url);
                break;
            case url.startsWith('/classes'):
                await renderClassesPage(url);
                break;
            case url.startsWith('/rooms'):
                await renderRoomsPage(url);
                break;
            case url.startsWith('/timeslots'):
                await renderTimeSlotsPage(url);
                break;
            case url.startsWith('/constraints'):
                await renderConstraintsPage(url);
                break;
            case url.startsWith('/schedules/generate'):
                renderGenerateSchedulePage();
                break;
            case url.startsWith('/schedules'):
                await renderSchedulesPage(url);
                break;
            default:
                renderNotFoundPage();
        }
        
        // Scroll en haut de la page
        window.scrollTo(0, 0);
    }
    // Rendu de la page d'accueil
    function renderHomePage() {
        // La page d'accueil est déjà dans le HTML principal
        // Rien à faire ici car c'est la page par défaut
    }
    
    // Rendu de la page des enseignants
    async function renderTeachersPage(url) {
        try {
            const response = await fetch(`${API_BASE_URL}/teachers`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des enseignants');
            
            const teachers = await response.json();
            
            contentElement.innerHTML = `
                <h1 class="mb-4">Gestion des Enseignants</h1>
                <div class="d-flex justify-content-between mb-4">
                    <p>Liste des enseignants et leurs spécialités.</p>
                    <button id="addTeacherBtn" class="btn btn-primary">
                        <i class="bi bi-plus-circle"></i> Ajouter un enseignant
                    </button>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Nom</th>
                                    <th scope="col">Prénom</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Heures/Semaine</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teachers.map(teacher => `
                                    <tr>
                                        <td>${teacher.id}</td>
                                        <td>${teacher.lastName}</td>
                                        <td>${teacher.firstName}</td>
                                        <td>${teacher.email || '-'}</td>
                                        <td>${teacher.hoursPerWeek}</td>
                                       <td>
                                            <a href="/teachers/${teacher.id}" class="btn btn-sm btn-info">
                                                <i class="bi bi-eye"></i>
                                            </a>
                                            <button class="btn btn-sm btn-primary manage-subjects" data-id="${teacher.id}">
                                                <i class="bi bi-book"></i>
                                            </button>
                                            <button class="btn btn-sm btn-warning edit-teacher" data-id="${teacher.id}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger delete-teacher" data-id="${teacher.id}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            // Ajouter des gestionnaires d'événements pour les boutons
            document.getElementById('addTeacherBtn').addEventListener('click', () => {
                showTeacherModal();
            });
            
            document.querySelectorAll('.edit-teacher').forEach(button => {
                button.addEventListener('click', () => {
                    const teacherId = button.getAttribute('data-id');
                    editTeacher(teacherId);
                });
            });
            
            document.querySelectorAll('.delete-teacher').forEach(button => {
                button.addEventListener('click', () => {
                    const teacherId = button.getAttribute('data-id');
                    deleteTeacher(teacherId);
                });
            });

            // Ajouter après les gestionnaires des boutons d'édition et de suppression
            document.querySelectorAll('.manage-subjects').forEach(button => {
                button.addEventListener('click', () => {
                    const teacherId = button.getAttribute('data-id');
                    renderTeacherSubjectsPage(teacherId);
                });
            });
            
        } catch (error) {
            console.error('Erreur:', error);
            contentElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Erreur lors de la récupération des enseignants: ${error.message}
                </div>
            `;
        }
    }
    // Fonction pour les autres pages
    async function renderSubjectsPage(url) {
        try {
            const response = await fetch(`${API_BASE_URL}/subjects`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des matières');
            
            const subjects = await response.json();
            
            contentElement.innerHTML = `
                <h1 class="mb-4">Gestion des Matières</h1>
                <div class="d-flex justify-content-between mb-4">
                    <p>Liste des matières enseignées.</p>
                    <button id="addSubjectBtn" class="btn btn-primary">
                        <i class="bi bi-plus-circle"></i> Ajouter une matière
                    </button>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row">
                            ${subjects.map(subject => `
                                <div class="col-md-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-header" style="background-color: ${subject.color}">
                                            <h5 class="card-title mb-0 text-white">${subject.name}</h5>
                                        </div>
                                        <div class="card-body">
                                            <p class="card-text">${subject.description || 'Aucune description'}</p>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-warning edit-subject" data-id="${subject.id}">
                                                    <i class="bi bi-pencil"></i> Modifier
                                                </button>
                                                <button class="btn btn-sm btn-danger delete-subject" data-id="${subject.id}">
                                                    <i class="bi bi-trash"></i> Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter des gestionnaires d'événements pour les boutons
            document.getElementById('addSubjectBtn').addEventListener('click', () => {
                showSubjectModal();
            });
            
            document.querySelectorAll('.edit-subject').forEach(button => {
                button.addEventListener('click', () => {
                    const subjectId = button.getAttribute('data-id');
                    editSubject(subjectId);
                });
            });
            
            document.querySelectorAll('.delete-subject').forEach(button => {
                button.addEventListener('click', () => {
                    const subjectId = button.getAttribute('data-id');
                    deleteSubject(subjectId);
                });
            });
            
        } catch (error) {
            console.error('Erreur:', error);
            contentElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Erreur lors de la récupération des matières: ${error.message}
                </div>
            `;
        }
    }
    
    // Classes
    async function renderClassesPage(url) {
        try {
            const response = await fetch(`${API_BASE_URL}/classes`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des classes');
            
            const classGroups = await response.json();
            
            contentElement.innerHTML = `
                <h1 class="mb-4">Gestion des Classes</h1>
                <div class="d-flex justify-content-between mb-4">
                    <p>Liste des classes et des groupes d'élèves.</p>
                    <button id="addClassBtn" class="btn btn-primary">
                        <i class="bi bi-plus-circle"></i> Ajouter une classe
                    </button>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Nom</th>
                                    <th scope="col">Niveau</th>
                                    <th scope="col">Nombre d'élèves</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${classGroups.map(classGroup => `
                                    <tr>
                                        <td>${classGroup.id}</td>
                                        <td>${classGroup.name}</td>
                                        <td>${classGroup.level}</td>
                                        <td>${classGroup.numberOfStudents}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info view-class-schedule" data-id="${classGroup.id}">
                                                <i class="bi bi-calendar"></i> Emploi du temps
                                            </button>
                                            <button class="btn btn-sm btn-warning edit-class" data-id="${classGroup.id}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger delete-class" data-id="${classGroup.id}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            // Ajouter les gestionnaires d'événements
            document.getElementById('addClassBtn').addEventListener('click', () => {
                showClassModal();
            });
            
            document.querySelectorAll('.edit-class').forEach(button => {
                button.addEventListener('click', () => {
                    const classId = button.getAttribute('data-id');
                    editClass(classId);
                });
            });
            
            document.querySelectorAll('.delete-class').forEach(button => {
                button.addEventListener('click', () => {
                    const classId = button.getAttribute('data-id');
                    deleteClass(classId);
                });
            });
            
            document.querySelectorAll('.view-class-schedule').forEach(button => {
                button.addEventListener('click', () => {
                    const classId = button.getAttribute('data-id');
                    viewClassSchedule(classId);
                });
            });
            
        } catch (error) {
            console.error('Erreur:', error);
            contentElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Erreur lors de la récupération des classes: ${error.message}
                </div>
            `;
        }
    }
    
    // Autres pages - implémentations similaires
    // Rendu de la page des salles
async function renderRoomsPage(url) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des salles');
      
      const rooms = await response.json();
      
      contentElement.innerHTML = `
        <h1 class="mb-4">Gestion des Salles</h1>
        <div class="d-flex justify-content-between mb-4">
          <p>Liste des salles disponibles pour les cours.</p>
          <button id="addRoomBtn" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Ajouter une salle
          </button>
        </div>
        
        <div class="card mb-4">
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nom</th>
                  <th scope="col">Type</th>
                  <th scope="col">Capacité</th>
                  <th scope="col">Bâtiment</th>
                  <th scope="col">Étage</th>
                  <th scope="col">Disponible</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rooms.map(room => `
                  <tr>
                    <td>${room.id}</td>
                    <td>${room.name}</td>
                    <td>${room.type || 'standard'}</td>
                    <td>${room.capacity}</td>
                    <td>${room.building || '-'}</td>
                    <td>${room.floor || '-'}</td>
                    <td>
                      <span class="badge ${room.isAvailable ? 'bg-success' : 'bg-danger'}">
                        ${room.isAvailable ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-warning edit-room" data-id="${room.id}">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-danger delete-room" data-id="${room.id}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      // Ajouter des gestionnaires d'événements pour les boutons
      document.getElementById('addRoomBtn').addEventListener('click', () => {
        showRoomModal();
      });
      
      document.querySelectorAll('.edit-room').forEach(button => {
        button.addEventListener('click', () => {
          const roomId = button.getAttribute('data-id');
          editRoom(roomId);
        });
      });
      
      document.querySelectorAll('.delete-room').forEach(button => {
        button.addEventListener('click', () => {
          const roomId = button.getAttribute('data-id');
          deleteRoom(roomId);
        });
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des salles: ${error.message}
        </div>
      `;
    }
  }

  // Rendu de la page des créneaux horaires
async function renderTimeSlotsPage(url) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des créneaux horaires');
      
      const timeSlots = await response.json();
      
      // Organiser les créneaux par jour
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const timeSlotsByDay = {};
      
      days.forEach(day => {
        timeSlotsByDay[day] = timeSlots.filter(slot => slot.day === day);
      });
      
      contentElement.innerHTML = `
        <h1 class="mb-4">Gestion des Créneaux Horaires</h1>
        <div class="d-flex justify-content-between mb-4">
          <p>Configuration des créneaux horaires disponibles pour les cours.</p>
          <button id="addTimeSlotBtn" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Ajouter un créneau
          </button>
        </div>
        
        <div class="row mb-4">
          ${days.map(day => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">${day}</h5>
                </div>
                <div class="card-body">
                  ${timeSlotsByDay[day].length > 0 ? `
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Début</th>
                          <th>Fin</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${timeSlotsByDay[day].map(slot => `
                          <tr class="${slot.isBreak ? 'table-secondary' : ''}">
                            <td>${slot.startTime.substring(0, 5)}</td>
                            <td>${slot.endTime.substring(0, 5)}</td>
                            <td>${slot.isBreak ? 'Pause' : 'Cours'}</td>
                            <td>
                              <button class="btn btn-sm btn-warning edit-time-slot" data-id="${slot.id}">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button class="btn btn-sm btn-danger delete-time-slot" data-id="${slot.id}">
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : `<p class="text-center mt-3">Aucun créneau configuré</p>`}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> Les pauses sont automatiquement exclues lors de la génération des emplois du temps.
        </div>
      `;
      
      // Ajouter des gestionnaires d'événements pour les boutons
      document.getElementById('addTimeSlotBtn').addEventListener('click', () => {
        showTimeSlotModal();
      });
      
      document.querySelectorAll('.edit-time-slot').forEach(button => {
        button.addEventListener('click', () => {
          const timeSlotId = button.getAttribute('data-id');
          editTimeSlot(timeSlotId);
        });
      });
      
      document.querySelectorAll('.delete-time-slot').forEach(button => {
        button.addEventListener('click', () => {
          const timeSlotId = button.getAttribute('data-id');
          deleteTimeSlot(timeSlotId);
        });
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des créneaux horaires: ${error.message}
        </div>
      `;
    }
  }

  // Fonction pour afficher la modale des créneaux horaires
function showTimeSlotModal(timeSlotData = null) {
    const modalTitle = timeSlotData ? 'Modifier un créneau horaire' : 'Ajouter un créneau horaire';
    const modalId = 'timeSlotModal';
    
    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer la structure de la modale
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="timeSlotForm">
              <input type="hidden" id="timeSlotId" value="${timeSlotData ? timeSlotData.id : ''}">
              <div class="mb-3">
                <label for="timeSlotDay" class="form-label">Jour</label>
                <select class="form-select" id="timeSlotDay" required>
                  <option value="" ${!timeSlotData ? 'selected' : ''} disabled>Sélectionner un jour</option>
                  <option value="Lundi" ${timeSlotData && timeSlotData.day === 'Lundi' ? 'selected' : ''}>Lundi</option>
                  <option value="Mardi" ${timeSlotData && timeSlotData.day === 'Mardi' ? 'selected' : ''}>Mardi</option>
                  <option value="Mercredi" ${timeSlotData && timeSlotData.day === 'Mercredi' ? 'selected' : ''}>Mercredi</option>
                  <option value="Jeudi" ${timeSlotData && timeSlotData.day === 'Jeudi' ? 'selected' : ''}>Jeudi</option>
                  <option value="Vendredi" ${timeSlotData && timeSlotData.day === 'Vendredi' ? 'selected' : ''}>Vendredi</option>
                  <option value="Samedi" ${timeSlotData && timeSlotData.day === 'Samedi' ? 'selected' : ''}>Samedi</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="timeSlotStart" class="form-label">Heure de début</label>
                <input type="time" class="form-control" id="timeSlotStart" value="${timeSlotData ? timeSlotData.startTime.substring(0, 5) : ''}" required>
              </div>
              <div class="mb-3">
                <label for="timeSlotEnd" class="form-label">Heure de fin</label>
                <input type="time" class="form-control" id="timeSlotEnd" value="${timeSlotData ? timeSlotData.endTime.substring(0, 5) : ''}" required>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="timeSlotIsBreak" ${timeSlotData && timeSlotData.isBreak ? 'checked' : ''}>
                <label class="form-check-label" for="timeSlotIsBreak">Pause (récréation, déjeuner, etc.)</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveTimeSlot">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveTimeSlot').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const timeSlotId = document.getElementById('timeSlotId').value;
      const day = document.getElementById('timeSlotDay').value;
      const startTime = document.getElementById('timeSlotStart').value;
      const endTime = document.getElementById('timeSlotEnd').value;
      const isBreak = document.getElementById('timeSlotIsBreak').checked;
      
      // Valider les données
      if (!day || !startTime || !endTime) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      // Vérifier que l'heure de fin est après l'heure de début
      if (startTime >= endTime) {
        alert('L\'heure de fin doit être postérieure à l\'heure de début.');
        return;
      }
      
      try {
        const url = timeSlotId 
          ? `${API_BASE_URL}/timeslots/${timeSlotId}` 
          : `${API_BASE_URL}/timeslots`;
        
        const method = timeSlotId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            day,
            startTime: startTime + ':00',
            endTime: endTime + ':00',
            isBreak
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Rafraîchir la page des créneaux horaires
        navigateTo('/timeslots');
        
        // Afficher une notification de succès
        showNotification(
          'Créneau horaire enregistré', 
          `Le créneau horaire de ${startTime} à ${endTime} le ${day} a été ${timeSlotId ? 'modifié' : 'ajouté'} avec succès.`,
          'success'
        );
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
  }
  
  // Fonction pour supprimer un créneau horaire
  async function deleteTimeSlot(timeSlotId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau horaire ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeSlotId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      // Rafraîchir la page des créneaux horaires
      navigateTo('/timeslots');
      
      // Afficher une notification de succès
      showNotification(
        'Créneau horaire supprimé', 
        'Le créneau horaire a été supprimé avec succès.',
        'success'
      );
      
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(
        'Erreur', 
        `Une erreur est survenue: ${error.message}`,
        'danger'
      );
    }
  }
  
  // Fonction pour modifier un créneau horaire
  async function editTimeSlot(timeSlotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeSlotId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      
      const timeSlotData = await response.json();
      showTimeSlotModal(timeSlotData);
      
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(
        'Erreur', 
        `Une erreur est survenue: ${error.message}`,
        'danger'
      );
    }
  }



  // Fonction pour supprimer une salle
async function deleteRoom(roomId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      // Rafraîchir la page des salles
      navigateTo('/rooms');
      
      // Afficher une notification de succès
      showNotification(
        'Salle supprimée', 
        'La salle a été supprimée avec succès.',
        'success'
      );
      
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(
        'Erreur', 
        `Une erreur est survenue: ${error.message}`,
        'danger'
      );
    }
  }
  
  // Fonction pour modifier une salle
  async function editRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      
      const roomData = await response.json();
      showRoomModal(roomData);
      
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(
        'Erreur', 
        `Une erreur est survenue: ${error.message}`,
        'danger'
      );
    }
  }


  // Rendu de la page des contraintes
async function renderConstraintsPage(url) {
    try {
      // Récupérer les contraintes
      const constraintsResponse = await fetch(`${API_BASE_URL}/constraints`);
      if (!constraintsResponse.ok) throw new Error('Erreur lors de la récupération des contraintes');
      
      const constraints = await constraintsResponse.json();
      
      // Récupérer les données associées (enseignants, salles, etc.)
      const teachersResponse = await fetch(`${API_BASE_URL}/teachers`);
      const classesResponse = await fetch(`${API_BASE_URL}/classes`);
      const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`);
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`);
      
      if (!teachersResponse.ok || !classesResponse.ok || !subjectsResponse.ok || !roomsResponse.ok) {
        throw new Error('Erreur lors de la récupération des données associées');
      }
      
      const teachers = await teachersResponse.json();
      const classes = await classesResponse.json();
      const subjects = await subjectsResponse.json();
      const rooms = await roomsResponse.json();
      
      // Organiser les contraintes par type
      const constraintsByType = {
        'teacher_unavailable': constraints.filter(c => c.type === 'teacher_unavailable'),
        'room_unavailable': constraints.filter(c => c.type === 'room_unavailable'),
        'specific_room_required': constraints.filter(c => c.type === 'specific_room_required'),
        'max_hours_per_day': constraints.filter(c => c.type === 'max_hours_per_day'),
        'consecutive_classes': constraints.filter(c => c.type === 'consecutive_classes'),
        'same_day_classes': constraints.filter(c => c.type === 'same_day_classes'),
        'class_limit': constraints.filter(c => c.type === 'class_limit'),
        'custom': constraints.filter(c => c.type === 'custom')
      };
      
      // Fonction pour obtenir le nom associé à un ID
      const getEntityName = (entityType, entityId) => {
        if (!entityId) return '-';
        switch (entityType) {
          case 'teacher':
            const teacher = teachers.find(t => t.id === entityId);
            return teacher ? `${teacher.firstName} ${teacher.lastName}` : '-';
          case 'class':
            const classGroup = classes.find(c => c.id === entityId);
            return classGroup ? classGroup.name : '-';
          case 'subject':
            const subject = subjects.find(s => s.id === entityId);
            return subject ? subject.name : '-';
          case 'room':
            const room = rooms.find(r => r.id === entityId);
            return room ? room.name : '-';
          default:
            return '-';
        }
      };
      
      // Fonction pour formater les paramètres des contraintes
      const formatParameters = (constraint) => {
        if (!constraint.parameters) return '-';
        
        switch (constraint.type) {
          case 'teacher_unavailable':
            return `Jours/Heures: ${constraint.parameters.days || 'Tous'}`;
          case 'room_unavailable':
            return `Jours/Heures: ${constraint.parameters.days || 'Tous'}`;
          case 'specific_room_required':
            return `Matière: ${getEntityName('subject', constraint.parameters.subjectId)}, Type de salle: ${constraint.parameters.roomType}`;
          case 'max_hours_per_day':
            return `Maximum: ${constraint.parameters.maxHours} heures par jour`;
          case 'consecutive_classes':
            return `Maximum: ${constraint.parameters.maxConsecutive} cours consécutifs`;
          case 'same_day_classes':
            return `Matières: ${constraint.parameters.subjectIds ? constraint.parameters.subjectIds.map(id => getEntityName('subject', id)).join(', ') : '-'}`;
          case 'class_limit':
            return `Classe: ${getEntityName('class', constraint.parameters.classId)}, Limite: ${constraint.parameters.maxHoursPerDay} heures/jour`;
          default:
            return JSON.stringify(constraint.parameters);
        }
      };
      
      contentElement.innerHTML = `
        <h1 class="mb-4">Gestion des Contraintes</h1>
        <div class="d-flex justify-content-between mb-4">
          <p>Configuration des contraintes pour la génération des emplois du temps.</p>
          <button id="addConstraintBtn" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Ajouter une contrainte
          </button>
        </div>
        
        <ul class="nav nav-tabs mb-4" id="constraintTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-constraints" type="button" role="tab">
              Toutes les contraintes
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="hard-tab" data-bs-toggle="tab" data-bs-target="#hard-constraints" type="button" role="tab">
              Contraintes strictes
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="soft-tab" data-bs-toggle="tab" data-bs-target="#soft-constraints" type="button" role="tab">
              Préférences
            </button>
          </li>
        </ul>
        
        <div class="tab-content" id="constraintTabContent">
          <div class="tab-pane fade show active" id="all-constraints" role="tabpanel">
            <div class="card mb-4">
              <div class="card-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Priorité</th>
                      <th>Description</th>
                      <th>Paramètres</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${constraints.map(constraint => `
                      <tr>
                        <td>${getConstraintTypeName(constraint.type)}</td>
                        <td>
                          <span class="badge ${constraint.priority === 'hard' ? 'bg-danger' : 'bg-warning'}">
                            ${constraint.priority === 'hard' ? 'Stricte' : 'Préférence'}
                          </span>
                        </td>
                        <td>${constraint.description || '-'}</td>
                        <td>${formatParameters(constraint)}</td>
                        <td>
                          <span class="badge ${constraint.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${constraint.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-warning edit-constraint" data-id="${constraint.id}">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-danger delete-constraint" data-id="${constraint.id}">
                            <i class="bi bi-trash"></i>
                          </button>
                          <button class="btn btn-sm ${constraint.isActive ? 'btn-secondary' : 'btn-success'} toggle-constraint" data-id="${constraint.id}" data-active="${constraint.isActive}">
                            <i class="bi ${constraint.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="tab-pane fade" id="hard-constraints" role="tabpanel">
            <div class="card mb-4">
              <div class="card-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Paramètres</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${constraints.filter(c => c.priority === 'hard').map(constraint => `
                      <tr>
                        <td>${getConstraintTypeName(constraint.type)}</td>
                        <td>${constraint.description || '-'}</td>
                        <td>${formatParameters(constraint)}</td>
                        <td>
                          <span class="badge ${constraint.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${constraint.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-warning edit-constraint" data-id="${constraint.id}">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-danger delete-constraint" data-id="${constraint.id}">
                            <i class="bi bi-trash"></i>
                          </button>
                          <button class="btn btn-sm ${constraint.isActive ? 'btn-secondary' : 'btn-success'} toggle-constraint" data-id="${constraint.id}" data-active="${constraint.isActive}">
                            <i class="bi ${constraint.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="tab-pane fade" id="soft-constraints" role="tabpanel">
            <div class="card mb-4">
              <div class="card-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Poids</th>
                      <th>Description</th>
                      <th>Paramètres</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${constraints.filter(c => c.priority === 'soft').map(constraint => `
                      <tr>
                        <td>${getConstraintTypeName(constraint.type)}</td>
                        <td>${constraint.weight || 1}</td>
                        <td>${constraint.description || '-'}</td>
                        <td>${formatParameters(constraint)}</td>
                        <td>
                          <span class="badge ${constraint.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${constraint.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-warning edit-constraint" data-id="${constraint.id}">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-danger delete-constraint" data-id="${constraint.id}">
                            <i class="bi bi-trash"></i>
                          </button>
                          <button class="btn btn-sm ${constraint.isActive ? 'btn-secondary' : 'btn-success'} toggle-constraint" data-id="${constraint.id}" data-active="${constraint.isActive}">
                            <i class="bi ${constraint.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> 
          Les contraintes strictes (hard) doivent être satisfaites, tandis que les préférences (soft) sont prises en compte dans la mesure du possible.
        </div>
      `;
      
      // Ajouter des gestionnaires d'événements pour les boutons
      document.getElementById('addConstraintBtn').addEventListener('click', () => {
        showConstraintModal();
      });
      
      document.querySelectorAll('.edit-constraint').forEach(button => {
        button.addEventListener('click', () => {
          const constraintId = button.getAttribute('data-id');
          editConstraint(constraintId);
        });
      });
      
      document.querySelectorAll('.delete-constraint').forEach(button => {
        button.addEventListener('click', () => {
          const constraintId = button.getAttribute('data-id');
          deleteConstraint(constraintId);
        });
      });
      
      document.querySelectorAll('.toggle-constraint').forEach(button => {
        button.addEventListener('click', async () => {
          const constraintId = button.getAttribute('data-id');
          const isActive = button.getAttribute('data-active') === 'true';
          
          try {
            const response = await fetch(`${API_BASE_URL}/constraints/${constraintId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                isActive: !isActive
              })
            });
            
            if (!response.ok) throw new Error('Erreur lors de la mise à jour');
            
            // Rafraîchir la page des contraintes
            navigateTo('/constraints');
            
            // Afficher une notification de succès
            showNotification(
              'Contrainte mise à jour', 
              `La contrainte a été ${!isActive ? 'activée' : 'désactivée'} avec succès.`,
              'success'
            );
          } catch (error) {
            console.error('Erreur:', error);
            showNotification(
              'Erreur', 
              `Une erreur est survenue: ${error.message}`,
              'danger'
            );
          }
        });
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des contraintes: ${error.message}
        </div>
      `;
    }
  }
  
// Fonction pour afficher la modale des contraintes
function showConstraintModal(constraintData = null) {
    const modalTitle = constraintData ? 'Modifier une contrainte' : 'Ajouter une contrainte';
    const modalId = 'constraintModal';
    
    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer la structure de la modale
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="constraintForm">
              <input type="hidden" id="constraintId" value="${constraintData ? constraintData.id : ''}">
              
              <div class="mb-3">
                <label for="constraintType" class="form-label">Type de contrainte</label>
                <select class="form-select" id="constraintType" required>
                  <option value="" ${!constraintData ? 'selected' : ''} disabled>Sélectionner un type</option>
                  <option value="teacher_unavailable" ${constraintData && constraintData.type === 'teacher_unavailable' ? 'selected' : ''}>Indisponibilité enseignant</option>
                  <option value="room_unavailable" ${constraintData && constraintData.type === 'room_unavailable' ? 'selected' : ''}>Indisponibilité salle</option>
                  <option value="specific_room_required" ${constraintData && constraintData.type === 'specific_room_required' ? 'selected' : ''}>Salle spécifique requise</option>
                  <option value="max_hours_per_day" ${constraintData && constraintData.type === 'max_hours_per_day' ? 'selected' : ''}>Maximum d'heures par jour</option>
                  <option value="consecutive_classes" ${constraintData && constraintData.type === 'consecutive_classes' ? 'selected' : ''}>Cours consécutifs</option>
                  <option value="same_day_classes" ${constraintData && constraintData.type === 'same_day_classes' ? 'selected' : ''}>Cours le même jour</option>
                  <option value="class_limit" ${constraintData && constraintData.type === 'class_limit' ? 'selected' : ''}>Limite de cours par classe</option>
                  <option value="custom" ${constraintData && constraintData.type === 'custom' ? 'selected' : ''}>Contrainte personnalisée</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="constraintPriority" class="form-label">Priorité</label>
                <select class="form-select" id="constraintPriority" required>
                  <option value="hard" ${!constraintData || constraintData.priority === 'hard' ? 'selected' : ''}>Stricte (doit être respectée)</option>
                  <option value="soft" ${constraintData && constraintData.priority === 'soft' ? 'selected' : ''}>Préférence (respectée si possible)</option>
                </select>
              </div>
              
              <div class="mb-3" id="weightDiv" style="display: ${constraintData && constraintData.priority === 'soft' ? 'block' : 'none'};">
                <label for="constraintWeight" class="form-label">Poids (importance relative)</label>
                <input type="number" class="form-control" id="constraintWeight" min="1" max="10" value="${constraintData && constraintData.weight ? constraintData.weight : '1'}">
                <div class="form-text">Plus le poids est élevé, plus la contrainte sera prioritaire.</div>
              </div>
              
              <div class="mb-3">
                <label for="constraintDescription" class="form-label">Description</label>
                <textarea class="form-control" id="constraintDescription" rows="2">${constraintData && constraintData.description ? constraintData.description : ''}</textarea>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="constraintIsActive" ${!constraintData || constraintData.isActive ? 'checked' : ''}>
                <label class="form-check-label" for="constraintIsActive">Contrainte active</label>
              </div>
              
              <hr>
              <h5>Paramètres spécifiques</h5>
              <div id="specificParams">
                <!-- Les champs spécifiques seront ajoutés dynamiquement ici -->
                <div class="alert alert-info">
                  Sélectionnez un type de contrainte pour afficher les paramètres spécifiques.
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveConstraint">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Gérer l'affichage du champ de poids en fonction de la priorité
    document.getElementById('constraintPriority').addEventListener('change', function() {
      document.getElementById('weightDiv').style.display = this.value === 'soft' ? 'block' : 'none';
    });
    
    // Gérer le changement de type de contrainte pour afficher les paramètres spécifiques
    document.getElementById('constraintType').addEventListener('change', function() {
      updateSpecificParams(this.value, constraintData);
    });
    
    // Afficher les paramètres spécifiques initiaux si on modifie une contrainte existante
    if (constraintData && constraintData.type) {
      updateSpecificParams(constraintData.type, constraintData);
    }
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveConstraint').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const constraintId = document.getElementById('constraintId').value;
      const type = document.getElementById('constraintType').value;
      const priority = document.getElementById('constraintPriority').value;
      const weight = document.getElementById('constraintWeight').value;
      const description = document.getElementById('constraintDescription').value;
      const isActive = document.getElementById('constraintIsActive').checked;
      
      // Récupérer les paramètres spécifiques en fonction du type
      const parameters = getSpecificParameters(type);
      
      // Valider les données
      if (!type || !priority) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      try {
        const url = constraintId 
          ? `${API_BASE_URL}/constraints/${constraintId}` 
          : `${API_BASE_URL}/constraints`;
        
        const method = constraintId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type,
            priority,
            weight: priority === 'soft' ? parseInt(weight) : 1,
            parameters,
            description,
            isActive
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Rafraîchir la page des contraintes
        navigateTo('/constraints');
        
        // Afficher une notification de succès
        showNotification(
          'Contrainte enregistrée', 
          `La contrainte a été ${constraintId ? 'modifiée' : 'ajoutée'} avec succès.`,
          'success'
        );
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
  }
  
  // Fonction pour mettre à jour les paramètres spécifiques selon le type de contrainte
  async function updateSpecificParams(type, constraintData = null) {
    const specificParamsDiv = document.getElementById('specificParams');
    let html = '';
    
    switch (type) {
      case 'teacher_unavailable':
        // Récupérer la liste des enseignants
        try {
          const response = await fetch(`${API_BASE_URL}/teachers`);
          if (!response.ok) throw new Error('Erreur lors de la récupération des enseignants');
          
          const teachers = await response.json();
          const currentTeacherId = constraintData && constraintData.parameters ? constraintData.parameters.teacherId : '';
          
          html = `
            <div class="mb-3">
              <label for="teacherId" class="form-label">Enseignant</label>
              <select class="form-select" id="teacherId" required>
                <option value="" ${!currentTeacherId ? 'selected' : ''} disabled>Sélectionner un enseignant</option>
                ${teachers.map(teacher => `
                  <option value="${teacher.id}" ${currentTeacherId === teacher.id ? 'selected' : ''}>
                    ${teacher.firstName} ${teacher.lastName}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Jours d'indisponibilité</label>
              <div class="row">
                ${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => `
                  <div class="col-md-4 mb-2">
                    <div class="form-check">
                      <input class="form-check-input day-checkbox" type="checkbox" id="day_${day}" value="${day}" ${
                        constraintData && constraintData.parameters && 
                        constraintData.parameters.days && 
                        constraintData.parameters.days.includes(day) ? 'checked' : ''
                      }>
                      <label class="form-check-label" for="day_${day}">${day}</label>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } catch (error) {
          console.error('Erreur:', error);
          html = `<div class="alert alert-danger">Erreur lors de la récupération des enseignants</div>`;
        }
        break;
        
      case 'room_unavailable':
        // Récupérer la liste des salles
        try {
          const response = await fetch(`${API_BASE_URL}/rooms`);
          if (!response.ok) throw new Error('Erreur lors de la récupération des salles');
          
          const rooms = await response.json();
          const currentRoomId = constraintData && constraintData.parameters ? constraintData.parameters.roomId : '';
          
          html = `
            <div class="mb-3">
              <label for="roomId" class="form-label">Salle</label>
              <select class="form-select" id="roomId" required>
                <option value="" ${!currentRoomId ? 'selected' : ''} disabled>Sélectionner une salle</option>
                ${rooms.map(room => `
                  <option value="${room.id}" ${currentRoomId === room.id ? 'selected' : ''}>
                    ${room.name} (${room.type})
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Jours d'indisponibilité</label>
              <div class="row">
                ${['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => `
                  <div class="col-md-4 mb-2">
                    <div class="form-check">
                      <input class="form-check-input day-checkbox" type="checkbox" id="day_${day}" value="${day}" ${
                        constraintData && constraintData.parameters && 
                        constraintData.parameters.days && 
                        constraintData.parameters.days.includes(day) ? 'checked' : ''
                      }>
                      <label class="form-check-label" for="day_${day}">${day}</label>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } catch (error) {
          console.error('Erreur:', error);
          html = `<div class="alert alert-danger">Erreur lors de la récupération des salles</div>`;
        }
        break;
        
      case 'specific_room_required':
        // Récupérer la liste des matières
        try {
          const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`);
          if (!subjectsResponse.ok) throw new Error('Erreur lors de la récupération des matières');
          
          const subjects = await subjectsResponse.json();
          const currentSubjectId = constraintData && constraintData.parameters ? constraintData.parameters.subjectId : '';
          const currentRoomType = constraintData && constraintData.parameters ? constraintData.parameters.roomType : '';
          
          html = `
            <div class="mb-3">
              <label for="subjectId" class="form-label">Matière</label>
              <select class="form-select" id="subjectId" required>
                <option value="" ${!currentSubjectId ? 'selected' : ''} disabled>Sélectionner une matière</option>
                ${subjects.map(subject => `
                  <option value="${subject.id}" ${currentSubjectId === subject.id ? 'selected' : ''}>
                    ${subject.name}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label for="roomType" class="form-label">Type de salle requis</label>
              <select class="form-select" id="roomType" required>
                <option value="" ${!currentRoomType ? 'selected' : ''} disabled>Sélectionner un type de salle</option>
                <option value="standard" ${currentRoomType === 'standard' ? 'selected' : ''}>Standard</option>
                <option value="lab" ${currentRoomType === 'lab' ? 'selected' : ''}>Laboratoire</option>
                <option value="computer" ${currentRoomType === 'computer' ? 'selected' : ''}>Informatique</option>
              <option value="gym" ${currentRoomType === 'gym' ? 'selected' : ''}>Gymnase</option>
              <option value="art" ${currentRoomType === 'art' ? 'selected' : ''}>Arts</option>
              <option value="music" ${currentRoomType === 'music' ? 'selected' : ''}>Musique</option>
            </select>
          </div>
        `;
      } catch (error) {
        console.error('Erreur:', error);
        html = `<div class="alert alert-danger">Erreur lors de la récupération des matières</div>`;
      }
      break;
      
    case 'max_hours_per_day':
      const maxHours = constraintData && constraintData.parameters ? constraintData.parameters.maxHours : 6;
      html = `
        <div class="mb-3">
          <label for="maxHours" class="form-label">Nombre maximum d'heures par jour</label>
          <input type="number" class="form-control" id="maxHours" min="1" max="12" value="${maxHours}" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Appliquer à:</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="applyTo" id="applyToAll" value="all" ${
              !constraintData || !constraintData.parameters || !constraintData.parameters.applyTo || constraintData.parameters.applyTo === 'all' ? 'checked' : ''
            }>
            <label class="form-check-label" for="applyToAll">Toutes les entités</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="applyTo" id="applyToTeacher" value="teacher" ${
              constraintData && constraintData.parameters && constraintData.parameters.applyTo === 'teacher' ? 'checked' : ''
            }>
            <label class="form-check-label" for="applyToTeacher">Enseignants uniquement</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="applyTo" id="applyToClass" value="class" ${
              constraintData && constraintData.parameters && constraintData.parameters.applyTo === 'class' ? 'checked' : ''
            }>
            <label class="form-check-label" for="applyToClass">Classes uniquement</label>
          </div>
        </div>
      `;
      break;
      
    case 'consecutive_classes':
      const maxConsecutive = constraintData && constraintData.parameters ? constraintData.parameters.maxConsecutive : 3;
      html = `
        <div class="mb-3">
          <label for="maxConsecutive" class="form-label">Nombre maximum de cours consécutifs</label>
          <input type="number" class="form-control" id="maxConsecutive" min="1" max="8" value="${maxConsecutive}" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Appliquer à:</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="applyTo" id="applyToTeacher" value="teacher" ${
              !constraintData || !constraintData.parameters || !constraintData.parameters.applyTo || constraintData.parameters.applyTo === 'teacher' ? 'checked' : ''
            }>
            <label class="form-check-label" for="applyToTeacher">Enseignants</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="applyTo" id="applyToClass" value="class" ${
              constraintData && constraintData.parameters && constraintData.parameters.applyTo === 'class' ? 'checked' : ''
            }>
            <label class="form-check-label" for="applyToClass">Classes</label>
          </div>
        </div>
      `;
      break;
      
    case 'same_day_classes':
      try {
        const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`);
        if (!subjectsResponse.ok) throw new Error('Erreur lors de la récupération des matières');
        
        const subjects = await subjectsResponse.json();
        const selectedSubjects = constraintData && constraintData.parameters ? constraintData.parameters.subjectIds || [] : [];
        
        html = `
          <div class="mb-3">
            <label class="form-label">Matières à programmer le même jour</label>
            <select id="subjectIds" class="form-select" multiple size="5">
              ${subjects.map(subject => `
                <option value="${subject.id}" ${selectedSubjects.includes(subject.id) ? 'selected' : ''}>
                  ${subject.name}
                </option>
              `).join('')}
            </select>
            <div class="form-text">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs matières.</div>
          </div>
        `;
      } catch (error) {
        console.error('Erreur:', error);
        html = `<div class="alert alert-danger">Erreur lors de la récupération des matières</div>`;
      }
      break;
      
    case 'class_limit':
      try {
        const classesResponse = await fetch(`${API_BASE_URL}/classes`);
        if (!classesResponse.ok) throw new Error('Erreur lors de la récupération des classes');
        
        const classes = await classesResponse.json();
        const currentClassId = constraintData && constraintData.parameters ? constraintData.parameters.classId : '';
        const maxHoursPerDay = constraintData && constraintData.parameters ? constraintData.parameters.maxHoursPerDay : 6;
        
        html = `
          <div class="mb-3">
            <label for="classId" class="form-label">Classe</label>
            <select class="form-select" id="classId" required>
              <option value="" ${!currentClassId ? 'selected' : ''} disabled>Sélectionner une classe</option>
              ${classes.map(classGroup => `
                <option value="${classGroup.id}" ${currentClassId === classGroup.id ? 'selected' : ''}>
                  ${classGroup.name} (${classGroup.level})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="mb-3">
            <label for="maxHoursPerDay" class="form-label">Nombre maximum d'heures par jour</label>
            <input type="number" class="form-control" id="maxHoursPerDay" min="1" max="10" value="${maxHoursPerDay}" required>
          </div>
        `;
      } catch (error) {
        console.error('Erreur:', error);
        html = `<div class="alert alert-danger">Erreur lors de la récupération des classes</div>`;
      }
      break;
      
    case 'custom':
      // Format JSON pour les paramètres personnalisés
      const customParams = constraintData && constraintData.parameters ? JSON.stringify(constraintData.parameters, null, 2) : '{\n  \n}';
      html = `
        <div class="mb-3">
          <label for="customParams" class="form-label">Paramètres personnalisés (JSON)</label>
          <textarea class="form-control" id="customParams" rows="6">${customParams}</textarea>
          <div class="form-text">Entrez les paramètres au format JSON.</div>
        </div>
      `;
      break;
      
    default:
      html = `
        <div class="alert alert-info">
          Sélectionnez un type de contrainte pour afficher les paramètres spécifiques.
        </div>
      `;
  }
  
  specificParamsDiv.innerHTML = html;
}

// Fonction pour récupérer les paramètres spécifiques selon le type de contrainte
function getSpecificParameters(type) {
  let parameters = {};
  
  switch (type) {
    case 'teacher_unavailable':
      const teacherId = document.getElementById('teacherId').value;
      const teacherDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
      parameters = {
        teacherId: parseInt(teacherId),
        days: teacherDays
      };
      break;
      
    case 'room_unavailable':
      const roomId = document.getElementById('roomId').value;
      const roomDays = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
      parameters = {
        roomId: parseInt(roomId),
        days: roomDays
      };
      break;
      
    case 'specific_room_required':
      const subjectId = document.getElementById('subjectId').value;
      const roomType = document.getElementById('roomType').value;
      parameters = {
        subjectId: parseInt(subjectId),
        roomType
      };
      break;
      
    case 'max_hours_per_day':
      const maxHours = document.getElementById('maxHours').value;
      const applyTo = document.querySelector('input[name="applyTo"]:checked').value;
      parameters = {
        maxHours: parseInt(maxHours),
        applyTo
      };
      break;
      
    case 'consecutive_classes':
      const maxConsecutive = document.getElementById('maxConsecutive').value;
      const applyToConsecutive = document.querySelector('input[name="applyTo"]:checked').value;
      parameters = {
        maxConsecutive: parseInt(maxConsecutive),
        applyTo: applyToConsecutive
      };
      break;
      
    case 'same_day_classes':
      const subjectIdsSelect = document.getElementById('subjectIds');
      const selectedSubjects = Array.from(subjectIdsSelect.selectedOptions).map(option => parseInt(option.value));
      parameters = {
        subjectIds: selectedSubjects
      };
      break;
      
    case 'class_limit':
      const classId = document.getElementById('classId').value;
      const maxHoursPerDay = document.getElementById('maxHoursPerDay').value;
      parameters = {
        classId: parseInt(classId),
        maxHoursPerDay: parseInt(maxHoursPerDay)
      };
      break;
      
    case 'custom':
      try {
        parameters = JSON.parse(document.getElementById('customParams').value);
      } catch (error) {
        alert('Format JSON invalide. Veuillez vérifier les paramètres personnalisés.');
        throw new Error('Format JSON invalide');
      }
      break;
  }
  
  return parameters;
}

// Fonction pour supprimer une contrainte
async function deleteConstraint(constraintId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette contrainte ? Cette action est irréversible.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/constraints/${constraintId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    
    // Rafraîchir la page des contraintes
    navigateTo('/constraints');
    
    // Afficher une notification de succès
    showNotification(
      'Contrainte supprimée', 
      'La contrainte a été supprimée avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour modifier une contrainte
async function editConstraint(constraintId) {
  try {
    const response = await fetch(`${API_BASE_URL}/constraints/${constraintId}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    
    const constraintData = await response.json();
    showConstraintModal(constraintData);
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

  // Fonction utilitaire pour obtenir le nom lisible d'un type de contrainte
  function getConstraintTypeName(type) {
    const types = {
      'teacher_unavailable': 'Indisponibilité enseignant',
      'room_unavailable': 'Indisponibilité salle',
      'class_limit': 'Limite de cours par classe',
      'consecutive_classes': 'Cours consécutifs',
      'same_day_classes': 'Cours le même jour',
      'max_hours_per_day': 'Maximum d\'heures par jour',
      'specific_room_required': 'Salle spécifique requise',
      'custom': 'Contrainte personnalisée'
    };
    
    return types[type] || type;
  }

  

  // Fonction pour afficher la modale des salles
function showRoomModal(roomData = null) {
    const modalTitle = roomData ? 'Modifier une salle' : 'Ajouter une salle';
    const modalId = 'roomModal';
    
    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer la structure de la modale
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="roomForm">
              <input type="hidden" id="roomId" value="${roomData ? roomData.id : ''}">
              <div class="mb-3">
                <label for="roomName" class="form-label">Nom de la salle</label>
                <input type="text" class="form-control" id="roomName" value="${roomData ? roomData.name : ''}" required>
              </div>
              <div class="mb-3">
                <label for="roomType" class="form-label">Type de salle</label>
                <select class="form-select" id="roomType">
                  <option value="standard" ${roomData && roomData.type === 'standard' ? 'selected' : ''}>Standard</option>
                  <option value="lab" ${roomData && roomData.type === 'lab' ? 'selected' : ''}>Laboratoire</option>
                  <option value="computer" ${roomData && roomData.type === 'computer' ? 'selected' : ''}>Informatique</option>
                  <option value="gym" ${roomData && roomData.type === 'gym' ? 'selected' : ''}>Gymnase</option>
                  <option value="art" ${roomData && roomData.type === 'art' ? 'selected' : ''}>Arts</option>
                  <option value="music" ${roomData && roomData.type === 'music' ? 'selected' : ''}>Musique</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="roomCapacity" class="form-label">Capacité</label>
                <input type="number" class="form-control" id="roomCapacity" value="${roomData ? roomData.capacity : '30'}" required min="1" max="100">
              </div>
              <div class="mb-3">
                <label for="roomBuilding" class="form-label">Bâtiment</label>
                <input type="text" class="form-control" id="roomBuilding" value="${roomData ? roomData.building || '' : ''}">
              </div>
              <div class="mb-3">
                <label for="roomFloor" class="form-label">Étage</label>
                <input type="text" class="form-control" id="roomFloor" value="${roomData ? roomData.floor || '' : ''}">
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="roomIsAvailable" ${roomData ? (roomData.isAvailable ? 'checked' : '') : 'checked'}>
                <label class="form-check-label" for="roomIsAvailable">Disponible</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveRoom">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveRoom').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const roomId = document.getElementById('roomId').value;
      const name = document.getElementById('roomName').value;
      const type = document.getElementById('roomType').value;
      const capacity = document.getElementById('roomCapacity').value;
      const building = document.getElementById('roomBuilding').value;
      const floor = document.getElementById('roomFloor').value;
      const isAvailable = document.getElementById('roomIsAvailable').checked;
      
      // Valider les données
      if (!name || !capacity) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      try {
        const url = roomId 
          ? `${API_BASE_URL}/rooms/${roomId}` 
          : `${API_BASE_URL}/rooms`;
        
        const method = roomId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            type,
            capacity: parseInt(capacity),
            building,
            floor,
            isAvailable
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Rafraîchir la page des salles
        navigateTo('/rooms');
        
        // Afficher une notification de succès
        showNotification(
          'Salle enregistrée', 
          `La salle ${name} a été ${roomId ? 'modifiée' : 'ajoutée'} avec succès.`,
          'success'
        );
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
  }


    
    function renderNotFoundPage() {
        contentElement.innerHTML = `
            <div class="text-center my-5">
                <h1 class="display-1">404</h1>
                <h2>Page non trouvée</h2>
                <p class="lead">La page que vous recherchez n'existe pas.</p>
                <a href="/" class="btn btn-primary">Retour à l'accueil</a>
            </div>
        `;
    }
    
    // Fonctions utilitaires pour les modales
    function showTeacherModal(teacherData = null) {
        // Créer une modale pour ajouter/modifier un enseignant
        const modalTitle = teacherData ? 'Modifier un enseignant' : 'Ajouter un enseignant';
        const modalId = 'teacherModal';
        
        // Supprimer la modale existante si elle existe
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Créer la structure de la modale
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="teacherForm">
                            <input type="hidden" id="teacherId" value="${teacherData ? teacherData.id : ''}">
                            <div class="mb-3">
                                <label for="firstName" class="form-label">Prénom</label>
                                <input type="text" class="form-control" id="firstName" value="${teacherData ? teacherData.firstName : ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="lastName" class="form-label">Nom</label>
                                <input type="text" class="form-control" id="lastName" value="${teacherData ? teacherData.lastName : ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" value="${teacherData ? teacherData.email : ''}">
                            </div>
                            <div class="mb-3">
                                <label for="hoursPerWeek" class="form-label">Heures par semaine</label>
                                <input type="number" class="form-control" id="hoursPerWeek" value="${teacherData ? teacherData.hoursPerWeek : '18'}" required min="1" max="40">
                            </div>
                            <div class="mb-3">
                                <label for="notes" class="form-label">Notes</label>
                                <textarea class="form-control" id="notes" rows="3">${teacherData ? teacherData.notes || '' : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="saveTeacher">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter la modale au document
        document.body.appendChild(modal);
        
        // Créer une instance de la modale Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        
        // Gestionnaire d'événement pour le bouton d'enregistrement
        document.getElementById('saveTeacher').addEventListener('click', async () => {
            // Récupérer les valeurs du formulaire
            const teacherId = document.getElementById('teacherId').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const hoursPerWeek = document.getElementById('hoursPerWeek').value;
            const notes = document.getElementById('notes').value;
            
            // Valider les données
            if (!firstName || !lastName || !hoursPerWeek) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            try {
                const url = teacherId 
                    ? `${API_BASE_URL}/teachers/${teacherId}` 
                    : `${API_BASE_URL}/teachers`;
                
                const method = teacherId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        hoursPerWeek: parseInt(hoursPerWeek),
                        notes
                    })
                });
                
                if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
                
                // Fermer la modale
                modalInstance.hide();
                
                // Rafraîchir la page des enseignants
                navigateTo('/teachers');
                
                // Afficher une notification de succès
                showNotification(
                    'Enseignant enregistré', 
                    `L'enseignant ${firstName} ${lastName} a été ${teacherId ? 'modifié' : 'ajouté'} avec succès.`,
                    'success'
                );
                
            } catch (error) {
                console.error('Erreur:', error);
                showNotification(
                    'Erreur', 
                    `Une erreur est survenue: ${error.message}`,
                    'danger'
                );
            }
        });
        
        // Afficher la modale
        modalInstance.show();
    }
    
    // Fonction pour supprimer un enseignant
    async function deleteTeacher(teacherId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            
            // Rafraîchir la page des enseignants
            navigateTo('/teachers');
            
            // Afficher une notification de succès
            showNotification(
                'Enseignant supprimé', 
                'L\'enseignant a été supprimé avec succès.',
                'success'
            );
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour modifier un enseignant
    async function editTeacher(teacherId) {
        try {
            const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des données');
            
            const teacherData = await response.json();
            showTeacherModal(teacherData);
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour afficher une notification
    function showNotification(title, message, type = 'info') {
        // Créer une notification toast
        const toastId = 'notification-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong>: ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Ajouter au conteneur de toasts ou créer un nouveau conteneur
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Initialiser le toast Bootstrap
        const toastInstance = new bootstrap.Toast(toast, {
            delay: 5000 // Durée d'affichage de 5 secondes
        });
        
        // Afficher le toast
        toastInstance.show();
    }
    
    // Fonction pour afficher la modale des matières
    function showSubjectModal(subjectData = null) {
        // Créer une modale pour ajouter/modifier une matière
        const modalTitle = subjectData ? 'Modifier une matière' : 'Ajouter une matière';
        const modalId = 'subjectModal';
        
        // Supprimer la modale existante si elle existe
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Créer la structure de la modale
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="subjectForm">
                            <input type="hidden" id="subjectId" value="${subjectData ? subjectData.id : ''}">
                            <div class="mb-3">
                                <label for="subjectName" class="form-label">Nom de la matière</label>
                                <input type="text" class="form-control" id="subjectName" value="${subjectData ? subjectData.name : ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="subjectColor" class="form-label">Couleur</label>
                                <input type="color" class="form-control form-control-color" id="subjectColor" value="${subjectData ? subjectData.color : '#CCCCCC'}" title="Choisir une couleur pour la matière">
                            </div>
                            <div class="mb-3">
                                <label for="subjectDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="subjectDescription" rows="3">${subjectData ? subjectData.description || '' : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="saveSubject">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter la modale au document
        document.body.appendChild(modal);
        
        // Créer une instance de la modale Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        
        // Gestionnaire d'événement pour le bouton d'enregistrement
        document.getElementById('saveSubject').addEventListener('click', async () => {
            // Récupérer les valeurs du formulaire
            const subjectId = document.getElementById('subjectId').value;
            const name = document.getElementById('subjectName').value;
            const color = document.getElementById('subjectColor').value;
            const description = document.getElementById('subjectDescription').value;
            
            // Valider les données
            if (!name) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            try {
                const url = subjectId 
                    ? `${API_BASE_URL}/subjects/${subjectId}` 
                    : `${API_BASE_URL}/subjects`;
                
                const method = subjectId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        color,
                        description
                    })
                });
                
                if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
                
                // Fermer la modale
                modalInstance.hide();
                
                // Rafraîchir la page des matières
                navigateTo('/subjects');
                
                // Afficher une notification de succès
                showNotification(
                    'Matière enregistrée', 
                    `La matière ${name} a été ${subjectId ? 'modifiée' : 'ajoutée'} avec succès.`,
                    'success'
                );
                
            } catch (error) {
                console.error('Erreur:', error);
                showNotification(
                    'Erreur', 
                    `Une erreur est survenue: ${error.message}`,
                    'danger'
                );
            }
        });
        
        // Afficher la modale
        modalInstance.show();
    }
    
    // Fonction pour supprimer une matière
    async function deleteSubject(subjectId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            
            // Rafraîchir la page des matières
            navigateTo('/subjects');
            
            // Afficher une notification de succès
            showNotification(
                'Matière supprimée', 
                'La matière a été supprimée avec succès.',
                'success'
            );
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour modifier une matière
    async function editSubject(subjectId) {
        try {
            const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des données');
            
            const subjectData = await response.json();
            showSubjectModal(subjectData);
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }


// Rendu de la page des emplois du temps
async function renderSchedulesPage(url) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des emplois du temps');
      
      const schedules = await response.json();
      
      // Détermine si un emploi du temps particulier est demandé
      const scheduleIdMatch = url.match(/\/schedules\/(\d+)/);
      
      if (scheduleIdMatch && scheduleIdMatch[1]) {
        // Affichage détaillé d'un emploi du temps spécifique
        await renderScheduleDetail(scheduleIdMatch[1]);
      } else {
        // Affichage de la liste des emplois du temps
        contentElement.innerHTML = `
          <h1 class="mb-4">Gestion des Emplois du Temps</h1>
          <div class="d-flex justify-content-between mb-4">
            <p>Liste des emplois du temps existants et création de nouveaux emplois du temps.</p>
            <div>
              <a href="/schedules/generate" class="btn btn-success">
                <i class="bi bi-calendar-plus"></i> Générer un emploi du temps
              </a>
              <button id="addScheduleBtn" class="btn btn-primary ms-2">
                <i class="bi bi-plus-circle"></i> Ajouter un emploi du temps
              </button>
            </div>
          </div>
          
          <div class="row mb-4">
            <div class="col-md-12">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">Emplois du temps</h5>
                </div>
                <div class="card-body">
                  ${schedules.length > 0 ? `
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Période</th>
                          <th>Statut</th>
                          <th>Actif</th>
                          <th>Créé le</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${schedules.map(schedule => `
                          <tr>
                            <td>${schedule.name}</td>
                            <td>${new Date(schedule.startDate).toLocaleDateString('fr-FR')} - ${new Date(schedule.endDate).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <span class="badge ${
                                schedule.status === 'published' ? 'bg-success' : 
                                schedule.status === 'draft' ? 'bg-warning' : 'bg-secondary'
                              }">
                                ${
                                  schedule.status === 'published' ? 'Publié' : 
                                  schedule.status === 'draft' ? 'Brouillon' : 'Archivé'
                                }
                              </span>
                            </td>
                            <td>
                              <span class="badge ${schedule.isActive ? 'bg-success' : 'bg-secondary'}">
                                ${schedule.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td>${new Date(schedule.createdAt).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <a href="/schedules/${schedule.id}" class="btn btn-sm btn-info">
                                <i class="bi bi-eye"></i> Voir
                              </a>
                              <button class="btn btn-sm btn-warning edit-schedule" data-id="${schedule.id}">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button class="btn btn-sm btn-danger delete-schedule" data-id="${schedule.id}">
                                <i class="bi bi-trash"></i>
                              </button>
                              ${!schedule.isActive && schedule.status === 'published' ? `
                                <button class="btn btn-sm btn-success activate-schedule" data-id="${schedule.id}">
                                  <i class="bi bi-check-circle"></i> Activer
                                </button>
                              ` : ''}
                              ${schedule.status === 'draft' ? `
                                <button class="btn btn-sm btn-primary publish-schedule" data-id="${schedule.id}">
                                  <i class="bi bi-send"></i> Publier
                                </button>
                              ` : ''}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  ` : `
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle"></i> Aucun emploi du temps n'a été créé pour le moment.
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">Guides et astuces</h5>
            </div>
            <div class="card-body">
              <h6>Comment créer un nouvel emploi du temps ?</h6>
              <ol>
                <li>Cliquez sur "Générer un emploi du temps"</li>
                <li>Définissez les paramètres de génération</li>
                <li>Lancez la génération automatique</li>
                <li>Vérifiez et ajustez l'emploi du temps généré</li>
                <li>Publiez l'emploi du temps quand il est prêt</li>
              </ol>
              <h6>Conseils</h6>
              <ul>
                <li>Assurez-vous que les contraintes sont bien configurées avant de générer un emploi du temps</li>
                <li>Vous pouvez modifier manuellement un emploi du temps généré si nécessaire</li>
                <li>Un seul emploi du temps peut être actif à la fois</li>
              </ul>
            </div>
          </div>
        `;
        
        // Ajouter des gestionnaires d'événements pour les boutons
        document.getElementById('addScheduleBtn').addEventListener('click', () => {
          showScheduleModal();
        });
        
        document.querySelectorAll('.edit-schedule').forEach(button => {
          button.addEventListener('click', () => {
            const scheduleId = button.getAttribute('data-id');
            editSchedule(scheduleId);
          });
        });
        
        document.querySelectorAll('.delete-schedule').forEach(button => {
          button.addEventListener('click', () => {
            const scheduleId = button.getAttribute('data-id');
            deleteSchedule(scheduleId);
          });
        });
        
        document.querySelectorAll('.activate-schedule').forEach(button => {
          button.addEventListener('click', () => {
            const scheduleId = button.getAttribute('data-id');
            activateSchedule(scheduleId);
          });
        });
        
        document.querySelectorAll('.publish-schedule').forEach(button => {
          button.addEventListener('click', () => {
            const scheduleId = button.getAttribute('data-id');
            publishSchedule(scheduleId);
          });
        });
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des emplois du temps: ${error.message}
        </div>
      `;
    }
  }
  
  // Fonction pour afficher les détails d'un emploi du temps
  async function renderScheduleDetail(scheduleId) {
    try {
      // Récupérer les données de l'emploi du temps
      const scheduleResponse = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`);
      if (!scheduleResponse.ok) throw new Error('Erreur lors de la récupération de l\'emploi du temps');
      
      const schedule = await scheduleResponse.json();
      
      // Récupérer les entrées de l'emploi du temps
      const entriesResponse = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/entries`);
      if (!entriesResponse.ok) throw new Error('Erreur lors de la récupération des entrées');
      
      const entries = await entriesResponse.json();
      
      // Récupérer les données associées
      const classesResponse = await fetch(`${API_BASE_URL}/classes`);
      const timeSlotsResponse = await fetch(`${API_BASE_URL}/timeslots`);
      
      if (!classesResponse.ok || !timeSlotsResponse.ok) {
        throw new Error('Erreur lors de la récupération des données associées');
      }
      
      const classes = await classesResponse.json();
      const timeSlots = await timeSlotsResponse.json().then(slots => 
        slots.filter(slot => !slot.isBreak).sort((a, b) => {
          // Trier par jour puis par heure
          const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
          if (dayDiff !== 0) return dayDiff;
          return a.startTime.localeCompare(b.startTime);
        })
      );
      
      // Organiser les créneaux par jour
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const timeSlotsByDay = {};
      
      days.forEach(day => {
        timeSlotsByDay[day] = timeSlots.filter(slot => slot.day === day);
      });
      
      contentElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Emploi du temps: ${schedule.name}</h1>
          <div>
            <a href="/schedules" class="btn btn-secondary">
              <i class="bi bi-arrow-left"></i> Retour
            </a>
            ${schedule.status === 'draft' ? `
              <button id="editScheduleBtn" class="btn btn-warning ms-2">
                <i class="bi bi-pencil"></i> Modifier
              </button>
              <button id="publishScheduleBtn" class="btn btn-primary ms-2">
                <i class="bi bi-send"></i> Publier
              </button>
            ` : ''}
            ${!schedule.isActive && schedule.status === 'published' ? `
              <button id="activateScheduleBtn" class="btn btn-success ms-2">
                <i class="bi bi-check-circle"></i> Activer
              </button>
            ` : ''}
            ${schedule.status !== 'archived' ? `
              <button id="archiveScheduleBtn" class="btn btn-secondary ms-2">
                <i class="bi bi-archive"></i> Archiver
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between">
            <div>
              <strong>Période:</strong> ${new Date(schedule.startDate).toLocaleDateString('fr-FR')} au ${new Date(schedule.endDate).toLocaleDateString('fr-FR')} | 
              <strong>Statut:</strong> 
              <span class="badge ${
                schedule.status === 'published' ? 'bg-success' : 
                schedule.status === 'draft' ? 'bg-warning' : 'bg-secondary'
              }">
                ${
                  schedule.status === 'published' ? 'Publié' : 
                  schedule.status === 'draft' ? 'Brouillon' : 'Archivé'
                }
              </span> | 
              <strong>Actif:</strong> 
              <span class="badge ${schedule.isActive ? 'bg-success' : 'bg-secondary'}">
                ${schedule.isActive ? 'Oui' : 'Non'}
              </span>
            </div>
            ${schedule.status === 'draft' ? `
              <button id="addEntryBtn" class="btn btn-sm btn-primary">
                <i class="bi bi-plus-circle"></i> Ajouter une entrée
              </button>
            ` : ''}
          </div>
          <div class="card-body">
            <ul class="nav nav-tabs mb-3" id="viewTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="classes-tab" data-bs-toggle="tab" data-bs-target="#classes-view" type="button" role="tab">
                  Vue par classe
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="teachers-tab" data-bs-toggle="tab" data-bs-target="#teachers-view" type="button" role="tab">
                  Vue par enseignant
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="rooms-tab" data-bs-toggle="tab" data-bs-target="#rooms-view" type="button" role="tab">
                  Vue par salle
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="all-tab" data-bs-toggle="tab" data-bs-target="#all-view" type="button" role="tab">
                  Vue complète
                </button>
              </li>
            </ul>
            
            <div class="tab-content" id="viewTabContent">
              <div class="tab-pane fade show active" id="classes-view" role="tabpanel">
                <div class="mb-3">
                  <label for="classSelect" class="form-label">Sélectionner une classe</label>
                  <select id="classSelect" class="form-select">
                    ${classes.map(classGroup => `
                      <option value="${classGroup.id}">${classGroup.name} (${classGroup.level})</option>
                    `).join('')}
                  </select>
                </div>
                <div id="classScheduleContainer" class="mt-4">
                  <!-- Le contenu sera chargé dynamiquement -->
                  <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-2">Chargement de l'emploi du temps...</p>
                  </div>
                </div>
              </div>
              
              <div class="tab-pane fade" id="teachers-view" role="tabpanel">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle"></i> 
                  Sélectionnez un enseignant pour afficher son emploi du temps.
                </div>
              </div>
              
              <div class="tab-pane fade" id="rooms-view" role="tabpanel">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle"></i> 
                  Sélectionnez une salle pour afficher son occupation.
                </div>
              </div>
              
              <div class="tab-pane fade" id="all-view" role="tabpanel">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle"></i> 
                  Cette vue affiche toutes les entrées de l'emploi du temps.
                </div>
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Jour</th>
                        <th>Horaire</th>
                        <th>Classe</th>
                        <th>Matière</th>
                        <th>Enseignant</th>
                        <th>Salle</th>
                        ${schedule.status === 'draft' ? '<th>Actions</th>' : ''}
                      </tr>
                    </thead>
                    <tbody>
                      ${entries.length > 0 ? entries.map(entry => `
                        <tr>
                          <td>${entry.TimeSlot.day}</td>
                          <td>${entry.TimeSlot.startTime.substring(0, 5)} - ${entry.TimeSlot.endTime.substring(0, 5)}</td>
                          <td>${entry.ClassGroup.name}</td>
                          <td>
                            <span class="badge" style="background-color: ${entry.Subject.color}">
                              ${entry.Subject.name}
                            </span>
                          </td>
                          <td>${entry.Teacher.firstName} ${entry.Teacher.lastName}</td>
                          <td>${entry.Room.name}</td>
                          ${schedule.status === 'draft' ? `
                            <td>
                              <button class="btn btn-sm btn-warning edit-entry" data-id="${entry.id}">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button class="btn btn-sm btn-danger delete-entry" data-id="${entry.id}">
                                <i class="bi bi-trash"></i>
                              </button>
                            </td>
                          ` : ''}
                        </tr>
                      `).join('') : `
                        <tr>
                          <td colspan="${schedule.status === 'draft' ? '7' : '6'}" class="text-center">
                            Aucune entrée dans cet emploi du temps
                          </td>
                        </tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Gestionnaires d'événements pour les actions sur l'emploi du temps
      if (schedule.status === 'draft') {
        document.getElementById('editScheduleBtn')?.addEventListener('click', () => {
          editSchedule(scheduleId);
        });
        
        document.getElementById('publishScheduleBtn')?.addEventListener('click', () => {
          publishSchedule(scheduleId);
        });
        
        document.getElementById('addEntryBtn')?.addEventListener('click', () => {
          showScheduleEntryModal(scheduleId);
        });
        
        document.querySelectorAll('.edit-entry').forEach(button => {
          button.addEventListener('click', () => {
            const entryId = button.getAttribute('data-id');
            editScheduleEntry(scheduleId, entryId);
          });
        });
        
        document.querySelectorAll('.delete-entry').forEach(button => {
          button.addEventListener('click', () => {
            const entryId = button.getAttribute('data-id');
            deleteScheduleEntry(scheduleId, entryId);
          });
        });
      }
      
      document.getElementById('activateScheduleBtn')?.addEventListener('click', () => {
        activateSchedule(scheduleId);
      });
      
      document.getElementById('archiveScheduleBtn')?.addEventListener('click', () => {
        archiveSchedule(scheduleId);
      });
      
      // Afficher l'emploi du temps de la première classe par défaut
      if (classes.length > 0) {
        const classSelect = document.getElementById('classSelect');
        loadClassSchedule(scheduleId, classSelect.value);
        
        // Gestionnaire d'événement pour le changement de classe
        classSelect.addEventListener('change', () => {
          loadClassSchedule(scheduleId, classSelect.value);
        });
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des détails de l'emploi du temps: ${error.message}
        </div>
        <a href="/schedules" class="btn btn-secondary">
          <i class="bi bi-arrow-left"></i> Retour aux emplois du temps
        </a>
      `;
    }
  }

  // Fonction pour afficher la modale d'emploi du temps
function showScheduleModal(scheduleData = null) {
    const modalTitle = scheduleData ? 'Modifier un emploi du temps' : 'Ajouter un emploi du temps';
    const modalId = 'scheduleModal';
    
    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer la structure de la modale
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="scheduleForm">
              <input type="hidden" id="scheduleId" value="${scheduleData ? scheduleData.id : ''}">
              <div class="mb-3">
                <label for="scheduleName" class="form-label">Nom de l'emploi du temps</label>
                <input type="text" class="form-control" id="scheduleName" value="${scheduleData ? scheduleData.name : ''}" required>
              </div>
              <div class="mb-3">
                <label for="scheduleStartDate" class="form-label">Date de début</label>
                <input type="date" class="form-control" id="scheduleStartDate" value="${scheduleData ? scheduleData.startDate.substring(0, 10) : new Date().toISOString().substring(0, 10)}" required>
              </div>
              <div class="mb-3">
                <label for="scheduleEndDate" class="form-label">Date de fin</label>
                <input type="date" class="form-control" id="scheduleEndDate" value="${scheduleData ? scheduleData.endDate.substring(0, 10) : ''}" required>
              </div>
              <div class="mb-3">
                <label for="scheduleStatus" class="form-label">Statut</label>
                <select class="form-select" id="scheduleStatus">
                  <option value="draft" ${!scheduleData || scheduleData.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                  <option value="published" ${scheduleData && scheduleData.status === 'published' ? 'selected' : ''}>Publié</option>
                  <option value="archived" ${scheduleData && scheduleData.status === 'archived' ? 'selected' : ''}>Archivé</option>
                </select>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="scheduleIsActive" ${scheduleData && scheduleData.isActive ? 'checked' : ''}>
                <label class="form-check-label" for="scheduleIsActive">Actif</label>
                <div class="form-text">Un seul emploi du temps peut être actif à la fois.</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveSchedule">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Calcul automatique de la date de fin (4 mois après la date de début)
    const startDateInput = document.getElementById('scheduleStartDate');
    const endDateInput = document.getElementById('scheduleEndDate');
    
    // Si pas de date de fin définie, calculer automatiquement
    if (!scheduleData || !scheduleData.endDate) {
      const startDate = new Date(startDateInput.value);
      startDate.setMonth(startDate.getMonth() + 4);
      endDateInput.value = startDate.toISOString().substring(0, 10);
    }
    
    // Mettre à jour automatiquement la date de fin lors du changement de la date de début
    startDateInput.addEventListener('change', () => {
      const startDate = new Date(startDateInput.value);
      startDate.setMonth(startDate.getMonth() + 4);
      endDateInput.value = startDate.toISOString().substring(0, 10);
    });
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveSchedule').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const scheduleId = document.getElementById('scheduleId').value;
      const name = document.getElementById('scheduleName').value;
      const startDate = document.getElementById('scheduleStartDate').value;
      const endDate = document.getElementById('scheduleEndDate').value;
      const status = document.getElementById('scheduleStatus').value;
      const isActive = document.getElementById('scheduleIsActive').checked;
      
      // Valider les données
      if (!name || !startDate || !endDate) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      // Vérifier que la date de fin est après la date de début
      if (new Date(startDate) >= new Date(endDate)) {
        alert('La date de fin doit être postérieure à la date de début.');
        return;
      }
      
      try {
        const url = scheduleId 
          ? `${API_BASE_URL}/schedules/${scheduleId}` 
          : `${API_BASE_URL}/schedules`;
        
        const method = scheduleId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            startDate,
            endDate,
            status,
            isActive
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Rafraîchir la page des emplois du temps
        navigateTo('/schedules');
        
        // Afficher une notification de succès
        showNotification(
          'Emploi du temps enregistré', 
          `L'emploi du temps "${name}" a été ${scheduleId ? 'modifié' : 'ajouté'} avec succès.`,
          'success'
        );
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
  }
  
  // Fonction pour afficher la modale d'ajout d'entrée à l'emploi du temps
  async function showScheduleEntryModal(scheduleId, entryData = null) {
    try {
      // Récupérer les données nécessaires
      const teachersResponse = await fetch(`${API_BASE_URL}/teachers`);
      const classesResponse = await fetch(`${API_BASE_URL}/classes`);
      const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`);
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`);
      const timeSlotsResponse = await fetch(`${API_BASE_URL}/timeslots/type/classes`);
      
      if (!teachersResponse.ok || !classesResponse.ok || !subjectsResponse.ok || !roomsResponse.ok || !timeSlotsResponse.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const teachers = await teachersResponse.json();
      const classes = await classesResponse.json();
      const subjects = await subjectsResponse.json();
      const rooms = await roomsResponse.json();
      const timeSlots = await timeSlotsResponse.json();
      
      const modalTitle = entryData ? 'Modifier une entrée' : 'Ajouter une entrée';
      const modalId = 'scheduleEntryModal';
      
      // Supprimer la modale existante si elle existe
      const existingModal = document.getElementById(modalId);
      if (existingModal) {
        existingModal.remove();
      }
      
      // Créer la structure de la modale
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal fade';
      modal.setAttribute('tabindex', '-1');
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${modalTitle}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="scheduleEntryForm">
                <input type="hidden" id="entryId" value="${entryData ? entryData.id : ''}">
                <div class="mb-3">
                  <label for="classGroupId" class="form-label">Classe</label>
                  <select class="form-select" id="classGroupId" required>
                    <option value="" ${!entryData ? 'selected' : ''} disabled>Sélectionner une classe</option>
                    ${classes.map(classGroup => `
                      <option value="${classGroup.id}" ${entryData && entryData.ClassGroupId === classGroup.id ? 'selected' : ''}>
                        ${classGroup.name} (${classGroup.level})
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="mb-3">
                  <label for="subjectId" class="form-label">Matière</label>
                  <select class="form-select" id="subjectId" required>
                    <option value="" ${!entryData ? 'selected' : ''} disabled>Sélectionner une matière</option>
                  ${subjects.map(subject => `
                    <option value="${subject.id}" 
                            style="background-color: ${subject.color}; color: white;" 
                            ${entryData && entryData.SubjectId === subject.id ? 'selected' : ''}>
                      ${subject.name}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="teacherId" class="form-label">Enseignant</label>
                <select class="form-select" id="teacherId" required>
                  <option value="" ${!entryData ? 'selected' : ''} disabled>Sélectionner un enseignant</option>
                  ${teachers.map(teacher => `
                    <option value="${teacher.id}" ${entryData && entryData.TeacherId === teacher.id ? 'selected' : ''}>
                      ${teacher.firstName} ${teacher.lastName}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="roomId" class="form-label">Salle</label>
                <select class="form-select" id="roomId" required>
                  <option value="" ${!entryData ? 'selected' : ''} disabled>Sélectionner une salle</option>
                  ${rooms.map(room => `
                    <option value="${room.id}" ${entryData && entryData.RoomId === room.id ? 'selected' : ''}>
                      ${room.name} (${room.type}, ${room.capacity} places)
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="timeSlotId" class="form-label">Créneau horaire</label>
                <select class="form-select" id="timeSlotId" required>
                  <option value="" ${!entryData ? 'selected' : ''} disabled>Sélectionner un créneau</option>
                  ${timeSlots.map(slot => `
                    <option value="${slot.id}" ${entryData && entryData.TimeSlotId === slot.id ? 'selected' : ''}>
                      ${slot.day} ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="entryNotes" class="form-label">Notes</label>
                <textarea class="form-control" id="entryNotes" rows="2">${entryData && entryData.notes ? entryData.notes : ''}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveEntry">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Filtrer les enseignants en fonction de la matière sélectionnée
    document.getElementById('subjectId').addEventListener('change', async function() {
      const subjectId = this.value;
      
      try {
        const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        
        const subjectData = await response.json();
        
        if (subjectData.Teachers && subjectData.Teachers.length > 0) {
          const teacherSelect = document.getElementById('teacherId');
          
          // Réinitialiser la liste des enseignants
          teacherSelect.innerHTML = `<option value="" disabled>Sélectionner un enseignant</option>`;
          
          // Ajouter les enseignants qui peuvent enseigner cette matière
          subjectData.Teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.firstName} ${teacher.lastName}`;
            teacherSelect.appendChild(option);
          });
          
          // Sélectionner le premier enseignant par défaut
          if (teacherSelect.options.length > 1) {
            teacherSelect.selectedIndex = 1;
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    });
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveEntry').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const entryId = document.getElementById('entryId').value;
      const ClassGroupId = document.getElementById('classGroupId').value;
      const SubjectId = document.getElementById('subjectId').value;
      const TeacherId = document.getElementById('teacherId').value;
      const RoomId = document.getElementById('roomId').value;
      const TimeSlotId = document.getElementById('timeSlotId').value;
      const notes = document.getElementById('entryNotes').value;
      
      // Valider les données
      if (!ClassGroupId || !SubjectId || !TeacherId || !RoomId || !TimeSlotId) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      try {
        let url = '';
        let method = '';
        
        if (entryId) {
          // Modification d'une entrée existante
          url = `${API_BASE_URL}/schedules/${scheduleId}/entries/${entryId}`;
          method = 'PUT';
        } else {
          // Création d'une nouvelle entrée
          url = `${API_BASE_URL}/schedules/${scheduleId}/entries`;
          method = 'POST';
        }
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ClassGroupId: parseInt(ClassGroupId),
            SubjectId: parseInt(SubjectId),
            TeacherId: parseInt(TeacherId),
            RoomId: parseInt(RoomId),
            TimeSlotId: parseInt(TimeSlotId),
            notes
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Rafraîchir la page des détails de l'emploi du temps
        navigateTo(`/schedules/${scheduleId}`);
        
        // Afficher une notification de succès
        showNotification(
          'Entrée enregistrée', 
          `L'entrée a été ${entryId ? 'modifiée' : 'ajoutée'} avec succès.`,
          'success'
        );
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour charger l'emploi du temps d'une classe
async function loadClassSchedule(scheduleId, classId) {
  try {
    const container = document.getElementById('classScheduleContainer');
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-2">Chargement de l'emploi du temps...</p>
      </div>
    `;
    
    const response = await fetch(`${API_BASE_URL}/schedules/class/${classId}`);
    
    if (response.status === 404) {
      container.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle"></i> 
          Aucun emploi du temps n'est disponible pour cette classe.
        </div>
      `;
      return;
    }
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    
    const data = await response.json();
    
    // Vérifier que les entrées appartiennent à l'emploi du temps actuel
    if (data.schedule.id != scheduleId) {
      container.innerHTML = `
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle"></i> 
          L'emploi du temps affiché appartient à un autre emploi du temps actif.
        </div>
      `;
      return;
    }
    
    // Organiser les entrées par jour et créneau
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = await fetch(`${API_BASE_URL}/timeslots/type/classes`)
      .then(res => res.json())
      .then(slots => slots.filter(slot => !slot.isBreak).sort((a, b) => a.startTime.localeCompare(b.startTime)));
    
    const slotsByDay = {};
    days.forEach(day => {
      slotsByDay[day] = timeSlots.filter(slot => slot.day === day);
    });
    
    const entriesBySlot = {};
    data.entries.forEach(entry => {
      const slotKey = `${entry.TimeSlot.day}-${entry.TimeSlotId}`;
      entriesBySlot[slotKey] = entry;
    });
    
    // Construire la grille d'emploi du temps
    let html = `
      <div class="schedule-grid">
        <div class="schedule-header">&nbsp;</div>
        ${days.map(day => `<div class="schedule-header">${day}</div>`).join('')}
        
        ${timeSlots
          .filter(slot => slot.day === days[0]) // Utiliser les créneaux du premier jour comme référence
          .map(slot => {
            const timeLabel = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
            
            return `
              <div class="time-slot">${timeLabel}</div>
              ${days.map(day => {
                const daySlot = slotsByDay[day].find(s => 
                  s.startTime === slot.startTime && s.endTime === slot.endTime
                );
                
                if (!daySlot) return `<div class="schedule-cell"></div>`;
                
                const slotKey = `${day}-${daySlot.id}`;
                const entry = entriesBySlot[slotKey];
                
                if (entry) {
                  return `
                    <div class="schedule-cell">
                      <div class="schedule-item" style="border-left-color: ${entry.Subject.color}">
                        <strong>${entry.Subject.name}</strong><br>
                        ${entry.Teacher.firstName} ${entry.Teacher.lastName}<br>
                        Salle: ${entry.Room.name}
                      </div>
                    </div>
                  `;
                } else {
                  return `<div class="schedule-cell"></div>`;
                }
              }).join('')}
            `;
          }).join('')}
      </div>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('classScheduleContainer').innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle"></i> 
        Erreur lors du chargement de l'emploi du temps: ${error.message}
      </div>
    `;
  }
}

// Fonction pour supprimer un emploi du temps
async function deleteSchedule(scheduleId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps ? Cette action est irréversible.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    
    // Rafraîchir la page des emplois du temps
    navigateTo('/schedules');
    
    // Afficher une notification de succès
    showNotification(
      'Emploi du temps supprimé', 
      'L\'emploi du temps a été supprimé avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour modifier un emploi du temps
async function editSchedule(scheduleId) {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    
    const scheduleData = await response.json();
    showScheduleModal(scheduleData);
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour publier un emploi du temps
async function publishSchedule(scheduleId) {
  if (!confirm('Êtes-vous sûr de vouloir publier cet emploi du temps ? Une fois publié, les modifications seront limitées.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/publish`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la publication');
    
    // Rafraîchir la page actuelle
    if (window.location.pathname.includes(`/schedules/${scheduleId}`)) {
      navigateTo(`/schedules/${scheduleId}`);
    } else {
      navigateTo('/schedules');
    }
    
    // Afficher une notification de succès
    showNotification(
      'Emploi du temps publié', 
      'L\'emploi du temps a été publié avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour activer un emploi du temps
async function activateSchedule(scheduleId) {
  if (!confirm('Êtes-vous sûr de vouloir activer cet emploi du temps ? L\'emploi du temps actif précédent sera désactivé.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActive: true
      })
    });
    
    if (!response.ok) throw new Error('Erreur lors de l\'activation');
    
    // Rafraîchir la page actuelle
    if (window.location.pathname.includes(`/schedules/${scheduleId}`)) {
      navigateTo(`/schedules/${scheduleId}`);
    } else {
      navigateTo('/schedules');
    }
    
    // Afficher une notification de succès
    showNotification(
      'Emploi du temps activé', 
      'L\'emploi du temps a été activé avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour archiver un emploi du temps
async function archiveSchedule(scheduleId) {
  if (!confirm('Êtes-vous sûr de vouloir archiver cet emploi du temps ?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/archive`, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Erreur lors de l\'archivage');
    
    // Rafraîchir la page actuelle
    if (window.location.pathname.includes(`/schedules/${scheduleId}`)) {
      navigateTo(`/schedules/${scheduleId}`);
    } else {
      navigateTo('/schedules');
    }
    
    // Afficher une notification de succès
    showNotification(
      'Emploi du temps archivé', 
      'L\'emploi du temps a été archivé avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour supprimer une entrée d'emploi du temps
async function deleteScheduleEntry(scheduleId, entryId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/entries/${entryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    
    // Rafraîchir la page des détails de l'emploi du temps
    navigateTo(`/schedules/${scheduleId}`);
    
    // Afficher une notification de succès
    showNotification(
      'Entrée supprimée', 
      'L\'entrée a été supprimée avec succès.',
      'success'
    );
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Fonction pour modifier une entrée d'emploi du temps
async function editScheduleEntry(scheduleId, entryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/entries/${entryId}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    
    const entryData = await response.json();
    showScheduleEntryModal(scheduleId, entryData);
    
  } catch (error) {
    console.error('Erreur:', error);
    showNotification(
      'Erreur', 
      `Une erreur est survenue: ${error.message}`,
      'danger'
    );
  }
}

// Rendu de la page de génération d'emploi du temps
// Rendu de la page de génération d'emploi du temps
function renderGenerateSchedulePage() {
    contentElement.innerHTML = `
      <h1 class="mb-4">Génération d'Emploi du Temps</h1>
      
      <div class="alert alert-info">
        <i class="bi bi-info-circle"></i> 
        Vous êtes sur le point de générer un nouvel emploi du temps. Veuillez définir les paramètres ci-dessous.
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Paramètres de génération</h5>
        </div>
        <div class="card-body">
          <form id="generateForm">
            <div class="mb-3">
              <label for="scheduleName" class="form-label">Nom de l'emploi du temps</label>
              <input type="text" class="form-control" id="scheduleName" value="Emploi du temps ${new Date().toLocaleDateString('fr-FR')}" required>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="startDate" class="form-label">Date de début</label>
                <input type="date" class="form-control" id="startDate" value="${new Date().toISOString().substring(0, 10)}" required>
              </div>
              <div class="col-md-6">
                <label for="endDate" class="form-label">Date de fin</label>
                <input type="date" class="form-control" id="endDate" required>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Classes à inclure</label>
              <div id="classesContainer" class="border rounded p-3 mb-3">
                <div class="text-center py-2">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                  </div>
                  <span class="ms-2">Chargement des classes...</span>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Options avancées</label>
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="respectTeacherPreferences" checked>
                <label class="form-check-label" for="respectTeacherPreferences">
                  Respecter les préférences des enseignants
                </label>
              </div>
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="optimizeRoomUsage" checked>
                <label class="form-check-label" for="optimizeRoomUsage">
                  Optimiser l'utilisation des salles
                </label>
              </div>
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="balanceClassLoad" checked>
                <label class="form-check-label" for="balanceClassLoad">
                  Équilibrer la charge de travail des classes
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="minimizeGaps" checked>
                <label class="form-check-label" for="minimizeGaps">
                  Minimiser les trous dans les emplois du temps
                </label>
              </div>
            </div>
            
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle"></i> 
              Assurez-vous que toutes les contraintes nécessaires sont configurées avant de générer l'emploi du temps.
            </div>
            
            <div class="d-grid">
              <button type="button" id="generateBtn" class="btn btn-lg btn-success">
                <i class="bi bi-calendar-plus"></i> Générer l'emploi du temps
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div id="generationResult" style="display: none;"></div>
    `;
    
    // Calculer la date de fin par défaut (4 mois après la date de début)
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    const startDate = new Date(startDateInput.value);
    startDate.setMonth(startDate.getMonth() + 4);
    endDateInput.value = startDate.toISOString().substring(0, 10);
    
    // Mettre à jour automatiquement la date de fin lors du changement de la date de début
    startDateInput.addEventListener('change', () => {
      const startDate = new Date(startDateInput.value);
      startDate.setMonth(startDate.getMonth() + 4);
      endDateInput.value = startDate.toISOString().substring(0, 10);
    });
    
    // Charger les classes
    fetch(`${API_BASE_URL}/classes`)
      .then(response => response.json())
      .then(classes => {
        const classesContainer = document.getElementById('classesContainer');
        
        if (classes.length === 0) {
          classesContainer.innerHTML = `
            <div class="alert alert-warning mb-0">
              Aucune classe n'est disponible. Veuillez d'abord créer des classes.
            </div>
          `;
          return;
        }
        
        classesContainer.innerHTML = classes.map(classGroup => `
          <div class="form-check">
            <input class="form-check-input class-checkbox" type="checkbox" id="class_${classGroup.id}" value="${classGroup.id}" checked>
            <label class="form-check-label" for="class_${classGroup.id}">
              ${classGroup.name} (${classGroup.level}, ${classGroup.numberOfStudents} élèves)
            </label>
          </div>
        `).join('');
        
        // Ajouter un bouton "Tout cocher/décocher"
        classesContainer.insertAdjacentHTML('beforeend', `
          <div class="mt-2">
            <button type="button" id="toggleAllClasses" class="btn btn-sm btn-outline-primary">
              Décocher tout
            </button>
          </div>
        `);
        
        // Gérer le bouton "Tout cocher/décocher"
        const toggleBtn = document.getElementById('toggleAllClasses');
        let allChecked = true;
        
        toggleBtn.addEventListener('click', () => {
          const checkboxes = document.querySelectorAll('.class-checkbox');
          checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
          });
          
          allChecked = !allChecked;
          toggleBtn.textContent = allChecked ? 'Décocher tout' : 'Cocher tout';
        });
      })
      .catch(error => {
        console.error('Erreur:', error);
        document.getElementById('classesContainer').innerHTML = `
          <div class="alert alert-danger mb-0">
            Erreur lors de la récupération des classes: ${error.message}
          </div>
        `;
      });
    
    // Gestionnaire d'événement pour le bouton de génération
    document.getElementById('generateBtn').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const name = document.getElementById('scheduleName').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      // Récupérer les classes sélectionnées
      const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked')).map(cb => parseInt(cb.value));
      
      // Récupérer les options avancées
      const respectTeacherPreferences = document.getElementById('respectTeacherPreferences').checked;
      const optimizeRoomUsage = document.getElementById('optimizeRoomUsage').checked;
      const balanceClassLoad = document.getElementById('balanceClassLoad').checked;
      const minimizeGaps = document.getElementById('minimizeGaps').checked;
      
      // Valider les données
      if (!name || !startDate || !endDate) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      if (selectedClasses.length === 0) {
        alert('Veuillez sélectionner au moins une classe.');
        return;
      }
  
      // Vérifier que les enseignants ont des matières attribuées
      try {
        const teachersResponse = await fetch(`${API_BASE_URL}/teachers`);
        if (!teachersResponse.ok) throw new Error('Erreur lors de la récupération des enseignants');
        
        const teachers = await teachersResponse.json();
        
        // Vérifier chaque enseignant individuellement
        for (const teacher of teachers) {
          const teacherResponse = await fetch(`${API_BASE_URL}/teachers/${teacher.id}`);
          if (!teacherResponse.ok) continue;
          
          const teacherData = await teacherResponse.json();
          
          if (!teacherData.Subjects || teacherData.Subjects.length === 0) {
            if (!confirm(`L'enseignant ${teacher.firstName} ${teacher.lastName} n'a aucune matière attribuée. Voulez-vous continuer quand même ?`)) {
              return;
            }
            break; // On ne demande qu'une fois
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des enseignants:', error);
        // Continue despite error
      }
      
      // Afficher une indication de chargement
      const generateBtn = document.getElementById('generateBtn');
      const originalBtnText = generateBtn.innerHTML;
      generateBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Génération en cours...
      `;
      generateBtn.disabled = true;
      
      try {
        const response = await fetch(`${API_BASE_URL}/schedules/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            startDate,
            endDate,
            classIds: selectedClasses,
            options: {
              respectTeacherPreferences,
              optimizeRoomUsage,
              balanceClassLoad,
              minimizeGaps
            }
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de la génération');
        
        const result = await response.json();
        
        // Afficher le résultat
        document.getElementById('generationResult').style.display = 'block';
        document.getElementById('generationResult').innerHTML = `
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Emploi du temps généré avec succès</h5>
            </div>
            <div class="card-body">
              <p><strong>ID de l'emploi du temps:</strong> ${result.scheduleId}</p>
              <p><strong>Nombre d'entrées générées:</strong> ${result.solution.length}</p>
              <p><strong>Succès:</strong> ${result.success ? 'Oui' : 'Non'}</p>
              
              ${result.unassignedClasses.length > 0 ? `
                <div class="alert alert-warning">
                  <h6><i class="bi bi-exclamation-triangle"></i> Avertissement</h6>
                  <p>Certains cours n'ont pas pu être assignés (${result.unassignedClasses.length}).</p>
                  <ul>
                    ${result.unassignedClasses.map(item => `
                      <li>Classe: ${item.classGroupId}, Matière: ${item.subjectId}, Raison: ${item.reason}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <div class="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <a href="/schedules/${result.scheduleId}" class="btn btn-primary">
                  <i class="bi bi-eye"></i> Voir l'emploi du temps
                </a>
                <a href="/schedules" class="btn btn-secondary">
                  <i class="bi bi-list"></i> Liste des emplois du temps
                </a>
              </div>
            </div>
          </div>
        `;
        
        // Faire défiler jusqu'au résultat
        document.getElementById('generationResult').scrollIntoView({ behavior: 'smooth' });
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue lors de la génération: ${error.message}`,
          'danger'
        );
      } finally {
        // Restaurer le bouton
        generateBtn.innerHTML = originalBtnText;
        generateBtn.disabled = false;
      }
    });
  }

  
// Fonction pour afficher la vue d'attribution des matières aux enseignants
async function renderTeacherSubjectsPage(teacherId) {
    try {
      // Récupérer les données de l'enseignant
      const teacherResponse = await fetch(`${API_BASE_URL}/teachers/${teacherId}`);
      if (!teacherResponse.ok) throw new Error('Erreur lors de la récupération des données de l\'enseignant');
      
      const teacher = await teacherResponse.json();
      
      // Récupérer toutes les matières
      const subjectsResponse = await fetch(`${API_BASE_URL}/subjects`);
      if (!subjectsResponse.ok) throw new Error('Erreur lors de la récupération des matières');
      
      const subjects = await subjectsResponse.json();
      
      // Créer un tableau des matières de l'enseignant
      const teacherSubjects = teacher.Subjects || [];
      
      contentElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Matières de ${teacher.firstName} ${teacher.lastName}</h1>
          <a href="/teachers" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Retour aux enseignants
          </a>
        </div>
        
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Matières enseignées</h5>
          </div>
          <div class="card-body">
            ${teacherSubjects.length > 0 ? `
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Heures/semaine</th>
                    <th>Principale</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${teacherSubjects.map(subject => `
                    <tr>
                      <td>
                        <span class="badge" style="background-color: ${subject.color}">
                          ${subject.name}
                        </span>
                      </td>
                      <td>${subject.TeacherSubject.hoursPerWeek}</td>
                      <td>
                        <span class="badge ${subject.TeacherSubject.isPrimary ? 'bg-success' : 'bg-secondary'}">
                          ${subject.TeacherSubject.isPrimary ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-warning edit-teacher-subject" 
                                data-subject-id="${subject.id}" 
                                data-hours="${subject.TeacherSubject.hoursPerWeek}"
                                data-primary="${subject.TeacherSubject.isPrimary}">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger remove-teacher-subject" data-subject-id="${subject.id}">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> 
                Cet enseignant n'a pas encore de matières assignées.
              </div>
            `}
            
            <button id="addTeacherSubjectBtn" class="btn btn-primary mt-3">
              <i class="bi bi-plus-circle"></i> Ajouter une matière
            </button>
          </div>
        </div>
      `;
      
      // Gestionnaire pour le bouton d'ajout
      document.getElementById('addTeacherSubjectBtn').addEventListener('click', () => {
        showTeacherSubjectModal(teacherId, subjects, teacherSubjects);
      });
      
      // Gestionnaires pour les boutons d'édition
      document.querySelectorAll('.edit-teacher-subject').forEach(button => {
        button.addEventListener('click', () => {
          const subjectId = button.getAttribute('data-subject-id');
          const hours = button.getAttribute('data-hours');
          const isPrimary = button.getAttribute('data-primary') === 'true';
          const subject = subjects.find(s => s.id == subjectId);
          
          showTeacherSubjectModal(teacherId, subjects, teacherSubjects, {
            subjectId,
            hours,
            isPrimary,
            subjectName: subject.name
          });
        });
      });
      
      // Gestionnaires pour les boutons de suppression
      document.querySelectorAll('.remove-teacher-subject').forEach(button => {
        button.addEventListener('click', async () => {
          const subjectId = button.getAttribute('data-subject-id');
          const subject = subjects.find(s => s.id == subjectId);
          
          if (confirm(`Êtes-vous sûr de vouloir retirer la matière "${subject.name}" de cet enseignant ?`)) {
            try {
              const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/subjects/${subjectId}`, {
                method: 'DELETE'
              });
              
              if (!response.ok) throw new Error('Erreur lors de la suppression');
              
              showNotification(
                'Matière retirée', 
                `La matière a été retirée de cet enseignant avec succès.`,
                'success'
              );
              
              // Recharger la page
              renderTeacherSubjectsPage(teacherId);
              
            } catch (error) {
              console.error('Erreur:', error);
              showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
              );
            }
          }
        });
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      contentElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> 
          Erreur lors de la récupération des données: ${error.message}
        </div>
        <a href="/teachers" class="btn btn-secondary">
          <i class="bi bi-arrow-left"></i> Retour aux enseignants
        </a>
      `;
    }
  }
  
  // Fonction pour afficher la modale d'attribution de matière
  function showTeacherSubjectModal(teacherId, allSubjects, teacherSubjects, existingData = null) {
    const modalTitle = existingData ? 'Modifier une matière' : 'Ajouter une matière';
    const modalId = 'teacherSubjectModal';
    
    // Filtrer les matières non encore attribuées (si ajout)
    let availableSubjects = allSubjects;
    if (!existingData) {
      const assignedSubjectIds = teacherSubjects.map(s => s.id);
      availableSubjects = allSubjects.filter(s => !assignedSubjectIds.includes(s.id));
    }
    
    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Créer la structure de la modale
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="teacherSubjectForm">
              <div class="mb-3">
                <label for="subjectId" class="form-label">Matière</label>
                ${existingData ? `
                  <input type="hidden" id="subjectId" value="${existingData.subjectId}">
                  <input type="text" class="form-control" value="${existingData.subjectName}" readonly>
                ` : `
                  <select class="form-select" id="subjectId" required>
                    <option value="" selected disabled>Sélectionner une matière</option>
                    ${availableSubjects.map(subject => `
                      <option value="${subject.id}" style="background-color: ${subject.color}; color: white;">
                        ${subject.name}
                      </option>
                    `).join('')}
                  </select>
                `}
              </div>
              <div class="mb-3">
                <label for="hoursPerWeek" class="form-label">Heures par semaine</label>
                <input type="number" class="form-control" id="hoursPerWeek" min="1" max="40" value="${existingData ? existingData.hours : '10'}" required>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="isPrimary" ${existingData && existingData.isPrimary ? 'checked' : ''}>
                <label class="form-check-label" for="isPrimary">Matière principale</label>
                <div class="form-text">Une matière principale est celle que l'enseignant préfère enseigner.</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" id="saveTeacherSubject">Enregistrer</button>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Créer une instance de la modale Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    
    // Gestionnaire d'événement pour le bouton d'enregistrement
    document.getElementById('saveTeacherSubject').addEventListener('click', async () => {
      // Récupérer les valeurs du formulaire
      const subjectId = existingData ? existingData.subjectId : document.getElementById('subjectId').value;
      const hoursPerWeek = document.getElementById('hoursPerWeek').value;
      const isPrimary = document.getElementById('isPrimary').checked;
      
      // Valider les données
      if (!subjectId || !hoursPerWeek) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/subjects/${subjectId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hoursPerWeek: parseInt(hoursPerWeek),
            isPrimary
          })
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        // Fermer la modale
        modalInstance.hide();
        
        // Afficher une notification de succès
        showNotification(
          'Matière attribuée', 
          `La matière a été ${existingData ? 'modifiée' : 'ajoutée'} avec succès.`,
          'success'
        );
        
        // Recharger la page
        renderTeacherSubjectsPage(teacherId);
        
      } catch (error) {
        console.error('Erreur:', error);
        showNotification(
          'Erreur', 
          `Une erreur est survenue: ${error.message}`,
          'danger'
        );
      }
    });
    
    // Afficher la modale
    modalInstance.show();
  }


    // Fonction pour afficher la modale des classes
    function showClassModal(classData = null) {
        // Créer une modale pour ajouter/modifier une classe
        const modalTitle = classData ? 'Modifier une classe' : 'Ajouter une classe';
        const modalId = 'classModal';
        
        // Supprimer la modale existante si elle existe
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Créer la structure de la modale
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="classForm">
                            <input type="hidden" id="classId" value="${classData ? classData.id : ''}">
                            <div class="mb-3">
                                <label for="className" class="form-label">Nom de la classe</label>
                                <input type="text" class="form-control" id="className" value="${classData ? classData.name : ''}" required>
                            </div>
                            <div class="mb-3">
                                <label for="classLevel" class="form-label">Niveau</label>
                                <select class="form-select" id="classLevel" required>
                                    <option value="" ${!classData ? 'selected' : ''} disabled>Sélectionnez un niveau</option>
                                    <option value="CP" ${classData && classData.level === 'CP' ? 'selected' : ''}>CP</option>
                                    <option value="CE1" ${classData && classData.level === 'CE1' ? 'selected' : ''}>CE1</option>
                                    <option value="CE2" ${classData && classData.level === 'CE2' ? 'selected' : ''}>CE2</option>
                                    <option value="CM1" ${classData && classData.level === 'CM1' ? 'selected' : ''}>CM1</option>
                                    <option value="CM2" ${classData && classData.level === 'CM2' ? 'selected' : ''}>CM2</option>
                                    <option value="6ème" ${classData && classData.level === '6ème' ? 'selected' : ''}>6ème</option>
                                    <option value="5ème" ${classData && classData.level === '5ème' ? 'selected' : ''}>5ème</option>
                                    <option value="4ème" ${classData && classData.level === '4ème' ? 'selected' : ''}>4ème</option>
                                    <option value="3ème" ${classData && classData.level === '3ème' ? 'selected' : ''}>3ème</option>
                                    <option value="2nde" ${classData && classData.level === '2nde' ? 'selected' : ''}>2nde</option>
                                    <option value="1ère" ${classData && classData.level === '1ère' ? 'selected' : ''}>1ère</option>
                                    <option value="Terminale" ${classData && classData.level === 'Terminale' ? 'selected' : ''}>Terminale</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="classStudents" class="form-label">Nombre d'élèves</label>
                                <input type="number" class="form-control" id="classStudents" value="${classData ? classData.numberOfStudents : '25'}" required min="1" max="50">
                            </div>
                            <div class="mb-3">
                                <label for="classNotes" class="form-label">Notes</label>
                                <textarea class="form-control" id="classNotes" rows="3">${classData ? classData.notes || '' : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="saveClass">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter la modale au document
        document.body.appendChild(modal);
        
        // Créer une instance de la modale Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        
        // Gestionnaire d'événement pour le bouton d'enregistrement
        document.getElementById('saveClass').addEventListener('click', async () => {
            // Récupérer les valeurs du formulaire
            const classId = document.getElementById('classId').value;
            const name = document.getElementById('className').value;
            const level = document.getElementById('classLevel').value;
            const numberOfStudents = document.getElementById('classStudents').value;
            const notes = document.getElementById('classNotes').value;
            
            // Valider les données
            if (!name || !level || !numberOfStudents) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            try {
                const url = classId 
                    ? `${API_BASE_URL}/classes/${classId}` 
                    : `${API_BASE_URL}/classes`;
                
                const method = classId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        level,
                        numberOfStudents: parseInt(numberOfStudents),
                        notes
                    })
                });
                
                if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
                
                // Fermer la modale
                modalInstance.hide();
                
                // Rafraîchir la page des classes
                navigateTo('/classes');
                
                // Afficher une notification de succès
                showNotification(
                    'Classe enregistrée', 
                    `La classe ${name} a été ${classId ? 'modifiée' : 'ajoutée'} avec succès.`,
                    'success'
                );
                
            } catch (error) {
                console.error('Erreur:', error);
                showNotification(
                    'Erreur', 
                    `Une erreur est survenue: ${error.message}`,
                    'danger'
                );
            }
        });
        
        // Afficher la modale
        modalInstance.show();
    }
    
    // Fonction pour supprimer une classe
    async function deleteClass(classId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            
            // Rafraîchir la page des classes
            navigateTo('/classes');
            
            // Afficher une notification de succès
            showNotification(
                'Classe supprimée', 
                'La classe a été supprimée avec succès.',
                'success'
            );
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour modifier une classe
    async function editClass(classId) {
        try {
            const response = await fetch(`${API_BASE_URL}/classes/${classId}`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des données');
            
            const classData = await response.json();
            showClassModal(classData);
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour voir l'emploi du temps d'une classe
    async function viewClassSchedule(classId) {
        try {
            const response = await fetch(`${API_BASE_URL}/schedules/class/${classId}`);
            
            if (response.status === 404) {
                showNotification(
                    'Information', 
                    'Aucun emploi du temps actif n\'est disponible pour cette classe.',
                    'info'
                );
                return;
            }
            
            if (!response.ok) throw new Error('Erreur lors de la récupération des données');
            
            const data = await response.json();
            renderClassScheduleView(data.schedule, data.entries, classId);
            
        } catch (error) {
            console.error('Erreur:', error);
            showNotification(
                'Erreur', 
                `Une erreur est survenue: ${error.message}`,
                'danger'
            );
        }
    }
    
    // Fonction pour afficher l'emploi du temps d'une classe
    async function renderClassScheduleView(schedule, entries, classId) {
        try {
            // Récupérer le nom de la classe
            const classResponse = await fetch(`${API_BASE_URL}/classes/${classId}`);
            if (!classResponse.ok) throw new Error('Erreur lors de la récupération des données de la classe');
            
            const classData = await classResponse.json();
            
            // Récupérer les créneaux horaires
            const timeSlotsResponse = await fetch(`${API_BASE_URL}/timeslots`);
            if (!timeSlotsResponse.ok) throw new Error('Erreur lors de la récupération des créneaux horaires');
            
            const timeSlots = await timeSlotsResponse.json();
            
            // Filtrer les créneaux qui ne sont pas des pauses
            const classTimeSlots = timeSlots.filter(slot => !slot.isBreak);
            
            // Organiser les créneaux par jour
            const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
            const timeSlotsByDay = {};
            
            days.forEach(day => {
                timeSlotsByDay[day] = classTimeSlots.filter(slot => slot.day === day);
            });
            
            // Organiser les entrées par jour et créneau
            const entriesByDayAndSlot = {};
            
            days.forEach(day => {
                entriesByDayAndSlot[day] = {};
                timeSlotsByDay[day].forEach(slot => {
                    entriesByDayAndSlot[day][slot.id] = entries.find(entry => 
                        entry.TimeSlot.day === day && entry.TimeSlotId === slot.id
                    );
                });
            });
            
            // Construire l'affichage de l'emploi du temps
            contentElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Emploi du temps: ${classData.name}</h1>
                    <a href="/classes" class="btn btn-secondary">
                        <i class="bi bi-arrow-left"></i> Retour aux classes
                    </a>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <strong>Niveau:</strong> ${classData.level} | 
                        <strong>Effectif:</strong> ${classData.numberOfStudents} élèves |
                        <strong>Période:</strong> ${new Date(schedule.startDate).toLocaleDateString('fr-FR')} au ${new Date(schedule.endDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div class="card-body">
                        <div class="schedule-grid">
                            <div class="schedule-header">&nbsp;</div>
                            ${days.map(day => `<div class="schedule-header">${day}</div>`).join('')}
                            
                            ${classTimeSlots
                                .filter(slot => slot.day === 'Lundi')
                                .map(slot => `
                                    <div class="time-slot">${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}</div>
                                    ${days.map(day => {
                                        const entry = entriesByDayAndSlot[day][timeSlotsByDay[day].find(s => 
                                            s.startTime === slot.startTime && s.endTime === slot.endTime
                                        )?.id];
                                        
                                        if (entry) {
                                            return `
                                                <div class="schedule-cell">
                                                    <div class="schedule-item" style="border-left-color: ${entry.Subject.color || '#0d6efd'}">
                                                        <strong>${entry.Subject.name}</strong><br>
                                                        ${entry.Teacher.firstName} ${entry.Teacher.lastName}<br>
                                                        Salle: ${entry.Room.name}
                                                    </div>
                                                </div>
                                            `;
                                        } else {
                                            return `<div class="schedule-cell"></div>`;
                                        }
                                    }).join('')}
                                `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> 
                    Cet emploi du temps est généré automatiquement en tenant compte des contraintes configurées.
                </div>
            `;
            
        } catch (error) {
            console.error('Erreur:', error);
            contentElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Erreur lors de l'affichage de l'emploi du temps: ${error.message}
                </div>
                <a href="/classes" class="btn btn-secondary">
                    <i class="bi bi-arrow-left"></i> Retour aux classes
                </a>
            `;
        }
    }
});
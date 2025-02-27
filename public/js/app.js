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
    async function renderRoomsPage(url) {
        contentElement.innerHTML = `
            <h1>Gestion des Salles</h1>
            <p>Cette page est en cours de développement.</p>
        `;
    }
    
    async function renderTimeSlotsPage(url) {
        contentElement.innerHTML = `
            <h1>Gestion des Créneaux Horaires</h1>
            <p>Cette page est en cours de développement.</p>
        `;
    }
    
    async function renderConstraintsPage(url) {
        contentElement.innerHTML = `
            <h1>Gestion des Contraintes</h1>
            <p>Cette page est en cours de développement.</p>
        `;
    }
    
    async function renderSchedulesPage(url) {
        contentElement.innerHTML = `
            <h1>Emplois du Temps</h1>
            <p>Cette page est en cours de développement.</p>
        `;
    }
    
    function renderGenerateSchedulePage() {
        contentElement.innerHTML = `
            <h1>Génération d'un Emploi du Temps</h1>
            <p>Cette page est en cours de développement.</p>
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> 
                L'algorithme de génération d'emplois du temps prend en compte toutes les contraintes configurées.
            </div>
        `;
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
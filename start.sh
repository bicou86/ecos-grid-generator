#!/bin/bash

# ================================================================
# ECOS Platform - Script de Démarrage
# Détecte l'environnement et démarre les services appropriés
# ================================================================

set -e

echo "================================================================"
echo "🏥 ECOS Platform - Démarrage Automatique"
echo "================================================================"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Vérifier si Docker est installé
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "1. Mode Docker (Recommandé)"
    echo "2. Mode HTML Direct (Test Rapide)"
    echo "3. Mode Développement Local"
    echo ""
    read -p "Choisir une option (1-3): " choice

    case $choice in
        1)
            print_info "Démarrage avec Docker..."

            # Vérifier si .env existe
            if [ ! -f .env ]; then
                print_warning "Fichier .env non trouvé, copie de .env.example"
                cp .env.example .env
                print_warning "⚠️  IMPORTANT: Éditez le fichier .env avec vos valeurs!"
                print_warning "   - JWT_SECRET"
                print_warning "   - STRIPE_SECRET_KEY"
                print_warning "   - STRIPE_PUBLISHABLE_KEY"
                read -p "Appuyez sur Entrée après avoir édité .env..."
            fi

            # Démarrer Docker Compose
            print_info "Lancement des containers Docker..."
            docker-compose up -d

            # Attendre que les services soient prêts
            print_info "Attente du démarrage des services (30 secondes)..."
            sleep 30

            # Importer les données si pas encore fait
            print_info "Vérification de l'import des données..."
            docker-compose exec -T backend python3 /app/import_cases_to_db.py || true

            print_success "Plateforme démarrée avec succès!"
            echo ""
            echo "================================================================"
            echo "🌐 Accès aux services:"
            echo "================================================================"
            echo "  Frontend:     http://localhost"
            echo "  Backend API:  http://localhost/api/v1"
            echo "  Adminer:      http://localhost:8080 (postgres/postgres)"
            echo "  Grafana:      http://localhost:3002 (admin/admin)"
            echo "================================================================"

            # Ouvrir le navigateur
            open http://localhost 2>/dev/null || xdg-open http://localhost 2>/dev/null || true
            ;;

        2)
            print_info "Ouverture de l'interface HTML..."
            if [ -f "HTML/ECOS_Revisions_Complete.html" ]; then
                open "HTML/ECOS_Revisions_Complete.html" 2>/dev/null || xdg-open "HTML/ECOS_Revisions_Complete.html" 2>/dev/null || true
                print_success "Interface HTML ouverte!"
                print_info "496 cas cliniques disponibles"
                print_warning "Mode démo - Pas de sauvegarde de progression"
            else
                print_error "Fichier HTML non trouvé"
            fi
            ;;

        3)
            print_info "Mode Développement Local"
            print_warning "Ce mode nécessite PostgreSQL installé localement"

            # Vérifier PostgreSQL
            if command -v psql &> /dev/null; then
                print_success "PostgreSQL trouvé"

                # Vérifier si la base existe
                if psql -lqt | cut -d \| -f 1 | grep -qw ecos_platform; then
                    print_success "Base de données ecos_platform existe"
                else
                    print_warning "Création de la base de données..."
                    createdb ecos_platform
                    print_info "Application du schéma..."
                    psql -d ecos_platform -f DATABASE_SCHEMA.sql
                    print_success "Base de données créée"
                fi

                # Installer les dépendances backend
                if [ ! -d "backend/node_modules" ]; then
                    print_info "Installation des dépendances backend..."
                    cd backend && npm install && cd ..
                fi

                # Installer les dépendances frontend
                if [ ! -d "frontend/node_modules" ]; then
                    print_info "Installation des dépendances frontend..."
                    cd frontend && npm install && cd ..
                fi

                # Démarrer les services
                print_info "Démarrage du backend..."
                cd backend && npm run dev &
                BACKEND_PID=$!

                sleep 5

                print_info "Démarrage du frontend..."
                cd frontend && npm run dev &
                FRONTEND_PID=$!

                print_success "Services démarrés!"
                echo ""
                echo "================================================================"
                echo "🌐 Accès aux services:"
                echo "================================================================"
                echo "  Frontend:     http://localhost:3001"
                echo "  Backend API:  http://localhost:3000/api/v1"
                echo "================================================================"
                echo ""
                print_info "Pour arrêter: Ctrl+C puis 'kill $BACKEND_PID $FRONTEND_PID'"

                # Ouvrir le navigateur
                sleep 3
                open http://localhost:3001 2>/dev/null || xdg-open http://localhost:3001 2>/dev/null || true

                # Attendre
                wait

            else
                print_error "PostgreSQL non trouvé"
                print_info "Installation:"
                print_info "  macOS:  brew install postgresql@15"
                print_info "  Linux:  sudo apt-get install postgresql-15"
            fi
            ;;

        *)
            print_error "Option invalide"
            exit 1
            ;;
    esac

else
    # Docker non installé, proposer les alternatives
    print_warning "Docker non installé"
    echo ""
    echo "Options disponibles:"
    echo "1. Interface HTML (Test Rapide)"
    echo "2. Installer Docker (Recommandé)"
    echo "3. Quitter"
    echo ""
    read -p "Choisir une option (1-3): " choice

    case $choice in
        1)
            print_info "Ouverture de l'interface HTML..."
            if [ -f "HTML/ECOS_Revisions_Complete.html" ]; then
                open "HTML/ECOS_Revisions_Complete.html" 2>/dev/null || xdg-open "HTML/ECOS_Revisions_Complete.html" 2>/dev/null || true
                print_success "Interface HTML ouverte!"
                print_info "496 cas cliniques disponibles"
                print_warning "Mode démo - Pas de sauvegarde de progression"
                print_info ""
                print_info "Pour installer Docker: https://www.docker.com/products/docker-desktop"
            else
                print_error "Fichier HTML non trouvé"
            fi
            ;;

        2)
            print_info "Installation de Docker:"
            echo ""
            echo "macOS:"
            echo "  1. Télécharger: https://www.docker.com/products/docker-desktop"
            echo "  2. Installer Docker Desktop"
            echo "  3. Redémarrer le terminal"
            echo "  4. Relancer: ./start.sh"
            echo ""
            echo "Linux:"
            echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
            echo "  sudo sh get-docker.sh"
            echo "  sudo usermod -aG docker \$USER"
            echo "  newgrp docker"
            ;;

        3)
            print_info "Bye!"
            exit 0
            ;;

        *)
            print_error "Option invalide"
            exit 1
            ;;
    esac
fi

echo ""
echo "================================================================"
print_success "Démarrage terminé!"
echo "================================================================"
